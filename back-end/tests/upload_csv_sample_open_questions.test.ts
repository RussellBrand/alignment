import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync"; // We'll use csv-parse to parse the CSV
import { app, connectDB } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { computeDBname, setupTestDB, teardownTestDB } from "./test_utils";

const testDBname = computeDBname(__filename);

describe("Sample OpenQuestions CSV Upload", () => {
  let db: mongoose.Connection;
  let sampleData: any[];

  // Path to the sample CSV file
  const sampleFilePath = path.join(
    __dirname,
    "../samples/sample_open_questions.csv"
  );

  beforeAll(async () => {
    // Connect to test database
    db = await setupTestDB(testDBname);

    // Read the sample CSV file
    const fileContent = fs.readFileSync(sampleFilePath, "utf8");

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true, // Treat the first line as headers
      skip_empty_lines: true,
      trim: true,
    });

    // Transform CSV records to match the OpenQuestion schema format
    sampleData = records.map((record: any) => ({
      _id: record._id,
      text: record.text,
      kind: record.kind,
      // Split the responses string by commas, trim each response
      responses: record.responses
        ? record.responses.split(",").map((r: string) => r.trim())
        : [],
    }));
  });

  afterAll(async () => {
    // Clean up test database connection
    await teardownTestDB();
  });

  it("should upload sample OpenQuestions data from CSV to database", async () => {
    // Clear any existing data first
    await OpenQuestion.deleteMany({});

    // Insert the sample data into the database
    const insertResult = await OpenQuestion.insertMany(sampleData, {
      ordered: false, // Continue inserting even if some fail
      rawResult: true, // Get detailed result
    });

    expect(insertResult.insertedCount).toEqual(sampleData.length);

    // Fetch all documents from the database to verify
    const uploadedQuestions = await OpenQuestion.find({}).lean();

    // Verify correct number of questions
    expect(uploadedQuestions.length).toBe(sampleData.length);

    // Verify each question was uploaded correctly by checking IDs and content
    for (const sampleQuestion of sampleData) {
      const uploadedQuestion = uploadedQuestions.find(
        (q) => q._id.toString() === sampleQuestion._id
      );

      expect(uploadedQuestion).toBeDefined();

      if (uploadedQuestion) {
        expect(uploadedQuestion.text).toBe(sampleQuestion.text);
        expect(uploadedQuestion.kind).toBe(sampleQuestion.kind);

        // Compare responses arrays
        expect(uploadedQuestion.responses).toHaveLength(
          sampleQuestion.responses.length
        );
        for (const response of sampleQuestion.responses) {
          expect(uploadedQuestion.responses).toContain(response);
        }
      }
    }
  });

  it("should verify each specific question was uploaded correctly", async () => {
    // Verify all questions in detail instead of sampling
    const sampleQuestionIds = sampleData.map((question) => question._id);

    for (const questionId of sampleQuestionIds) {
      // Find the question in the original sample data
      const expectedQuestion = sampleData.find((q) => q._id === questionId);
      expect(expectedQuestion).toBeDefined();

      // Find the same question in the database
      const dbQuestion = await OpenQuestion.findById(questionId).lean();
      expect(dbQuestion).toBeDefined();

      // Verify all properties match
      expect(dbQuestion?.text).toBe(expectedQuestion.text);
      expect(dbQuestion?.kind).toBe(expectedQuestion.kind);

      // Verify responses array
      expect(dbQuestion?.responses).toHaveLength(
        expectedQuestion.responses.length
      );
      for (const response of expectedQuestion.responses) {
        expect(dbQuestion?.responses).toContain(response);
      }
    }

    // Count total questions to confirm all were uploaded
    const count = await OpenQuestion.countDocuments();
    expect(count).toBe(sampleData.length);
  });
});
