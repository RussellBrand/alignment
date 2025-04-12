import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

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

export default validate;
