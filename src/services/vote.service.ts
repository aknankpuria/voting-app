import { prisma } from "../config/prisma";

export const castVote = async (userId: number, optionId: number) => {
  return prisma.vote.create({
    data: {
      userId,
      optionId,
    },
  });
};

export const hasUserVotedInPoll = async (userId: number, pollId: number) => {
  return prisma.vote.findFirst({
    where: {
      userId,
      option: { pollId },
    },
  });
};

export const getPollVotes = async (pollId: number) => {
  return prisma.pollOption.findMany({
    where: { pollId },
    select: {
      id: true,
      text: true,
      _count: { select: { votes: true } },
    },
  });
};
