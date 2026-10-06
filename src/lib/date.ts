export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function lastDays(n: number, from: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() - (n - 1 - i));
    return dayKey(d);
  });
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
