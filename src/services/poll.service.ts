import { prisma } from "../config/prisma";

export const createPoll = async (
  question: string,
  options: string[],
  creatorId: number,
  isPublished: boolean = false
) => {
  return prisma.poll.create({
    data: {
      question,
      isPublished,
      creator: { connect: { id: creatorId } },
      options: { create: options.map((text) => ({ text })) },
    },
    include: { options: true },
  });
};

export const getPollById = async (id: number) => {
  return prisma.poll.findUnique({
    where: { id },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });
};
