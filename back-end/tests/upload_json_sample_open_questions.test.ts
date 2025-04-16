import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { app, connectDB } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { computeDBname, setupTestDB, teardownTestDB } from "./test_utils";

const testDBname = computeDBname(__filename);

describe("Sample OpenQuestions JSON Upload", () => {
  let db: mongoose.Connection;
  let sampleData: any[];

  // Path to the sample JSON file
  const sampleFilePath = path.join(
    __dirname,
    "../samples/sample_open_questions.json"
  );

  beforeAll(async () => {
    // Connect to test database
    db = await setupTestDB(testDBname);

    // Read the sample data file
    const fileContent = fs.readFileSync(sampleFilePath, "utf8");
    sampleData = JSON.parse(fileContent);
  });

  afterAll(async () => {
    // Clean up test database connection
    await teardownTestDB();
  });

  it("should upload sample OpenQuestions data to database", async () => {
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
    // This test will check each specific question by ID

    // Select a few sample questions to verify in detail
    const sampleQuestionIds = [
      sampleData[0]._id, // First question
      sampleData[3]._id, // Fourth question
      sampleData[4]._id, // Fifth question
    ];

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
