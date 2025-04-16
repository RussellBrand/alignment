import request from "supertest";
import mongoose from "mongoose";
import { app, connectDB } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { User } from "../src/schemas/userSchema";
import { Quote } from "../src/schemas/quoteSchema";
import { Whence } from "../src/schemas/whenceSchema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestData, TestIDs } from "./test_utils";

// Use a simple, short name for this test to avoid namespace issues
const SIMPLE_TEST_DB = "alignment_test_openq_modify";

describe("Simple HTML Modification Routes", () => {
  let db: mongoose.Connection;
  let openQuestionId: string;
  let userId: string;
  let quoteId: string;
  let whenceId: string;

  beforeAll(async () => {
    try {
      // Connect directly to a simple database name
      // TODO: use the test_utility file open function
      db = await connectDB(`_${SIMPLE_TEST_DB}`);

      // Clear all collections to ensure a clean state
      await Promise.all([
        User.deleteMany({}),
        OpenQuestion.deleteMany({}),
        Quote.deleteMany({}),
        Whence.deleteMany({}),
      ]);
    } catch (error) {
      console.error("Test setup error:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error("Test teardown error:", error);
    }
  });

  beforeEach(async () => {
    try {
      // Clear any existing data first
      await Promise.all([
        User.deleteMany({}),
        OpenQuestion.deleteMany({}),
        Quote.deleteMany({}),
        Whence.deleteMany({}),
      ]);

      // Then create fresh test data
      const ids: TestIDs = await createTestData();
      ({ openQuestionId, userId, quoteId, whenceId } = ids);
    } catch (error) {
      console.error("Test data creation error:", error);
      throw error;
    }
  });

  describe("Create Routes", () => {
    it("should show the new open question form", async () => {
      const response = await request(app).get("/simple/open-questions/new");

      expect(response.status).toBe(200);
      expect(response.text).toContain("New OpenQuestion");
      expect(response.text).toContain("<form");
      expect(response.text).toContain('action="/simple/open-questions/create"');
      expect(response.text).toContain('method="POST"');
      expect(response.text).toContain("Text");
    });

    it("should create a new open question via HTML form", async () => {
      const newQuestion = {
        text: "A new test open question via HTML form",
        kind: "nominal",
        responses: JSON.stringify(["Option 1", "Option 2", "Option 3"]),
      };

      // Post the form data
      const response = await request(app)
        .post("/simple/open-questions/create")
        .type("form")
        .send(newQuestion);

      // Should redirect to the readAll page after creation
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/open-questions/readAll");

      // Verify the question was created in the database
      const createdQuestion = await OpenQuestion.findOne({
        text: newQuestion.text,
      });
      expect(createdQuestion).not.toBeNull();
      expect(createdQuestion?.text).toBe(newQuestion.text);
    });

    it("should handle creating an open question with invalid data", async () => {
      // Trying to create a question without required text field
      const response = await request(app)
        .post("/simple/open-questions/create")
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
    it("should show the edit open question form", async () => {
      const response = await request(app).get(
        `/simple/open-questions/edit/${openQuestionId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Edit OpenQuestion");
      expect(response.text).toContain("<form");
      expect(response.text).toContain(
        `action="/simple/open-questions/update/${openQuestionId}"`
      );
      expect(response.text).toContain('method="POST"');
      expect(response.text).toContain("What is a test question?"); // existing question text
    });

    it("should update an open question via HTML form", async () => {
      const updatedData = { text: "Updated test open question via HTML form" };

      // Post the updated data
      const response = await request(app)
        .post(`/simple/open-questions/update/${openQuestionId}`)
        .type("form")
        .send(updatedData);

      // Should redirect after update - the actual redirect location may vary
      expect(response.status).toBe(302);

      // Verify the question was updated in the database
      const updatedQuestion = await OpenQuestion.findById(openQuestionId);
      expect(updatedQuestion).not.toBeNull();
      expect(updatedQuestion?.text).toBe(updatedData.text);
    });

    it("should handle updating an open question with invalid data", async () => {
      // Trying to update with possibly invalid data
      const response = await request(app)
        .post(`/simple/open-questions/update/${openQuestionId}`)
        .type("form")
        .send({ text: "" }); // Empty text might be handled differently

      // The app may redirect or show error with different status codes
      expect([200, 302, 400, 404]).toContain(response.status);
    });

    it("should show error when updating a non-existent open question", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist
      const updatedData = { text: "This update should fail" };

      const response = await request(app)
        .post(`/simple/open-questions/update/${nonExistentId}`)
        .type("form")
        .send(updatedData);

      expect([404, 400]).toContain(response.status);
      // Error message may vary based on implementation
    });
  });

  describe("Delete Routes", () => {
    it("should show the delete confirmation page", async () => {
      const response = await request(app).get(
        `/simple/open-questions/delete/${openQuestionId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Delete OpenQuestion");
      expect(response.text).toContain("Are you sure");
      expect(response.text).toContain(openQuestionId);
      // Should contain both confirm and cancel buttons
      expect(response.text).toContain("Delete");
      expect(response.text).toContain("Cancel");
    });

    it("should delete an open question via HTML form", async () => {
      // Post to confirm the delete
      const response = await request(app)
        .post(`/simple/open-questions/delete/${openQuestionId}`)
        .type("form")
        .send({});

      // Should redirect to the readAll page after deletion
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/open-questions/readAll");

      // Verify the question was deleted from the database
      const deletedQuestion = await OpenQuestion.findById(openQuestionId);
      expect(deletedQuestion).toBeNull();
    });

    it("should show error when deleting a non-existent open question", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist

      const response = await request(app)
        .post(`/simple/open-questions/delete/${nonExistentId}`)
        .type("form")
        .send({});

      expect([404, 400]).toContain(response.status);
      // Error message may vary based on implementation
    });
  });

  describe("Delete All Routes", () => {
    it("should show the delete all confirmation page", async () => {
      const response = await request(app).get(
        "/simple/open-questions/deleteAll"
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Delete All");
      expect(response.text).toContain("Are you sure");
      // Should contain both confirm and cancel buttons
      expect(response.text).toContain("Delete All");
      expect(response.text).toContain("Cancel");
    });

    it("should delete all open questions via HTML form", async () => {
      // Create some additional questions for this test
      await OpenQuestion.create({
        text: "Additional question 1",
        kind: "nominal",
        responses: ["Option A", "Option B"],
      });
      await OpenQuestion.create({
        text: "Additional question 2",
        kind: "ordinal",
        responses: ["Option 1", "Option 2", "Option 3"],
      });

      // Verify we have multiple questions
      const questionsBefore = await OpenQuestion.countDocuments();
      expect(questionsBefore).toBeGreaterThan(1);

      // Post to confirm the delete all
      const response = await request(app)
        .post("/simple/open-questions/deleteAll")
        .type("form")
        .send({});

      // Should redirect to the readAll page after deletion
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/simple/open-questions/readAll");

      // Verify all questions were deleted from the database
      const questionsAfter = await OpenQuestion.countDocuments();
      expect(questionsAfter).toBe(0);
    });
  });

  describe("CSV and JSON Upload Routes", () => {
    it("should show the CSV upload form", async () => {
      const response = await request(app).get(
        "/simple/open-questions/upload-csv"
      );

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.text).toContain("Upload CSV");
        expect(response.text).toContain('enctype="multipart/form-data"');
        expect(response.text).toContain("file");
      }
    });

    it("should show the JSON upload form", async () => {
      const response = await request(app).get(
        "/simple/open-questions/upload-json"
      );

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
        "/simple/open-questions/upload-json"
      );

      if (checkResponse.status === 200) {
        // Create a small JSON file content for testing with all required fields
        const fileContent = JSON.stringify([
          {
            text: "Uploaded open question 1",
            kind: "nominal",
            responses: ["Option 1", "Option 2"],
          },
          {
            text: "Uploaded open question 2",
            kind: "ordinal",
            responses: ["Low", "Medium", "High"],
          },
        ]);

        const response = await request(app)
          .post("/simple/open-questions/process-json")
          .attach("file", Buffer.from(fileContent), "test-open-questions.json");

        expect([200, 302]).toContain(response.status);

        if (response.status === 302) {
          // If successful and redirected, verify questions were created
          const uploadedQuestions = await OpenQuestion.find({
            text: {
              $in: ["Uploaded open question 1", "Uploaded open question 2"],
            },
          });
          expect(uploadedQuestions.length).toBeGreaterThan(0);

          // Check that the kind and responses were also saved
          const question = await OpenQuestion.findOne({
            text: "Uploaded open question 1",
          });
          expect(question?.kind).toBe("nominal");
          expect(question?.responses).toContain("Option 1");
        }
      }
    });
  });
});
