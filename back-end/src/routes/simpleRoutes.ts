import express, { Router } from "express";
import { Model, Document } from "mongoose";
import simpleController from "../controllers/simpleController";

// Create routes for a specific model
const createSimpleRoutes = <T extends Document>(Model: Model<T>): Router => {
  const router = express.Router();
  const modelName = Model.modelName.toLowerCase();

  router.get("/count", simpleController.count(Model));
  router.get("/readAll", simpleController.readAll(Model));
  router.get("/readOne/:id", simpleController.readOne(Model));
  router.get("/readMany", simpleController.readMany(Model));

  return router;
};

export default createSimpleRoutes;
