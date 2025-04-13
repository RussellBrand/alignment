import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { IUser } from "../../schemas/userSchema";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// JWT secret should be in an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Generate JWT token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );
};

// Middleware to require authentication
export const requireAuth = passport.authenticate("jwt", { session: false });

// Middleware to require admin role
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  next();
};
