import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { AuthenticationError } from '../middleware/errorHandler.js';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Find user by username
  const user = db.prepare(`
    SELECT id, username, email, password_hash, name, role, department, is_active
    FROM users 
    WHERE username = ? AND is_active = 1
  `).get(username);

  if (!user) {
    throw new AuthenticationError('Invalid username or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid username or password');
  }

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  db.prepare(`
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(user.id);

  // Remove password from response
  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department
  };

  res.json({
    success: true,
    data: {
      token,
      refreshToken,
      user: userResponse
    }
  });
};

export const refresh = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('Invalid refresh token');
  }

  // Generate new tokens
  const tokenPayload = {
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    role: req.user.role,
    department: req.user.department
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.json({
    success: true,
    data: {
      token,
      refreshToken
    }
  });
};