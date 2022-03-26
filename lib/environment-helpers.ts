export function getTags(env: Record<string, any>): string | null {
  const tags = env.TAGS ?? env.tags;

  return tags == null ? null : String(tags);
}
