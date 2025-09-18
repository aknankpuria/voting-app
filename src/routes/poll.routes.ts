import { Router } from "express";
import { createPoll, getPoll } from "../controllers/poll.controller";

const router = Router();

router.post("/", createPoll);
router.get("/:id", getPoll);

export default router;
