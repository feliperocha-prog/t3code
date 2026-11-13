/**
 * Pads a loosely typed daily time ("9:00", "9:5") to the HH:MM shape the
 * schedule expects. Out-of-range values ("24:00", "9:60") are only padded, so
 * validation still rejects them.
 */
export function normalizeDailyTime(value: string): string {
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(value);
  if (!match) return value;
  const [, hours = "", minutes = ""] = match;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
