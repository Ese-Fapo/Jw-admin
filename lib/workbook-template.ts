import type { WorkbookSection } from "@prisma/client";

export type WorkbookTemplateItem = {
  section: WorkbookSection;
  partTitle: string;
  position: number;
};

export const workbookSectionOptions: { label: string; value: WorkbookSection }[] = [
  { label: "Opening Comments", value: "OPENING" },
  { label: "Treasures From God’s Word", value: "TREASURES" },
  { label: "Apply Yourself to the Field Ministry", value: "APPLY_YOURSELF" },
  { label: "Living as Christians", value: "LIVING_AS_CHRISTIANS" },
  { label: "Congregation Bible Study", value: "CONGREGATION_BIBLE_STUDY" },
  { label: "Concluding Comments", value: "CONCLUDING_COMMENTS" },
];

export const workbookSectionLabels: Record<WorkbookSection, string> = Object.fromEntries(
  workbookSectionOptions.map((option) => [option.value, option.label])
) as Record<WorkbookSection, string>;

export const workbookTemplateParts: WorkbookTemplateItem[] = [
  { section: "OPENING", partTitle: "Opening Comments", position: 1 },

  { section: "TREASURES", partTitle: "Treasures From God’s Word Talk", position: 1 },
  { section: "TREASURES", partTitle: "Digging for Spiritual Gems", position: 2 },
  { section: "TREASURES", partTitle: "Bible Reading", position: 3 },

  { section: "APPLY_YOURSELF", partTitle: "Initial Call", position: 1 },
  { section: "APPLY_YOURSELF", partTitle: "Return Visit", position: 2 },
  { section: "APPLY_YOURSELF", partTitle: "Bible Study", position: 3 },

  { section: "LIVING_AS_CHRISTIANS", partTitle: "Local Needs / Feature Part", position: 1 },

  { section: "CONGREGATION_BIBLE_STUDY", partTitle: "Congregation Bible Study", position: 1 },

  { section: "CONCLUDING_COMMENTS", partTitle: "Concluding Comments", position: 1 },
];
