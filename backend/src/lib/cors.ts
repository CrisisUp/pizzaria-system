export function getCorsOrigins(): string[] {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  return corsOrigin.split(',').map((s) => s.trim());
}