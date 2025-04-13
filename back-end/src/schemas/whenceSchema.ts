import { z } from "zod";
import createModel from "@zodyac/zod-mongoose"; // Fixed import syntax
import { Document, model, Schema } from "mongoose";

// Define the schema once with Zod
export const whenceSchema = z.object({
  source: z.string(),
});

// Export the type derived from the Zod schema
export type IWhence = z.infer<typeof whenceSchema> & Document;

// Convert Zod schema to Mongoose schema
const WhenceMongooseSchema = new Schema({
  source: { type: String, required: true },
});

// Create and export the Mongoose model
export const Whence = model<IWhence>("Whence", WhenceMongooseSchema);
