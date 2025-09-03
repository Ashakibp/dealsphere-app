import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, organizationId: true }
    });

    if (!user) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add user to context for use in handler
    context.user = user;
    return handler(request, context);
  };
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      const user = await getUserFromRequest(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!roles.includes(user.role)) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      context.user = user;
      return handler(request, context);
    };
  };
}