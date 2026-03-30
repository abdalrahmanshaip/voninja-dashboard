/**
 * Generate a valid FCM topic name from a given text.
 *
 * FCM Topic Naming Rules:
 * - Allowed characters: [a-zA-Z0-9-_.~%]
 * - Max length: 900 characters
 * - No spaces, no /, @, #, etc.
 *
 * Strategy:
 * - Prefix with "leaderboard." for easy grouping
 * - Slugify the title (lowercase, replace spaces with dots)
 * - Append a short unique suffix (6 chars from timestamp + random)
 * - Strip any disallowed characters
 *
 * Examples:
 *   "Summer Challenge 2025" → "leaderboard.summer.challenge.2025.a3f8b1"
 *   "مسابقة رمضان"          → "leaderboard.x4c2e9"  (non-latin stripped)
 */

/**
 * Converts a string to a valid FCM topic slug
 * @param {string} text - The input text (e.g., event title)
 * @param {string} [prefix="leaderboard"] - Topic prefix for grouping
 * @returns {string} A valid, unique FCM topic name
 */
export function generateTopicSlug(text, prefix = "leaderboard") {
  // Generate a short unique suffix (6 hex chars)
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);

  // Slugify: lowercase, replace spaces/underscores with dots, remove disallowed chars
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".") // spaces → dots
    .replace(/[^a-z0-9.~%-]/g, "") // remove anything not allowed (keeps a-z, 0-9, ., ~, %, -)
    .replace(/\.{2,}/g, ".") // collapse consecutive dots
    .replace(/^\.+|\.+$/g, ""); // trim leading/trailing dots

  // Build final topic: prefix.slug.uniqueSuffix
  const parts = [prefix, slug, uniqueSuffix].filter(Boolean);
  const topic = parts.join(".");

  // Ensure max 900 chars
  return topic.substring(0, 900);
}

/**
 * Validates that a topic name matches FCM requirements
 * @param {string} topic - The topic name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTopicName(topic) {
  if (!topic || topic.trim().length === 0) {
    return { valid: false, error: "Topic name is required" };
  }

  if (topic.length > 900) {
    return { valid: false, error: "Topic name must be 900 characters or less" };
  }

  // FCM allowed: [a-zA-Z0-9-_.~%]
  const invalidChars = topic.replace(/[a-zA-Z0-9\-_.~%]/g, "");
  if (invalidChars.length > 0) {
    return {
      valid: false,
      error: `Contains invalid characters: "${invalidChars}". Only letters, numbers, - _ . ~ % are allowed`,
    };
  }

  return { valid: true };
}
