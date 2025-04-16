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


    expect(insertResult.insertedCount).toEqual(
      sampleData.length
    );

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

    // Verify first question
    const question1 = await OpenQuestion.findById(
      "60d21b4667d0d8992e610c01"
    ).lean();
    expect(question1).toBeDefined();
    expect(question1?.text).toBe(
      "What is your preferred programming language?"
    );
    expect(question1?.kind).toBe("nominal");
    expect(question1?.responses).toContain("JavaScript");
    expect(question1?.responses).toContain("Python");

    // Verify a different question
    const question4 = await OpenQuestion.findById(
      "60d21b4667d0d8992e610c04"
    ).lean();
    expect(question4).toBeDefined();
    expect(question4?.text).toBe(
      "How satisfied are you with your current development environment?"
    );
    expect(question4?.kind).toBe("ordinal");
    expect(question4?.responses).toContain("Very satisfied");
    expect(question4?.responses).toContain("Neutral");

    // Verify the question with the kind typo
    const question5 = await OpenQuestion.findById(
      "60d21b4667d0d8992e610c05"
    ).lean();
    expect(question5).toBeDefined();
    expect(question5?.text).toBe("Which database technology do you prefer?");
    expect(question5?.kind).toBe("nominal");

    // Count total questions to confirm all were uploaded
    const count = await OpenQuestion.countDocuments();
    expect(count).toBe(sampleData.length);
  });
});
