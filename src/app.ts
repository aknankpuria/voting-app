import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import pollRoutes from "./routes/poll.routes";
import voteRoutes from "./routes/vote.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/polls", pollRoutes);
app.use("/votes", voteRoutes);

export default app;
