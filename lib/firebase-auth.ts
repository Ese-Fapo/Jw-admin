"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
}

type AuthSession = { user: AuthUser } | null;
type SessionStatus = "loading" | "authenticated" | "unauthenticated";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function getServerUser(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
  try {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) return null;
    const body = await res.json();
    if (!body?.user) return null;

    return {
      id: String(body.user.id),
      email: body.user.email ?? null,
      name: body.user.name ?? null,
      image: body.user.image ?? null,
      role: body.user.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch {
    return null;
  }
}

async function logAdminSignIn(method: "google" | "password") {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const idToken = await currentUser.getIdToken();
    await fetch("/api/auth/admin-signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ method }),
    });
  } catch (error) {
    console.warn("Failed to record admin sign-in history:", error);
  }
}

function fallbackAuthUser(firebaseUser: FirebaseUser): AuthUser {
  const isAdminEmail = adminEmails.includes(firebaseUser.email?.toLowerCase() || "");
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    image: firebaseUser.photoURL,
    role: isAdminEmail ? "ADMIN" : "USER",
  };
}

async function mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
  const serverUser = await getServerUser(firebaseUser);
  if (serverUser) return serverUser;

  try {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const isAdminEmail = adminEmails.includes(firebaseUser.email?.toLowerCase() || "");
    const roleFromStore = userData?.role === "ADMIN" ? "ADMIN" : "USER";

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      image: firebaseUser.photoURL,
      role: isAdminEmail ? "ADMIN" : roleFromStore,
    };
  } catch (error) {
    console.warn("Falling back to Firebase auth profile because Firestore is unavailable:", error);
    return fallbackAuthUser(firebaseUser);
  }
}

export const authClient = {
  useSession() {
    const [data, setData] = useState<AuthSession>(null);
    const [status, setStatus] = useState<SessionStatus>("loading");

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setData(null);
          setStatus("unauthenticated");
          return;
        }

        try {
          const mappedUser = await mapFirebaseUser(firebaseUser);
          setData({ user: mappedUser });
          setStatus("authenticated");
        } catch {
          setData({ user: fallbackAuthUser(firebaseUser) });
          setStatus("authenticated");
        }
      });

      return () => unsubscribe();
    }, []);

    const update = async () => {
      const current = auth.currentUser;
      if (!current) {
        setData(null);
        setStatus("unauthenticated");
        return null;
      }

      const mappedUser = await mapFirebaseUser(current);
      const nextSession = { user: mappedUser };
      setData(nextSession);
      setStatus("authenticated");
      return nextSession;
    };

    return {
      data,
      isPending: status === "loading",
      status,
      update,
    };
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const authUser = await mapFirebaseUser(firebaseUser);
        callback(authUser);
      } catch {
        callback(fallbackAuthUser(firebaseUser));
      }
    });
  },

  signIn: {
    async social({ provider }: { provider: "google"; callbackURL?: string }) {
      if (provider === "google") {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Determine if user should be admin
        const shouldBeAdmin = adminEmails.includes(
          user.email?.toLowerCase() || ""
        );

        // Create/update user in Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              name: user.displayName || "User",
              image: user.photoURL,
              role: shouldBeAdmin ? "ADMIN" : "USER",
              emailVerified: user.emailVerified,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            await setDoc(
              userDocRef,
              {
                name: user.displayName || "User",
                image: user.photoURL,
                role: shouldBeAdmin ? "ADMIN" : userDoc.data()?.role,
                updatedAt: new Date(),
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.warn("Signed in with Google, but Firestore profile sync failed:", error);
        }

        await logAdminSignIn("google");

        return user;
      }
    },

    async emailPassword({ email, password }: { email: string; password: string }) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      // Block unverified accounts immediately
      if (!user.emailVerified) {
        await firebaseSignOut(auth);
        const err = new Error("Email not verified. Please check your inbox and click the link.");
        (err as Error & { code: string }).code = "auth/email-not-verified";
        throw err;
      }

      const shouldBeAdmin = adminEmails.includes(user.email?.toLowerCase() || "");

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName || user.email?.split("@")[0] || "User",
            image: user.photoURL,
            role: shouldBeAdmin ? "ADMIN" : "USER",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await setDoc(
            userDocRef,
            {
              role: shouldBeAdmin ? "ADMIN" : userDoc.data()?.role,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.warn("Firestore profile sync failed:", error);
      }

      await logAdminSignIn("password");

      return user;
    },
  },

  signUp: {
    async emailPassword({ email, password }: { email: string; password: string }) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      await sendEmailVerification(user);
      // Sign out immediately — they must verify before accessing the app
      await firebaseSignOut(auth);
      return { email: user.email };
    },
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async getSession(): Promise<{ data: AuthSession }> {
    const current = auth.currentUser;
    if (!current) return { data: null };

    const mappedUser = await mapFirebaseUser(current);
    return { data: { user: mappedUser } };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    if (!user) return null;

    return mapFirebaseUser(user);
  },
};
