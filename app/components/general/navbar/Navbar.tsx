"use client";

import Link from "next/link";
import { useState } from "react";
import { useModalStore } from "@/app/store/useModalStore";
import { useAuth } from "@/app/providers/AuthProvider";
import toast from "react-hot-toast";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const publicLinks = [
  { name: "Workbook", href: "/" },
  { name: "Meeting Calendar", href: "/meeting-calendar" },
  { name: "Cart Schedule", href: "/cart-schedule" },
  { name: "Assignments", href: "/assignments" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, signOut } = useAuth();
  const { openSignIn } = useModalStore();

  const isAdmin =
    user?.role === "ADMIN" ||
    (!!user?.email && adminEmails.includes(user.email.toLowerCase()));

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast("Signed out successfully.", { icon: "👋" });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="content-wrap">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Link href="/" className="max-w-[70%] text-sm font-semibold leading-tight text-white sm:max-w-none sm:text-lg">
            JW Christian Life & Ministry
          </Link>

          <div className="hidden items-center gap-4 lg:flex">
            {publicLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm text-slate-300 hover:text-white">
                {link.name}
              </Link>
            ))}

            {user && (
              <Link href="/field-service-report" className="text-sm text-slate-300 hover:text-white">
                Field Report
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-sky-900/60 px-2.5 py-1 text-sm font-medium text-sky-300 ring-1 ring-sky-700/50 hover:bg-sky-800/60 hover:text-sky-200 transition-colors"
              >
                Admin
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <button
                onClick={openSignIn}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
              >
                Login
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 md:hidden"
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-slate-800 transition-all lg:hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="content-wrap space-y-1 py-3">
          {publicLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <Link
              href="/field-service-report"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Field Report
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-sky-300 hover:bg-sky-900/40 hover:text-sky-200"
            >
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={async () => {
                setIsMenuOpen(false);
                await handleLogout();
              }}
              disabled={isLoggingOut}
              className="mt-2 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <button
              onClick={() => {
                openSignIn();
                setIsMenuOpen(false);
              }}
              className="mt-2 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
