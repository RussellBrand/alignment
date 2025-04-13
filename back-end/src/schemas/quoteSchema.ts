import { z } from "zod";
import createModel from "@zodyac/zod-mongoose"; // Fixed import syntax
import { Document, model, Schema } from "mongoose";

// Define the schema once with Zod
export const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
});

// Export the type derived from the Zod schema
export type IQuote = z.infer<typeof quoteSchema> & Document;

// Convert Zod schema to Mongoose schema
const QuoteMongooseSchema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
});

// Create and export the Mongoose model
export const Quote = model<IQuote>("Quote", QuoteMongooseSchema);
