interface SerializeApiErrorOptions {
  fallback?: string;
  getMessage?: (key: string) => string;
}

export function serializeApiError(error: unknown, options: SerializeApiErrorOptions = {}): string {
  const fallback = options.fallback ?? "Something went wrong.";

  if (typeof error !== "object" || error === null) return fallback;

  const err = error as { message?: string; code?: string; case?: string };
  if (err.message) return err.message;

  if (err.case && err.code && options.getMessage) {
    const key = `errors.${err.case}.${err.code}`;
    const translated = options.getMessage(key);
    if (translated && translated !== key) return translated;
  }

  return err.code ?? err.case ?? fallback;
}
