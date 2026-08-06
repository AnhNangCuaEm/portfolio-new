import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Lazy singleton — only created at runtime when first query is made
let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(url);
  }
  return _sql;
}

// Convenience proxy — use this like: await sql`SELECT 1`
export const sql: NeonQueryFunction<false, false> = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return (getDb() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

