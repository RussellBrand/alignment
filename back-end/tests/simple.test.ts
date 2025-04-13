import request from "supertest";
import mongoose from "mongoose";
import { app, connectDB } from "../src/server";
import { Question } from "../src/schemas/questionSchema";
import { User } from "../src/schemas/userSchema";
import { Quote } from "../src/schemas/quoteSchema";
import { Whence } from "../src/schemas/whenceSchema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("Simple HTML Routes", () => {
  let db: mongoose.Connection;
  let questionId: string;
  let userId: string;
  let quoteId: string;
  let whenceId: string;

  // Connect to test database once before all tests
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    db = await connectDB("simple_test");
  });

  // Clean up after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    // console.log("Test database dropped and disconnected");
  });

  // Clear test data and add some test documents before each test
  beforeEach(async () => {
    // Clean all collections
    await Question.deleteMany({});
    await User.deleteMany({});
    await Quote.deleteMany({});
    await Whence.deleteMany({});

    // Create test data for each model
    const question = await Question.create({
      text: "What is a test question?",
    });
    questionId = question._id.toString();

    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
    });
    userId = user._id.toString();

    const quote = await Quote.create({
      text: "This is a test quote",
      author: "Test Author",
    });
    quoteId = quote._id.toString();

    const whence = await Whence.create({ source: "Test Source" });
    whenceId = whence._id.toString();
  });

  describe("Dashboard", () => {
    it("should return the simple dashboard HTML page", async () => {
      const response = await request(app).get("/simple");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Simple API Dashboard");
      expect(response.text).toContain("Users");
      expect(response.text).toContain("Questions");
      expect(response.text).toContain("Quotes");
      expect(response.text).toContain("Whence");
    });

    it("should redirect root to simple dashboard", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(302); // Redirect status code
      expect(response.header.location).toBe("/simple");
    });
  });

  describe("Count Routes", () => {
    it("should return Questions count HTML page", async () => {
      const response = await request(app).get("/simple/questions/count");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Question Count");
      expect(response.text).toContain("Total number of Question documents");
      expect(response.text).toContain("1"); // We created one question in beforeEach
    });

    it("should return Users count HTML page", async () => {
      const response = await request(app).get("/simple/users/count");

      expect(response.status).toBe(200);
      expect(response.text).toContain("User Count");
      expect(response.text).toContain("Total number of User documents");
      expect(response.text).toContain("1");
    });

    it("should return Quotes count HTML page", async () => {
      const response = await request(app).get("/simple/quotes/count");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Quote Count");
      expect(response.text).toContain("Total number of Quote documents");
      expect(response.text).toContain("1");
    });

    it("should return Whence count HTML page", async () => {
      const response = await request(app).get("/simple/whence/count");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Whence Count");
      expect(response.text).toContain("Total number of Whence documents");
      expect(response.text).toContain("1");
    });
  });

  describe("ReadAll Routes", () => {
    it("should return all Questions as HTML", async () => {
      const response = await request(app).get("/simple/questions/readAll");

      expect(response.status).toBe(200);
      expect(response.text).toContain("All Questions");
      expect(response.text).toContain("What is a test question?");
      expect(response.text).toContain(questionId);
    });

    it("should return all Users as HTML", async () => {
      const response = await request(app).get("/simple/users/readAll");

      expect(response.status).toBe(200);
      expect(response.text).toContain("All Users");
      expect(response.text).toContain("Test User");
      expect(response.text).toContain("test@example.com");
      expect(response.text).toContain(userId);
    });

    it("should return all Quotes as HTML", async () => {
      const response = await request(app).get("/simple/quotes/readAll");

      expect(response.status).toBe(200);
      expect(response.text).toContain("All Quotes");
      expect(response.text).toContain("This is a test quote");
      expect(response.text).toContain("Test Author");
      expect(response.text).toContain(quoteId);
    });

    it("should return all Whence records as HTML", async () => {
      const response = await request(app).get("/simple/whence/readAll");

      expect(response.status).toBe(200);
      expect(response.text).toContain("All Whences");
      expect(response.text).toContain("Test Source");
      expect(response.text).toContain(whenceId);
    });
  });

  describe("ReadOne Routes", () => {
    it("should return a single Question as HTML", async () => {
      const response = await request(app).get(
        `/simple/questions/readOne/${questionId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Question Details");
      expect(response.text).toContain("What is a test question?");
      expect(response.text).toContain(questionId);
    });

    it("should return a single User as HTML", async () => {
      const response = await request(app).get(
        `/simple/users/readOne/${userId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("User Details");
      expect(response.text).toContain("Test User");
      expect(response.text).toContain("test@example.com");
      expect(response.text).toContain(userId);
    });

    it("should return a single Quote as HTML", async () => {
      const response = await request(app).get(
        `/simple/quotes/readOne/${quoteId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Quote Details");
      expect(response.text).toContain("This is a test quote");
      expect(response.text).toContain("Test Author");
      expect(response.text).toContain(quoteId);
    });

    it("should return a single Whence record as HTML", async () => {
      const response = await request(app).get(
        `/simple/whence/readOne/${whenceId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Whence Details");
      expect(response.text).toContain("Test Source");
      expect(response.text).toContain(whenceId);
    });

    it("should return 404 HTML page for non-existent id", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist
      const response = await request(app).get(
        `/simple/questions/readOne/${nonExistentId}`
      );

      expect(response.status).toBe(404);
      expect(response.text).toContain("Not Found");
      expect(response.text).toContain(
        `Question with ID ${nonExistentId} not found`
      );
    });
  });

  describe("ReadMany Routes", () => {
    it("should return multiple Questions as HTML", async () => {
      // Create another question to test with multiple
      const question2 = await Question.create({
        text: "Another test question?",
      });
      const question2Id = question2._id.toString();

      // Log the question IDs to verify they exist
      // console.log("Test question IDs:", { questionId, question2Id });

      // Verify the questions exist in the database
      const existingQuestions = await Question.find({
        _id: { $in: [questionId, question2Id] },
      });
      // console.log(
      //   "Found questions in DB:",
      //   existingQuestions.map((q) => ({ id: q._id.toString(), text: q.text }))
      // );

      const response = await request(app).get(
        `/simple/questions/readMany?ids=${questionId},${question2Id}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Multiple Questions");
      expect(response.text).toContain("What is a test question?");
      expect(response.text).toContain("Another test question?");
      expect(response.text).toContain(questionId);
      expect(response.text).toContain(question2Id);
    });

    it("should return multiple Users as HTML", async () => {
      // Create another user to test with multiple
      const user2 = await User.create({
        name: "Another User",
        email: "another@example.com",
      });
      const user2Id = user2._id.toString();

      const response = await request(app).get(
        `/simple/users/readMany?ids=${userId},${user2Id}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Multiple Users");
      expect(response.text).toContain("Test User");
      expect(response.text).toContain("Another User");
      expect(response.text).toContain(userId);
      expect(response.text).toContain(user2Id);
    });

    it("should return multiple Quotes as HTML", async () => {
      // Create another quote to test with multiple
      const quote2 = await Quote.create({
        text: "Another test quote",
        author: "Another Author",
      });
      const quote2Id = quote2._id.toString();

      const response = await request(app).get(
        `/simple/quotes/readMany?ids=${quoteId},${quote2Id}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Multiple Quotes");
      expect(response.text).toContain("This is a test quote");
      expect(response.text).toContain("Another test quote");
      expect(response.text).toContain(quoteId);
      expect(response.text).toContain(quote2Id);
    });

    it("should return multiple Whence records as HTML", async () => {
      // Create another whence to test with multiple
      const whence2 = await Whence.create({ source: "Another Source" });
      const whence2Id = whence2._id.toString();

      const response = await request(app).get(
        `/simple/whence/readMany?ids=${whenceId},${whence2Id}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Multiple Whences");
      expect(response.text).toContain("Test Source");
      expect(response.text).toContain("Another Source");
      expect(response.text).toContain(whenceId);
      expect(response.text).toContain(whence2Id);
    });

    it("should display a note about missing IDs", async () => {
      const nonExistentId = "60a1234a1234b56789abcdef"; // This ID should not exist
      const response = await request(app).get(
        `/simple/questions/readMany?ids=${questionId},${nonExistentId}`
      );

      expect(response.status).toBe(200);
      expect(response.text).toContain("Multiple Questions");
      expect(response.text).toContain("What is a test question?");
      expect(response.text).toContain(questionId);
      expect(response.text).toContain("The following IDs were not found:");
      expect(response.text).toContain(nonExistentId);
    });

    it("should return 400 for missing ids parameter", async () => {
      const response = await request(app).get("/simple/questions/readMany");

      expect(response.status).toBe(400);
      expect(response.text).toContain("Bad Request");
      expect(response.text).toContain("Query parameter 'ids' is required");
    });

    it("should return 404 when no matching documents are found", async () => {
      const nonExistentId1 = "60a1234a1234b56789abcdef";
      const nonExistentId2 = "60a1234a1234b56789abcdee";

      const response = await request(app).get(
        `/simple/questions/readMany?ids=${nonExistentId1},${nonExistentId2}`
      );

      expect(response.status).toBe(404);
      expect(response.text).toContain("Not Found");
      expect(response.text).toContain(
        "No documents found with the provided IDs"
      );
    });
  });
});
