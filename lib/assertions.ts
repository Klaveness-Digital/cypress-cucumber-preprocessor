export function assert(value: any, message?: string): asserts value {
  if (value) {
    return;
  }

  throw new Error(message ?? `Expected a truthy value, but got ${value}`);
}

export function assertAndReturn<T>(
  value: T | false | null | undefined,
  message?: string
): T {
  assert(value, message);
  return value;
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function assertIsString(
  value: any,
  message: string
): asserts value is string {
  assert(isString(value), message);
}
