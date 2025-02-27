import { validationResult } from "express-validator";

export const validateInput = (checks: any[]) => {
  return async (req: any, res: any, next: any) => {
    await Promise.all(checks.map((check) => check.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  };
};
