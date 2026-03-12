"use client";

export default function PrintWorkbookButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
    >
      Print Workbook
    </button>
  );
}
