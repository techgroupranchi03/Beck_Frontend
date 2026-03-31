/**
 * Encode an entity ID and title into a URL-friendly slug.
 * Format: "{id}-{kebab-title}" e.g. "42-marketing-meeting"
 */
export function toSlug(id, title) {
  const kebab = (title || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${id}-${kebab}`;
}

/**
 * Extract the numeric ID from an "{id}-{slug}" URL param.
 * Returns null if the param doesn't start with a valid number.
 */
export function fromSlug(slug) {
  if (!slug) return null;
  const id = parseInt(slug.split('-')[0], 10);
  return Number.isNaN(id) ? null : id;
}
