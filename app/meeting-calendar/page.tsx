"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkbookSection } from "@/lib/domain-types";
import { useAuth } from "@/app/providers/AuthProvider";
import { workbookSectionLabels, workbookSectionOptions } from "@/lib/workbook-template";
import AdminWorkbookControl from "@/app/admin/workbook-control";

type Assignment = {
  id: string;
  weekOf: string;
  section: WorkbookSection;
  partTitle: string;
  personName: string;
  assistantName: string | null;
  position: number;
  notes: string | null;
};

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const SECTION_ORDER: WorkbookSection[] = [
  "OPENING",
  "TREASURES",
  "APPLY_YOURSELF",
  "LIVING_AS_CHRISTIANS",
  "CONGREGATION_BIBLE_STUDY",
  "CONCLUDING_COMMENTS",
];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isAdminUser(user: { role: "USER" | "ADMIN"; email: string | null } | null) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return !!user.email && adminEmails.includes(user.email.toLowerCase());
}

export default function MeetingCalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCrud = isAdminUser(user);

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekEnd = useMemo(() => addDays(weekStart, 7 * 8 - 1), [weekStart]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?mode=signin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const loadCalendar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const start = formatDateInput(weekStart);
        const end = formatDateInput(weekEnd);
        const res = await fetch(`/api/workbook/assignments?start=${start}&end=${end}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load meeting calendar");
        setRows(body.assignments as Assignment[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load meeting calendar");
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendar();
  }, [user, weekStart, weekEnd]);

  const weekBuckets = useMemo(() => {
    const buckets = new Map<string, Assignment[]>();
    for (let i = 0; i < 8; i++) {
      const week = addDays(weekStart, i * 7);
      buckets.set(formatDateInput(week), []);
    }

    for (const row of rows) {
      const key = formatDateInput(new Date(row.weekOf));
      if (!buckets.has(key)) continue;
      buckets.get(key)?.push(row);
    }

    for (const [, list] of buckets) {
      list.sort((a, b) => {
        const sec = SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
        if (sec !== 0) return sec;
        return a.position - b.position;
      });
    }

    return buckets;
  }, [rows, weekStart]);

  const identitySet = useMemo(() => {
    const set = new Set<string>();
    if (!user) return set;

    const name = normalize(user.name);
    const email = normalize(user.email);
    const emailLocal = email.includes("@") ? email.split("@")[0] : "";

    if (name) set.add(name);
    if (email) set.add(email);
    if (emailLocal) set.add(emailLocal);

    return set;
  }, [user]);

  const myAssignments = useMemo(() => {
    if (!user) return [] as Assignment[];

    return rows.filter((row) => {
      const person = normalize(row.personName);
      const assistant = normalize(row.assistantName);
      return identitySet.has(person) || identitySet.has(assistant);
    });
  }, [rows, identitySet, user]);

  if (loading || !user) {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-300">Checking access…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Meeting Calendar</h1>
        <p className="mt-2 text-sm text-slate-400">
          View congregation meeting parts for the next 8 weeks and track your personal assignments.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Weeks Ahead</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">8</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">My Parts</p>
            <p className="mt-1 text-2xl font-semibold text-sky-300">{myAssignments.length}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">{canCrud ? "Admin" : "User"}</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-400">Loading upcoming meetings…</p>
        ) : (
          <div className="mt-6 space-y-5">
            {[...weekBuckets.entries()].map(([weekKey, items]) => {
              const myWeekParts = items.filter((row) => {
                const person = normalize(row.personName);
                const assistant = normalize(row.assistantName);
                return identitySet.has(person) || identitySet.has(assistant);
              });

              return (
                <div key={weekKey} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white">Week of {formatWeekLabel(weekKey)}</h2>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {items.length} parts
                    </span>
                  </div>

                  {myWeekParts.length > 0 && (
                    <div className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200">
                      Your parts this week: {myWeekParts.map((part) => part.partTitle).join(" • ")}
                    </div>
                  )}

                  {items.length === 0 ? (
                    <p className="text-sm text-slate-500">No parts scheduled for this week yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase tracking-wider text-slate-500">
                          <tr className="border-b border-slate-800">
                            <th className="px-2 py-2 text-left">Section</th>
                            <th className="px-2 py-2 text-left">Part</th>
                            <th className="px-2 py-2 text-left">Assigned</th>
                            <th className="px-2 py-2 text-left">Assistant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => {
                            const mine =
                              identitySet.has(normalize(item.personName)) ||
                              identitySet.has(normalize(item.assistantName));
                            return (
                              <tr key={item.id} className={`border-b border-slate-900/70 ${mine ? "bg-sky-950/30" : ""}`}>
                                <td className="px-2 py-2 text-slate-300">{workbookSectionLabels[item.section]}</td>
                                <td className="px-2 py-2 text-slate-100">{item.partTitle}</td>
                                <td className={`px-2 py-2 ${mine ? "text-sky-300 font-medium" : "text-slate-300"}`}>
                                  {item.personName}
                                </td>
                                <td className="px-2 py-2 text-slate-400">{item.assistantName ?? "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canCrud && (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Admin CRUD Controls</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create, update, and delete meeting parts. Changes are persisted and reflected in this calendar.
          </p>
          <AdminWorkbookControl sectionOptions={workbookSectionOptions} />
        </div>
      )}
    </section>
  );
}
