import { RRule, rrulestr } from "rrule";

type RRuleFormatOptions = {
  locale?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
};

const WEEKDAY_LABELS: Record<string, string> = {
  MO: "segunda-feira",
  TU: "terça-feira",
  WE: "quarta-feira",
  TH: "quinta-feira",
  FR: "sexta-feira",
  SA: "sábado",
  SU: "domingo",
};

const WEEKDAY_LABELS_SHORT: Record<string, string> = {
  MO: "seg",
  TU: "ter",
  WE: "qua",
  TH: "qui",
  FR: "sex",
  SA: "sáb",
  SU: "dom",
};

const MONTH_LABELS: Record<number, string> = {
  1: "janeiro",
  2: "fevereiro",
  3: "março",
  4: "abril",
  5: "maio",
  6: "junho",
  7: "julho",
  8: "agosto",
  9: "setembro",
  10: "outubro",
  11: "novembro",
  12: "dezembro",
};

const formatFrequency = (freq: number, interval: number): string => {
  const freqMap: Record<number, string> = {
    [RRule.HOURLY]: interval === 1 ? "a cada hora" : `a cada ${interval} horas`,
    [RRule.DAILY]: interval === 1 ? "diariamente" : `a cada ${interval} dias`,
    [RRule.WEEKLY]:
      interval === 1 ? "semanalmente" : `a cada ${interval} semanas`,
    [RRule.MONTHLY]:
      interval === 1 ? "mensalmente" : `a cada ${interval} meses`,
    [RRule.YEARLY]: interval === 1 ? "anualmente" : `a cada ${interval} anos`,
  };

  return freqMap[freq] || "frequência desconhecida";
};

const formatWeekdays = (byweekday: any[]): string => {
  if (!byweekday || byweekday.length === 0) return "";

  const weekdays = byweekday
    .map((day) => {
      if (typeof day === "object" && day.weekday !== undefined) {
        const dayCode = Object.keys(WEEKDAY_LABELS)[day.weekday];
        return WEEKDAY_LABELS_SHORT[dayCode];
      }
      return WEEKDAY_LABELS_SHORT[day] || day;
    })
    .filter(Boolean);

  if (weekdays.length === 0) return "";
  if (weekdays.length === 1) return `às ${weekdays[0]}`;
  if (weekdays.length === 2) return `às ${weekdays[0]} e ${weekdays[1]}`;

  const last = weekdays.pop();
  return `às ${weekdays.join(", ")} e ${last}`;
};

const formatByMonth = (bymonth: number[]): string => {
  if (!bymonth || bymonth.length === 0) return "";

  const months = bymonth.map((m) => MONTH_LABELS[m]).filter(Boolean);

  if (months.length === 0) return "";
  if (months.length === 1) return `em ${months[0]}`;
  if (months.length === 2) return `em ${months[0]} e ${months[1]}`;

  const last = months.pop();
  return `em ${months.join(", ")} e ${last}`;
};

const formatByMonthDay = (bymonthday: number[]): string => {
  if (!bymonthday || bymonthday.length === 0) return "";

  const days = bymonthday.map((d) => {
    if (d === -1) return "último dia";
    if (d === 1) return "dia 1º";
    if (d === 2) return "dia 2º";
    if (d === 3) return "dia 3º";
    return `dia ${d}`;
  });

  if (days.length === 0) return "";
  if (days.length === 1) return `no ${days[0]}`;
  if (days.length === 2) return `nos ${days[0]} e ${days[1]}`;

  const last = days.pop();
  return `nos ${days.join(", ")} e ${last}`;
};

const formatBySetPos = (bysetpos: number[]): string => {
  if (!bysetpos || bysetpos.length === 0) return "";

  const positions = bysetpos.map((pos) => {
    if (pos === -1) return "última";
    if (pos === 1) return "1ª";
    if (pos === 2) return "2ª";
    if (pos === 3) return "3ª";
    if (pos === 4) return "4ª";
    return `${pos}ª`;
  });

  if (positions.length === 0) return "";
  if (positions.length === 1) return `na ${positions[0]} ocorrência`;

  const last = positions.pop();
  return `na ${positions.join(", ")} e ${last} ocorrência`;
};

const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  };

  return date.toLocaleDateString("pt-BR", { ...defaultOptions, ...options });
};

/**
 * Formata uma RRULE em texto legível em português
 * @param rruleString - String RRULE completa (pode incluir DTSTART)
 * @param options - Opções de formatação
 * @returns Descrição legível da recorrência
 */
export function formatRRuleToText(
  rruleString: string,
  options: RRuleFormatOptions = {}
): string {
  try {
    // Normaliza quebras de linha (tanto \n literal quanto reais)
    const normalizedRRule = rruleString
      .replace(/\\n/g, "\n") // Converte \n literal para quebra real
      .replace(/\r?\n/g, "\n") // Normaliza quebras de linha
      .trim();

    // Parse da RRULE
    const rule = rrulestr(normalizedRRule);
    const opts = rule.origOptions;

    if (!opts) return "Recorrência inválida";

    const parts: string[] = [];

    // Frequência base
    if (opts.freq !== undefined) {
      const freqText = formatFrequency(opts.freq, opts.interval || 1);
      parts.push(freqText.charAt(0).toUpperCase() + freqText.slice(1));
    }

    // Dias da semana (para weekly)
    if (opts.byweekday && Array.isArray(opts.byweekday)) {
      const weekdaysText = formatWeekdays(opts.byweekday);
      if (weekdaysText) parts.push(weekdaysText);
    }

    // Dia do mês
    if (opts.bymonthday) {
      const bymonthday = Array.isArray(opts.bymonthday)
        ? opts.bymonthday
        : [opts.bymonthday];
      const monthDayText = formatByMonthDay(bymonthday);
      if (monthDayText) parts.push(monthDayText);
    }

    // Posição na semana/mês
    if (opts.bysetpos) {
      const bysetpos = Array.isArray(opts.bysetpos)
        ? opts.bysetpos
        : [opts.bysetpos];
      const setPosText = formatBySetPos(bysetpos);
      if (setPosText) parts.push(setPosText);
    }

    // Mês específico (para yearly)
    if (opts.bymonth) {
      const bymonth = Array.isArray(opts.bymonth)
        ? opts.bymonth
        : [opts.bymonth];
      const monthText = formatByMonth(bymonth);
      if (monthText) parts.push(monthText);
    }

    let result = parts.join(" ");

    // Limitações
    const limitations: string[] = [];

    if (opts.count) {
      limitations.push(
        `por ${opts.count} ${opts.count === 1 ? "vez" : "vezes"}`
      );
    }

    if (opts.until) {
      const untilDate = formatDate(opts.until, options.dateFormat);
      limitations.push(`até ${untilDate}`);
    }

    if (limitations.length > 0) {
      result += `, ${limitations.join(" ou ")}`;
    }

    // Data de início
    if (opts.dtstart && normalizedRRule.includes("DTSTART")) {
      const startDate = formatDate(opts.dtstart, options.dateFormat);
      result += `. Começando em ${startDate}`;
    }

    return result;
  } catch (error) {
    console.error("Erro ao formatar RRULE:", error);
    return "Formato de recorrência inválido";
  }
}

/**
 * Extrai apenas a parte RRULE de uma string que pode conter DTSTART
 * @param rruleString - String completa
 * @returns Apenas a parte RRULE
 */
export function extractRRuleOnly(rruleString: string): string {
  const normalizedString = rruleString.replace(/\\n/g, "\n");
  const lines = normalizedString.split(/\r?\n/);
  const rruleLine = lines.find((line) => line.startsWith("RRULE:"));
  return rruleLine ? rruleLine.replace("RRULE:", "") : rruleString;
}

/**
 * Extrai a data de início (DTSTART) de uma string RRULE
 * @param rruleString - String completa
 * @returns Data de início ou null
 */
export function extractDTStart(rruleString: string): Date | null {
  try {
    const normalizedString = rruleString.replace(/\\n/g, "\n");
    const lines = normalizedString.split(/\r?\n/);
    const dtstartLine = lines.find((line) => line.startsWith("DTSTART:"));

    if (!dtstartLine) return null;

    const dateStr = dtstartLine.replace("DTSTART:", "");

    // Formato: YYYYMMDDTHHMMSSZ ou similar
    if (dateStr.endsWith("Z")) {
      const year = parseInt(dateStr.slice(0, 4));
      const month = parseInt(dateStr.slice(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.slice(6, 8));
      const hour = parseInt(dateStr.slice(9, 11));
      const minute = parseInt(dateStr.slice(11, 13));
      const second = parseInt(dateStr.slice(13, 15));

      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    return new Date(dateStr);
  } catch (error) {
    console.error("Erro ao extrair DTSTART:", error);
    return null;
  }
}

// Exemplos de uso:
// formatRRuleToText("DTSTART:20251019T160000Z\nRRULE:FREQ=HOURLY;INTERVAL=1;COUNT=10;UNTIL=20251021T030000Z;BYDAY=MO,TU,WE;WKST=SU")
// => "A cada hora às seg, ter e qua, por 10 vezes até 21 de outubro de 2025 06:00. Começando em 19 de outubro de 2025 19:00"
