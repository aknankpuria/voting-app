import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await UserService.getUserById(1);  // TODO: check if email already exists
    const user = await UserService.createUser(name, email, password);

    const { passwordHash, ...safeUser } = user as any;
    res.status(201).json(safeUser);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await UserService.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { passwordHash, ...safeUser } = user as any;
  res.json(safeUser);
};
