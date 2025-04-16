import express, { Router } from "express";
import { Model, Document } from "mongoose";
import simpleController, { upload } from "../controllers/simpleController";
import { z, ZodObject, ZodRawShape } from "zod";
import { OpenQuestion } from "../schemas/openQuestionSchema";
import { Question } from "../schemas/questionSchema";
import { openQuestionSchema } from "../schemas/openQuestionSchema";
import { questionSchema } from "../schemas/questionSchema";
import { User } from "../schemas/userSchema";
import { userSchema } from "../schemas/userSchema";
import { Quote } from "../schemas/quoteSchema";
import { quoteSchema } from "../schemas/quoteSchema";
import { Whence } from "../schemas/whenceSchema";
import { whenceSchema } from "../schemas/whenceSchema";

// Create separate routers for each model with their own prefixes
export const simpleOpenQuestionRouter = express.Router();
export const simpleQuestionRouter = express.Router();
export const simpleUserRouter = express.Router();
export const simpleQuoteRouter = express.Router();
export const simpleWhenceRouter = express.Router();
export const simpleDashboardRouter = express.Router();

// Create routes for a specific model
const createSimpleRoutes = <T extends Document>(
  Model: Model<T>,
  schema: ZodObject<ZodRawShape> = z.object({}) // Fixed: Use ZodObject<ZodRawShape> instead of z.ZodType
): Router => {
  const router = express.Router();

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

  // Edit and update routes
  router.get("/edit/:id", simpleController.editForm(Model, schema));
  router.post(
    "/update/:id",
    express.urlencoded({ extended: true }),
    simpleController.update(Model, schema)
  );

  // Delete routes
  router.get("/delete/:id", simpleController.deleteForm(Model));
  router.post("/delete/:id", simpleController.deleteOne(Model));

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
