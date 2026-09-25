export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (typeof error === "object" && error !== null && "status" in error) {
    return typeof error.status === "number" && error.status >= 500 && error.status < 600;
  }
  return (
    error instanceof TypeError &&
    /^(fetch failed|Failed to fetch|NetworkError when attempting to fetch resource\.|Load failed)$/.test(
      error.message,
    )
  );
}
