import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse against the schema. If it fails, it throws a ZodError.
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next(); // Data is perfectly typed and safe. Proceed to controller.
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: true,
          message: 'Validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return;
      }
      next(error);
    }
};