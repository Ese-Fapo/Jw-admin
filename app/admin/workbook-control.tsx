"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { WorkbookSection } from "@prisma/client";

type SectionOption = {
  label: string;
  value: WorkbookSection;
};

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

function getWeekDateInputValue(initialDate = new Date()) {
  const year = initialDate.getFullYear();
  const month = String(initialDate.getMonth() + 1).padStart(2, "0");
  const day = String(initialDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminWorkbookControl({ sectionOptions }: { sectionOptions: SectionOption[] }) {
  const [weekOf, setWeekOf] = useState(getWeekDateInputValue());
  const [section, setSection] = useState<WorkbookSection>("OPENING");
  const [partTitle, setPartTitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [position, setPosition] = useState(1);
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => a.position - b.position),
    [assignments]
  );

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workbook/assignments?week=${encodeURIComponent(weekOf)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to load assignments");
      setAssignments(body.assignments as Assignment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOf]);

  const handleGenerateTemplate = async (overwrite = false) => {
    setError(null);
    setIsGeneratingTemplate(true);

    try {
      const response = await fetch("/api/workbook/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekOf, overwrite }),
      });

      const body = await response.json();

      if (response.status === 409 && !overwrite) {
        const confirmed = window.confirm(
          "Assignments already exist for this week. Replace with default template?"
        );
        if (confirmed) {
          await handleGenerateTemplate(true);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to generate template");
      }

      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate template");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!partTitle.trim() || !personName.trim()) {
      setError("Part title and person name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/workbook/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekOf,
          section,
          partTitle,
          personName,
          assistantName,
          position,
          notes,
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to create assignment");

      setPartTitle("");
      setPersonName("");
      setAssistantName("");
      setPosition((prev) => prev + 1);
      setNotes("");

      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/workbook/assignments/${id}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to delete assignment");

      setAssignments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={handleCreate} className="card space-y-4 p-5">
        <h2 className="text-xl font-semibold text-white">Add assignment</h2>

        <div>
          <label htmlFor="weekOf" className="mb-1 block text-sm text-slate-300">Week of</label>
          <input
            id="weekOf"
            type="date"
            value={weekOf}
            onChange={(event) => setWeekOf(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="section" className="mb-1 block text-sm text-slate-300">Section</label>
          <select
            id="section"
            value={section}
            onChange={(event) => setSection(event.target.value as WorkbookSection)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {sectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="partTitle" className="mb-1 block text-sm text-slate-300">Part title</label>
          <input
            id="partTitle"
            value={partTitle}
            onChange={(event) => setPartTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="personName" className="mb-1 block text-sm text-slate-300">Assigned person</label>
          <input
            id="personName"
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="assistantName" className="mb-1 block text-sm text-slate-300">Assistant (optional)</label>
          <input
            id="assistantName"
            value={assistantName}
            onChange={(event) => setAssistantName(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="position" className="mb-1 block text-sm text-slate-300">Position in section</label>
          <input
            id="position"
            type="number"
            min={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm text-slate-300">Notes (optional)</label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleGenerateTemplate(false)}
            disabled={isGeneratingTemplate}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {isGeneratingTemplate ? "Generating..." : "Generate week template"}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save assignment"}
          </button>

          <button
            type="button"
            onClick={fetchAssignments}
            disabled={isLoading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900 disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Load this week"}
          </button>
        </div>
      </form>

      <div className="card p-5">
        <h2 className="text-xl font-semibold text-white">Current week assignments</h2>
        <p className="mt-1 text-xs text-slate-400">{weekOf}</p>

        <div className="mt-4 space-y-3">
          {sortedAssignments.length === 0 ? (
            <p className="text-sm text-slate-400">No assignments loaded for this week.</p>
          ) : (
            sortedAssignments.map((item) => {
              const label = sectionOptions.find((option) => option.value === item.section)?.label ?? item.section;
              return (
                <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">{label} • Position {item.position}</p>
                      <p className="mt-1 text-sm font-medium text-white">{item.partTitle}</p>
                      <p className="text-sm text-sky-300">{item.personName}</p>
                      {item.assistantName && <p className="text-xs text-indigo-300">Assistant: {item.assistantName}</p>}
                      {item.notes && <p className="mt-1 text-xs text-slate-400">{item.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md bg-red-600 px-2.5 py-1 text-xs text-white hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
