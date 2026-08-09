import crypto from 'crypto';
import { prisma } from '../config/database';

function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** En desarrollo marca el email como verificado. En producción genera token (hash + TTL 24h). */
export async function generateVerificationToken(userId: number): Promise<string | null> {
  if (isDevMode()) {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
    return null;
  }

  const token = crypto.randomUUID();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  // TODO: enviar por email; por ahora solo log
  console.log(`[verificación email] usuario ${userId}: ${token}`);

  return token;
}

export async function verifyEmail(token: string): Promise<boolean> {
  const hashedToken = hashToken(token);

  const record = await prisma.emailVerificationToken.findFirst({
    where: { token: hashedToken },
  });

  if (!record) {
    return false;
  }

  if (new Date() > record.expiresAt) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return false;
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  return true;
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return user?.emailVerified ?? false;
}
