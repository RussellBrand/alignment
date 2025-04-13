import express, { Router } from "express";
import { Model, Document } from "mongoose";
import simpleController, { upload } from "../controllers/simpleController";
import { z } from "zod";

// Create routes for a specific model
const createSimpleRoutes = <T extends Document>(
  Model: Model<T>,
  schema: z.ZodType = z.object({}) // Default empty schema as fallback
): Router => {
  const router = express.Router();
  const modelName = Model.modelName.toLowerCase();
  const singularName = modelName.endsWith("s")
    ? modelName.slice(0, -1)
    : modelName;

  // Read routes (existing)
  router.get("/count", simpleController.count(Model));
  router.get("/readAll", simpleController.readAll(Model));
  router.get("/readOne/:id", simpleController.readOne(Model));
  router.get("/readMany", simpleController.readMany(Model));

  // New form and create routes
  router.get("/new", simpleController.newForm(Model, schema));
  router.post(
    "/create",
    express.urlencoded({ extended: true }),
    simpleController.create(Model, schema)
  );

  // Also support singular form for create as expected by tests
  router.post(
    `/${singularName}/create`,
    express.urlencoded({ extended: true }),
    simpleController.create(Model, schema)
  );

  // Edit and update routes
  router.get("/edit/:id", simpleController.editForm(Model));
  router.post(
    "/update/:id",
    express.urlencoded({ extended: true }),
    simpleController.update(Model, schema)
  );

  // Also support singular form for update as expected by tests
  router.post(
    `/${singularName}/update/:id`,
    express.urlencoded({ extended: true }),
    simpleController.update(Model, schema)
  );

  // Delete routes
  router.get("/delete/:id", simpleController.deleteForm(Model));
  router.post("/delete/:id", simpleController.deleteOne(Model));

  // Also support singular form for delete as expected by tests
  router.post(`/${singularName}/delete/:id`, simpleController.deleteOne(Model));

  // Support singular form for reading as expected by tests
  router.get(`/${singularName}/readAll`, simpleController.readAll(Model));

  // Delete all routes
  router.get("/deleteAll", simpleController.deleteAllForm(Model));
  router.post("/deleteAll", simpleController.deleteAll(Model));

  // CSV upload routes
  router.get("/upload-csv", simpleController.csvUploadForm(Model));
  router.post(
    "/process-csv",
    upload.single("file"),
    simpleController.processCSV(Model, schema)
  );

  // JSON upload routes
  router.get("/upload-json", simpleController.jsonUploadForm(Model));
  router.post(
    "/process-json",
    upload.single("file"),
    simpleController.processJSON(Model, schema)
  );

  return router;
};

export default createSimpleRoutes;
