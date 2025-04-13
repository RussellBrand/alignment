import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";

// Extend Zod with zodyac methods
extendZod(z);

// Define the schema once with Zod
export const questionSchema = z
  .object({
    text: z.string(),
  })
  .strict();

// Extract the TypeScript type from the Zod schema
export type QuestionType = z.infer<typeof questionSchema>;

// Define the interface that extends mongoose.Document
export interface IQuestion extends QuestionType, mongoose.Document {}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(questionSchema);

// Create and export the model with a type assertion to overcome the type compatibility issue
export const Question = mongoose.model<IQuestion>(
  "Question",
  mongooseSchema as any
);
