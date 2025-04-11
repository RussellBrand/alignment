const mongoose = require("mongoose");
const { zodSchema } = require("@zodyac/zod-mongoose");
const schemas = require("../schemas");

// Define our own createModel function
const createModel = (name, schema) => mongoose.model(name, zodSchema(schema));

// Ensure all schemas exist before creating models
const User = createModel("User", schemas.userSchema);
const Question = createModel("Question", schemas.questionSchema);
const Quote = createModel("Quote", schemas.quoteSchema);
const Whence = createModel("Whence", schemas.whenceSchema);

module.exports = {
  User,
  Question,
  Quote,
  Whence,
};
