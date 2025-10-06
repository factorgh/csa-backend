import { Request, Response } from "express";
import type { IUser } from "../models/user.model";

type ReqWithUser = Request & { user?: IUser };
import * as AuthService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const { email, password, fullName, phone } = req.body;
  const result = await AuthService.register({
    email,
    password,
    fullName,
    phone,
  });
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.json({ success: true, data: result });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  res.json({ success: true, data: result ? { sent: true } : { sent: true } });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  res.json({ success: true, data: result });
}

export async function me(req: ReqWithUser, res: Response) {
  res.json({ success: true, data: req.user });
}

export async function updateMe(req: ReqWithUser, res: Response) {
  const { email, password, fullName, phone } = req.body;
  const result = await AuthService.updateMe({
    userId: String(req.user!._id),
    email,
    password,
    fullName,
    phone,
  });
  res.json({ success: true, data: result });
}
