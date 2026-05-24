export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("bg-BG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(value: string | number) {
  return `${value} EUR`;
}

export function formatOrderStatus(status: string) {
  switch (status) {
    case "Pending":
      return "Чакаща";
    case "Accepted":
      return "Приета";
    case "Completed":
      return "Завършена";
    case "Cancelled":
      return "Отказана";
    default:
      return status;
  }
}
