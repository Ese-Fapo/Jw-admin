"use client";

import { FormEvent, useMemo, useState } from "react";
import { ServiceAssignmentCategory } from "@prisma/client";
import { serviceCategoryLabels } from "@/lib/ministry-schedule";
import { auth } from "@/lib/firebase";

type ServiceAssignment = {
  id: string;
  category: ServiceAssignmentCategory;
  title: string;
  assigneeName: string;
  assistantName: string | null;
  dayLabel: string | null;
  timeLabel: string | null;
  notes: string | null;
  position: number;
};

const categories: ServiceAssignmentCategory[] = ["CART", "CLEANING", "SOUND", "GENERAL_INFO"];

export default function ServiceControl() {
  const [weekOf, setWeekOf] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ServiceAssignmentCategory>("CART");
  const [title, setTitle] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ServiceAssignment[]>([]);

  const sortedRows = useMemo(() => [...rows].sort((a, b) => a.position - b.position), [rows]);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const currentUser = auth.currentUser;
    if (!currentUser) return headers;
    const idToken = await currentUser.getIdToken();
    headers.Authorization = `Bearer ${idToken}`;
    return headers;
  };

  const loadRows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/service-assignments?week=${encodeURIComponent(weekOf)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to load assignments");
      setRows(body.assignments as ServiceAssignment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !assigneeName.trim()) {
      setError("Title and assignee are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/service-assignments", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          weekOf,
          category,
          title,
          assigneeName,
          assistantName,
          dayLabel,
          timeLabel,
          notes,
          position,
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to create assignment");

      setTitle("");
      setAssigneeName("");
      setAssistantName("");
      setDayLabel("");
      setTimeLabel("");
      setNotes("");
      setPosition((prev) => prev + 1);

      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/service-assignments/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to delete assignment");
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <h2 className="text-xl font-semibold text-white">Add cart/assignment item</h2>

        <div>
          <label htmlFor="serviceWeek" className="mb-1 block text-sm text-slate-300">Week of</label>
          <input
            id="serviceWeek"
            type="date"
            value={weekOf}
            onChange={(event) => setWeekOf(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="serviceCategory" className="mb-1 block text-sm text-slate-300">Category</label>
          <select
            id="serviceCategory"
            value={category}
            onChange={(event) => setCategory(event.target.value as ServiceAssignmentCategory)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{serviceCategoryLabels[item]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceTitle" className="mb-1 block text-sm text-slate-300">Title / Assignment</label>
          <input
            id="serviceTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="serviceAssignee" className="mb-1 block text-sm text-slate-300">Assigned</label>
            <input
              id="serviceAssignee"
              value={assigneeName}
              onChange={(event) => setAssigneeName(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="serviceAssistant" className="mb-1 block text-sm text-slate-300">Assistant</label>
            <input
              id="serviceAssistant"
              value={assistantName}
              onChange={(event) => setAssistantName(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="serviceDay" className="mb-1 block text-sm text-slate-300">Day label</label>
            <input
              id="serviceDay"
              value={dayLabel}
              onChange={(event) => setDayLabel(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="serviceTime" className="mb-1 block text-sm text-slate-300">Time label</label>
            <input
              id="serviceTime"
              value={timeLabel}
              onChange={(event) => setTimeLabel(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="servicePosition" className="mb-1 block text-sm text-slate-300">Position</label>
          <input
            id="servicePosition"
            type="number"
            min={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="serviceNotes" className="mb-1 block text-sm text-slate-300">Notes</label>
          <textarea
            id="serviceNotes"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save item"}
          </button>
          <button
            type="button"
            onClick={loadRows}
            disabled={isLoading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900 disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Load this week"}
          </button>
        </div>
      </form>

      <div className="card p-5">
        <h2 className="text-xl font-semibold text-white">Current service items</h2>
        <p className="mt-1 text-xs text-slate-400">{weekOf}</p>

        <div className="mt-4 space-y-3">
          {sortedRows.length === 0 ? (
            <p className="text-sm text-slate-400">No service items loaded for this week.</p>
          ) : (
            sortedRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">{serviceCategoryLabels[row.category]} • Position {row.position}</p>
                    <p className="mt-1 text-sm font-medium text-white">{row.title}</p>
                    <p className="text-sm text-sky-300">{row.assigneeName}</p>
                    {row.assistantName && <p className="text-xs text-indigo-300">Assistant: {row.assistantName}</p>}
                    {(row.dayLabel || row.timeLabel) && (
                      <p className="text-xs text-slate-400">{row.dayLabel ?? ""} {row.timeLabel ? `• ${row.timeLabel}` : ""}</p>
                    )}
                    {row.notes && <p className="mt-1 text-xs text-slate-400">{row.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-md bg-red-600 px-2.5 py-1 text-xs text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
