import type { ServiceAssignmentCategory } from "@prisma/client";

export type CartScheduleRow = {
  title: string;
  assigneeName: string;
  assistantName: string | null;
  dayLabel: string;
  timeLabel: string;
  notes: string | null;
  position: number;
};

export type CongregationAssignmentRow = {
  category: ServiceAssignmentCategory;
  title: string;
  assigneeName: string;
  assistantName: string | null;
  notes: string | null;
  position: number;
};

export const serviceCategoryLabels: Record<ServiceAssignmentCategory, string> = {
  CART: "Cart Schedule",
  CLEANING: "Cleaning",
  SOUND: "Sound System",
  GENERAL_INFO: "General Information",
};

export const defaultCartSchedule: CartScheduleRow[] = [
  {
    title: "Main Street Witnessing Cart",
    assigneeName: "To be assigned",
    assistantName: "To be assigned",
    dayLabel: "Saturday",
    timeLabel: "10:00 - 12:00",
    notes: null,
    position: 1,
  },
  {
    title: "Market Square Witnessing Cart",
    assigneeName: "To be assigned",
    assistantName: "To be assigned",
    dayLabel: "Sunday",
    timeLabel: "09:00 - 11:00",
    notes: null,
    position: 2,
  },
];

export const defaultCongregationAssignments: CongregationAssignmentRow[] = [
  {
    category: "CLEANING",
    title: "Kingdom Hall Cleaning Team",
    assigneeName: "To be assigned",
    assistantName: "To be assigned",
    notes: "After midweek meeting",
    position: 1,
  },
  {
    category: "SOUND",
    title: "Microphones / Audio Desk",
    assigneeName: "To be assigned",
    assistantName: "To be assigned",
    notes: "Arrive 20 minutes early",
    position: 1,
  },
  {
    category: "GENERAL_INFO",
    title: "Attendant / General support",
    assigneeName: "To be assigned",
    assistantName: "To be assigned",
    notes: null,
    position: 1,
  },
];
