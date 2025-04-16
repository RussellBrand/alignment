import express, { Application } from "express";
import mongoose, { Connection } from "mongoose";
import passport from "./config/passport";
import session from "express-session";
import createRoutes from "./routes/crudRoutes";
import createSimpleRoutes from "./routes/simpleRoutes";
import simpleController from "./controllers/simpleController";
import authRoutes from "./routes/auth/authRoutes";

// Import directly from individual schema files
import { userSchema, User, type IUser } from "./schemas/userSchema";
import {
  openQuestionSchema,
  OpenQuestion,
  type IOpenQuestion,
} from "./schemas/openQuestionSchema";
import { quoteSchema, Quote, type IQuote } from "./schemas/quoteSchema";
import { whenceSchema, Whence, type IWhence } from "./schemas/whenceSchema";

const app: Application = express();
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.use("/api/auth", authRoutes);

// Regular API routes
app.use("/api/users", createRoutes<IUser>(User, userSchema));

// Set up routes for open-questions
const openQuestionApiRoutes = createRoutes<IOpenQuestion>(
  OpenQuestion,
  openQuestionSchema
);
app.use("/api/open-questions", openQuestionApiRoutes);
// Backward compatibility alias for old routes
app.use("/api/questions", openQuestionApiRoutes);

app.use("/api/quotes", createRoutes<IQuote>(Quote, quoteSchema));
app.use("/api/whence", createRoutes<IWhence>(Whence, whenceSchema));

// Simple HTML routes - now passing schemas directly
app.use("/simple/users", createSimpleRoutes(User, userSchema));

// Set up simple routes for open-questions
const openQuestionSimpleRoutes = createSimpleRoutes(
  OpenQuestion,
  openQuestionSchema
);
app.use("/simple/open-questions", openQuestionSimpleRoutes);
// Backward compatibility alias for old routes
app.use("/simple/questions", openQuestionSimpleRoutes);

app.use("/simple/quotes", createSimpleRoutes(Quote, quoteSchema));
app.use("/simple/whence", createSimpleRoutes(Whence, whenceSchema));

// Dashboard route
app.get(
  "/simple",
  simpleController.dashboard(["Users", "OpenQuestions", "Quotes", "Whence"])
);

// Redirect root to simple dashboard
app.get("/", (_req, res) => {
  res.redirect("/simple");
});

const connectDB = async (dbSuffix?: string): Promise<Connection> => {
  const baseMongoURI =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_TEST_URI ||
        "mongodb://localhost:27017/alignment_test"
      : process.env.MONGODB_URI || "mongodb://localhost:27017/zod2mongo";

  // Append the suffix to the database name if provided
  const mongoURI = dbSuffix
    ? baseMongoURI.replace(/\/([^\/]+)$/, `/$1${dbSuffix}`)
    : baseMongoURI;

  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${mongoURI}`);
    return mongoose.connection;
  } catch (error) {
    const err = error as Error;
    console.error("MongoDB connection error:", err.message);

    // In test environments, throw the error instead of exiting the process
    // This allows tests to catch and handle the error properly
    if (process.env.NODE_ENV === "test") {
      throw error;
    }

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
