import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";
import mongoose from "mongoose";

// Extend Zod with zodyac methods
extendZod(z);

// Define the Zod schema for validation and type inference
export const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
});

// Extract the TypeScript type from the Zod schema
export type QuoteType = z.infer<typeof quoteSchema>;

// Define the interface that extends mongoose.Document
export interface IQuote extends QuoteType, mongoose.Document {}

// Create the mongoose schema using zodSchema from the Zod schema
const mongooseSchema = zodSchema(quoteSchema);

// Create and export the model with a type assertion to overcome the type compatibility issue
export const Quote = mongoose.model<IQuote>("Quote", mongooseSchema as any);
