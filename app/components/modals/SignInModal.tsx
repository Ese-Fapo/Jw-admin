"use client";
import { FcGoogle } from "react-icons/fc";
import Modal from "./Modal";
import { useModalStore } from "@/app/store/useModalStore";
import { FaGithub } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInModal() {
  const { isOpen, closeSignIn } = useModalStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const signWithGoogle = async () => {
    try {
      setLoadingProvider("google");
      setError(null);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      closeSignIn();
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Falha ao fazer login com Google. Tente novamente.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const signWithGithub = async () => {
    try {
      setLoadingProvider("github");
      setError(null);
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
      closeSignIn();
    } catch (err) {
      console.error("GitHub sign in error:", err);
      setError("Falha ao fazer login com GitHub. Tente novamente.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingProvider("logout");
      await authClient.signOut();
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
      {isPending ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : user ? (
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
                  alt={user.name}
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
            <button 
              onClick={signWithGithub}
              disabled={loadingProvider !== null}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {loadingProvider === "github" ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Conectando...</span>
                </div>
              ) : (
                <>
                  <FaGithub className="text-2xl" />
                  <span>Continue with GitHub</span>
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
