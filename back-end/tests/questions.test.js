const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../server");
const { Question } = require("../models");

// Sample question data
const testQuestion = {
  text: "What is the meaning of life?",
};

describe("Question Routes", () => {
  let db;

  // Connect to test database once before all tests
  beforeAll(async () => {
    // Set NODE_ENV to test to use test database
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
      expect(response.body.q).toBe(testQuestion.q);
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
      // First create a question
      await request(app).post("/api/questions").send(testQuestion);

      const response = await request(app).get("/api/questions");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return a specific question by ID", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const response = await request(app).get(`/api/questions/${questionId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(questionId);
      expect(response.body.q).toBe(testQuestion.q);
    });
  });

  describe("PUT /api/questions/:id", () => {
    it("should update an existing question", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;
      const updatedData = { ...testQuestion, text: "Updated question text" };

      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.q).toBe(updatedData.q);
    });
  });

  describe("DELETE /api/questions/:id", () => {
    it("should delete an existing question", async () => {
      // First create a question
      const createResponse = await request(app)
        .post("/api/questions")
        .send(testQuestion);

      const questionId = createResponse.body._id;

      const deleteResponse = await request(app).delete(
        `/api/questions/${questionId}`
      );
      expect(deleteResponse.status).toBe(200);

      // Try to get the deleted question - should return 404
      const getResponse = await request(app).get(
        `/api/questions/${questionId}`
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
