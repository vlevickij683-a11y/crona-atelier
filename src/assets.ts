/** Resolve built-in assets without changing persisted product image identifiers. */
export function publicAsset(value: string): string {
  const base = import.meta.env.BASE_URL;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith(base)) return value;
  return base + value.slice(1);
}
