export const ACTIVITY_TYPE_VALUES = ["корен", "кг"] as const;

export type ActivityType = (typeof ACTIVITY_TYPE_VALUES)[number];