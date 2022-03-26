export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isFalse(value: unknown): value is false {
  return value === false;
}

export function isStringOrFalse(value: unknown): value is string | false {
  return isString(value) || isFalse(value);
}

export function isStringOrStringArray(
  value: unknown
): value is string | string[] {
  return (
    typeof value === "string" || (Array.isArray(value) && value.every(isString))
  );
}

export function notNull<T>(value: T | null | undefined): value is T {
  return value != null;
}
