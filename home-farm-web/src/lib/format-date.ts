function toDateParts(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("bg-BG", {
    timeZone: "Europe/Sofia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  if (!day || !month || !year) {
    return null;
  }

  return { day, month, year };
}

export function formatBulgarianDate(value: string | Date) {
  const parts = toDateParts(value);

  if (!parts) {
    return typeof value === "string" ? value : value.toISOString();
  }

  return `${parts.day}.${parts.month}.${parts.year} г.`;
}

export function formatDateInputValue(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const parts = toDateParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}
