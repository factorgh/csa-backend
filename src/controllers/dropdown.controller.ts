import { Request, Response } from "express";
import Dropdown from "../models/dropdown.model";

export async function listPublic(
  _req: Request,
  res: Response
): Promise<Response> {
  const items = await Dropdown.find({ active: true }).sort({
    category: 1,
    sortOrder: 1,
  });
  return res.json({ success: true, data: items });
}

export async function upsert(req: Request, res: Response): Promise<Response> {
  const { category, code, label, description, active, sortOrder } = req.body;
  const item = await Dropdown.findOneAndUpdate(
    { category, code },
    { label, description, active, sortOrder },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return res.json({ success: true, data: item });
}

export async function manageList(
  _req: Request,
  res: Response
): Promise<Response> {
  const items = await Dropdown.find({}).sort({ category: 1, sortOrder: 1 });
  return res.json({ success: true, data: items });
}

export async function updateById(
  req: Request,
  res: Response
): Promise<Response> {
  const { id } = req.params;
  const { label, description, active, sortOrder, metadata, code, category } =
    req.body;
  const updated = await Dropdown.findByIdAndUpdate(
    id,
    { label, description, active, sortOrder, metadata, code, category },
    { new: true }
  );
  if (!updated)
    return res.status(404).json({ success: false, message: "Not found" });
  return res.json({ success: true, data: updated });
}

export async function deleteById(
  req: Request,
  res: Response
): Promise<Response> {
  const { id } = req.params;
  const result = await Dropdown.deleteOne({ _id: id } as any);
  if (result.deletedCount === 0)
    return res.status(404).json({ success: false, message: "Not found" });
  return res.status(204).send();
}
