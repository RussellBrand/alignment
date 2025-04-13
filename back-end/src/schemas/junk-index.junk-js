const { z } = require("zod");
const { extendZod } = require("@zodyac/zod-mongoose");

// Extend Zod with MongoDB capabilities
extendZod(z);

module.exports = {
  userSchema: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().regex(/^\d+$/, "Phone must contain only digits"),
  }),

  questionSchema: z.object({
    q: z.string().min(1, "Question is required"),
    a: z.number().int("Answer must be an integer"),
  }),

  quoteSchema: z.object({
    fulltext: z.string().min(1, "Full text is required"),
  }),

  whenceSchema: z
    .object({
      begun_at: z.date(),
      ended_at: z.date(),
    })
    .refine((data) => data.begun_at <= data.ended_at, {
      message: "begun_at must be earlier than ended_at",
    }),
};
