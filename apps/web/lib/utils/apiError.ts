// API errors return a stable machine-readable `code` (see
// apps/api/src/common/filters/*-exception.filter.ts), never translated
// text. The client looks the code up in messages/<locale>.json under
// "errors" to render it — this is that lookup's input half.
export function getApiErrorCode(error: unknown): string | undefined {
  const code = (error as any)?.response?.data?.code;
  return typeof code === 'string' ? code : undefined;
}
