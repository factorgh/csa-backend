import { Request, Response } from 'express';
import Dropdown from '../models/dropdown.model';

export async function listPublic(_req: Request, res: Response) {
  const items = await Dropdown.find({ active: true }).sort({ category: 1, sortOrder: 1 });
  res.json({ success: true, data: items });
}

export async function upsert(req: Request, res: Response) {
  const { category, code, label, description, active, sortOrder } = req.body;
  const item = await Dropdown.findOneAndUpdate(
    { category, code },
    { label, description, active, sortOrder },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: item });
}

export async function manageList(_req: Request, res: Response) {
  const items = await Dropdown.find({}).sort({ category: 1, sortOrder: 1 });
  res.json({ success: true, data: items });
}
