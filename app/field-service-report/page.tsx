"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function FieldServiceReportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?mode=signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Checking session...</h1>
          <p className="mt-2 text-sm text-slate-400">Please wait while we load your report page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-wider text-sky-300">Field Service</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Field Service Report</h1>
          <p className="mt-2 text-sm text-slate-400">
            Welcome, {user.name ?? user.email ?? "Publisher"}. Submit your monthly report below.
          </p>
        </header>

        <form className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Month</span>
            <input type="month" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Hours</span>
            <input type="number" min={0} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="0" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Placements</span>
            <input type="number" min={0} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="0" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Videos Shown</span>
            <input type="number" min={0} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="0" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Return Visits</span>
            <input type="number" min={0} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="0" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Bible Studies</span>
            <input type="number" min={0} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="0" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-slate-300">Notes</span>
            <textarea rows={4} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="Optional notes" />
          </label>

          <div className="sm:col-span-2">
            <button
              type="button"
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
