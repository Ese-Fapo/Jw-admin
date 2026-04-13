"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import AdminWorkbookControl from "./workbook-control";
import ServiceControl from "./service-control";
import AdminUsersControl from "./admin-users-control";
import { workbookSectionOptions } from "@/lib/workbook-template";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAdminUser(user: { role: "USER" | "ADMIN"; email: string | null } | null) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return !!user.email && adminEmails.includes(user.email.toLowerCase());
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const canAccessAdmin = isAdminUser(user);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?mode=signin");
      return;
    }

    if (!loading && user && !canAccessAdmin) {
      router.replace("/field-service-report");
    }
  }, [loading, user, canAccessAdmin, router]);

  if (loading || !user) {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Checking access...</h1>
          <p className="mt-2 text-sm text-slate-400">Please wait while we verify your account.</p>
        </div>
      </section>
    );
  }

  if (!canAccessAdmin) {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Redirecting...</h1>
          <p className="mt-2 text-sm text-slate-400">Taking you to your field service page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-wrap relative py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-32 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sky-300">
              Verified Admin Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Manage weekly meeting assignments, service responsibilities, users, and admin history from one control center.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{user.email ?? "Admin"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur sm:p-6">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Workbook Assignments</h2>
        <p className="mt-1 text-sm text-slate-400">Assign meeting parts and presenters for each week.</p>
        <AdminWorkbookControl sectionOptions={workbookSectionOptions} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur sm:p-6">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Cart / Cleaning / Sound / General</h2>
        <p className="mt-1 text-sm text-slate-400">Manage table rows for cart schedule and congregation assignments.</p>
        <ServiceControl />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur sm:p-6">
        <AdminUsersControl />
      </div>
    </section>
  );
}
