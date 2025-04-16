import * as fs from "fs";
import * as path from "path";

interface OpenQuestion {
  _id: string;
  text: string;
  kind: string;
  responses: string[];
}

/**
 * Converts JSON data to CSV format
 * @param jsonData Array of OpenQuestion objects
 * @returns CSV string
 */
function convertToCSV(jsonData: OpenQuestion[]): string {
  // Create header row
  const header = ["_id", "text", "kind", "responses"];

  // Create CSV rows
  const rows = jsonData.map((item) => {
    return [
      item._id,
      `"${item.text.replace(/"/g, '""')}"`, // Escape quotes in text
      item.kind,
      `"${item.responses.join(",").replace(/"/g, '""')}"`, // Join responses with comma and escape quotes
    ].join(",");
  });

  // Combine header and rows
  return [header.join(","), ...rows].join("\n");
}

/**
 * Main function to read JSON and write CSV
 */
async function main() {
  try {
    // Define file paths
    const inputPath = path.join(
      __dirname,
      "samples",
      "sample_open_questions.json"
    );
    const outputPath = path.join(
      __dirname,
      "samples",
      "sample_open_questions.csv"
    );

    // Read JSON file
    const jsonData = JSON.parse(
      fs.readFileSync(inputPath, "utf8")
    ) as OpenQuestion[];

    // Convert to CSV
    const csvData = convertToCSV(jsonData);

    // Write CSV file
    fs.writeFileSync(outputPath, csvData);

    console.log(`Successfully converted JSON to CSV: ${outputPath}`);
  } catch (error) {
    console.error("Error converting JSON to CSV:", error);
  }
}

// Run the program
main();
