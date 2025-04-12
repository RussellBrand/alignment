import { z } from "zod";

const userSchema: z.ZodObject<{ name: z.ZodString, email: z.ZodString }> =
  z.object({
    name: z.string(),
    email: z.string().email(),
  });

const questionSchema: z.ZodObject<{ text: z.ZodString }> = z
  .object({
    text: z.string(),
  })
  .strict();

const quoteSchema: z.ZodObject<{ text: z.ZodString, author: z.ZodString }> =
  z.object({
    text: z.string(),
    author: z.string(),
  });

const whenceSchema: z.ZodObject<{ source: z.ZodString }> = z.object({
  source: z.string(),
});

export { userSchema, questionSchema, quoteSchema, whenceSchema };
