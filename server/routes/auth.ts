import type { Express, Request, Response } from "express";
import type { LoginRequest, LoginResponse } from "../../shared/api";
import { findUserByUsername, updateStreakOnLogin } from "../models/User";

/**
 * Handle login request with automatic streak calculation
 */
export function handleLogin(req: Request, res: Response<LoginResponse>) {
  try {
    const { username, password } = req.body as LoginRequest;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        error: "Missing credentials",
      });
    }

    // Find user by username
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        error: "User not found",
      });
    }

    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        error: "Incorrect password",
      });
    }

    // Update streak on successful login
    const updatedUser = updateStreakOnLogin(user.id);
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user streak",
        error: "Database error",
      });
    }

    // Return successful login response with updated streak
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        initials: updatedUser.initials,
        streak: updatedUser.streak,
        lastLoginDate: updatedUser.lastLoginDate,
      },
      streak: updatedUser.streak,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Register the auth routes
 */
export function registerAuthRoutes(app: Express) {
  app.post("/api/login", handleLogin);
}
