type TrustedOriginsConfig = {
  nodeEnv?: string;
  mobileScheme?: string;
  vercelEnv?: string;
  vercelGitCommitRef?: string;
  previewExpoGoOrigin?: string;
};

const EXPO_GO_STAGING_BRANCH = "codex/final-pr-preview-2026-09-28";

export function getTrustedOrigins({
  nodeEnv = process.env.NODE_ENV,
  mobileScheme = process.env.NODUS_MOBILE_SCHEME,
  vercelEnv = process.env.VERCEL_ENV,
  vercelGitCommitRef = process.env.VERCEL_GIT_COMMIT_REF,
  previewExpoGoOrigin = process.env.NODUS_PREVIEW_EXPO_GO_ORIGIN,
}: TrustedOriginsConfig = {}): string[] {
  const origins = [mobileScheme ?? "nodusfit://"];

  // Local web and Expo Go origins are needed in development only.
  if (nodeEnv === "development") {
    origins.push("http://localhost:*", "http://127.0.0.1:*", "exp://", "exp://**");
  }

  if (
    vercelEnv === "preview" &&
    vercelGitCommitRef === EXPO_GO_STAGING_BRANCH &&
    previewExpoGoOrigin
  ) {
    const exactOrigin = parseExactExpoGoOrigin(previewExpoGoOrigin);
    if (exactOrigin) origins.push(exactOrigin);
  }

  return origins;
}

function parseExactExpoGoOrigin(value: string): string | undefined {
  if (value !== value.trim() || value.includes("*") || value.includes("?")) return;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "exp:" ||
      !url.hostname ||
      !url.port ||
      url.username ||
      url.password ||
      (url.pathname !== "" && url.pathname !== "/") ||
      url.search ||
      url.hash
    ) {
      return;
    }

    return `exp://${url.host}`;
  } catch {
    return;
  }
}
