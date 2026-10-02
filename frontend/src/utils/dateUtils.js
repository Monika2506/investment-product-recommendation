/**
 * Timezone-Aware Date & Time Utilities for InvestIQ
 * Parses UTC ISO 8601 strings and renders them in the user's native browser local timezone
 * using JavaScript Intl.DateTimeFormat without manual offset math.
 */

export function parseUtcDate(isoString) {
  if (!isoString) return null;
  let str = String(isoString).trim();
  // If string has no timezone offset indicator (no Z, +, or trailing offset), append Z so JS parses as UTC
  if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) {
    str += 'Z';
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

export function formatLocalDateTime(isoString, options = {}) {
  const date = parseUtcDate(isoString);
  if (!date) return 'N/A';

  const defaultOpts = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };

  try {
    return new Intl.DateTimeFormat(undefined, defaultOpts).format(date);
  } catch (_) {
    return date.toLocaleString();
  }
}

export function formatLocalDate(isoString) {
  return formatLocalDateTime(isoString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: undefined,
    minute: undefined,
    second: undefined
  });
}

export function formatLocalTime(isoString) {
  return formatLocalDateTime(isoString, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
