import mongoose, { Document, Schema } from "mongoose";
import { DropdownCategory } from "../types/types";

export interface IDropdown extends Document {
  _id: mongoose.Types.ObjectId;
  category: DropdownCategory;
  code: string;
  label: string;
  description?: string;
  active: boolean;
  sortOrder: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const dropdownSchema = new Schema<IDropdown>(
  {
    category: {
      type: String,
      enum: Object.values(DropdownCategory),
      required: [true, "Category is required"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      uppercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint on category + code
dropdownSchema.index({ category: 1, code: 1 }, { unique: true });
dropdownSchema.index({ category: 1, active: 1, sortOrder: 1 });

const Dropdown = mongoose.model<IDropdown>("Dropdown", dropdownSchema);

export default Dropdown;
