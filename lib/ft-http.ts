import "server-only";

/** Identify ourselves to 42. Firewalls in front of APIs often reject anonymous clients. */
export const FT_USER_AGENT = "42shops (+https://github.com/HxX2/42shops)";

/**
 * Summarize a failed 42 response for the server logs: status, auth error
 * header, firewall hints and the start of the body. Never includes our secret.
 */
export async function describeFtError(res: Response): Promise<string> {
  const parts = [`status ${res.status}`];
  for (const header of ["www-authenticate", "server", "cf-ray", "content-type"]) {
    const value = res.headers.get(header);
    if (value) parts.push(`${header}: ${value}`);
  }
  try {
    const body = (await res.text()).replace(/\s+/g, " ").trim();
    if (body) parts.push(`body: ${body.slice(0, 400)}`);
  } catch {
    // body unreadable; status and headers are still useful
  }
  return parts.join(" | ");
}
