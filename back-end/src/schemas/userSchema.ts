import { z } from "zod";
import createModel from "@zodyac/zod-mongoose"; // Fixed import syntax
import { Document, model, Schema } from "mongoose";

// Define the schema once with Zod
export const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Export the type derived from the Zod schema
export type IUser = z.infer<typeof userSchema> & Document;

// Convert Zod schema to Mongoose schema
const UserMongooseSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

// Create and export the Mongoose model
export const User = model<IUser>("User", UserMongooseSchema);
