import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import type { ServiceAssignmentCategory, UserRole, WorkbookSection } from "@/lib/domain-types";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
};

export type WorkbookAssignmentRecord = {
  id: string;
  weekOf: string;
  section: WorkbookSection;
  partTitle: string;
  personName: string;
  assistantName: string | null;
  position: number;
  notes: string | null;
  createdById: string;
  createdAt: number;
  updatedAt: number;
};

export type ServiceAssignmentRecord = {
  id: string;
  weekOf: string;
  category: ServiceAssignmentCategory;
  title: string;
  assigneeName: string;
  assistantName: string | null;
  dayLabel: string | null;
  timeLabel: string | null;
  notes: string | null;
  position: number;
  createdById: string;
  createdAt: number;
  updatedAt: number;
};

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageURL: string | null;
  coverImagePublicId: string | null;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  createdAt: number;
  updatedAt: number;
};

export type AdminSignInHistoryRecord = {
  id: string;
  adminUserId: string;
  adminEmail: string;
  method: string;
  createdAt: number;
};

export function weekKeyFromInput(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export function weekKeyFromDate(value: Date): string {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export function nowMs() {
  return Date.now();
}

export function toIsoDateTime(value: unknown): string {
  if (typeof value === "number") return new Date(value).toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString();
  }
  return new Date(0).toISOString();
}

export function postToApi(post: PostRecord) {
  return {
    ...post,
    createdAt: toIsoDateTime(post.createdAt),
    updatedAt: toIsoDateTime(post.updatedAt),
    author: {
      id: post.authorId,
      name: post.authorName,
      image: post.authorImage,
    },
  };
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getFirebaseAdminDb();
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as AppUser;
}
