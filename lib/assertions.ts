import assert from "assert";

export function assertAndReturn<T>(
  value: T | false | null | undefined,
  message?: string
): T {
  assert(value, message);
  return value;
}

export function assertIsString(
  value: any,
  message: string
): asserts value is string {
  assert(typeof value === "string", message);
}
