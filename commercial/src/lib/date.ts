export function dateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isSameDay(a: string | Date, b: string | Date) {
  return dateKey(a) === dateKey(b);
}

export function isSameMonth(a: string | Date, b: string | Date) {
  return monthKey(a) === monthKey(b);
}

export function startOfWeek(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isSameWeek(a: string | Date, b: string | Date) {
  return dateKey(startOfWeek(a)) === dateKey(startOfWeek(b));
}
