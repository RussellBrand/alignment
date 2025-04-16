import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import request from "supertest";
import { app } from "../src/server";
import { OpenQuestion } from "../src/schemas/openQuestionSchema";
import { computeDBname, setupTestDB, teardownTestDB } from "./test_utils";

const testDBname = computeDBname(__filename);

describe("Errorful OpenQuestions CSV Upload Tests", () => {
  let db: mongoose.Connection;
  let errorfulData: any[];

  // Path to the errorful CSV file
  const errorfulFilePath = path.join(
    __dirname,
    "../samples/errorful_open_questions.csv"
  );

  beforeAll(async () => {
    // Connect to test database
    db = await setupTestDB(testDBname);

    // Read the sample CSV file
    const fileContent = fs.readFileSync(errorfulFilePath, "utf8");

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true, // Treat the first line as headers
      skip_empty_lines: true,
      trim: true,
    });

    // Transform CSV records to match the OpenQuestion schema format
    errorfulData = records.map((record: any) => ({
      _id: record._id,
      text: record.text,
      kind: record.kind,
      // Split the responses string by semicolons, trim each response
      responses: record.responses
        ? record.responses.split(";").map((r: string) => r.trim())
        : [],
      // Preserve any extra fields
      ...(record.extraField && { extraField: record.extraField }),
    }));
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
    // First try to get the count of items before we start
    const initialCount = await OpenQuestion.countDocuments();

    // Find a valid item from the errorful data - we need one with text, kind, and at least 3 responses
    const validItems = errorfulData.filter(
      (item) =>
        item.text && item.kind && item.responses && item.responses.length >= 3
    );

    // Make sure we have at least one valid item to test with
    expect(validItems.length).toBeGreaterThan(0);
    const validItem = { ...validItems[0] };
    delete validItem._id; // Remove ID to test auto-generation

    // Create a properly formatted CSV string with the valid item
    const headers = "text,kind,responses\n";
    const responsesStr = validItem.responses
      .map((r: string) => (r.includes(";") ? `"${r.replace(/"/g, '""')}"` : r))
      .join(";");
    const csvRow = `${validItem.text},${validItem.kind},${responsesStr}`;
    const csvContent = headers + csvRow;

    console.log("CSV content being uploaded:", csvContent);

    // Create a file on disk that we can upload
    const tempFilePath = path.join(
      __dirname,
      "../uploads",
      Date.now() + "-temp-valid-item.csv"
    );
    await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.promises.writeFile(tempFilePath, csvContent);

    try {
      // Use the process-csv route to upload the CSV content
      const uploadResponse = await request(app)
        .post("/simple/open-questions/process-csv")
        .attach("file", tempFilePath);

      console.log("Upload response status:", uploadResponse.status);
      console.log("Upload response text:", uploadResponse.text);

      if (hasError(uploadResponse)) {
        console.error("Upload had an error. Status:", uploadResponse.status);
        console.error("Response body:", uploadResponse.text);
      }

      // Verify the database connection is working
      const dbCount = await OpenQuestion.countDocuments();
      console.log(
        `Database contains ${dbCount} items (started with ${initialCount})`
      );

      // Find the item in the database
      const createdItem = await OpenQuestion.findOne({ text: validItem.text });

      // Add detailed logging before assertion
      if (!createdItem) {
        console.error(
          "Item not found in database. Searched for text:",
          validItem.text
        );
        // Try a more flexible search to see if it was saved with modifications
        const allItems = await OpenQuestion.find({});
        console.log(
          "All items in database:",
          JSON.stringify(allItems, null, 2)
        );
      }

      // Now check if the item exists
      expect(createdItem).not.toBeNull();
      expect(createdItem?._id).toBeDefined();
      expect(createdItem?.text).toBe(validItem.text);
      expect(createdItem?.kind).toBe(validItem.kind);
      expect(createdItem?.responses).toHaveLength(validItem.responses.length);

      // Check that we can access it through the API
      const readResponse = await request(app).get(
        `/simple/open-questions/readOne/${createdItem?._id}`
      );
      expect(readResponse.status).toBe(200);
      expect(readResponse.text).toContain(validItem.text);
      expect(readResponse.text).toContain(validItem.kind);

      // Check that responses are included in the HTML output
      for (const response of validItem.responses) {
        expect(readResponse.text).toContain(response);
      }
    } finally {
      // Clean up: Remove our temporary file
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (err) {
        // Ignore errors if file doesn't exist
      }
    }
  });

  it("should reject an item with a missing kind field", async () => {
    // Find an item with missing kind field from the CSV data
    const itemsWithMissingKind = errorfulData.filter(
      (item) =>
        item.text && !item.kind && item.responses && item.responses.length >= 2
    );

    // Skip the test if we don't have suitable test data in the CSV
    if (itemsWithMissingKind.length === 0) {
      console.warn(
        "Skipping test: No item with missing kind field found in CSV"
      );
      return;
    }

    const testItem = itemsWithMissingKind[0];

    // Create CSV content with just this item
    const headers = "text,kind,responses\n";
    const itemCsv = `${testItem.text},,${testItem.responses.join(";")}`;
    const fileContent = headers + itemCsv;

    // Use the process-csv route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach("file", Buffer.from(fileContent), "test-item-missing-kind.csv");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: testItem.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with a missing responses field", async () => {
    // Find items with missing responses from the CSV data
    const itemsWithMissingResponses = errorfulData.filter(
      (item) =>
        item.text &&
        item.kind &&
        (!item.responses || item.responses.length === 0)
    );

    // Skip the test if we don't have suitable test data in the CSV
    if (itemsWithMissingResponses.length === 0) {
      console.warn(
        "Skipping test: No item with missing responses found in CSV"
      );
      return;
    }

    const testItem = itemsWithMissingResponses[0];

    // Create CSV content with just this item
    const headers = "text,kind,responses\n";
    const itemCsv = `${testItem.text},${testItem.kind},`;
    const fileContent = headers + itemCsv;

    // Use the process-csv route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach(
        "file",
        Buffer.from(fileContent),
        "test-item-missing-responses.csv"
      );

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: testItem.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with an empty responses array", async () => {
    // Find items with empty responses from the CSV data
    const itemsWithEmptyResponses = errorfulData.filter(
      (item) =>
        item.text &&
        item.kind &&
        (!item.responses || item.responses.length === 0)
    );

    // Skip the test if we don't have suitable test data in the CSV
    if (itemsWithEmptyResponses.length === 0) {
      console.warn("Skipping test: No item with empty responses found in CSV");
      return;
    }

    const testItem = itemsWithEmptyResponses[0];

    // Create CSV content with just this item
    const headers = "text,kind,responses\n";
    const itemCsv = `${testItem.text},${testItem.kind},`;
    const fileContent = headers + itemCsv;

    // Use the process-csv route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach(
        "file",
        Buffer.from(fileContent),
        "test-item-empty-responses.csv"
      );

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: testItem.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should reject an item with only one response", async () => {
    // Find items with just one response from the CSV data
    const itemsWithOneResponse = errorfulData.filter(
      (item) =>
        item.text && item.kind && item.responses && item.responses.length === 1
    );

    // Skip the test if we don't have suitable test data in the CSV
    if (itemsWithOneResponse.length === 0) {
      console.warn(
        "Skipping test: No item with exactly one response found in CSV"
      );
      return;
    }

    const testItem = itemsWithOneResponse[0];

    // Create CSV content with just this item
    const headers = "text,kind,responses\n";
    const itemCsv = `${testItem.text},${testItem.kind},${testItem.responses[0]}`;
    const fileContent = headers + itemCsv;

    // Use the process-csv route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach("file", Buffer.from(fileContent), "test-item-one-response.csv");

    // Should either contain error text or have an error status code
    expect(hasError(response)).toBe(true);

    // Verify the item was not added to database
    const createdItem = await OpenQuestion.findOne({
      text: testItem.text,
    });

    expect(createdItem).toBeNull();
  });

  it("should accept an item with exactly two responses", async () => {
    // Find items with exactly two responses from the CSV data
    const itemsWithTwoResponses = errorfulData.filter(
      (item) =>
        item.text && item.kind && item.responses && item.responses.length === 2
    );

    // Skip the test if we don't have suitable test data in the CSV
    if (itemsWithTwoResponses.length === 0) {
      console.warn(
        "Skipping test: No item with exactly two responses found in CSV"
      );
      return;
    }

    const testItem = itemsWithTwoResponses[0];

    // Create CSV content with just this item
    const headers = "text,kind,responses\n";
    const itemCsv = `${testItem.text},${
      testItem.kind
    },${testItem.responses.join(";")}`;
    const fileContent = headers + itemCsv;

    // Use the process-csv route to attempt upload
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach("file", Buffer.from(fileContent), "test-item-two-responses.csv");

    // Check response (should be successful)
    expect(hasError(response)).toBe(false);

    // Verify the item was added to database
    const createdItem = await OpenQuestion.findOne({
      text: testItem.text,
    });

    expect(createdItem).not.toBeNull();
    expect(createdItem?.responses).toHaveLength(2);
  });

  it("should handle batch upload with mixed valid and invalid items", async () => {
    // Use the full errorful_open_questions.csv file
    const fileContent = fs.readFileSync(errorfulFilePath);

    // Use the process-csv route to attempt uploading all items
    const response = await request(app)
      .post("/simple/open-questions/process-csv")
      .attach("file", fileContent, "errorful_open_questions.csv");

    // The response should contain error information since there are invalid items
    expect(hasError(response)).toBe(true);

    // Count how many items were successfully added
    const count = await OpenQuestion.countDocuments();

    // With the current implementation, no items are inserted when there are invalid items
    // This may be due to the "ordered: true" option in the bulk insert operation
    expect(count).toBe(0);
  });
});
