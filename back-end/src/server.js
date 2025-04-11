const express = require("express");
const mongoose = require("mongoose");
const { User, Question, Quote, Whence } = require("./models");
const createRoutes = require("./routes/crudRoutes");
const schemas = require("./schemas");

// Create Express app
const app = express();
app.use(express.json());

// Register routes with /api prefix
app.use("/api/users", createRoutes(User, schemas.userSchema));
app.use("/api/questions", createRoutes(Question, schemas.questionSchema));
app.use("/api/quotes", createRoutes(Quote, schemas.quoteSchema));
app.use("/api/whence", createRoutes(Whence, schemas.whenceSchema));

// Database connection function - exported separately
const connectDB = async () => {
  const mongoURI =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_TEST_URI ||
        "mongodb://localhost:27017/alignment_test"
      : process.env.MONGODB_URI || "mongodb://localhost:27017/zod2mongo";

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${mongoURI}`);
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Start server function - separated from app definition
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Start server only if not imported as a module
if (require.main === module) {
  startServer();
}

// Export for testing - now exports functions separately
module.exports = { app, connectDB, startServer };
