const express = require("express");
const mongoose = require("mongoose");
const { User, Question, Quote, Whence } = require("./models");
const createRoutes = require("./routes/crudRoutes");
const schemas = require("./schemas");

const app = express();
app.use(express.json());

// Database connection
const connectDB = async () => {
  const mongoURI = process.env.NODE_ENV === "test"
    ? (process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/alignment_test")
    : (process.env.MONGODB_URI || "mongodb://localhost:27017/zod2mongo");
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${mongoURI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Register routes with /api prefix
app.use("/api/users", createRoutes(User, schemas.userSchema));
app.use("/api/questions", createRoutes(Question, schemas.questionSchema));
app.use("/api/quotes", createRoutes(Quote, schemas.quoteSchema));
app.use("/api/whence", createRoutes(Whence, schemas.whenceSchema));

// Start server only if not imported as a module
let server;
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  // If imported as a module (for tests), don't start the server automatically
  connectDB();
}

// Export for testing
module.exports = { app, server };
