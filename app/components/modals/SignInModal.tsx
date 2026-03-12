"use client";
import { FcGoogle } from "react-icons/fc";
import Modal from "./Modal";
import { useModalStore } from "@/app/store/useModalStore";
import { FaGithub } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

export default function SignInModal() {
  const { isOpen, closeSignIn } = useModalStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginProvider, setLoginProvider] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        console.log("Full session data:", session);
        const userData = session.data?.user || null;
        setUser(userData);
        
        // First, try to get provider from localStorage
        const storedProvider = localStorage.getItem("loginProvider");
        if (storedProvider) {
          console.log("Provider from localStorage:", storedProvider);
          setLoginProvider(storedProvider);
        }
        
        // Detect login provider from session - try multiple approaches
        if (session.data) {
          // Log the full session structure to debug
          console.log("Session data structure:", JSON.stringify(session.data, null, 2));
          
          // Try different ways to access provider info
          const accounts = (session.data as any).user?.accounts;
          const sessionAccounts = (session.data as any).accounts;
          
          console.log("Accounts from user:", accounts);
          console.log("Accounts from session:", sessionAccounts);
          
          if (accounts && accounts.length > 0) {
            const provider = accounts[0].providerId || accounts[0].provider;
            console.log("Provider found:", provider);
            setLoginProvider(provider);
            localStorage.setItem("loginProvider", provider);
          } else if (sessionAccounts && sessionAccounts.length > 0) {
            const provider = sessionAccounts[0].providerId || sessionAccounts[0].provider;
            console.log("Provider found from session:", provider);
            setLoginProvider(provider);
            localStorage.setItem("loginProvider", provider);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
        setLoginProvider(null);
      } finally {
        setLoadingUser(false);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const signWithGoogle = async () => {
    try {
      setLoadingProvider("google");
      setError(null);
      localStorage.setItem("loginProvider", "google");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      setLoginProvider("google");
      closeSignIn();
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Falha ao fazer login com Google. Tente novamente.");
      localStorage.removeItem("loginProvider");
    } finally {
      setLoadingProvider(null);
    }
  };

  const signWithGithub = async () => {
    try {
      setLoadingProvider("github");
      setError(null);
      localStorage.setItem("loginProvider", "github");
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
      setLoginProvider("github");
      closeSignIn();
    } catch (err) {
      console.error("GitHub sign in error:", err);
      setError("Falha ao fazer login com GitHub. Tente novamente.");
      localStorage.removeItem("loginProvider");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingProvider("logout");
      await authClient.signOut();
      setUser(null);
      setLoginProvider(null);
      localStorage.removeItem("loginProvider");
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
      {loadingUser ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              {loginProvider === "github" && "Bem-vindo via GitHub!"}
              {loginProvider === "google" && "Bem-vindo via Google!"}
              {!loginProvider && "Bem-vindo!"}
            </h2>
            <p className="text-green-400 text-sm font-medium mb-4">✓ LOGGED IN</p>
            {loginProvider && (
              <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                {loginProvider === "github" && <FaGithub className="text-lg" />}
                {loginProvider === "google" && <FcGoogle className="text-lg" />}
                <span>Conectado com {loginProvider === "github" ? "GitHub" : "Google"}</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-lg p-4">
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
                <p className="text-gray-300 text-sm">{user.email}</p>
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
            <h2 className="text-xl font-semibold text-white mb-2">Fazer Login</h2>
            <p className="text-red-400 text-sm font-medium mb-4">✗ LOGGED OUT</p>
            <p className="text-gray-400 text-sm">
              Continue com um provedor de login para acessar sua conta.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Botões de login */}
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
                  <span>Continuar com Google</span>
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
                  <span>Continuar com GitHub</span>
                </>
              )}
            </button>
          </div>
          <p className="text-gray-500 text-center text-xs">Ao continuar, você concorda com nossos termos e condições.</p>
        </div>
      )}
    </Modal>
  );
}
