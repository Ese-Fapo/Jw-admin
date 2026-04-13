"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkbookSection } from "@/lib/domain-types";
import { auth } from "@/lib/firebase";

const UNASSIGNED = "To be assigned";

const SECTION_ORDER: WorkbookSection[] = [
  "OPENING",
  "TREASURES",
  "APPLY_YOURSELF",
  "LIVING_AS_CHRISTIANS",
  "CONGREGATION_BIBLE_STUDY",
  "CONCLUDING_COMMENTS",
];

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

type RowEdit = {
  section: WorkbookSection;
  partTitle: string;
  position: string;
  personName: string;
  assistantName: string;
  notes: string;
  saving: boolean;
  dirty: boolean;
};

type EditMap = Record<string, RowEdit>;

type NewPartForm = {
  section: WorkbookSection;
  partTitle: string;
  personName: string;
  assistantName: string;
  notes: string;
};

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminWorkbookControl({ sectionOptions }: { sectionOptions: SectionOption[] }) {
  const [weekOf, setWeekOf] = useState(getTodayDateValue());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editMap, setEditMap] = useState<EditMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [newPart, setNewPart] = useState<NewPartForm>({
    section: sectionOptions[0]?.value ?? "OPENING",
    partTitle: "",
    personName: "",
    assistantName: "",
    notes: "",
  });

  const sectionLabels = useMemo(
    () => Object.fromEntries(sectionOptions.map((s) => [s.value, s.label])),
    [sectionOptions]
  );

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication session is not ready. Please sign in again.");
    headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
    return headers;
  }, []);

  const initEditMap = useCallback((data: Assignment[]) => {
    const map: EditMap = {};
    for (const a of data) {
      map[a.id] = {
        section: a.section,
        partTitle: a.partTitle,
        position: String(a.position),
        personName: a.personName === UNASSIGNED ? "" : a.personName,
        assistantName: a.assistantName ?? "",
        notes: a.notes ?? "",
        saving: false,
        dirty: false,
      };
    }
    return map;
  }, []);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await fetch(`/api/workbook/assignments?week=${encodeURIComponent(weekOf)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load");
      const data: Assignment[] = body.assignments;
      setAssignments(data);
      setEditMap(initEditMap(data));
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [weekOf, initEditMap]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleGenerate = async (overwrite = false) => {
    setIsGenerating(true);
    setGlobalError(null);
    try {
      const res = await fetch("/api/workbook/template", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ weekOf, overwrite }),
      });
      const body = await res.json();
      if (res.status === 409 && !overwrite) {
        if (window.confirm("Assignments already exist for this week. Replace with default template?")) {
          await handleGenerate(true);
        }
        return;
      }
      if (!res.ok) throw new Error(body.error ?? "Failed to generate");
      await loadAssignments();
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (
    id: string,
    field: keyof Pick<RowEdit, "section" | "partTitle" | "position" | "personName" | "assistantName" | "notes">,
    value: string
  ) => {
    setEditMap((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value, dirty: true } }));
  };

  const saveRow = useCallback(async (id: string) => {
    const edit = editMap[id];
    if (!edit) return;

    const partTitle = edit.partTitle.trim();
    if (!partTitle) {
      setGlobalError("Part title cannot be empty.");
      return;
    }

    const parsedPosition = Number(edit.position);
    if (!Number.isFinite(parsedPosition) || parsedPosition < 1) {
      setGlobalError("Position must be a number greater than or equal to 1.");
      return;
    }

    setEditMap((prev) => ({ ...prev, [id]: { ...prev[id], saving: true } }));
    try {
      const res = await fetch(`/api/workbook/assignments/${id}`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          section: edit.section,
          partTitle,
          position: parsedPosition,
          personName: edit.personName.trim() || UNASSIGNED,
          assistantName: edit.assistantName.trim() || null,
          notes: edit.notes.trim() || null,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save");
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                section: body.section,
                partTitle: body.partTitle,
                position: body.position,
                personName: body.personName,
                assistantName: body.assistantName,
                notes: body.notes,
              }
            : a
        )
      );
      setEditMap((prev) => ({ ...prev, [id]: { ...prev[id], saving: false, dirty: false } }));
    } catch (err) {
      setEditMap((prev) => ({ ...prev, [id]: { ...prev[id], saving: false } }));
      setGlobalError(err instanceof Error ? err.message : "Failed to save");
    }
  }, [editMap, getAuthHeaders]);

  const saveAll = async () => {
    const dirtyIds = Object.entries(editMap)
      .filter(([, e]) => e.dirty)
      .map(([id]) => id);
    if (dirtyIds.length === 0) return;
    setIsSavingAll(true);
    setGlobalError(null);
    try {
      await Promise.all(dirtyIds.map((id) => saveRow(id)));
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    setGlobalError(null);
    try {
      const confirmed = window.confirm("Delete this meeting part? This action cannot be undone.");
      if (!confirmed) return;

      const res = await fetch(`/api/workbook/assignments/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to delete");
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setEditMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleCreatePart = async () => {
    const partTitle = newPart.partTitle.trim();
    if (!partTitle) {
      setGlobalError("Part title is required to create a meeting part.");
      return;
    }

    setGlobalError(null);
    setIsCreatingPart(true);
    try {
      const res = await fetch("/api/workbook/assignments", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          weekOf,
          section: newPart.section,
          partTitle,
          personName: newPart.personName.trim() || UNASSIGNED,
          assistantName: newPart.assistantName.trim() || null,
          notes: newPart.notes.trim() || null,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to create part");

      setNewPart((prev) => ({
        ...prev,
        partTitle: "",
        personName: "",
        assistantName: "",
        notes: "",
      }));
      await loadAssignments();
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to create part");
    } finally {
      setIsCreatingPart(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<WorkbookSection, Assignment[]>();
    for (const sec of SECTION_ORDER) map.set(sec, []);
    for (const a of assignments) {
      const list = map.get(a.section);
      if (list) list.push(a);
    }
    for (const [, list] of map) list.sort((a, b) => a.position - b.position);
    return map;
  }, [assignments]);

  const totalCount = assignments.length;
  const assignedCount = assignments.filter(
    (a) => a.personName !== UNASSIGNED && a.personName.trim() !== ""
  ).length;
  const dirtyCount = Object.values(editMap).filter((e) => e.dirty).length;

  return (
    <div className="mt-6 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="weekPicker" className="text-sm text-slate-300 whitespace-nowrap">
            Week of
          </label>
          <input
            id="weekPicker"
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleGenerate(false)}
          disabled={isGenerating || isLoading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {isGenerating ? "Generating…" : "Generate Week Template"}
        </button>

        {dirtyCount > 0 && (
          <button
            onClick={saveAll}
            disabled={isSavingAll}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {isSavingAll ? "Saving all…" : `Save All (${dirtyCount})`}
          </button>
        )}

        <button
          onClick={loadAssignments}
          disabled={isLoading}
          className="ml-auto rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Create new part */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">Add Meeting Part</h3>
        <p className="mt-1 text-xs text-slate-500">Admins can create custom parts for the selected week.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={newPart.section}
            onChange={(e) => setNewPart((prev) => ({ ...prev, section: e.target.value as WorkbookSection }))}
            className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {sectionOptions.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newPart.partTitle}
            onChange={(e) => setNewPart((prev) => ({ ...prev, partTitle: e.target.value }))}
            placeholder="Part title (required)"
            className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
          />

          <input
            type="text"
            value={newPart.personName}
            onChange={(e) => setNewPart((prev) => ({ ...prev, personName: e.target.value }))}
            placeholder="Assigned person (optional)"
            className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
          />

          <input
            type="text"
            value={newPart.assistantName}
            onChange={(e) => setNewPart((prev) => ({ ...prev, assistantName: e.target.value }))}
            placeholder="Assistant (optional)"
            className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
          />

          <input
            type="text"
            value={newPart.notes}
            onChange={(e) => setNewPart((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleCreatePart}
            disabled={isCreatingPart || isLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {isCreatingPart ? "Creating…" : "Create Part"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm">
          <span className="text-slate-400">Progress:</span>
          <span className={`font-semibold ${assignedCount === totalCount ? "text-emerald-400" : "text-amber-400"}`}>
            {assignedCount} / {totalCount} assigned
          </span>
          {assignedCount < totalCount && (
            <span className="ml-auto flex items-center gap-1.5 text-amber-400/80">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              {totalCount - assignedCount} still need a name
            </span>
          )}
          {assignedCount === totalCount && (
            <span className="ml-auto text-emerald-400">All parts assigned ✓</span>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-slate-400 animate-pulse">Loading assignments…</p>
      )}

      {/* Assignment sections */}
      {!isLoading &&
        [...grouped.entries()].map(([section, rows]) => {
          if (rows.length === 0) return null;
          const sectionUnassigned = rows.filter(
            (r) => r.personName === UNASSIGNED || r.personName.trim() === ""
          ).length;
          return (
            <div key={section} className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-800/50 px-4 py-2.5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">
                  {sectionLabels[section] ?? section}
                </h3>
                {sectionUnassigned > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs text-amber-400">
                    {sectionUnassigned} unassigned
                  </span>
                )}
                {sectionUnassigned === 0 && (
                  <span className="text-xs text-emerald-400">✓ Complete</span>
                )}
              </div>

              {/* Column headers */}
              <div className="hidden sm:grid sm:grid-cols-[2.4fr_2fr_2fr_auto_auto] gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span>Part</span>
                <span>Assigned Person</span>
                <span>Assistant</span>
                <span>Notes</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-800/60">
                {rows.map((row) => {
                  const edit = editMap[row.id];
                  const isUnassigned = row.personName === UNASSIGNED || row.personName.trim() === "";
                  const isSaving = edit?.saving ?? false;
                  const isDirty = edit?.dirty ?? false;

                  return (
                    <div
                      key={row.id}
                      className={`flex flex-col gap-3 px-4 py-3 sm:grid sm:grid-cols-[2.4fr_2fr_2fr_1fr_auto] sm:items-center ${
                        isUnassigned ? "bg-amber-950/20 border-l-2 border-amber-500/50" : ""
                      }`}
                    >
                      {/* Part title */}
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isUnassigned && (
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          )}
                          <input
                            type="text"
                            value={edit?.partTitle ?? ""}
                            onChange={(e) => updateField(row.id, "partTitle", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveRow(row.id)}
                            placeholder="Part title"
                            className={`w-full rounded-md border px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                              isDirty
                                ? "border-sky-500/60 bg-sky-950/40 focus:border-sky-400"
                                : "border-slate-700 bg-slate-950 focus:border-sky-500"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-[1fr_110px] gap-2">
                          <select
                            value={edit?.section ?? row.section}
                            onChange={(e) => updateField(row.id, "section", e.target.value)}
                            className={`rounded-md border px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none transition-colors ${
                              isDirty
                                ? "border-sky-500/60 bg-sky-950/40 focus:border-sky-400"
                                : "border-slate-700 bg-slate-950 focus:border-sky-500"
                            }`}
                          >
                            {sectionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={edit?.position ?? String(row.position)}
                            onChange={(e) => updateField(row.id, "position", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveRow(row.id)}
                            placeholder="Pos"
                            className={`rounded-md border px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none transition-colors ${
                              isDirty
                                ? "border-sky-500/60 bg-sky-950/40 focus:border-sky-400"
                                : "border-slate-700 bg-slate-950 focus:border-sky-500"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Person name */}
                      <input
                        type="text"
                        placeholder="Enter name…"
                        value={edit?.personName ?? ""}
                        onChange={(e) => updateField(row.id, "personName", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveRow(row.id)}
                        className={`rounded-md border px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none w-full transition-colors ${
                          isDirty
                            ? "border-sky-500/60 bg-sky-950/40 focus:border-sky-400"
                            : "border-slate-700 bg-slate-950 focus:border-sky-500"
                        }`}
                      />

                      {/* Assistant */}
                      <input
                        type="text"
                        placeholder="Assistant (optional)"
                        value={edit?.assistantName ?? ""}
                        onChange={(e) => updateField(row.id, "assistantName", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveRow(row.id)}
                        className={`rounded-md border px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none w-full transition-colors ${
                          isDirty
                            ? "border-sky-500/60 bg-sky-950/40 focus:border-sky-400"
                            : "border-slate-700 bg-slate-950 focus:border-sky-500"
                        }`}
                      />

                      {/* Notes */}
                      <input
                        type="text"
                        placeholder="Notes…"
                        value={edit?.notes ?? ""}
                        onChange={(e) => updateField(row.id, "notes", e.target.value)}
                        className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none w-full"
                      />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveRow(row.id)}
                          disabled={isSaving || !isDirty}
                          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-40 whitespace-nowrap"
                        >
                          {isSaving ? "…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:border-red-500/60 hover:text-red-400 transition-colors"
                          title="Delete row"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
