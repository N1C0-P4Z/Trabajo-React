import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Email verification service.
 * - DEV mode: auto-verifies immediately (no token generated).
 * - PROD mode: generates crypto.randomUUID token, stores SHA-256 hash with 24h TTL.
 */

function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a verification token for the given user.
 * In DEV mode, auto-verifies and returns null (no token needed).
 * In PROD mode, returns the plaintext token (to be sent via email).
 */
export async function generateVerificationToken(userId: number): Promise<string | null> {
  if (isDevMode()) {
    // Auto-verify in DEV
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
    return null;
  }

  // PROD: generate token and store hash
  const token = crypto.randomUUID();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Remove any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  await prisma.emailVerificationToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });

  // Mock email send — log to console
  console.log(`[EMAIL VERIFICATION] Token for user ${userId}: ${token}`);
  console.log(`[EMAIL VERIFICATION] In production, this would be sent via email.`);

  return token;
}

/**
 * Verify email using the plaintext token.
 * Returns true if verification succeeds, false otherwise.
 */
export async function verifyEmail(token: string): Promise<boolean> {
  const hashedToken = hashToken(token);

  const record = await prisma.emailVerificationToken.findFirst({
    where: { token: hashedToken },
  });

  if (!record) {
    return false;
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    // Clean up expired token
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return false;
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  // Clean up used token
  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  return true;
}

/**
 * Check if a user's email is verified.
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return user?.emailVerified ?? false;
}
