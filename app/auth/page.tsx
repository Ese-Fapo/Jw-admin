"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "signin";

  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(
    () => (mode === "register" ? "Create your account" : "Sign in to your account"),
    [mode]
  );

  const subText =
    mode === "register"
      ? "Register with Google to access your field service report section."
      : "Already registered? Sign in with Google.";

  const continueWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
      });
      router.push("/admin");
    } catch (err) {
      console.error("Google auth error:", err);
      setError("Could not continue with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">{heading}</h1>
          <p className="mt-2 text-sm text-slate-400">{subText}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setMode("signin")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "signin" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("register")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
        ) : null}

        <button
          onClick={continueWithGoogle}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-medium text-black transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <FcGoogle className="text-2xl" />
              <span>{mode === "register" ? "Register with Google" : "Sign in with Google"}</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
