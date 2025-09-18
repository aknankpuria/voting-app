import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_poll", (pollId: number) => {
      socket.join(`poll_${pollId}`);
    });

    socket.on("leave_poll", (pollId: number) => {
      socket.leave(`poll_${pollId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const broadcastPollUpdate = async (io: Server, pollId: number) => {
  const options = await prisma.pollOption.findMany({
    where: { pollId },
    select: { id: true, text: true, _count: { select: { votes: true } } },
  });

  io.to(`poll_${pollId}`).emit("poll_update", {
    pollId,
    options: options.map((o) => ({ id: o.id, text: o.text, votes: o._count.votes })),
  });
};
