import { Request, Response } from "express";
import * as VoteService from "../services/vote.service";
import { broadcastPollUpdate } from "../sockets/poll.socket";

let ioInstance: any; // injected from server

export const setIO = (io: any) => {
  ioInstance = io;
};

export const vote = async (req: Request, res: Response) => {
  try {
    const pollId = Number(req.params.pollId);
    const { userId, optionId } = req.body;

    if (!userId || !optionId) return res.status(400).json({ error: "Missing userId or optionId" });

    // Prevent duplicate votes
    const alreadyVoted = await VoteService.hasUserVotedInPoll(userId, pollId);
    if (alreadyVoted) return res.status(409).json({ error: "User already voted in this poll" });

    await VoteService.castVote(userId, optionId);

    // Fetch updated results
    const options = await VoteService.getPollVotes(pollId);

    // Broadcast results via WebSocket
    if (ioInstance) {
      broadcastPollUpdate(ioInstance, pollId);
    }

    res.json({
      success: true,
      options: options.map((o) => ({ id: o.id, text: o.text, votes: o._count.votes })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
