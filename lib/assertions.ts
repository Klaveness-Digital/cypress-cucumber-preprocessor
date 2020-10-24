import assert from "assert";

export function assertAndReturn<T>(
  value: T | false | null | undefined,
  message?: string
): T {
  assert(value, message);
  return value;
}
