import express, { Router } from "express";
import controller from "../controllers/crudController";
import validate from "../middlewares/validate";
import { ZodSchema } from "zod";
import { Model } from "mongoose";

export default function createRoutes(
  Model: Model<any>,
  schema: ZodSchema
): Router {
  const router = express.Router();

  router.post("/", validate(schema), controller.create(Model));
  router.get("/", controller.readAll(Model));
  router.get("/:id", controller.readOne(Model));
  router.put("/:id", validate(schema), controller.update(Model));
  router.delete("/:id", controller.delete(Model));

  return router;
}
