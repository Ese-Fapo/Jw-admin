"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
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

function fallbackAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    image: firebaseUser.photoURL,
    role: "USER",
  };
}

async function mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
  try {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      image: firebaseUser.photoURL,
      role: userData?.role || "USER",
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

        return user;
      }
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
