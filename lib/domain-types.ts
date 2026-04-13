export const WORKBOOK_SECTIONS = [
  "OPENING",
  "TREASURES",
  "APPLY_YOURSELF",
  "LIVING_AS_CHRISTIANS",
  "CONGREGATION_BIBLE_STUDY",
  "CONCLUDING_COMMENTS",
] as const;

export type WorkbookSection = (typeof WORKBOOK_SECTIONS)[number];

export const SERVICE_ASSIGNMENT_CATEGORIES = ["CART", "CLEANING", "SOUND", "GENERAL_INFO"] as const;

export type ServiceAssignmentCategory = (typeof SERVICE_ASSIGNMENT_CATEGORIES)[number];

export type UserRole = "USER" | "ADMIN";

export function isWorkbookSection(value: string): value is WorkbookSection {
  return WORKBOOK_SECTIONS.includes(value as WorkbookSection);
}

export function isServiceAssignmentCategory(value: string): value is ServiceAssignmentCategory {
  return SERVICE_ASSIGNMENT_CATEGORIES.includes(value as ServiceAssignmentCategory);
}
