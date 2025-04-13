import express, { Application } from "express";
import mongoose, { Connection } from "mongoose";
import createRoutes from "./routes/crudRoutes";

// Import directly from individual schema files
import { userSchema, User, type IUser } from "./schemas/userSchema";
import {
  questionSchema,
  Question,
  type IQuestion,
} from "./schemas/questionSchema";
import { quoteSchema, Quote, type IQuote } from "./schemas/quoteSchema";
import { whenceSchema, Whence, type IWhence } from "./schemas/whenceSchema";

const app: Application = express();
app.use(express.json());

app.use("/api/users", createRoutes<IUser>(User, userSchema));
app.use("/api/questions", createRoutes<IQuestion>(Question, questionSchema));
app.use("/api/quotes", createRoutes<IQuote>(Quote, quoteSchema));
app.use("/api/whence", createRoutes<IWhence>(Whence, whenceSchema));

const connectDB = async (): Promise<Connection> => {
  const mongoURI =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_TEST_URI ||
        "mongodb://localhost:27017/alignment_test"
      : process.env.MONGODB_URI || "mongodb://localhost:27017/zod2mongo";

  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${mongoURI}`);
    return mongoose.connection;
  } catch (error) {
    const err = error as Error;
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) {
  startServer();
}

export { app, connectDB, startServer };
