import { Router } from "express";
import { vote } from "../controllers/vote.controller";

const router = Router();

// /votes/:pollId
router.post("/:pollId", vote);

export default router;
