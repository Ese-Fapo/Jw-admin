"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useModalStore } from "@/app/store/useModalStore";

const navLinks = [
  { name: "Workbook", href: "/" },
  { name: "Cart Schedule", href: "/cart-schedule" },
  { name: "Assignments", href: "/assignments" },
  { name: "Field Report", href: "/field-service-report" },
  { name: "Admin", href: "/admin" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { openSignIn } = useModalStore();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="content-wrap">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Link href="/" className="max-w-[70%] text-sm font-semibold leading-tight text-white sm:max-w-none sm:text-lg">
            JW Christian Life & Ministry
          </Link>

          <div className="hidden items-center gap-4 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm text-slate-300 hover:text-white">
                {link.name}
              </Link>
            ))}

            <button
              onClick={openSignIn}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              {session?.user ? "Account" : "Login"}
            </button>
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={() => {
              openSignIn();
              setIsMenuOpen(false);
            }}
            className="mt-2 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            {session?.user ? "Account" : "Login"}
          </button>
        </div>
      </div>
    </nav>
  );
}
