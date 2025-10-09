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
    populate?: any; // new: support populate
  } = {}
): Promise<IPaginationResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;
  const query = model
    .find(filter, options.projection)
    .sort(options.sort || { createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Apply populate if provided
  if (options.populate) {
    (query as any).populate(options.populate);
  }

  if (options.lean) {
    (query as any).lean(true);
  }

  const [data, total] = await Promise.all([query, model.countDocuments(filter)]);

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
