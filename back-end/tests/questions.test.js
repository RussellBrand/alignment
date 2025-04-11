// With Vitest globals enabled, we don't need to import these
// They're automatically available in the global scope
const superagent = require("superagent");
const mongoose = require("mongoose");
const { Question } = require("../models");

// Import server module
const { app } = require("../server");

// We'll create our own server instance for testing
let server;

const BASE_URL = "http://localhost:3000"; // Adjust port as needed
const API_PREFIX = "/api/questions";

// Sample question data
const testQuestion = {
  text: "What is the meaning of life?",
  options: ["42", "Love", "Growth", "There is no meaning"],
  correctAnswer: "42",
  category: "Philosophy",
};

describe("Question Routes", () => {
  let createdQuestionId;

  // Set up before all tests
  beforeAll(async () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = "test";

    // Start the server on a test port
    const PORT = 3000;
    server = app.listen(PORT);

    // Wait a moment for server to be fully started
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`Test server started on port ${PORT}`);
  });

  // Clean up after all tests
  afterAll(async () => {
    // Close the server and database connection
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("Test server closed");
    }
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
      const response = await superagent
        .post(`${BASE_URL}${API_PREFIX}`)
        .send(testQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.text).toBe(testQuestion.text);

      // Save the ID for other tests
      createdQuestionId = response.body._id;
    });

    it("should return 400 with invalid data", async () => {
      try {
        await superagent
          .post(`${BASE_URL}${API_PREFIX}`)
          .send({ text: "Incomplete question" });
        // If we reach here, test should fail
        expect(true).toBe(false);
      } catch (error) {
        // SuperAgent error response is in error.response.status
        console.log(error);
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe("GET /api/questions", () => {
    it("should return all questions", async () => {
      // First create a question
      const createResponse = await superagent
        .post(`${BASE_URL}${API_PREFIX}`)
        .send(testQuestion);

      const response = await superagent.get(`${BASE_URL}${API_PREFIX}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return a specific question by ID", async () => {
      // First create a question
      const createResponse = await superagent
        .post(`${BASE_URL}${API_PREFIX}`)
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const response = await superagent.get(
        `${BASE_URL}${API_PREFIX}/${questionId}`
      );

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(questionId);
      expect(response.body.text).toBe(testQuestion.text);
    });
  });

  describe("PUT /api/questions/:id", () => {
    it("should update an existing question", async () => {
      // First create a question
      const createResponse = await superagent
        .post(`${BASE_URL}${API_PREFIX}`)
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { ...testQuestion, text: "Updated question text" };

      const response = await superagent
        .put(`${BASE_URL}${API_PREFIX}/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(updatedData.text);
    });
  });

  describe("DELETE /api/questions/:id", () => {
    it("should delete an existing question", async () => {
      // First create a question
      const createResponse = await superagent
        .post(`${BASE_URL}${API_PREFIX}`)
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const deleteResponse = await superagent.delete(
        `${BASE_URL}${API_PREFIX}/${questionId}`
      );
      expect(deleteResponse.status).toBe(200);

      // Try to get the deleted question - should fail
      try {
        await superagent.get(`${BASE_URL}${API_PREFIX}/${questionId}`);
        // If we reach here, test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
