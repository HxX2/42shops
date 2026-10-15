import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

/** Read lazily so `next build` never needs the secrets. */
export const env = {
  get clientId() {
    return required("FT_CLIENT_ID");
  },
  get clientSecret() {
    return required("FT_CLIENT_SECRET");
  },
  get appUrl(): string | undefined {
    return process.env.APP_URL?.trim().replace(/\/+$/, "") || undefined;
  },
};
