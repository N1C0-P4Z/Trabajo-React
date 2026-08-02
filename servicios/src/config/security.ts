/**
 * Security configuration — parses and validates required environment variables.
 * Application crashes on startup if critical secrets are missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[SECURITY] Required environment variable "${name}" is missing. Aborting startup.`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

// ── Critical secrets (crash on missing) ──────────────────────────
export const JWT_SECRET = requireEnv('JWT_SECRET');
export const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

// ── reCAPTCHA keys (needed later for captcha middleware) ─────────
export const RECAPTCHA_SECRET = optionalEnv('RECAPTCHA_SECRET', '');
export const RECAPTCHA_SITE_KEY = optionalEnv('RECAPTCHA_SITE_KEY', '');

// ── Rate limiting defaults ───────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10); // 15 min
export const RATE_LIMIT_MAX = parseInt(optionalEnv('RATE_LIMIT_MAX', '5'), 10);

// ── Body size limit ──────────────────────────────────────────────
export const BODY_SIZE_LIMIT = '1mb';
