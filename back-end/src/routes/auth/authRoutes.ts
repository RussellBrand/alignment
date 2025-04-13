import express from "express";
import passport from "passport";
import { z } from "zod";
import { User, IUser } from "../../schemas/userSchema";
import {
  generateToken,
  requireAuth,
} from "../../middlewares/auth/authMiddleware";
import validate from "../../middlewares/validate";

const router = express.Router();

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration route
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
});

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Login route
router.post("/login", validate(loginSchema), (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (
      err: Error | null,
      user: IUser | false,
      info: { message: string } | undefined
    ) => {
      if (err) return next(err);

      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Login failed" });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  )(req, res, next);
});

// Get current user profile
router.get("/profile", requireAuth, (req, res) => {
  // TypeScript now knows req.user exists because of our type declaration
  // in the auth middleware, but let's add an extra check to be safe
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - User not found" });
  }

  const user = req.user;

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
