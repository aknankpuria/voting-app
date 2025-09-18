import { Request, Response } from "express";
import * as PollService from "../services/poll.service";

export const createPoll = async (req: Request, res: Response) => {
  try {
    const { question, options, creatorId, isPublished } = req.body;
    if (!question || !Array.isArray(options) || options.length === 0 || !creatorId) {
      return res.status(400).json({ error: "Invalid poll data" });
    }
    const poll = await PollService.createPoll(question, options, creatorId, isPublished);
    res.status(201).json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPoll = async (req: Request, res: Response) => {
  try {
    const poll = await PollService.getPollById(Number(req.params.id));
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    const options = poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: (o as any)._count.votes,
    }));

    res.json({ ...poll, options });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
