import { Request, Response } from "express";
import { Model, Document } from "mongoose";
import { z } from "zod";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";
import multer from "multer";
import path from "path";

// Create a storage configuration that ensures the uploads directory exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use a relative path that matches the expected test environment
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Create the directory if it doesn't exist
    fs.mkdir(uploadsDir, { recursive: true })
      .then(() => {
        cb(null, uploadsDir);
      })
      .catch((err) => {
        console.error(`Failed to create uploads directory: ${err.message}`);
        // Still try to use the directory even if creation failed
        // (it might already exist)
        cb(null, uploadsDir);
      });
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up multer for file uploads with the custom storage
export const upload = multer({ storage });

// Define a type for requests with a file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Utility function to generate HTML wrapper
const htmlWrapper = (title: string, content: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; }
        pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; }
        .back-link { margin-top: 20px; }
        .back-link a { color: #0066cc; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }
        form { margin: 20px 0; }
        label { display: block; margin: 10px 0 5px; }
        input[type="text"], input[type="email"] { width: 300px; padding: 8px; }
        button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; 
                cursor: pointer; margin-top: 10px; border-radius: 4px; }
        button.delete { background-color: #f44336; }
        .error { color: #f44336; margin: 10px 0; }
        .success { color: #4CAF50; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      
      <div class="back-link">
        <a href="/simple">Back to Simple Dashboard</a>
      </div>
      ${content}
    </body>
    </html>
  `;
};

// Get count of documents
const count =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const count = await Model.countDocuments();
      const modelName = Model.modelName;

      const content = `
      <p>Total number of ${modelName} documents: <strong>${count}</strong></p>
    `;

      res.send(htmlWrapper(`${modelName} Count`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Read all documents
const readAll =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const documents = await Model.find();
      const modelName = Model.modelName;

      // Create a more detailed HTML representation that explicitly shows document properties
      let documentsHtml = "";
      documents.forEach((doc) => {
        documentsHtml += `<div class="document">
          <h3>ID: ${doc._id}</h3>
          <ul>`;

        // Add each document property individually
        Object.entries(doc.toObject()).forEach(([key, value]) => {
          if (key !== "_id" && key !== "__v") {
            documentsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
          }
        });

        documentsHtml += `</ul>
        </div>`;
      });

      const content = `
      <p>Total: ${documents.length} ${modelName}(s)</p>
      <div class="back-link">
        <a href="/simple/${modelName.toLowerCase()}/new">Add New ${modelName}</a> | 
        <a href="/simple/${modelName.toLowerCase()}/upload-csv">Upload CSV</a> | 
        <a href="/simple/${modelName.toLowerCase()}/upload-json">Upload JSON</a> |
        <a href="/simple/${modelName.toLowerCase()}/deleteAll">Delete All</a>
      </div>
      ${documentsHtml}
      <pre>${JSON.stringify(documents, null, 2)}</pre>
    `;

      res.send(htmlWrapper(`All ${modelName}s`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Read one document by ID
const readOne =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const document = await Model.findById(req.params.id);
      const modelName = Model.modelName;

      if (!document) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              `<p>${modelName} with ID ${req.params.id} not found</p>`
            )
          );
      }

      // Create a more detailed HTML representation that explicitly shows document properties
      let documentHtml = `<div class="document-details">
        <h3>ID: ${document._id}</h3>
        <ul>`;

      // Add each document property individually
      Object.entries(document.toObject()).forEach(([key, value]) => {
        if (key !== "_id" && key !== "__v") {
          documentHtml += `<li><strong>${key}:</strong> ${value}</li>`;
        }
      });

      documentHtml += `</ul></div>`;

      const content = `
      <div class="actions">
        <a href="/simple/${modelName.toLowerCase()}/edit/${
        document._id
      }">Edit</a> | 
        <a href="/simple/${modelName.toLowerCase()}/delete/${
        document._id
      }">Delete</a>
      </div>
      ${documentHtml}
      <pre>${JSON.stringify(document, null, 2)}</pre>
    `;

      res.send(htmlWrapper(`${modelName} Details`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Read multiple documents by IDs
const readMany =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const idsParam = req.query.ids as string;

      if (!idsParam) {
        return res
          .status(400)
          .send(
            htmlWrapper(
              "Bad Request",
              "<p>Query parameter 'ids' is required</p>"
            )
          );
      }

      const ids = idsParam.split(",").map((id) => id.trim());

      if (ids.length === 0) {
        return res
          .status(400)
          .send(htmlWrapper("Bad Request", "<p>No valid IDs provided</p>"));
      }

      // Get all documents in one query
      const documents = await Model.find();

      // Now filter just the ones we want by ID
      const requestedDocuments = documents.filter((doc) =>
        ids.includes(doc._id.toString())
      );

      if (requestedDocuments.length === 0) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              "<p>No documents found with the provided IDs</p>"
            )
          );
      }

      // Check for missing IDs
      const foundIds = requestedDocuments.map((doc) => doc._id.toString());
      const missingIds = ids.filter((id) => !foundIds.includes(id));

      let missingContent = "";
      if (missingIds.length > 0) {
        missingContent = `
        <p><strong>Note:</strong> The following IDs were not found: ${missingIds.join(
          ", "
        )}</p>
      `;
      }

      // Create a more detailed HTML representation of each document
      let documentsHtml = "";
      requestedDocuments.forEach((doc) => {
        documentsHtml += `<div class="document">
          <h3>ID: ${doc._id}</h3>
          <ul>`;

        // Add each document property individually
        Object.entries(doc.toObject()).forEach(([key, value]) => {
          if (key !== "_id" && key !== "__v") {
            documentsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
          }
        });

        documentsHtml += `</ul>
        </div>`;
      });

      const content = `
      <p>Found ${requestedDocuments.length} ${modelName}(s)</p>
      ${missingContent}
      ${documentsHtml}
      <pre>${JSON.stringify(requestedDocuments, null, 2)}</pre>
    `;

      res.send(htmlWrapper(`Multiple ${modelName}s`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Generate a form for creating a new document
const newForm =
  <T extends Document>(Model: Model<T>, schema: z.ZodType) =>
  async (_req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const singularName = modelName.toLowerCase().endsWith("s")
        ? modelName.toLowerCase().slice(0, -1)
        : modelName.toLowerCase();

      // Extract field information from the Zod schema
      const shape = (schema as any)._def.shape();
      let formFields = "";

      // Generate form fields based on schema properties
      Object.entries(shape).forEach(([key, value]) => {
        // Skip internal fields
        if (key === "_id" || key === "__v") return;

        // Determine field type
        let inputType = "text";
        if (key === "email") inputType = "email";

        formFields += `
          <div>
            <label for="${key}">${
          key.charAt(0).toUpperCase() + key.slice(1)
        }:</label>
            <input type="${inputType}" id="${key}" name="${key}" required>
          </div>
        `;
      });

      const content = `
      <form action="/simple/${singularName}/create" method="POST">
        ${formFields}
        <button type="submit">Create ${modelName}</button>
      </form>
      `;

      res.send(htmlWrapper(`New ${modelName}`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Create a new document from form submission
const create =
  <T extends Document>(Model: Model<T>, schema: z.ZodType) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const singularName = modelName.toLowerCase().endsWith("s")
        ? modelName.toLowerCase().slice(0, -1)
        : modelName.toLowerCase();

      // Parse and validate input using Zod schema
      const validationResult = schema.safeParse(req.body);

      if (!validationResult.success) {
        // Format validation errors
        const errorMessages = validationResult.error.errors
          .map(
            (err) =>
              `<p class="error">${err.path.join(".")}: ${err.message}</p>`
          )
          .join("");

        return res.status(200).send(
          htmlWrapper(
            "Error",
            `
            <h2>Validation Error</h2>
            ${errorMessages}
            <div class="back-link">
              <a href="/simple/${modelName.toLowerCase()}/new">Back to Form</a>
            </div>
          `
          )
        );
      }

      // Create the document
      const document = await Model.create(validationResult.data);

      // Redirect to the readAll page with singular form as expected by tests
      res.redirect(`/simple/${singularName}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Display form to edit an existing document
const editForm =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const singularName = modelName.toLowerCase().endsWith("s")
        ? modelName.toLowerCase().slice(0, -1)
        : modelName.toLowerCase();
      const document = await Model.findById(req.params.id);

      if (!document) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              `<p>${modelName} with ID ${req.params.id} not found</p>`
            )
          );
      }

      // Generate form fields with current values
      let formFields = "";
      const docObj = document.toObject();

      Object.entries(docObj).forEach(([key, value]) => {
        // Skip internal Mongoose fields
        if (key === "_id" || key === "__v") return;

        // Determine field type
        let inputType = "text";
        if (key === "email") inputType = "email";

        formFields += `
          <div>
            <label for="${key}">${
          key.charAt(0).toUpperCase() + key.slice(1)
        }:</label>
            <input type="${inputType}" id="${key}" name="${key}" value="${value}" required>
          </div>
        `;
      });

      const content = `
      <form action="/simple/${singularName}/update/${document._id}" method="POST">
        <input type="hidden" name="_id" value="${document._id}">
        ${formFields}
        <button type="submit">Update ${modelName}</button>
      </form>
      `;

      res.send(htmlWrapper(`Edit ${modelName}`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Update an existing document from form submission
const update =
  <T extends Document>(Model: Model<T>, schema: z.ZodType) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const id = req.params.id;

      // Check if document exists
      const existingDoc = await Model.findById(id);
      if (!existingDoc) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              `<p>${modelName} with ID ${id} not found</p>`
            )
          );
      }

      // Validate the update data
      // Create a modified schema that makes all fields optional for partial updates
      const updateSchema = z.object(
        Object.fromEntries(
          Object.entries((schema as any)._def.shape()).map(([key, value]) => [
            key,
            (value as z.ZodType).optional(),
          ])
        )
      );

      const validationResult = updateSchema.safeParse(req.body);

      if (!validationResult.success) {
        // Format validation errors
        const errorMessages = validationResult.error.errors
          .map(
            (err: z.ZodIssue) =>
              `<p class="error">${err.path.join(".")}: ${err.message}</p>`
          )
          .join("");

        return res.status(200).send(
          htmlWrapper(
            "Error",
            `
            <h2>Validation Error</h2>
            ${errorMessages}
            <div class="back-link">
              <a href="/simple/${modelName.toLowerCase()}/edit/${id}">Back to Edit Form</a>
            </div>
          `
          )
        );
      }

      // Update the document
      await Model.findByIdAndUpdate(id, validationResult.data);

      // Redirect to the readAll page
      res.redirect(`/simple/${modelName.toLowerCase()}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Display delete confirmation page
const deleteForm =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const singularName = modelName.toLowerCase().endsWith("s")
        ? modelName.toLowerCase().slice(0, -1)
        : modelName.toLowerCase();
      const document = await Model.findById(req.params.id);

      if (!document) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              `<p>${modelName} with ID ${req.params.id} not found</p>`
            )
          );
      }

      // Show document details before confirming deletion
      let documentDetails = "<ul>";
      const docObj = document.toObject();

      Object.entries(docObj).forEach(([key, value]) => {
        if (key !== "__v") {
          // Show ID but skip __v
          documentDetails += `<li><strong>${key}:</strong> ${value}</li>`;
        }
      });

      documentDetails += "</ul>";

      const content = `
      <h2>Are you sure you want to delete this ${modelName}?</h2>
      ${documentDetails}
      <form action="/simple/${singularName}/delete/${
        document._id
      }" method="POST">
        <button type="submit" class="delete">Confirm Delete</button>
      </form>
      <div class="back-link" style="margin-top: 20px;">
        <a href="/simple/${modelName.toLowerCase()}/readAll">Cancel</a>
      </div>
      `;

      res.send(htmlWrapper(`Delete ${modelName}`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Delete a document
const deleteOne =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const id = req.params.id;

      const result = await Model.findByIdAndDelete(id);

      if (!result) {
        return res
          .status(404)
          .send(
            htmlWrapper(
              "Not Found",
              `<p>${modelName} with ID ${id} not found</p>`
            )
          );
      }

      // Redirect to the readAll page
      res.redirect(`/simple/${modelName.toLowerCase()}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Display delete all confirmation page
const deleteAllForm =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;
      const count = await Model.countDocuments();

      const content = `
      <h2>Are you sure you want to delete all ${modelName}s?</h2>
      <p>This will permanently delete all ${count} ${modelName}(s) in the database.</p>
      <p><strong>This action cannot be undone!</strong></p>
      
      <form action="/simple/${modelName.toLowerCase()}/deleteAll" method="POST">
        <button type="submit" class="delete">Confirm Delete All</button>
      </form>
      <div class="back-link" style="margin-top: 20px;">
        <a href="/simple/${modelName.toLowerCase()}/readAll">Cancel</a>
      </div>
      `;

      res.send(htmlWrapper(`Delete All ${modelName}s`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Delete all documents
const deleteAll =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;

      await Model.deleteMany({});

      // Redirect to the readAll page
      res.redirect(`/simple/${modelName.toLowerCase()}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Display CSV upload form
const csvUploadForm =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;

      const content = `
      <h2>Upload CSV File</h2>
      <p>Upload a CSV file to create multiple ${modelName} records at once.</p>
      <p>The first row should contain field names that match the ${modelName} fields.</p>
      
      <form action="/simple/${modelName.toLowerCase()}/process-csv" method="POST" enctype="multipart/form-data">
        <div>
          <label for="csvFile">Select CSV File:</label>
          <input type="file" id="csvFile" name="file" accept=".csv" required>
        </div>
        <button type="submit">Upload</button>
      </form>
      `;

      res.send(htmlWrapper(`Upload ${modelName} CSV`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Process CSV upload
const processCSV =
  <T extends Document>(Model: Model<T>, schema: z.ZodType) =>
  async (req: RequestWithFile, res: Response) => {
    try {
      const modelName = Model.modelName;

      if (!req.file) {
        return res
          .status(400)
          .send(htmlWrapper("Error", `<p>No file was uploaded</p>`));
      }

      // Read the CSV file
      const fileContent = await fs.readFile(req.file.path, "utf-8");

      // Parse the CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Validate each record
      const validRecords = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const validationResult = schema.safeParse(record);

        if (validationResult.success) {
          validRecords.push(validationResult.data);
        } else {
          errors.push(`Row ${i + 1}: ${validationResult.error.message}`);
        }
      }

      // Delete the temporary file
      await fs.unlink(req.file.path);

      if (errors.length > 0) {
        // Show validation errors
        const errorList = errors.map((err) => `<li>${err}</li>`).join("");

        return res.status(400).send(
          htmlWrapper(
            "CSV Validation Errors",
            `
            <p>${errors.length} errors found in the CSV file:</p>
            <ul>${errorList}</ul>
            <div class="back-link">
              <a href="/simple/${modelName.toLowerCase()}/upload-csv">Try Again</a>
            </div>
          `
          )
        );
      }

      // Insert valid records
      if (validRecords.length > 0) {
        await Model.insertMany(validRecords);
      }

      // Redirect to the readAll page with a success message
      res.redirect(`/simple/${modelName.toLowerCase()}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Display JSON upload form
const jsonUploadForm =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const modelName = Model.modelName;

      const content = `
      <h2>Upload JSON File</h2>
      <p>Upload a JSON file to create multiple ${modelName} records at once.</p>
      <p>The JSON should be an array of objects with fields that match the ${modelName} schema.</p>
      
      <form action="/simple/${modelName.toLowerCase()}/process-json" method="POST" enctype="multipart/form-data">
        <div>
          <label for="jsonFile">Select JSON File:</label>
          <input type="file" id="jsonFile" name="file" accept=".json" required>
        </div>
        <button type="submit">Upload</button>
      </form>
      `;

      res.send(htmlWrapper(`Upload ${modelName} JSON`, content));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Process JSON upload
const processJSON =
  <T extends Document>(Model: Model<T>, schema: z.ZodType) =>
  async (req: RequestWithFile, res: Response) => {
    try {
      const modelName = Model.modelName;

      if (!req.file) {
        return res
          .status(400)
          .send(htmlWrapper("Error", `<p>No file was uploaded</p>`));
      }

      // Read the JSON file
      const fileContent = await fs.readFile(req.file.path, "utf-8");
      let records;

      try {
        records = JSON.parse(fileContent);

        // Ensure it's an array
        if (!Array.isArray(records)) {
          records = [records]; // Convert single object to array
        }
      } catch (parseError) {
        await fs.unlink(req.file.path);
        return res
          .status(400)
          .send(
            htmlWrapper(
              "Error",
              `<p>Invalid JSON format: ${(parseError as Error).message}</p>`
            )
          );
      }

      // Validate each record
      const validRecords = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const validationResult = schema.safeParse(record);

        if (validationResult.success) {
          validRecords.push(validationResult.data);
        } else {
          errors.push(`Record ${i + 1}: ${validationResult.error.message}`);
        }
      }

      // Delete the temporary file
      await fs.unlink(req.file.path);

      if (errors.length > 0) {
        // Show validation errors
        const errorList = errors.map((err) => `<li>${err}</li>`).join("");

        return res.status(400).send(
          htmlWrapper(
            "JSON Validation Errors",
            `
            <p>${errors.length} errors found in the JSON file:</p>
            <ul>${errorList}</ul>
            <div class="back-link">
              <a href="/simple/${modelName.toLowerCase()}/upload-json">Try Again</a>
            </div>
          `
          )
        );
      }

      // Insert valid records
      if (validRecords.length > 0) {
        await Model.insertMany(validRecords);
      }

      // Redirect to the readAll page with a success message
      res.redirect(`/simple/${modelName.toLowerCase()}/readAll`);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .send(htmlWrapper("Error", `<p>Error: ${err.message}</p>`));
    }
  };

// Dashboard showing links to all simple routes
const dashboard =
  (models: string[]) => async (_req: Request, res: Response) => {
    let modelLinks = "";

    models.forEach((model) => {
      modelLinks += `
      <div class="model-section">
        <h2>${model}</h2>
        <ul>
          <li><a href="/simple/${model.toLowerCase()}/count">Count</a></li>
          <li><a href="/simple/${model.toLowerCase()}/readAll">Read All</a></li>
          <li><a href="/simple/${model.toLowerCase()}/new">Add New</a></li>
          <li><a href="/simple/${model.toLowerCase()}/upload-csv">Upload CSV</a></li>
          <li><a href="/simple/${model.toLowerCase()}/upload-json">Upload JSON</a></li>
        </ul>
      </div>
    `;
    });

    const content = `
    <div class="dashboard">
      <p>Select a model and operation:</p>
      ${modelLinks}
    </div>
  `;

    res.send(htmlWrapper("Simple API Dashboard", content));
  };

export default {
  count,
  readAll,
  readOne,
  readMany,
  newForm,
  create,
  editForm,
  update,
  deleteForm,
  deleteOne,
  deleteAllForm,
  deleteAll,
  csvUploadForm,
  processCSV,
  jsonUploadForm,
  processJSON,
  dashboard,
  upload,
};
