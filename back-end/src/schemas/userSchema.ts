import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";

// Extend Zod with zodyac methods
extendZod(z);

// Define the schema once with Zod
export const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Extract the TypeScript type from the Zod schema
export type UserType = z.infer<typeof userSchema>;

// Define the interface that extends mongoose.Document
export interface IUser extends UserType, mongoose.Document {}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(userSchema);

// Create and export the model with a type assertion to overcome the type compatibility issue
export const User = mongoose.model<IUser>("User", mongooseSchema as any);
