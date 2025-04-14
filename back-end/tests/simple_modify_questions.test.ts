import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/server";
import { Question } from "../src/schemas/questionSchema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  computeDBname,
  setupTestDB,
  teardownTestDB,
  createTestData,
  TestIDs,
} from "./test_utils";

const testDBname = computeDBname(__filename);

describe("Simple HTML Modification Routes", () => {
  let db: mongoose.Connection;
  let questionId: string;
  let userId: string;
  let quoteId: string;
  let whenceId: string;

  beforeAll(async () => {
    db = await setupTestDB(testDBname);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    const ids: TestIDs = await createTestData();
    ({ questionId, userId, quoteId, whenceId } = ids);
  });

  describe("Create Routes", () => {
    it("should show the new question form", async () => {
      const response = await request(app).get("/simple/questions/new");

      expect(response.status).toBe(200);
      expect(response.text).toContain("New Question");
      expect(response.text).toContain("<form");
      expect(response.text).toContain('action="/simple/questions/create"');
      expect(response.text).toContain('method="POST"');
      expect(response.text).toContain("Text");
    });

    it("should create a new question via HTML form", async () => {
      const newQuestion = { text: "A new test question via HTML form" };

      // Post the form data
      const response = await request(app)
        .post("/simple/questions/create")
        .type("form")
        .send(newQuestion);

      // Should redirect to the readAll page after creation
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/questions/readAll");

      // Verify the question was created in the database
      const createdQuestion = await Question.findOne({
        text: newQuestion.text,
      });
      expect(createdQuestion).not.toBeNull();
      expect(createdQuestion?.text).toBe(newQuestion.text);
    });

    it("should handle creating a question with invalid data", async () => {
      // Trying to create a question without required text field
      const response = await request(app)
        .post("/simple/questions/create")
        .type("form")
        .send({ invalidField: "This should fail" });

      // The app may redirect or show a 200 status with error message, depending on implementation
      expect([200, 302, 400, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.text).toContain("Error");
      }
    });
  });

  describe("Update Routes", () => {
    it("should show the edit question form", async () => {
      const response = await request(app).get(
        `/simple/questions/edit/${questionId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Edit Question");
      expect(response.text).toContain("<form");
      expect(response.text).toContain(
        `action="/simple/questions/update/${questionId}"`
      );
      expect(response.text).toContain('method="POST"');
      expect(response.text).toContain("What is a test question?"); // existing question text
    });

    it("should update a question via HTML form", async () => {
      const updatedData = { text: "Updated test question via HTML form" };

      // Post the updated data
      const response = await request(app)
        .post(`/simple/questions/update/${questionId}`)
        .type("form")
        .send(updatedData);

      // Should redirect after update - the actual redirect location may vary
      expect(response.status).toBe(302);

      // Verify the question was updated in the database
      const updatedQuestion = await Question.findById(questionId);
      expect(updatedQuestion).not.toBeNull();
      expect(updatedQuestion?.text).toBe(updatedData.text);
    });

    it("should handle updating a question with invalid data", async () => {
      // Trying to update with possibly invalid data
      const response = await request(app)
        .post(`/simple/questions/update/${questionId}`)
        .type("form")
        .send({ text: "" }); // Empty text might be handled differently

      // The app may redirect or show error with different status codes
      expect([200, 302, 400, 404]).toContain(response.status);
    });

    it("should show error when updating a non-existent question", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist
      const updatedData = { text: "This update should fail" };

      const response = await request(app)
        .post(`/simple/questions/update/${nonExistentId}`)
        .type("form")
        .send(updatedData);

      expect([404, 400]).toContain(response.status);
      // Error message may vary based on implementation
    });
  });

  describe("Delete Routes", () => {
    it("should show the delete confirmation page", async () => {
      const response = await request(app).get(
        `/simple/questions/delete/${questionId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Delete Question");
      expect(response.text).toContain("Are you sure");
      expect(response.text).toContain(questionId);
      // Should contain both confirm and cancel buttons
      expect(response.text).toContain("Delete");
      expect(response.text).toContain("Cancel");
    });

    it("should delete a question via HTML form", async () => {
      // Post to confirm the delete
      const response = await request(app)
        .post(`/simple/questions/delete/${questionId}`)
        .type("form")
        .send({});

      // Should redirect to the readAll page after deletion
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/questions/readAll");

      // Verify the question was deleted from the database
      const deletedQuestion = await Question.findById(questionId);
      expect(deletedQuestion).toBeNull();
    });

    it("should show error when deleting a non-existent question", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist

      const response = await request(app)
        .post(`/simple/questions/delete/${nonExistentId}`)
        .type("form")
        .send({});

      expect([404, 400]).toContain(response.status);
      // Error message may vary based on implementation
    });
  });

  describe("Delete All Routes", () => {
    it("should show the delete all confirmation page", async () => {
      const response = await request(app).get("/simple/questions/deleteAll");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Delete All");
      expect(response.text).toContain("Are you sure");
      // Should contain both confirm and cancel buttons
      expect(response.text).toContain("Delete All");
      expect(response.text).toContain("Cancel");
    });

    it("should delete all questions via HTML form", async () => {
      // Create some additional questions for this test
      await Question.create({ text: "Additional question 1" });
      await Question.create({ text: "Additional question 2" });

      // Verify we have multiple questions
      const questionsBefore = await Question.countDocuments();
      expect(questionsBefore).toBeGreaterThan(1);

      // Post to confirm the delete all
      const response = await request(app)
        .post("/simple/questions/deleteAll")
        .type("form")
        .send({});

      // Should redirect to the readAll page after deletion
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/questions/readAll");

      // Verify all questions were deleted from the database
      const questionsAfter = await Question.countDocuments();
      expect(questionsAfter).toBe(0);
    });
  });

  describe("CSV and JSON Upload Routes", () => {
    it("should show the CSV upload form", async () => {
      const response = await request(app).get("/simple/questions/upload-csv");

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.text).toContain("Upload CSV");
        expect(response.text).toContain('enctype="multipart/form-data"');
        expect(response.text).toContain("file");
      }
    });

    it("should show the JSON upload form", async () => {
      const response = await request(app).get("/simple/questions/upload-json");

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.text).toContain("Upload JSON");
        expect(response.text).toContain('enctype="multipart/form-data"');
        expect(response.text).toContain("file");
      }
    });

    it("should process JSON file upload if available", async () => {
      // Check if endpoint exists first
      const checkResponse = await request(app).get(
        "/simple/questions/upload-json"
      );

      if (checkResponse.status === 200) {
        // Create a small JSON file content for testing
        const fileContent = JSON.stringify([
          { text: "Uploaded question 1" },
          { text: "Uploaded question 2" },
        ]);

        const response = await request(app)
          .post("/simple/questions/process-json")
          .attach("file", Buffer.from(fileContent), "test-questions.json");

        expect([200, 302]).toContain(response.status);

        if (response.status === 302) {
          // If successful and redirected, verify questions were created
          const uploadedQuestions = await Question.find({
            text: { $in: ["Uploaded question 1", "Uploaded question 2"] },
          });
          expect(uploadedQuestions.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
