import request from "supertest";
import app from "./app";
import { prisma } from "./config/prisma";
import { createServer } from "http";
import { Server } from "socket.io";
import Client from "socket.io-client";
import { setIO } from "./controllers/vote.controller";
import pollSocket from "./sockets/poll.socket";

const PORT = 5000; // test port

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
pollSocket(io);
setIO(io);

httpServer.listen(PORT, () => console.log("Test server running"));

const api = request(httpServer);

async function cleanupDB() {
  // Order matters due to foreign key constraints
  await prisma.vote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.user.deleteMany();
}

async function runTests() {
  try {
    console.log("🧪 Starting test suite...\n");

    // ---------- CLEANUP BEFORE ----------
    await cleanupDB();

    // ---------- USERS ----------
    let userId: number;
    {
      // Create user
      const res = await api.post("/users").send({ name: "Alice", email: "alice@test.com", password: "secret" });
      console.log("Create User:", res.status, res.body);
      userId = res.body.id;

      // Duplicate email
      const dup = await api.post("/users").send({ name: "Alice2", email: "alice@test.com", password: "xxx" });
      console.log("Duplicate User:", dup.status, dup.body);

      // Missing fields
      const bad = await api.post("/users").send({ email: "bob@test.com" });
      console.log("Invalid User:", bad.status, bad.body);

      // Get user
      const get = await api.get(`/users/${userId}`);
      console.log("Get User:", get.status, get.body);

      // User not found
      const notFound = await api.get(`/users/999`);
      console.log("Get Missing User:", notFound.status, notFound.body);
    }

    // ---------- POLLS ----------
    let pollId: number, optionId: number;
    {
      // Create poll
      const res = await api.post("/polls").send({
        question: "Which color?",
        options: ["Red", "Green", "Blue"],
        creatorId: userId,
        isPublished: true,
      });
      console.log("Create Poll:", res.status, res.body);
      pollId = res.body.id;
      optionId = res.body.options[1].id;

      // Invalid poll (missing options)
      const bad = await api.post("/polls").send({ question: "Bad poll", creatorId: userId });
      console.log("Invalid Poll:", bad.status, bad.body);

      // Get poll
      const get = await api.get(`/polls/${pollId}`);
      console.log("Get Poll:", get.status, get.body);

      // Non-existing poll
      const notFound = await api.get(`/polls/999`);
      console.log("Get Missing Poll:", notFound.status, notFound.body);
    }

    // ---------- VOTES ----------
    {
      // Cast valid vote
      const res = await api.post(`/votes/${pollId}`).send({ userId, optionId });
      console.log("Vote:", res.status, res.body);

      // Duplicate vote
      const dup = await api.post(`/votes/${pollId}`).send({ userId, optionId });
      console.log("Duplicate Vote:", dup.status, dup.body);

      // Missing fields
      const bad = await api.post(`/votes/${pollId}`).send({ userId });
      console.log("Invalid Vote:", bad.status, bad.body);

      // Wrong option for poll
      const wrong = await api.post(`/votes/${pollId}`).send({ userId, optionId: 999 });
      console.log("Wrong Option:", wrong.status, wrong.body);

      // Non-existing poll
      const missingPoll = await api.post(`/votes/999`).send({ userId, optionId });
      console.log("Vote on Missing Poll:", missingPoll.status, missingPoll.body);
    }

    // ---------- SOCKETS ----------
    {
      console.log("\n🔌 WebSocket test...");

      const client1 = Client(`http://localhost:${PORT}`);
      const client2 = Client(`http://localhost:${PORT}`);

      await new Promise((resolve) => {
        client1.on("connect", () => {
          client1.emit("join_poll", pollId);
          client2.on("connect", () => {
            client2.emit("join_poll", pollId);

            client1.on("poll_update", (data) => {
              console.log("Client1 received update:", data);
              client1.close();
              client2.close();
              resolve(true);
            });

            // Cast another vote to trigger update
            api.post(`/votes/${pollId}`).send({ userId: userId + 1, optionId }).then(() => {
              console.log("Triggered vote for WS test");
            });
          });
        });
      });
    }

    console.log("\n✅ All tests executed!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    // ---------- CLEANUP AFTER ----------
    await cleanupDB();
    await prisma.$disconnect();
    httpServer.close();
    process.exit();
  }
}

runTests();
