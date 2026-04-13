import type { WorkbookSection } from "@/lib/domain-types";

export type WorkbookTemplateItem = {
  section: WorkbookSection;
  partTitle: string;
  position: number;
};

export const workbookSectionOptions: { label: string; value: WorkbookSection }[] = [
  { label: "Chairman's Opening Comments", value: "OPENING" },
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
  { section: "OPENING", partTitle: "Chairman's Opening Comments", position: 1 },

  { section: "TREASURES", partTitle: "1. Treasures From God’s Word Talk", position: 1 },
  { section: "TREASURES", partTitle: "2. Digging for Spiritual Gems", position: 2 },
  { section: "TREASURES", partTitle: "3. Bible Reading", position: 3 },

  { section: "APPLY_YOURSELF", partTitle: "1. Initial Call", position: 1 },
  { section: "APPLY_YOURSELF", partTitle: "2. Return Visit", position: 2 },
  { section: "APPLY_YOURSELF", partTitle: "3. Bible Study", position: 3 },

  { section: "LIVING_AS_CHRISTIANS", partTitle: "Local Needs / Feature Part", position: 1 },

  { section: "CONGREGATION_BIBLE_STUDY", partTitle: "Congregation Bible Study", position: 1 },

  { section: "CONCLUDING_COMMENTS", partTitle: "Concluding Comments", position: 1 },
];
