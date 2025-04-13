import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";

// Extend Zod with zodyac methods
extendZod(z);

// Define the schema once with Zod
export const whenceSchema = z.object({
  source: z.string(),
});

// Extract the TypeScript type from the Zod schema
export type WhenceType = z.infer<typeof whenceSchema>;

// Define the interface that extends mongoose.Document
export interface IWhence extends WhenceType, mongoose.Document {}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(whenceSchema);

// Create and export the model with a type assertion to overcome the type compatibility issue
export const Whence = mongoose.model<IWhence>("Whence", mongooseSchema as any);
