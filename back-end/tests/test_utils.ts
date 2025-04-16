/**
 * Utility functions for test files
 */

import mongoose from "mongoose";
import path from "path";
import { app, connectDB } from "../src/server";
import { User } from "../src/schemas/userSchema";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { Quote } from "../src/schemas/quoteSchema";
import { Whence } from "../src/schemas/whenceSchema";

export interface TestIDs {
  openQuestionId: string;
  userId: string;
  quoteId: string;
  whenceId: string;
}

/**
 * Computes a unique database name based on the test file name
 * Ensures the name is valid for MongoDB (no periods, etc.)
 */
export function computeDBname(fileName: string): string {
  // Extract basename and remove extension
  const baseName = path.basename(fileName, path.extname(fileName));
  // Replace any non-alphanumeric characters with underscores to avoid MongoDB name restrictions
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
  // Add timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  return `test_${sanitizedName}_${timestamp}`;
}

/**
 * Sets up a test database with a unique name
 */
export async function setupTestDB(
  dbName: string
): Promise<mongoose.Connection> {
  try {
    // Connect to a test database with a unique name
    const db = await connectDB(`_${dbName}`);

    // Explicitly wait for connection to be fully established
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear all collections to ensure a clean state
    await Promise.all([
      User.deleteMany({}),
      OpenQuestion.deleteMany({}),
      Quote.deleteMany({}),
      Whence.deleteMany({}),
    ]);

    return db;
  } catch (error) {
    console.error("Test database setup failed:", error);
    throw error; // Re-throw to ensure tests fail properly
  }
}

/**
 * Tears down the test database connection
 */
export async function teardownTestDB(): Promise<void> {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Test database teardown failed:", error);
  }
}

/**
 * Creates test data for all models and returns their IDs
 */
export async function createTestData(): Promise<TestIDs> {
  // Create test open question
  const openQuestion = await OpenQuestion.create({
    text: "What is a test question?",
  });

  // Create test user with minimal fields (password is optional in test env)
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
  });

  // Create test quote
  const quote = await Quote.create({
    text: "This is a test quote",
    author: "Test Author",
  });

  // Create test whence
  const whence = await Whence.create({
    source: "Test Source",
  });

  const result: any = {
    openQuestionId: openQuestion._id.toString(),
    userId: user._id.toString(),
    quoteId: quote._id.toString(),
    whenceId: whence._id.toString(),
  };

  // For backward compatibility with existing tests
  result.questionId = result.openQuestionId;

  return result;
}
