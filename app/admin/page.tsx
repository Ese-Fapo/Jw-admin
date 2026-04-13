"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import AdminWorkbookControl from "./workbook-control";
import ServiceControl from "./service-control";
import { workbookSectionOptions } from "@/lib/workbook-template";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?mode=signin");
      return;
    }

    if (!loading && user && user.role !== "ADMIN") {
      router.replace("/field-service-report");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-white">Checking access...</h1>
          <p className="mt-2 text-sm text-slate-400">Please wait while we verify your account.</p>
        </div>
      </section>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-white">Redirecting...</h1>
          <p className="mt-2 text-sm text-slate-400">Taking you to your field service page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-wrap py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Admin Control</h1>
      <p className="mt-2 text-sm text-slate-400">Assign meeting parts and presenters for each week.</p>
      <AdminWorkbookControl sectionOptions={workbookSectionOptions} />

      <div className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-semibold text-white">Cart / Cleaning / Sound / General</h2>
        <p className="mt-2 text-sm text-slate-400">Manage table rows for Cart Schedule and Congregation Assignments pages.</p>
        <ServiceControl />
      </div>
    </section>
  );
}
