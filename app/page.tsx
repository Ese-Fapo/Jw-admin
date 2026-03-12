import { WorkbookSection } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { workbookSectionLabels, workbookTemplateParts } from "@/lib/workbook-template";
import PrintWorkbookButton from "@/app/components/general/PrintWorkbookButton";

const sectionStyles: Record<WorkbookSection, { chip: string; header: string }> = {
  OPENING: {
    chip: "bg-[#123b6f] text-[#eaf2ff]",
    header: "from-[#2b548b] to-[#365f96]",
  },
  TREASURES: {
    chip: "bg-[#184a84] text-[#eaf2ff]",
    header: "from-[#3d679f] to-[#4a73aa]",
  },
  APPLY_YOURSELF: {
    chip: "bg-[#1f558f] text-[#edf4ff]",
    header: "from-[#507bb2] to-[#5b86bc]",
  },
  LIVING_AS_CHRISTIANS: {
    chip: "bg-[#2a6099] text-[#eff5ff]",
    header: "from-[#618bbf] to-[#6f97c8]",
  },
  CONGREGATION_BIBLE_STUDY: {
    chip: "bg-[#346ba3] text-[#f1f7ff]",
    header: "from-[#739ccb] to-[#7fa7d2]",
  },
  CONCLUDING_COMMENTS: {
    chip: "bg-[#3d75ad] text-[#f3f8ff]",
    header: "from-[#86add6] to-[#90b6dc]",
  },
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export default async function HomePage() {
  const weekOf = startOfWeek(new Date());

  let assignments: {
    id: string;
    section: WorkbookSection;
    partTitle: string;
    personName: string;
    assistantName: string | null;
    notes: string | null;
    position: number;
  }[] = [];
  let dbUnavailable = false;

  try {
    assignments = await prisma.workbookAssignment.findMany({
      where: { weekOf },
      orderBy: [{ section: "asc" }, { position: "asc" }],
      select: {
        id: true,
        section: true,
        partTitle: true,
        personName: true,
        assistantName: true,
        notes: true,
        position: true,
      },
    });
  } catch (error) {
    dbUnavailable = true;
    console.error("Workbook data unavailable:", error);
  }

  const grouped = assignments.reduce<Record<WorkbookSection, typeof assignments>>(
    (acc, item) => {
      acc[item.section].push(item);
      return acc;
    },
    {
      OPENING: [],
      TREASURES: [],
      APPLY_YOURSELF: [],
      LIVING_AS_CHRISTIANS: [],
      CONGREGATION_BIBLE_STUDY: [],
      CONCLUDING_COMMENTS: [],
    }
  );

  const templateBySection = workbookTemplateParts.reduce<
    Record<WorkbookSection, { partTitle: string; position: number }[]>
  >(
    (acc, item) => {
      acc[item.section].push({ partTitle: item.partTitle, position: item.position });
      return acc;
    },
    {
      OPENING: [],
      TREASURES: [],
      APPLY_YOURSELF: [],
      LIVING_AS_CHRISTIANS: [],
      CONGREGATION_BIBLE_STUDY: [],
      CONCLUDING_COMMENTS: [],
    }
  );

  const rowsBySection = (Object.keys(workbookSectionLabels) as WorkbookSection[]).reduce<
    Record<
      WorkbookSection,
      {
        id: string;
        partTitle: string;
        personName: string;
        assistantName: string | null;
        notes: string | null;
        isPlaceholder: boolean;
      }[]
    >
  >(
    (acc, section) => {
      const templateRows = [...templateBySection[section]].sort((a, b) => a.position - b.position);
      const assignedRows = [...grouped[section]].sort((a, b) => a.position - b.position);
      const usedAssignmentIds = new Set<string>();

      const normalizedRows = templateRows.map((templateRow) => {
        const match = assignedRows.find(
          (assignment) =>
            assignment.position === templateRow.position || assignment.partTitle === templateRow.partTitle
        );

        if (match) usedAssignmentIds.add(match.id);

        return {
          id: match?.id ?? `template-${section}-${templateRow.position}-${templateRow.partTitle}`,
          partTitle: match?.partTitle ?? templateRow.partTitle,
          personName: match?.personName ?? "To be assigned",
          assistantName: match?.assistantName ?? null,
          notes: match?.notes ?? null,
          isPlaceholder: !match,
        };
      });

      const extraAssignedRows = assignedRows
        .filter((assignment) => !usedAssignmentIds.has(assignment.id))
        .map((assignment) => ({
          id: assignment.id,
          partTitle: assignment.partTitle,
          personName: assignment.personName,
          assistantName: assignment.assistantName,
          notes: assignment.notes,
          isPlaceholder: false,
        }));

      acc[section] = [...normalizedRows, ...extraAssignedRows];
      return acc;
    },
    {
      OPENING: [],
      TREASURES: [],
      APPLY_YOURSELF: [],
      LIVING_AS_CHRISTIANS: [],
      CONGREGATION_BIBLE_STUDY: [],
      CONCLUDING_COMMENTS: [],
    }
  );

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="clm-sheet rounded-xl border border-[#9ab2d3] bg-[#f7faff] p-5 sm:p-7">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4f6b91]">Jehovah’s Witnesses</p>
            <h1 className="mt-1 text-2xl font-bold text-[#143b6f] sm:text-3xl">Christian Life and Ministry Workbook</h1>
            <p className="mt-2 text-sm text-[#2f4f79]">
              Week of {weekOf.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <PrintWorkbookButton />
        </header>

       
        <div className="space-y-4">
          {(Object.keys(workbookSectionLabels) as WorkbookSection[]).map((section) => {
            const items = rowsBySection[section];
            const styles = sectionStyles[section];

            return (
              <article key={section} className="overflow-hidden rounded-lg border border-[#9ab2d3] bg-white/80">
                <div className={`bg-linear-to-r ${styles.header} px-4 py-2`}>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${styles.chip}`}>Section</span>
                    <h2 className="text-sm font-semibold text-white sm:text-base">{workbookSectionLabels[section]}</h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#e8f0fb]">
                      <tr className="border-b border-[#b7c9e2]">
                        <th className="px-4 py-2 text-[#1f416f]">Part</th>
                        <th className="px-4 py-2 text-[#1f416f]">Assigned</th>
                        <th className="px-4 py-2 text-[#1f416f]">Assistant</th>
                        <th className="px-4 py-2 text-[#1f416f]">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td className="px-4 py-3 text-[#6b7f9b]">—</td>
                          <td className="px-4 py-3 text-[#6b7f9b]">Not assigned</td>
                          <td className="px-4 py-3 text-[#6b7f9b]">—</td>
                          <td className="px-4 py-3 text-[#6b7f9b]">—</td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item.id} className="border-b border-[#d3dff0] last:border-b-0">
                            <td className="px-4 py-3 text-[#173b6c]">{item.partTitle}</td>
                            <td className={`px-4 py-3 font-medium ${item.isPlaceholder ? "text-[#7a8ca6]" : "text-[#175086]"}`}>
                              {item.personName}
                            </td>
                            <td className={`px-4 py-3 ${item.isPlaceholder ? "text-[#7a8ca6]" : "text-[#2f5f95]"}`}>
                              {item.assistantName ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-[#4f6788]">{item.notes ?? ""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-[#9ab2d3] bg-white/85 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#143b6f] sm:text-lg">Weekend Meetings</h2>
            <Link
              href="/cart-schedule"
              className="rounded-md border border-[#2e5f96] bg-[#2e5f96] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#234b79]"
            >
              Open Cart Schedule
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/cart-schedule"
              className="group rounded-lg border border-[#b7c9e2] bg-[#eef4fd] p-4 transition hover:border-[#2f5f95] hover:bg-[#e5eefb]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5b7599]">Saturday</p>
              <h3 className="mt-1 text-sm font-semibold text-[#173b6c] sm:text-base">Weekend Ministry Support</h3>
              <p className="mt-1 text-sm text-[#4f6788]">Review publisher pairings and territory cart setup.</p>
              <p className="mt-2 text-xs font-semibold text-[#2f5f95] group-hover:text-[#1e4a77]">Go to cart schedule →</p>
            </Link>

            <Link
              href="/cart-schedule"
              className="group rounded-lg border border-[#b7c9e2] bg-[#eef4fd] p-4 transition hover:border-[#2f5f95] hover:bg-[#e5eefb]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5b7599]">Sunday</p>
              <h3 className="mt-1 text-sm font-semibold text-[#173b6c] sm:text-base">Public Meeting Coordination</h3>
              <p className="mt-1 text-sm text-[#4f6788]">Confirm support assignments and follow-up notes.</p>
              <p className="mt-2 text-xs font-semibold text-[#2f5f95] group-hover:text-[#1e4a77]">Go to cart schedule →</p>
            </Link>
          </div>
        </div>

        <p className="mt-5 text-xs text-[#5d7393]">
          Use Admin page to update assignments and assistants.
        </p>
      </div>
    </section>
  );
}
