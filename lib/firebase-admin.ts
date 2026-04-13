import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;
let hasLoggedInitError = false;

function isPlaceholderServiceKey(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized.includes("replace-with-your-firebase-service-account-json") ||
    normalized.includes("your-service-account-json")
  );
}

export function isFirebaseAdminConfigured() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key || isPlaceholderServiceKey(key)) return false;

  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  return Boolean(bucket && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

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
    const decoded = Buffer.from(normalized, "base64").toString("utf8").trim();
    if (decoded.startsWith("{")) {
      return parseJson(decoded);
    }
  } catch {
    // ignore and throw below
  }

  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Use raw JSON string or base64-encoded JSON.");
}

function getFirebaseAdminApp(): admin.app.App {
  if (adminApp) return adminApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey || isPlaceholderServiceKey(serviceAccountKey)) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is missing or still set to a placeholder value"
    );
  }

  try {
    const serviceAccount = parseServiceAccount(serviceAccountKey);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    if (!hasLoggedInitError) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
      hasLoggedInitError = true;
    }
    throw error;
  }

  return adminApp;
}

export async function getFirebaseAdminAuth(): Promise<admin.auth.Auth> {
  return admin.auth(getFirebaseAdminApp());
}

export async function getFirebaseAdminDb(): Promise<admin.firestore.Firestore> {
  return admin.firestore(getFirebaseAdminApp());
}

export async function getFirebaseAdminStorage(): Promise<admin.storage.Storage> {
  return admin.storage(getFirebaseAdminApp());
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
