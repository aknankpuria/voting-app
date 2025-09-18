import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

export const createUser = async (name: string, email: string, password: string) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  return prisma.user.create({ data: { name, email, passwordHash } });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};
