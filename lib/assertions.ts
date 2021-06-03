import { isString } from "./type-guards";

export function assert(value: any, message?: string): asserts value {
  if (value) {
    return;
  }

  throw new Error(message ?? `Expected a truthy value, but got ${value}`);
}

export function assertAndReturn<T>(
  value: T,
  message?: string
): Exclude<T, false | null | undefined> {
  assert(value, message);
  return value as Exclude<T, false | null | undefined>;
}

export function assertIsString(
  value: any,
  message: string
): asserts value is string {
  assert(isString(value), message);
}
