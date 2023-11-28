import { Request, Response, NextFunction } from "express";

import { client, handleHashPassword } from "../libs";
import { USERS } from "../models";
export const SignUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  // Minlength 6
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters.",
    });
  }

  const existingUser = USERS.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists.",
    });
  }

  try {
    const hashed_password = handleHashPassword(password);
    // Generate random id and push to in memory users
    const id = Math.random().toString(36).substring(2, 9);
    const user = {
      id,
      email,
      hashed_password,
    };
    USERS.push(user);

    // Create user in Stream Chat
    await client.upsertUser({
      id,
      email,
      name: email,
    });

    // Create token for user
    const token = client.createToken(id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    return res.json({
      message: "User already exists.",
    });
  }
};
