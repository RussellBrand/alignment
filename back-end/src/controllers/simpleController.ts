import { Request, Response } from "express";
import { Model, Document } from "mongoose";

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
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
      <div class="back-link">
        <a href="/simple">Back to Simple Dashboard</a>
      </div>
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

      // Convert string IDs to MongoDB ObjectIDs - this avoids issues with string comparison
      // Log both the IDs we're looking for and the found documents to help debug
      console.log(`Looking for IDs: ${ids.join(", ")}`);

      // Get all documents in one query
      const documents = await Model.find();
      console.log(`All documents: ${documents.length}`);
      documents.forEach((doc) =>
        console.log(
          `- Document: ${
            doc._id
          } (${doc._id.toString()}), Text: ${JSON.stringify(doc.toObject())}`
        )
      );

      // Now filter just the ones we want by ID
      const requestedDocuments = documents.filter((doc) =>
        ids.includes(doc._id.toString())
      );
      console.log(`Found ${requestedDocuments.length} requested documents`);

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
          <li><a href="/simple/${model.toLowerCase()}/readOne/ID">Read One (replace ID)</a></li>
          <li><a href="/simple/${model.toLowerCase()}/readMany?ids=ID1,ID2">Read Many (replace IDs)</a></li>
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
  dashboard,
};
