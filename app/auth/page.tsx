"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineCheckCircle } from "react-icons/hi";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

type Screen = "signin" | "register" | "verify-pending";

function firebaseMessage(code: string): string {
  switch (code) {
    case "auth/email-not-verified":
      return "Your email is not verified. Please check your inbox.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "signin";

  const [screen, setScreen] = useState<Screen>(initialMode);
  const [pendingEmail, setPendingEmail] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(() => {
    if (screen === "register") return "Create your account";
    if (screen === "verify-pending") return "Verify your email";
    return "Sign in to your account";
  }, [screen]);

  // ── Google sign-in (always verified) ─────────────────────────────────────
  const handleGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/admin" });
      const name = (result as { displayName?: string } | null)?.displayName;
      toast.success(`Welcome${name ? `, ${name.split(" ")[0]}` : ""}! You are signed in.`, {
        duration: 4000,
        icon: "👋",
      });
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError("Could not sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email/password sign-in ────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setIsLoading(true);
    try {
      const user = await authClient.signIn.emailPassword({ email: email.trim(), password });
      const firstName = (user.displayName ?? email.split("@")[0]).split(" ")[0];
      toast.success(`Welcome back, ${firstName}!`, { duration: 4000, icon: "👋" });
      router.push("/admin");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-not-verified") {
        setPendingEmail(email.trim());
        setScreen("verify-pending");
        setPassword("");
      } else {
        setError(firebaseMessage(code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email/password register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authClient.signUp.emailPassword({ email: email.trim(), password });
      setPendingEmail(email.trim());
      setPassword("");
      setConfirmPassword("");
      setScreen("verify-pending");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(firebaseMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Input class helper ────────────────────────────────────────────────────
  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none";

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY PENDING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === "verify-pending") {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg text-center">
          <HiOutlineCheckCircle className="mx-auto mb-4 text-5xl text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-sky-300">{pendingEmail || "your email"}</span>.
            <br />
            Click the link in that email, then come back and sign in.
          </p>

          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Didn&apos;t get it? Check your spam folder. The link expires in 1 hour.
          </div>

          <button
            onClick={() => {
              setScreen("signin");
              setEmail(pendingEmail);
              setError(null);
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition"
          >
            <HiOutlineMail className="text-lg" />
            Go to Sign In
          </button>

          <button
            onClick={() => {
              setScreen("register");
              setEmail(pendingEmail);
              setError(null);
            }}
            className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Wrong email? Register again
          </button>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN-IN / REGISTER SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">{heading}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {screen === "register"
              ? "Create an account with email and password."
              : "Sign in with your email or Google account."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => { setScreen("signin"); setError(null); }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              screen === "signin" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setScreen("register"); setError(null); }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              screen === "register" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {screen === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : "Create account & send verification email"}
            </button>
          </form>
        )}

        {/* ── SIGN-IN FORM ── */}
        {screen === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : "Sign in"}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-600">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-black hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 transition"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-slate-600">
          Google accounts are always verified and sign in immediately.
        </p>
      </div>
    </section>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <section className="content-wrap py-10 sm:py-14">
          <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <p className="text-sm text-slate-400">Loading authentication…</p>
          </div>
        </section>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
