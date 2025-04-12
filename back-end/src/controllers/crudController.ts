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

export default { create, readAll, readOne, update, delete: deleteOne };
