import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth-guards";
import AdminWorkbookControl from "./workbook-control";
import ServiceControl from "./service-control";
import { workbookSectionOptions } from "@/lib/workbook-template";

export default async function AdminPage() {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/");
  }

  if (role !== "ADMIN") {
    return (
      <section className="content-wrap py-10 sm:py-14">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-white">Access denied</h1>
          <p className="mt-2 text-sm text-slate-400">Only admins can access workbook control.</p>
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
