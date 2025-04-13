import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {
      const err = error as ZodError;
      res.status(400).json({ error: err.errors });
    }
  };

const validatePutRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clone the body without the _id field to validate against the schema
      const { _id, ...bodyWithoutId } = req.body;

      schema.parse(bodyWithoutId);

      // If _id exists in request body, ensure it matches URL param id
      if (_id && req.params.id && _id !== req.params.id) {
        return res.status(400).json({
          error: [
            {
              message: "Body _id must match URL parameter id",
              path: ["_id"],
            },
          ],
        });
      }
      next();
    } catch (error: unknown) {
      const err = error as ZodError;
      res.status(400).json({ error: err.errors });
    }
  };

const validatePatchRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clone the body without the _id field
      const { _id, ...bodyWithoutId } = req.body;

      // For PATCH requests, we need to validate partial data
      // Create a partial schema where all properties are optional
      const partialSchema = schema.partial();

      // Validate the partial data
      partialSchema.parse(bodyWithoutId);

      // If _id exists in request body, ensure it matches URL param id
      if (_id && req.params.id && _id !== req.params.id) {
        return res.status(400).json({
          error: [
            {
              message: "Body _id must match URL parameter id",
              path: ["_id"],
            },
          ],
        });
      }
      next();
    } catch (error: unknown) {
      const err = error as ZodError;
      res.status(400).json({ error: err.errors });
    }
  };

export default validate;
export { validatePutRequest, validatePatchRequest };
