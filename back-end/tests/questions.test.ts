import request from "supertest";
import mongoose from "mongoose";
import { app, connectDB } from "../src/server";
import { Question } from "../src/schemas/questionSchema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Sample question data
const testQuestion = {
  text: "What is the meaning of life?",
};

describe("Question Routes", () => {
  let db: mongoose.Connection;

  // Connect to test database once before all tests
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    db = await connectDB();
  });

  // Clean up after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log("Test database dropped and disconnected");
  });

  // Clear test data before each test
  beforeEach(async () => {
    await Question.deleteMany({});
  });

  describe("POST /api/questions", () => {
    it("should create a new question", async () => {
      const response = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.text).toBe(testQuestion.text);
    });

    it("should reject question with excess attributes", async () => {
      const questionWithExcessAttributes = {
        text: "Valid question text",
        excessAttribute: "This attribute should be stripped or rejected",
      };

      const response = await request(app)
        .post("/api/questions")
        .send(questionWithExcessAttributes);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });

    it("should return 400 with invalid data", async () => {
      const response = await request(app)
        .post("/api/questions")
        .send({ invalidField: "Incomplete question" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/questions", () => {
    it("should return all questions", async () => {
      await request(app).post("/api/questions").send(testQuestion);

      const response = await request(app).get("/api/questions");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return a specific question by ID", async () => {
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const response = await request(app).get(`/api/questions/${questionId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(questionId);
      expect(response.body.text).toBe(testQuestion.text);
    });
  });

  describe("PUT /api/questions/:id", () => {
    it("should update an existing question", async () => {
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { ...testQuestion, text: "Updated question text" };

      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should update a question if the ID is not included in the payload", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { text: "Updated without including ID" };

      // Update without including the _id in the payload
      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should update a question if the ID in the payload matches the URL parameter", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = {
        _id: questionId,
        text: "Updated with matching ID",
      };

      // Update with matching IDs
      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should reject update if the ID in the payload doesn't match the URL parameter", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      // Create another question to get a different ID
      const anotherResponse = await request(app)
        .post("/api/questions")
        .send({ text: "Another question" });

      const questionId = createResponse.body._id;
      const anotherQuestionId = anotherResponse.body._id;

      // Try to update with mismatched IDs
      const updatedData = {
        _id: anotherQuestionId, // Deliberately using a different ID
        text: "This update should fail",
      };

      const response = await request(app)
        .put(`/api/questions/${questionId}`)
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

  describe("DELETE /api/questions/:id", () => {
    it("should delete an existing question", async () => {
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const deleteResponse = await request(app).delete(
        `/api/questions/${questionId}`
      );
      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(app).get(
        `/api/questions/${questionId}`
      );
      expect(getResponse.status).toBe(404);
    });
  });

  describe("POST /api/questions/many", () => {
    it("should retrieve a question with one ID", async () => {
      // Create one question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;

      // Test readMany with one ID
      const response = await request(app)
        .post("/api/questions/many")
        .send({ ids: [questionId] });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe(questionId);
      expect(response.body[0].text).toBe(testQuestion.text);
    });

    it("should retrieve multiple questions with multiple IDs", async () => {
      // Create three questions
      const question1 = await request(app)
        .post("/api/questions")
        .send({ text: "First question" });

      const question2 = await request(app)
        .post("/api/questions")
        .send({ text: "Second question" });

      const question3 = await request(app)
        .post("/api/questions")
        .send({ text: "Third question" });

      const ids = [question1.body._id, question2.body._id, question3.body._id];

      // Test readMany with three IDs
      const response = await request(app)
        .post("/api/questions/many")
        .send({ ids });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Verify each question is retrieved correctly
      const texts = response.body.map((q) => q.text);
      expect(texts).toContain("First question");
      expect(texts).toContain("Second question");
      expect(texts).toContain("Third question");
    });

    it("should handle an empty array of IDs appropriately", async () => {
      // Test readMany with empty array
      const response = await request(app)
        .post("/api/questions/many")
        .send({ ids: [] });

      // According to the controller implementation, this should return 404
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No documents found");
    });

    it("should return error when one or more IDs don't exist", async () => {
      // Create one question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist

      // Test readMany with existing and non-existent IDs
      const response = await request(app)
        .post("/api/questions/many")
        .send({ ids: [questionId, nonExistentId] });

      // Should still return 200 but with only the documents found
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Only one document should be returned
      expect(response.body[0]._id).toBe(questionId);
    });
  });

  describe("PATCH /api/questions/:id", () => {
    it("should partially update an existing question", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { text: "Partially updated question text" };

      // Perform a partial update
      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });

    it("should reject patch if the ID in the payload doesn't match the URL parameter", async () => {
      // First create two questions
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const anotherResponse = await request(app)
        .post("/api/questions")
        .send({ text: "Another question" });

      const questionId = createResponse.body._id;
      const anotherQuestionId = anotherResponse.body._id;

      // Try to patch with mismatched IDs
      const patchData = {
        _id: anotherQuestionId, // Deliberately using a different ID
        text: "This patch should fail",
      };

      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
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
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const patchWithExcessAttributes = {
        text: "Valid question text update",
        excessAttribute: "This attribute should be rejected",
      };

      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .send(patchWithExcessAttributes);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });

    it("should reject patch with incorrect field type", async () => {
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const patchWithWrongType = {
        text: 12345, // Text should be a string, not a number
      };

      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .send(patchWithWrongType);

      // The request should be rejected with 400 status
      expect(response.status).toBe(400);
    });
  });
});
