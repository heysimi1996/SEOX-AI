export type MetaFieldStatus = 'Available' | 'Missing' | 'Unavailable' | 'Error';

export function getMetaFieldStatus(
  value: string | string[] | null | undefined,
  contentType: string,
  requestFailed = false,
): MetaFieldStatus {
  if (requestFailed) return 'Error';
  if (!/(?:text\/html|application\/xhtml\+xml)/iu.test(contentType)) return 'Unavailable';
  const hasValue = Array.isArray(value)
    ? value.some((item) => item.trim().length > 0)
    : typeof value === 'string' && value.trim().length > 0;
  return hasValue ? 'Available' : 'Missing';
}

export function hasAuditedScore(score: number, totalChecks: number): boolean {
  return Number.isFinite(score) && Number.isFinite(totalChecks) && totalChecks > 0;
}
