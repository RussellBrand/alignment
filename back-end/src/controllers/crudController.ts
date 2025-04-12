import { Request, Response } from "express";
import { Model } from "mongoose";

const create = (Model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const document = await Model.create(req.body);
    res.status(201).json(document);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

const readAll = (Model: Model<any>) => async (_req: Request, res: Response) => {
  try {
    const documents = await Model.find();
    res.status(200).json(documents);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

const readOne = (Model: Model<any>) => async (req: Request, res: Response) => {
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

const update = (Model: Model<any>) => async (req: Request, res: Response) => {
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

const deleteOne =
  (Model: Model<any>) => async (req: Request, res: Response) => {
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
