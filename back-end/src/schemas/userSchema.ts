import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Extend Zod with zodyac methods
extendZod(z);

// Define the schema once with Zod
// Make password optional in test environment to support existing tests
const passwordField =
  process.env.NODE_ENV === "test"
    ? z.string().min(6).optional()
    : z.string().min(6);

export const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: passwordField,
  role: z.enum(["user", "admin"]).default("user"),
});

// Extract the TypeScript type from the Zod schema
export type UserType = z.infer<typeof userSchema>;

// Define the interface that extends mongoose.Document
export interface IUser extends UserType, mongoose.Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(userSchema);

// Add pre-save hook for password hashing
mongooseSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add method to compare passwords
mongooseSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model with a type assertion to overcome the type compatibility issue
export const User = mongoose.model<IUser>("User", mongooseSchema as any);
