import { ServiceAssignmentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultCongregationAssignments, serviceCategoryLabels } from "@/lib/ministry-schedule";

const categoryBadgeStyles: Record<ServiceAssignmentCategory, string> = {
  CART: "bg-[#dce9f9] text-[#2f5f95]",
  CLEANING: "bg-[#e4f3ec] text-[#1f6a4c]",
  SOUND: "bg-[#efe8fb] text-[#5a4693]",
  GENERAL_INFO: "bg-[#f3f4f6] text-[#4b5563]",
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function hasConfiguredDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) return false;

  return !["USER", "PASSWORD", "HOST", "DATABASE"].some((token) =>
    databaseUrl.includes(token)
  );
}

export default async function AssignmentsPage() {
  const weekOf = startOfWeek(new Date());

  let dbUnavailable = !hasConfiguredDatabase();
  let rows = defaultCongregationAssignments;

  if (!dbUnavailable) {
    try {
      const dbRows = await prisma.serviceAssignment.findMany({
        where: {
          weekOf,
          category: {
            in: [
              ServiceAssignmentCategory.CLEANING,
              ServiceAssignmentCategory.SOUND,
              ServiceAssignmentCategory.GENERAL_INFO,
            ],
          },
        },
        orderBy: [{ category: "asc" }, { position: "asc" }],
        select: {
          category: true,
          title: true,
          assigneeName: true,
          assistantName: true,
          notes: true,
          position: true,
        },
      });

      if (dbRows.length > 0) {
        rows = dbRows;
      }
    } catch (error) {
      dbUnavailable = true;
      console.error("Congregation assignments unavailable:", error);
    }
  }

  const assignedCount = rows.filter((row) => row.assigneeName !== "To be assigned").length;
  const pendingCount = rows.length - assignedCount;
  const categoryCount = new Set(rows.map((row) => row.category)).size;

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="rounded-xl border border-[#9ab2d3] bg-[#f7faff] p-5 shadow-sm sm:p-7">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[#4f6b91]">Congregation Support</p>
          <h1 className="mt-1 text-3xl font-bold text-[#143b6f] sm:text-4xl">Congregation Assignments</h1>
          <p className="mt-2 text-sm text-[#2f4f79]">
            Cleaning, sound system, and general information • Week of{" "}
            {weekOf.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
          {dbUnavailable && (
            <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-100/80 px-3 py-2 text-xs text-amber-900">
              Showing template view. Database connection is not available.
            </p>
          )}
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#b7c9e2] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[#5d7393]">Total Assignments</p>
            <p className="mt-1 text-2xl font-bold text-[#143b6f]">{rows.length}</p>
          </div>
          <div className="rounded-lg border border-[#b7c9e2] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[#5d7393]">Assigned</p>
            <p className="mt-1 text-2xl font-bold text-[#175086]">{assignedCount}</p>
          </div>
          <div className="rounded-lg border border-[#b7c9e2] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[#5d7393]">Categories</p>
            <p className="mt-1 text-2xl font-bold text-[#2f5f95]">{categoryCount}</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-[#b7c9e2] bg-[#eef4fd] px-4 py-3 text-sm text-[#2f4f79]">
          Quick view on mobile cards, full detail table on larger screens.
        </div>

        <div className="space-y-3 md:hidden">
          {rows.map((row, index) => (
            <article key={`${row.category}-${row.title}-${index}`} className="rounded-lg border border-[#b7c9e2] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#173b6c]">{row.title}</h2>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryBadgeStyles[row.category]}`}>
                  {serviceCategoryLabels[row.category]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5d7393]">Assigned</p>
                  <p className="text-sm font-medium text-[#175086]">{row.assigneeName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5d7393]">Assistant</p>
                  <p className="text-sm text-[#2f5f95]">{row.assistantName ?? "—"}</p>
                </div>
              </div>

              {row.notes ? (
                <div className="mt-2 rounded-md bg-[#f5f8fd] px-2 py-1.5">
                  <p className="text-xs text-[#4f6788]">{row.notes}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-[#9ab2d3] bg-white md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#e8f0fb]">
                <tr className="border-b border-[#b7c9e2]">
                  <th className="px-4 py-3 text-[#1f416f]">Category</th>
                  <th className="px-4 py-3 text-[#1f416f]">Assignment</th>
                  <th className="px-4 py-3 text-[#1f416f]">Assigned</th>
                  <th className="px-4 py-3 text-[#1f416f]">Assistant</th>
                  <th className="px-4 py-3 text-[#1f416f]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.category}-${row.title}-${index}`} className="border-b border-[#d3dff0] last:border-b-0">
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryBadgeStyles[row.category]}`}>
                        {serviceCategoryLabels[row.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#173b6c]">{row.title}</td>
                    <td className="px-4 py-3 text-[#175086]">{row.assigneeName}</td>
                    <td className="px-4 py-3 text-[#2f5f95]">{row.assistantName ?? "—"}</td>
                    <td className="px-4 py-3 text-[#4f6788]">{row.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-[#5d7393]">
          Pending assignments: <span className="font-semibold">{pendingCount}</span>. Use Admin page for updates.
        </p>
      </div>
    </section>
  );
}
