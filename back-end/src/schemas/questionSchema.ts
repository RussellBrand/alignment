import { z } from "zod";
import createModel from "@zodyac/zod-mongoose"; // Fixed import syntax
import { Document, model, Schema } from "mongoose";

// Define the schema once with Zod
export const questionSchema = z
  .object({
    text: z.string(),
  })
  .strict();

// Export the type derived from the Zod schema
export type IQuestion = z.infer<typeof questionSchema> & Document;

// Convert Zod schema to Mongoose schema
const QuestionMongooseSchema = new Schema({
  text: { type: String, required: true },
});

// Create and export the Mongoose model
export const Question = model<IQuestion>("Question", QuestionMongooseSchema);
