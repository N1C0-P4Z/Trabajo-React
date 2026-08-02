import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/security';

export const generateToken = (payload: object): string => {
  const expiresIn: string = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
};
