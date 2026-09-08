export const APP_TIMEZONE = 'America/Sao_Paulo';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const UTC_MIDNIGHT = /T00:00:00(\.000)?Z$/;

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const civilDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const utcLongDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const pad = (value: number) => String(value).padStart(2, '0');

const formatYmd = (year: string, month: string, day: string) =>
  `${day}/${month}/${year}`;

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const isUtcMidnight = (date: Date) =>
  date.getUTCHours() === 0 &&
  date.getUTCMinutes() === 0 &&
  date.getUTCSeconds() === 0 &&
  date.getUTCMilliseconds() === 0;

const toDate = (value: Date | string): Date | null => {
  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? parsed : null;
};

const isCivilDateString = (value: string) =>
  DATE_ONLY.test(value) || UTC_MIDNIGHT.test(value);

/**
 * Calendar date without shifting the day.
 * YYYY-MM-DD and UTC midnight stay on the stored civil day.
 * Other instants use America/Sao_Paulo.
 */
export const formatDate = (date?: Date | string | null): string => {
  if (!date) return '';

  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (isCivilDateString(trimmed)) {
      const [year, month, day] = trimmed.slice(0, 10).split('-');
      return formatYmd(year, month, day);
    }
  }

  const parsed = toDate(date);
  if (!parsed) return '';
  if (isUtcMidnight(parsed)) {
    return formatYmd(
      String(parsed.getUTCFullYear()),
      pad(parsed.getUTCMonth() + 1),
      pad(parsed.getUTCDate()),
    );
  }
  return civilDateFormatter.format(parsed);
};

/** Instant displayed as dd/MM/yyyy HH:mm in America/Sao_Paulo. */
export const formatDateTime = (date?: Date | string | null): string => {
  if (!date) return '';
  const parsed = toDate(date);
  if (!parsed) return '';

  const parts = dateTimeFormatter.formatToParts(parsed);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
};

/** Long civil date (ex.: 07 de setembro de 2026) without shifting the calendar day. */
export const formatLongDate = (date?: Date | string | null): string => {
  if (!date) return '';

  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (isCivilDateString(trimmed)) {
      const [year, month, day] = trimmed.slice(0, 10).split('-').map(Number);
      return utcLongDateFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)));
    }
  }

  const parsed = toDate(date);
  if (!parsed) return '';
  if (isUtcMidnight(parsed)) {
    return utcLongDateFormatter.format(
      new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
          12,
        ),
      ),
    );
  }
  return longDateFormatter.format(parsed);
};

/** Day of month from a civil date, without timezone shift. */
export const formatCivilDay = (date?: Date | string | null): string => {
  const formatted = formatDate(date);
  return formatted ? formatted.slice(0, 2) : '';
};

const parseLocalCalendarDate = (value: string): Date | null => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

/**
 * Value for DatePicker (date-only).
 * YYYY-MM-DD and UTC midnight stay on the stored civil day so the picker
 * does not show the previous day in BRT.
 */
export const parsePickerDate = (
  value?: Date | string | null,
): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    if (!isValidDate(value)) return null;
    if (isUtcMidnight(value)) {
      return new Date(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
      );
    }
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY.test(trimmed) || UTC_MIDNIGHT.test(trimmed)) {
    return parseLocalCalendarDate(trimmed);
  }

  return toDate(trimmed);
};

/**
 * Value for DateTimePicker. ISO instants keep their time (including 00:00Z,
 * which is 21:00 in São Paulo). Date-only strings become a local calendar date.
 */
export const parsePickerDateTime = (
  value?: Date | string | null,
): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY.test(trimmed)) {
    return parseLocalCalendarDate(trimmed);
  }

  return toDate(trimmed);
};

export const toIsoDateTime = (value?: Date | string | null): string => {
  const parsed = parsePickerDateTime(value);
  return parsed ? parsed.toISOString() : '';
};
