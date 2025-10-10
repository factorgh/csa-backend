import { Request, Response } from "express";
import type { IUser } from "../models/user.model";
import * as LicenseService from "../services/license.service";

type ReqWithUser = Request & { user?: IUser };

export async function listMyLicenses(req: ReqWithUser, res: Response) {
  const email = req.user?.email as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await LicenseService.listUserLicensesByEmail(email, {
    page,
    limit,
  });
  res.json({ success: true, data: result.data, pagination: result.pagination });
}

export async function requestRenewal(req: ReqWithUser, res: Response) {
  const { notes } = req.body as any;
  const request = await LicenseService.requestRenewal(
    req.params.id,
    String(req.user!._id),
    notes
  );
  res.status(201).json({ success: true, data: request });
}
