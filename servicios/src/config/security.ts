function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida "${name}".`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const JWT_SECRET = requireEnv('JWT_SECRET');

export const RECAPTCHA_SECRET = optionalEnv('RECAPTCHA_SECRET', '');
export const RECAPTCHA_SITE_KEY = optionalEnv('RECAPTCHA_SITE_KEY', '');

export const RATE_LIMIT_WINDOW_MS = parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10); // 15 min
export const RATE_LIMIT_MAX = parseInt(optionalEnv('RATE_LIMIT_MAX', '5'), 10);

export const BODY_SIZE_LIMIT = '1mb';
