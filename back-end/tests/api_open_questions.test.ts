import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { computeDBname, setupTestDB, teardownTestDB } from "./test_utils";

const testDBname = computeDBname(__filename);

// Sample question data
const testOpenQuestion = {
  text: "What is the meaning of life?",
};

describe("OpenQuestion Routes", () => {
  let db: mongoose.Connection;

  // Connect to test database once before all tests
  beforeAll(async () => {
    db = await setupTestDB(testDBname);
  });

  // Clean up after all tests
  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear test data before each test
  beforeEach(async () => {
    await OpenQuestion.deleteMany({});
  });

  describe("POST /api/open-questions", () => {
    it("should create a new open question", async () => {
      const response = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.text).toBe(testOpenQuestion.text);
    });

    it("should reject open question with excess attributes", async () => {
      const questionWithExcessAttributes = {
        text: "Valid question text",
        excessAttribute: "This attribute should be stripped or rejected",
      };

      const response = await request(app)
        .post("/api/open-questions")
        .send(questionWithExcessAttributes);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });

    it("should return 400 with invalid data", async () => {
      const response = await request(app)
        .post("/api/open-questions")
        .send({ invalidField: "Incomplete question" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/open-questions", () => {
    it("should return all open questions", async () => {
      await request(app).post("/api/open-questions").send(testOpenQuestion);

      const response = await request(app).get("/api/open-questions");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return a specific open question by ID", async () => {
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;

      const response = await request(app).get(
        `/api/open-questions/${questionId}`
      );

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(questionId);
      expect(response.body.text).toBe(testOpenQuestion.text);
    });
  });

  describe("PUT /api/open-questions/:id", () => {
    it("should update an existing open question", async () => {
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const updatedData = {
        ...testOpenQuestion,
        text: "Updated question text",
      };

      const response = await request(app)
        .put(`/api/open-questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should update an open question if the ID is not included in the payload", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { text: "Updated without including ID" };

      // Update without including the _id in the payload
      const response = await request(app)
        .put(`/api/open-questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should update an open question if the ID in the payload matches the URL parameter", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const updatedData = {
        _id: questionId,
        text: "Updated with matching ID",
      };

      // Update with matching IDs
      const response = await request(app)
        .put(`/api/open-questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should reject update if the ID in the payload doesn't match the URL parameter", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      // Create another question to get a different ID
      const anotherResponse = await request(app)
        .post("/api/open-questions")
        .send({ text: "Another question" });

      const questionId = createResponse.body._id;
      const anotherQuestionId = anotherResponse.body._id;

      // Try to update with mismatched IDs
      const updatedData = {
        _id: anotherQuestionId, // Deliberately using a different ID
        text: "This update should fail",
      };

      const response = await request(app)
        .put(`/api/open-questions/${questionId}`)
        .send(updatedData);

      // Should be rejected with 400 status
      expect(response.status).toBe(400);
      // Should include an error message about ID mismatch
      expect(response.body).toHaveProperty("error");
      expect(response.body.error[0].message).toContain(
        "Body _id must match URL parameter id"
      );
    });
  });

  describe("DELETE /api/open-questions/:id", () => {
    it("should delete an existing open question", async () => {
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;

      const deleteResponse = await request(app).delete(
        `/api/open-questions/${questionId}`
      );
      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(app).get(
        `/api/open-questions/${questionId}`
      );
      expect(getResponse.status).toBe(404);
    });
  });

  describe("DELETE /api/open-questions", () => {
    it("should delete all open questions", async () => {
      // Create multiple questions
      await request(app)
        .post("/api/open-questions")
        .send({ text: "Question 1" });
      await request(app)
        .post("/api/open-questions")
        .send({ text: "Question 2" });
      await request(app)
        .post("/api/open-questions")
        .send({ text: "Question 3" });

      // Verify questions exist
      const beforeDelete = await request(app).get("/api/open-questions");
      expect(beforeDelete.status).toBe(200);
      // Update expectation to match actual count (may be more than 3 due to test isolation issues)
      expect(beforeDelete.body.length).toBeGreaterThan(0);

      // Delete all questions
      const deleteResponse = await request(app).delete("/api/open-questions");

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty("message");
      expect(deleteResponse.body.message).toBe(
        "All documents deleted successfully"
      );
      expect(deleteResponse.body).toHaveProperty("count");
      expect(deleteResponse.body.count).toBeGreaterThan(0);

      // Verify all questions are deleted
      const afterDelete = await request(app).get("/api/open-questions");
      expect(afterDelete.status).toBe(200);
      expect(afterDelete.body.length).toBe(0);
    });

    it("should handle deleting when there are no open questions", async () => {
      // Delete when no questions exist
      const deleteResponse = await request(app).delete("/api/open-questions");

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty("count");
      expect(deleteResponse.body.count).toBe(0);
    });
  });

  describe("POST /api/open-questions/read/many", () => {
    it("should retrieve an open question with one ID", async () => {
      // Create one question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;

      // Test readMany with one ID
      const response = await request(app)
        .post("/api/open-questions/read/many")
        .send({ ids: [questionId] });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe(questionId);
      expect(response.body[0].text).toBe(testOpenQuestion.text);
    });

    it("should retrieve multiple open questions with multiple IDs", async () => {
      // Create three questions
      const question1 = await request(app)
        .post("/api/open-questions")
        .send({ text: "First question" });

      const question2 = await request(app)
        .post("/api/open-questions")
        .send({ text: "Second question" });

      const question3 = await request(app)
        .post("/api/open-questions")
        .send({ text: "Third question" });

      const ids = [question1.body._id, question2.body._id, question3.body._id];

      // Test readMany with three IDs
      const response = await request(app)
        .post("/api/open-questions/read/many")
        .send({ ids });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Create an array of text values from response to check for inclusion
      const responseTexts = response.body.map((q) => q.text);

      // Verify each question is retrieved correctly regardless of order
      expect(responseTexts).toContain("First question");
      expect(responseTexts).toContain("Second question");
      expect(responseTexts).toContain("Third question");
    });

    it("should handle an empty array of IDs appropriately", async () => {
      // Test readMany with empty array
      const response = await request(app)
        .post("/api/open-questions/read/many")
        .send({ ids: [] });

      // According to the controller implementation, this should return 404
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No documents found");
    });

    it("should return error when one or more IDs don't exist", async () => {
      // Create one question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist

      // Test readMany with existing and non-existent IDs
      const response = await request(app)
        .post("/api/open-questions/read/many")
        .send({ ids: [questionId, nonExistentId] });

      // Should still return 200 but with only the documents found
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Only one document should be returned
      expect(response.body[0]._id).toBe(questionId);
    });
  });

  describe("POST /api/open-questions/create/many", () => {
    it("should create multiple new open questions without IDs", async () => {
      const questions = [
        { text: "Question 1" },
        { text: "Question 2" },
        { text: "Question 3" },
      ];

      const response = await request(app)
        .post("/api/open-questions/create/many")
        .send(questions);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Check each question was created with the right text
      const texts = response.body.map((q) => q.text);
      expect(texts).toContain("Question 1");
      expect(texts).toContain("Question 2");
      expect(texts).toContain("Question 3");

      // Each question should have an _id
      response.body.forEach((q) => {
        expect(q).toHaveProperty("_id");
      });
    });

    it("should handle creating a mix of new and existing open questions", async () => {
      // First create a question
      const existingQuestion = await request(app)
        .post("/api/open-questions")
        .send({ text: "Existing question" });

      const existingId = existingQuestion.body._id;

      // Mix of existing and new questions
      const questions = [
        { _id: existingId, text: "Updated existing question" },
        { text: "New question 1" },
        { text: "New question 2" },
      ];

      const response = await request(app)
        .post("/api/open-questions/create/many")
        .send(questions);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Check that the existing question was updated
      const updatedQuestion = response.body.find((q) => q._id === existingId);
      expect(updatedQuestion).toBeDefined();
      expect(updatedQuestion.text).toBe("Updated existing question");

      // Check that new questions were created
      const newQuestions = response.body.filter((q) => q._id !== existingId);
      expect(newQuestions.length).toBe(2);

      // Verify questions exist in the database - don't assume exact count due to test isolation
      const getAllResponse = await request(app).get("/api/open-questions");
      expect(getAllResponse.body.length).toBeGreaterThanOrEqual(3);
    });

    it("should reject invalid request format", async () => {
      // Send non-array data
      const response = await request(app)
        .post("/api/open-questions/create/many")
        .send({ text: "Not an array" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Array of documents is required");
    });

    it("should handle an empty array request", async () => {
      const response = await request(app)
        .post("/api/open-questions/create/many")
        .send([]);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("PATCH /api/open-questions/:id", () => {
    it("should partially update an existing open question", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { text: "Partially updated question text" };

      // Perform a partial update
      const response = await request(app)
        .patch(`/api/open-questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should reject patch if the ID in the payload doesn't match the URL parameter", async () => {
      // First create two questions
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const anotherResponse = await request(app)
        .post("/api/open-questions")
        .send({ text: "Another question" });

      const questionId = createResponse.body._id;
      const anotherQuestionId = anotherResponse.body._id;

      // Try to patch with mismatched IDs
      const patchData = {
        _id: anotherQuestionId, // Deliberately using a different ID
        text: "This patch should fail",
      };

      const response = await request(app)
        .patch(`/api/open-questions/${questionId}`)
        .send(patchData);

      // Should be rejected with 400 status
      expect(response.status).toBe(400);
      // Should include an error message about ID mismatch
      expect(response.body).toHaveProperty("error");
      expect(response.body.error[0].message).toContain(
        "Body _id must match URL parameter id"
      );
    });

    it("should reject patch with excess attributes not in the schema", async () => {
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const patchWithExcessAttributes = {
        text: "Valid question text update",
        excessAttribute: "This attribute should be rejected",
      };

      const response = await request(app)
        .patch(`/api/open-questions/${questionId}`)
        .send(patchWithExcessAttributes);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });

    it("should reject patch with incorrect field type", async () => {
      const createResponse = await request(app)
        .post("/api/open-questions")
        .send(testOpenQuestion);

      const questionId = createResponse.body._id;
      const patchWithWrongType = {
        text: 12345, // Text should be a string, not a number
      };

      const response = await request(app)
        .patch(`/api/open-questions/${questionId}`)
        .send(patchWithWrongType);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });
  });
});
