import express, { Router } from "express";
import controller from "../controllers/crudController";
import validate, { validatePutRequest } from "../middlewares/validate";
import { ZodSchema } from "zod";
import { Model, Document } from "mongoose";

export default function createRoutes<T extends Document>(
  Model: Model<T>,
  schema: ZodSchema
): Router {
  const router = express.Router();

  router.post("/", validate(schema), controller.create<T>(Model));
  router.get("/", controller.readAll<T>(Model));
  router.get("/:id", controller.readOne<T>(Model));
  router.put("/:id", validatePutRequest(schema), controller.update<T>(Model));
  router.delete("/:id", controller.delete<T>(Model));

  return router;
}
