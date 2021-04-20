export function isString(value: unknown): value is string {
  return typeof value === "string";
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
