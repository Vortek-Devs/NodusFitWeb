import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import {
  INVITE_COOKIE_NAME,
  inviteMatchesSignup,
  parseCookie,
  roleForInvite,
} from "@/lib/auth/invite-context";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {};

async function hasValidStudentInviteForEmail(
  context: { request?: Request } | null,
  email: string,
): Promise<boolean> {
  // O convite atravessa o redirect OAuth somente pelo cookie httpOnly.
  // O hook consulta a API novamente para nao confiar em dados do browser.
  const token = parseCookie(
    context?.request?.headers.get("cookie") ?? null,
    INVITE_COOKIE_NAME,
  );
  if (!token) return false;

  const apiUrl = process.env.NODUS_API_URL;
  if (!apiUrl) return false;

  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/v1/invites/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!response.ok) return false;

  const invite = (await response.json()) as { role?: string; email?: string };
  return inviteMatchesSignup(invite, email);
}

export const auth = betterAuth({
  appName: "NodusFit",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: google,
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "PERSONAL",
        input: false,
        fieldName: "role",
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
        fieldName: "is_active",
      },
      isBanned: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
        fieldName: "is_banned",
      },
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  databaseHooks: {
    user: {
      create: {
        // A role e decidida no servidor. O formulario nao consegue promover
        // o usuario porque o campo role tambem possui input: false.
        before: async (user, context) => ({
          data: {
            ...user,
            role: roleForInvite(await hasValidStudentInviteForEmail(context, user.email)),
            isActive: true,
            isBanned: false,
          },
        }),
      },
    },
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "ES256",
        },
      },
      jwt: {
        // Este JWT nao substitui a sessao BetterAuth. Ele e uma credencial
        // curta emitida para o BFF se autenticar na NodusAPI.
        issuer: process.env.BETTER_AUTH_URL,
        audience: "nodus-api",
        expirationTime: "15m",
        definePayload: ({ user }) => ({
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.emailVerified,
        }),
      },
      schema: {
        jwks: {
          modelName: "jwks",
          fields: {
            publicKey: "public_key",
            privateKey: "private_key",
            createdAt: "created_at",
            expiresAt: "expires_at",
          },
        },
      },
    }),
  ],
});
