import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";

// Extend Zod with zodyac methods
extendZod(z);

// Define the schema once with Zod
export const openQuestionSchema = z
  .object({
    text: z.string(),
  })
  .strict();

// Extract the TypeScript type from the Zod schema
export type OpenQuestionType = z.infer<typeof openQuestionSchema>;

// Define the interface that extends mongoose.Document
export interface IOpenQuestion extends OpenQuestionType, mongoose.Document {}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(openQuestionSchema);

// Create and export the model with a type assertion to overcome the type compatibility issue
export const OpenQuestion = mongoose.model<IOpenQuestion>(
  "OpenQuestion",
  mongooseSchema as any
);
