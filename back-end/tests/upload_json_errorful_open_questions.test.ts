import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import request from "supertest";
import { app } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { computeDBname, setupTestDB, teardownTestDB } from "./test_utils";

const testDBname = computeDBname(__filename);

describe("Errorful OpenQuestions JSON Upload Tests", () => {
  let db: mongoose.Connection;
  let errorfulData: any[];

  // Path to the errorful JSON file
  const errorfulFilePath = path.join(
    __dirname,
    "../samples/errorful_open_questions.json"
  );

  // Helper functions to find specific test cases in the sample data
  const findItemWithoutId = () => errorfulData.find((item) => !item._id);
  
  const findItemWithWrongKind = () =>
    errorfulData.find((item) => item.wrongKind && !item.kind);
  
  const findItemWithMissingKind = () =>
    errorfulData.find((item) => !item.wrongKind && !item.kind && item.text && item.responses);
  
  const findItemWithMissingResponses = () =>
    errorfulData.find((item) => item.kind && item.text && !item.responses);
  
  const findItemWithEmptyResponses = () =>
    errorfulData.find((item) => item.responses && Array.isArray(item.responses) && item.responses.length === 0);
  
  const findItemWithOneResponse = () =>
    errorfulData.find((item) => item.responses && Array.isArray(item.responses) && item.responses.length === 1);
  
  const findItemWithTwoResponses = () =>
    errorfulData.find((item) => item.responses && Array.isArray(item.responses) && item.responses.length === 2);
  
  const findItemWithExtraField = () =>
    errorfulData.find((item) => item.extraField !== undefined);

  beforeAll(async () => {
    // Connect to test database
    db = await setupTestDB(testDBname);

    // Read the errorful data file
    const fileContent = fs.readFileSync(errorfulFilePath, "utf8");
    errorfulData = JSON.parse(fileContent);
  });

  afterAll(async () => {
    // Clean up test database connection
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Clear any existing data before each test
    await OpenQuestion.deleteMany({});
  });

  // Helper function to check if response contains error message or has error status
  const hasError = (response: request.Response): boolean => {
    return (
      response.text.toLowerCase().includes("error") ||
      response.status === 400 ||
      response.status === 422 ||
      response.status === 500
    );
  };

  it("should successfully load an item without an ID", async () => {
    // Find the item without an ID
    const itemWithoutId = findItemWithoutId();
    expect(itemWithoutId).toBeDefined();
    expect(itemWithoutId._id).toBeUndefined();

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithoutId]);

    // Use the process-json route to upload the item
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-without-id.json");

    // Check response (should be success - either 200 or 302 redirect)
    expect([200, 302]).toContain(response.status);
    expect(hasError(response)).toBe(false); // No error in response

    // Find the newly created item in the database to get its generated ID
    const createdItem = await OpenQuestion.findOne({
      text: itemWithoutId.text,
    });

    expect(createdItem).toBeDefined();
    const createdId = createdItem?._id.toString();

    // Use the readOne route to verify the item was created correctly
    const readResponse = await request(app).get(
      `/simple/open-questions/readOne/${createdId}`
    );

    expect(readResponse.status).toBe(200);
    expect(readResponse.text).toContain(itemWithoutId.text);
    expect(readResponse.text).toContain(itemWithoutId.kind);

    // Check that responses are included in the HTML output
    for (const response of itemWithoutId.responses) {
      expect(readResponse.text).toContain(response);
    }
  });

  it("should reject an item with a wrong kind field", async () => {
    // Find item with wrong kind field
    const itemWithWrongKind = findItemWithWrongKind();
    expect(itemWithWrongKind).toBeDefined();
    expect(itemWithWrongKind.wrongKind).toBeDefined();
    expect(itemWithWrongKind.kind).toBeUndefined();

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithWrongKind]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-wrong-kind.json");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithWrongKind.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with a missing kind field", async () => {
    // Find item with missing kind field
    const itemWithMissingKind = findItemWithMissingKind();
    expect(itemWithMissingKind).toBeDefined();
    expect(itemWithMissingKind.kind).toBeUndefined();

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithMissingKind]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-missing-kind.json");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithMissingKind.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with a missing responses field", async () => {
    // Find item with missing responses field
    const itemWithMissingResponses = findItemWithMissingResponses();
    expect(itemWithMissingResponses).toBeDefined();
    expect(itemWithMissingResponses.responses).toBeUndefined();

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithMissingResponses]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach(
        "file",
        Buffer.from(fileContent),
        "test-item-missing-responses.json"
      );

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithMissingResponses.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with an empty responses array", async () => {
    // Find item with empty responses array
    const itemWithEmptyResponses = findItemWithEmptyResponses();
    expect(itemWithEmptyResponses).toBeDefined();
    expect(itemWithEmptyResponses.responses).toEqual([]);

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithEmptyResponses]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach(
        "file",
        Buffer.from(fileContent),
        "test-item-empty-responses.json"
      );

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithEmptyResponses.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with only one response", async () => {
    // Find item with only one response
    const itemWithOneResponse = findItemWithOneResponse();
    expect(itemWithOneResponse).toBeDefined();
    expect(itemWithOneResponse.responses.length).toBe(1);

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithOneResponse]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-one-response.json");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithOneResponse.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with exactly two responses", async () => {
    // Find item with two responses
    const itemWithTwoResponses = findItemWithTwoResponses();
    expect(itemWithTwoResponses).toBeDefined();
    expect(itemWithTwoResponses.responses.length).toBe(2);

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithTwoResponses]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-two-responses.json");

    // Check response (should be error)
    expect(response.status).toBe(400);
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: itemWithTwoResponses.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with extra fields", async () => {
    // Find item with extra field
    const itemWithExtraField = findItemWithExtraField();
    expect(itemWithExtraField).toBeDefined();
    expect(itemWithExtraField.extraField).toBeDefined();

    // Create JSON file content with just this item
    const fileContent = JSON.stringify([itemWithExtraField]);

    // Use the process-json route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", Buffer.from(fileContent), "test-item-extra-field.json");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database or was added without the extra field
    const createdItem = await OpenQuestion.findOne({
      text: itemWithExtraField.text,
    });

    if (createdItem) {
      // If item was created, make sure it doesn't have the extra field
      expect((createdItem as any).extraField).toBeUndefined();
    }
  });

  it("should handle batch upload with mixed valid and invalid items", async () => {
    // Use the full errorful_open_questions.json file
    const fileContent = fs.readFileSync(errorfulFilePath);

    // Use the process-json route to attempt uploading all items
    const response = await request(app)
      .post("/simple/open-questions/process-json")
      .attach("file", fileContent, "errorful_open_questions.json");

    // The response should contain error information since there are invalid items
    expect(hasError(response)).toBe(true);

    // Count how many items were successfully added
    const count = await OpenQuestion.countDocuments();

    // With the current implementation, no items are inserted when there are invalid items
    // This may be due to the "ordered: true" option in the bulk insert operation
    expect(count).toBe(0);
  });
});
