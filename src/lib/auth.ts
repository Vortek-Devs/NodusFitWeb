import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { getOAuthState } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import {
  inviteMatchesSignup,
  readSignupInviteContext,
  roleForInvite,
  type SignupInviteValidation,
} from "@/lib/auth/invite-context";
import { sendNodusVerificationEmail } from "@/lib/auth/verification-email";

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
          disableImplicitSignUp: true,
        },
      }
    : {};

async function validateStudentInviteForEmail(
  context: { path?: string; request?: Request } | null,
  email: string,
): Promise<SignupInviteValidation> {
  let oauthState: unknown;
  if (
    context?.path === "/callback" ||
    context?.path?.startsWith("/callback/") ||
    context?.path?.startsWith("/oauth2/callback/")
  ) {
    try {
      oauthState = await getOAuthState();
    } catch {
      return "invalid";
    }
  }
  const inviteContext = readSignupInviteContext(
    context?.request?.headers ?? null,
    context?.path,
    oauthState,
  );
  if (inviteContext.status !== "present") return inviteContext.status;

  const apiUrl = process.env.NODUS_API_URL;
  if (!apiUrl) return "invalid";

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/v1/invites/${encodeURIComponent(inviteContext.token)}`,
      { cache: "no-store", signal: context?.request?.signal },
    );
    if (!response.ok) return "invalid";
    const invite: unknown = await response.json();
    return inviteMatchesSignup(invite, email) ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}

export const auth = betterAuth({
  appName: "NodusFit",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.NODUS_MOBILE_SCHEME ?? "nodusfit://"],
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendNodusVerificationEmail({ email: user.email, url });
    },
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
        before: async (user, context) => {
          const role = roleForInvite(
            await validateStudentInviteForEmail(context, user.email),
          );
          if (!role) return false;
          return {
            data: {
              ...user,
              role,
              isActive: true,
              isBanned: false,
            },
          };
        },
      },
    },
  },
  plugins: [
    expo(),
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
