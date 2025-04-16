import * as fs from "fs";
import * as path from "path";

/**
 * Escapes special characters for CSV format
 * @param value The value to escape
 * @returns Escaped string
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the value contains quotes, commas, or new lines, wrap in quotes and escape internal quotes
  if (
    stringValue.includes('"') ||
    stringValue.includes(",") ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Handles complex values (objects and arrays) for CSV output
 * @param value Any value that might need special handling
 * @returns String representation for CSV
 */
function handleComplexValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    // Join array elements with a semicolon
    return escapeCSVValue(value.map((v) => String(v)).join(";"));
  }

  if (typeof value === "object") {
    // Convert object to JSON string
    return escapeCSVValue(JSON.stringify(value));
  }

  return escapeCSVValue(value);
}

/**
 * Converts JSON data to CSV format
 * @param jsonData Array of objects
 * @returns CSV string
 */
function convertToCSV(jsonData: any[]): string {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return "";
  }

  // Extract headers from the first object
  const headers = Object.keys(jsonData[0]);

  // Create CSV rows
  const rows = jsonData.map((item) => {
    return headers
      .map((header) => {
        return handleComplexValue(item[header]);
      })
      .join(",");
  });

  // Combine header and rows
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Main function to read JSON and write CSV
 */
async function main() {
  try {
    // Get input and output paths from command line arguments or use defaults
    const args = process.argv.slice(2);
    let inputPath = args[0];
    let outputPath = args[1];

    // Use default paths if not provided
    if (!inputPath || !outputPath) {
      console.log("No input/output paths provided, using defaults");

      // Default paths
      inputPath = path.join(__dirname, "samples", "sample_open_questions.json");
      outputPath = path.join(__dirname, "samples", "sample_open_questions.csv");
    }

    // Read JSON file
    console.log(`Reading from: ${inputPath}`);
    const jsonData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    if (!Array.isArray(jsonData)) {
      throw new Error("Input JSON must be an array of objects");
    }

    // Convert to CSV
    const csvData = convertToCSV(jsonData);

    // Write CSV file
    fs.writeFileSync(outputPath, csvData);
    console.log(`Successfully converted JSON to CSV: ${outputPath}`);
  } catch (error) {
    console.error("Error converting JSON to CSV:", error);
    process.exit(1);
  }
}

// Run the program
main();
