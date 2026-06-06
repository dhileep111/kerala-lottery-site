/**
 * Centralized slug sanitization utilities.
 *
 * Rules:
 *  - Trim leading/trailing whitespace
 *  - Lowercase
 *  - Replace internal whitespace runs with hyphens
 *  - Decode and remove %20 / percent-encoded spaces
 *  - Collapse consecutive slashes to a single slash
 */
export function cleanSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/%20/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9/-]/g, '')
    .replace(/\/+/g, '/');
}

/**
 * Validate that a slug is safe for use in a URL path segment.
 * Returns null if valid, or an error string if not.
 */
export function validateSlug(slug: string): string | null {
  if (!slug || slug !== cleanSlug(slug)) {
    return `Malformed slug: "${slug}" — expected "${cleanSlug(slug)}"`;
  }
  return null;
}
