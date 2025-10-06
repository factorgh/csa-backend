import { Model, FilterQuery } from "mongoose";
import { IPaginationResult } from "../types/types";

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: {
    page?: number;
    limit?: number;
    sort?: any;
    projection?: any;
    lean?: boolean;
  } = {}
): Promise<IPaginationResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model
      .find(filter, options.projection)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(!!options.lean),
    model.countDocuments(filter),
  ]);

  return {
    data: data as any,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
