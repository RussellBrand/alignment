const { z } = require("zod");

// Define all schemas used by your models
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  // Add other user fields as needed
});

const questionSchema = z
  .object({
    text: z.string(),
    // Add other question fields as needed
  })
  .strict();
// The `.strict()` method ensures that no additional fields are allowed in the object

const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
  // Add other quote fields as needed
});

const whenceSchema = z.object({
  source: z.string(),
  // Add other whence fields as needed
});

module.exports = {
  userSchema,
  questionSchema,
  quoteSchema,
  whenceSchema,
};
