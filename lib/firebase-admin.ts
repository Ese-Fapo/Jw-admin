import * as admin from "firebase-admin";

let adminApp: admin.app.App;

function parseServiceAccount(serviceAccountKey: string) {
  const normalized = serviceAccountKey.trim();

  const parseJson = (raw: string) => {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  };

  if (normalized.startsWith("{")) {
    return parseJson(normalized);
  }

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    if (decoded.startsWith("{")) {
      return parseJson(decoded);
    }
  } catch {
    // ignore and throw below
  }

  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Use raw JSON string or base64-encoded JSON.");
}

export async function getFirebaseAdminAuth(): Promise<admin.auth.Auth> {
  if (adminApp) {
    return admin.auth(adminApp);
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"
    );
  }

  try {
    const serviceAccount = parseServiceAccount(serviceAccountKey);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }

  return admin.auth(adminApp);
}

export async function getFirebaseApiKey(): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY environment variable is not set");
  }
  return apiKey;
}

export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  const auth = await getFirebaseAdminAuth();
  return auth.verifyIdToken(token);
}
