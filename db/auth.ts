import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { db } from './database.ts';
import { users, sessions, accounts, verifications } from './schema.ts';

// Authentication instance for the HAX Portal.
// The drizzle adapter requires the schema explicitly: without it better-auth
// cannot resolve the plural table names (users, sessions, ...) and every
// request fails at runtime.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    usePlural: true,
    schema: { users, sessions, accounts, verifications },
  }),
  emailAndPassword: {
    enabled: true,
    // Demo credentials are short; keep sign-up usable for local development.
    minPasswordLength: 4,
  },
  session: {
    expiresIn: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      roleId: {
        type: 'string',
        defaultValue: 'guest',
        input: false,
      },
    },
  },
  // displayUsername is disabled: the portal has its own displayName field.
  plugins: [username({ displayUsername: false })],
});

export type Session = typeof auth.$Infer.Session;
