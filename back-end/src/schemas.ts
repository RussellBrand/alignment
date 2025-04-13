import { z } from "zod";

export const userSchema: z.ZodObject<{ name: z.ZodString, email: z.ZodString }> =
  z.object({
    name: z.string(),
    email: z.string().email(),
  });

export const questionSchema: z.ZodObject<{ text: z.ZodString }> = z
  .object({
    text: z.string(),
  })
  .strict();

export const quoteSchema: z.ZodObject<{ text: z.ZodString, author: z.ZodString }> =
  z.object({
    text: z.string(),
    author: z.string(),
  });

export const whenceSchema: z.ZodObject<{ source: z.ZodString }> = z.object({
  source: z.string(),
});


