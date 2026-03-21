/**
 * FCM V1 Direct API Service
 *
 * Sends FCM notifications directly from the browser using the
 * service account credentials and the FCM V1 REST API.
 *
 * Flow: Sign JWT (Web Crypto) → Exchange for OAuth2 Token → Call FCM V1 API
 */

const FCM_PROJECT_ID = import.meta.env.VITE_FCM_PROJECT_ID;
const FCM_CLIENT_EMAIL = import.meta.env.VITE_FCM_CLIENT_EMAIL;
const FCM_PRIVATE_KEY = import.meta.env.VITE_FCM_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n",
);

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FCM_URL = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Base64url encode a string or ArrayBuffer */
function base64url(input) {
  let bytes;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Import a PEM private key for signing */
async function importPrivateKey(pem) {
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryStr = atob(pemContents);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

// ─── JWT & OAuth2 ─────────────────────────────────────────────────────────────

/** Cache for the access token */
let cachedToken = null;
let tokenExpiry = 0;

/** Create a signed JWT for Google OAuth2 */
async function createSignedJWT() {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: FCM_CLIENT_EMAIL,
    sub: FCM_CLIENT_EMAIL,
    aud: TOKEN_URL,
    iat: now,
    exp: exp,
    scope: FCM_SCOPE,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(FCM_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64url(signature)}`;
}

/** Get an OAuth2 access token (with caching) */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const jwt = await createSignedJWT();

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

// ─── FCM API ──────────────────────────────────────────────────────────────────

/**
 * Send a notification to an FCM topic
 * @param {string} topic - Topic name (e.g., "leaderboard")
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} eventId - Event ID for data payload
 * @returns {Promise<object>} FCM response
 */
export async function sendTopicNotification(topic, title, body, eventId) {
  const accessToken = await getAccessToken();

  const message = {
    message: {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
      data: {
        type: "event",
        eventId: eventId || "",
      },
    },
  };

  const response = await fetch(FCM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FCM send failed: ${error}`);
  }

  return response.json();
}
