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
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      // ── Android-specific configuration ─────────────────────────────────
      android: {
        priority: "high",
        notification: {
          title: title,
          body: body,
          sound: "default",
          default_sound: true,
          notification_priority: "PRIORITY_HIGH",
          channel_id: "high_importance_channel",
          icon: "ic_notification",
        },
      },
      // ── iOS (APNs) specific configuration ──────────────────────────────
      apns: {
        headers: {
          "apns-priority": "10",
          "apns-push-type": "alert",
        },
        payload: {
          aps: {
            alert: {
              title: title,
              body: body,
            },
            sound: "default",
            badge: 1,
            "content-available": 1,
            "mutable-content": 1,
          },
        },
      },
    },
  };

  console.log("📤 FCM Request Payload:", JSON.stringify(message, null, 2));

  const response = await fetch(FCM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const responseText = await response.text();
  console.log("📥 FCM Response Status:", response.status);
  console.log("📥 FCM Response Body:", responseText);

  if (!response.ok) {
    throw new Error(`FCM send failed: ${responseText}`);
  }

  const result = JSON.parse(responseText);
  console.log("✅ FCM Message Name:", result.name);
  return result;
}

// ─── Send to a specific device token (for testing) ───────────────────────────

/**
 * Send a notification to a specific device FCM token.
 * Use this to test if the notification pipeline works end-to-end
 * before troubleshooting topic subscriptions.
 *
 * @param {string} token - The device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<object>} FCM response
 */
export async function sendTokenNotification(token, title, body) {
  const accessToken = await getAccessToken();

  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: {
        type: "test",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      android: {
        priority: "high",
        notification: {
          title: title,
          body: body,
          sound: "default",
          default_sound: true,
          notification_priority: "PRIORITY_HIGH",
          channel_id: "high_importance_channel",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
          "apns-push-type": "alert",
        },
        payload: {
          aps: {
            alert: { title: title, body: body },
            sound: "default",
            badge: 1,
            "content-available": 1,
          },
        },
      },
    },
  };

  console.log("📤 FCM Token Send Payload:", JSON.stringify(message, null, 2));

  const response = await fetch(FCM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const responseText = await response.text();
  console.log("📥 FCM Token Response:", response.status, responseText);

  if (!response.ok) {
    throw new Error(`FCM token send failed: ${responseText}`);
  }

  return JSON.parse(responseText);
}

// ─── Validate a topic message without sending ────────────────────────────────

/**
 * Dry-run validation: check if the FCM payload is valid without sending.
 * FCM returns 200 if valid, error details if not.
 *
 * @param {string} topic - Topic name
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<object>} Validation result
 */
export async function validateTopicMessage(topic, title, body) {
  const accessToken = await getAccessToken();

  const message = {
    validate_only: true,
    message: {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
    },
  };

  console.log("🔍 FCM Validate Payload:", JSON.stringify(message, null, 2));

  const response = await fetch(FCM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const responseText = await response.text();
  console.log("🔍 FCM Validate Response:", response.status, responseText);

  if (!response.ok) {
    throw new Error(`FCM validation failed: ${responseText}`);
  }

  return JSON.parse(responseText);
}
