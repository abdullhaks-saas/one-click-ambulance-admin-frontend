/** Local calendar YYYY-MM-DD */
export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Inclusive last N calendar days ending today → { from, to } */
export function rollingDaysRange(dayCount: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (dayCount - 1));
  return { from: formatYmd(from), to: formatYmd(to) };
}
