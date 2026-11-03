import { format, isValid, parse, startOfDay } from "date-fns";

export function toDateValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromDateValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? startOfDay(date) : undefined;
}

export function toMonthValue(date: Date): string {
  return format(date, "yyyy-MM");
}

export function fromMonthValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM", new Date());
  return isValid(date) ? startOfDay(date) : undefined;
}

export function isDateValue(value: string): boolean {
  return fromDateValue(value) != null;
}

export function isMonthValue(value: string): boolean {
  return fromMonthValue(value) != null;
}
