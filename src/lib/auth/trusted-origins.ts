type TrustedOriginsConfig = {
  nodeEnv?: string;
  mobileScheme?: string;
};

export function getTrustedOrigins({
  nodeEnv = process.env.NODE_ENV,
  mobileScheme = process.env.NODUS_MOBILE_SCHEME,
}: TrustedOriginsConfig = {}): string[] {
  const origins = [mobileScheme ?? "nodusfit://"];

  // Localhost aliases are needed for dev previews, never for deployed auth.
  if (nodeEnv === "development") {
    origins.push("http://localhost:*", "http://127.0.0.1:*");
  }

  return origins;
}
