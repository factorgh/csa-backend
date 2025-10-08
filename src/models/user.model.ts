import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import type {
  UserRole as UserRoleT,
  UserStatus as UserStatusT,
} from "../types/types";
import { UserRole, UserStatus } from "../types/runtime";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  telephoneNumber?: string;
  role: UserRoleT;
  designation?: string;
  gender?: string;
  status: UserStatusT;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: function (this: any) {
        return this.isNew || this.isModified("password");
      },
      minlength: [8, "Confirm Password must be at least 8 characters"],
      validate: {
        validator: function (this: any, value: string): boolean {
          // Only runs on CREATE and SAVE
          return value === this.password;
        },
        message: "Passwords do not match",
      },
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    telephoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.APPLICANT,
    } as any,
    designation: {
      type: String,
    } as any,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    } as any,
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.INACTIVE,
    } as any,
    lastLoginAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (this: any, next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (
  this: any,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// 🧹 Remove sensitive data from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.confirmPassword;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
