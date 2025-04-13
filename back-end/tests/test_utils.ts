/**
 * Utility functions for test files
 */

const path = require("path");
import mongoose from "mongoose";
import { connectDB } from "../src/server";
import { Question } from "../src/schemas/questionSchema";
import { User } from "../src/schemas/userSchema";
import { Quote } from "../src/schemas/quoteSchema";
import { Whence } from "../src/schemas/whenceSchema";

/**
 * Computes a unique database name for tests based on the file name
 * @param filePath The path to the test file
 * @returns A database name with "_" prefix and dots replaced by underscores
 */
export function computeDBname(filePath: string): string {
  const fileName = path.basename(filePath);
  return "_" + fileName.replace(/\./g, "_");
}

/**
 * Sets up the database connection for testing
 * @param dbName Name of the test database
 * @returns A Promise that resolves to the database connection
 */
export async function setupTestDB(
  dbName: string
): Promise<mongoose.Connection> {
  process.env.NODE_ENV = "test";
  return await connectDB(dbName);
}

/**
 * Cleans up the database connection after testing
 * @returns A Promise that resolves when the connection is closed
 */
export async function teardownTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

/**
 * Interface for IDs returned from createTestData
 */
export interface TestIDs {
  questionId: string;
  userId: string;
  quoteId: string;
  whenceId: string;
}

/**
 * Creates test data in the database
 * @returns A Promise that resolves to an object containing the created document IDs
 */
export async function createTestData(): Promise<TestIDs> {
  // Clean all collections
  await Question.deleteMany({});
  await User.deleteMany({});
  await Quote.deleteMany({});
  await Whence.deleteMany({});

  // Create test data for each model
  const question = await Question.create({
    text: "What is a test question?",
  });
  const questionId = question._id.toString();

  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
  });
  const userId = user._id.toString();

  const quote = await Quote.create({
    text: "This is a test quote",
    author: "Test Author",
  });
  const quoteId = quote._id.toString();

  const whence = await Whence.create({ source: "Test Source" });
  const whenceId = whence._id.toString();

  return {
    questionId,
    userId,
    quoteId,
    whenceId,
  };
}
