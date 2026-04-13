"use client";
import { FcGoogle } from "react-icons/fc";
import Modal from "./Modal";
import { useModalStore } from "@/app/store/useModalStore";
import { FaSignOutAlt } from "react-icons/fa";
import { authClient } from "@/lib/firebase-auth";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function SignInModal() {
  const { isOpen, closeSignIn } = useModalStore();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signWithGoogle = async () => {
    try {
      setLoadingProvider("google");
      setError(null);
      await authClient.signIn.social({ provider: "google" });
      router.push("/admin");
      closeSignIn();
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Falha ao fazer login com Google. Tente novamente.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingProvider("logout");
      await signOut();
      closeSignIn();
    } catch (err) {
      console.error("Logout error:", err);
      setError("Falha ao fazer logout. Tente novamente.");
    } finally {
      setLoadingProvider(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeSignIn}>
      {user ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Logged in</h2>
            <p className="text-green-400 text-sm font-medium mb-4">✓ Session active</p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              {user.image && (
                <img 
                  src={user.image} 
                  alt={user.name ?? "User avatar"}
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
              )}
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-slate-300 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loadingProvider !== null}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {loadingProvider === "logout" ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Desconectando...</span>
              </div>
            ) : (
              <>
                <FaSignOutAlt className="text-lg" />
                <span>Fazer Logout</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Login</h2>
            <p className="text-slate-400 text-sm">
              Continue with a social account.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Need registration options?{" "}
              <Link href="/auth?mode=register" onClick={closeSignIn} className="text-sky-400 hover:text-sky-300">
                Open register / sign-in page
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button 
              onClick={signWithGoogle}
              disabled={loadingProvider !== null}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-black px-4 py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {loadingProvider === "google" ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Conectando...</span>
                </div>
              ) : (
                <>
                  <FcGoogle className="text-2xl" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
          <p className="text-gray-500 text-center text-xs">By continuing, you agree to the platform terms.</p>
        </div>
      )}
    </Modal>
  );
}
