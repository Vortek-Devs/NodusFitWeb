type TrustedOriginsConfig = {
  nodeEnv?: string;
  mobileScheme?: string;
};

export function getTrustedOrigins({
  nodeEnv = process.env.NODE_ENV,
  mobileScheme = process.env.NODUS_MOBILE_SCHEME,
}: TrustedOriginsConfig = {}): string[] {
  const origins = [mobileScheme ?? "nodusfit://"];

  // Local web and Expo Go origins are needed in development only.
  if (nodeEnv === "development") {
    origins.push("http://localhost:*", "http://127.0.0.1:*", "exp://", "exp://**");
  }

  return origins;
}
