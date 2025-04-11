const { z } = require("zod");

module.exports = (schema) => (req, res, next) => {
  console.log(
    "Request body:",
    req.body,
    "Content-Type:",
    req.headers["content-type"]
  );

  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.error("***Validation error:", req.body, error.errors);

    res.status(400).json({
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }
};
