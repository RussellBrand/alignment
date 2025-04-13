import { Request, Response } from "express";
import { Model, Document } from "mongoose";

// Generic function to create a document
const create =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const document = await Model.create(req.body);
      res.status(201).json(document);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  };

// Generic function to create multiple documents
const createMany =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      if (!req.body || !Array.isArray(req.body)) {
        return res
          .status(400)
          .json({ error: "Array of documents is required" });
      }

      // Filter out items without _id and items with _id
      const itemsWithoutId = req.body.filter((item) => !item._id);
      const itemsWithId = req.body.filter((item) => item._id);

      const results = [];

      // Insert items without ID
      if (itemsWithoutId.length > 0) {
        const insertedDocs = await Model.insertMany(itemsWithoutId);
        results.push(...insertedDocs);
      }

      // Update or insert items with ID (upsert)
      for (const item of itemsWithId) {
        const { _id, ...updateData } = item;
        const upsertedDoc = await Model.findByIdAndUpdate(_id, updateData, {
          new: true,
          upsert: true,
        });
        results.push(upsertedDoc);
      }

      res.status(201).json(results);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  };

// Generic function to read all documents
const readAll =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const documents = await Model.find();
      res.status(200).json(documents);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

// Generic function to read one document by id
const readOne =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const document = await Model.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Not found" });
      }
      res.status(200).json(document);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

// Generic function to read multiple documents by ids
const readMany =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      // Expect an array of ids in the request body
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Array of IDs is required" });
      }

      const documents = await Model.find({ _id: { $in: ids } });

      // Check if any documents were found
      if (documents.length === 0) {
        return res.status(404).json({ error: "No documents found" });
      }

      res.status(200).json(documents);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

// Generic function to update one document
const update =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!document) {
        return res.status(404).json({ error: "Not found" });
      }
      res.status(200).json(document);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  };

// Generic function for partial update (PATCH) of a document
//
// TODO: validation that there are no excess fields
// TODO: do it in one mongo call instead of two
const patch =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      // Use findById first to check if document exists
      const existingDocument = await Model.findById(req.params.id);
      if (!existingDocument) {
        return res.status(404).json({ error: "Not found" });
      }

      // Apply only the fields that are provided in the request body
      Object.keys(req.body).forEach((key) => {
        existingDocument.set(key, req.body[key]);
      });

      // Save the updated document
      await existingDocument.save();

      res.status(200).json(existingDocument);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  };

// Generic function to delete all documents
const deleteAll =
  <T extends Document>(Model: Model<T>) =>
  async (_req: Request, res: Response) => {
    try {
      const result = await Model.deleteMany({});
      res.status(200).json({
        message: "All documents deleted successfully",
        count: result.deletedCount,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

// Generic function to delete one document
const deleteOne =
  <T extends Document>(Model: Model<T>) =>
  async (req: Request, res: Response) => {
    try {
      const document = await Model.findByIdAndDelete(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Not found" });
      }
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  };

export default {
  create,
  createMany,
  readAll,
  readOne,
  readMany,
  update,
  patch,
  deleteAll,
  delete: deleteOne,
};
