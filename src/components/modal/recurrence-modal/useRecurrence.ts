import { Options, RRule, Weekday, rrulestr } from "rrule";
import { RecurrenceForm } from "./recurrence.schema";

const toWeekday = (code: string): Weekday => {
  switch (code) {
    case "MO":
      return RRule.MO;
    case "TU":
      return RRule.TU;
    case "WE":
      return RRule.WE;
    case "TH":
      return RRule.TH;
    case "FR":
      return RRule.FR;
    case "SA":
      return RRule.SA;
    case "SU":
    default:
      return RRule.SU;
  }
};

export function parseRRuleToForm(initialRRule?: string) {
  if (!initialRRule) return {} as Partial<RecurrenceForm>;
  try {
    const rule = rrulestr(initialRRule) as RRule;
    const o = rule.origOptions as any;
    const form: Partial<RecurrenceForm> = {};
    if (o.freq === RRule.HOURLY) form.freq = "HOURLY";
    else if (o.freq === RRule.DAILY) form.freq = "DAILY";
    else if (o.freq === RRule.WEEKLY) form.freq = "WEEKLY";
    else if (o.freq === RRule.MONTHLY) {
      form.freq = "MONTHLY";
    } else if (o.freq === RRule.YEARLY) form.freq = "YEARLY";
    if (o.interval) form.interval = o.interval;
    if (o.count) form.count = o.count;
    if (o.until) form.until = new Date(o.until).toISOString().slice(0, 16);
    if (o.byweekday) {
      const arr = Array.isArray(o.byweekday) ? o.byweekday : [o.byweekday];
      form.byweekday = arr.map((w: any) => (w as Weekday).toString());
    }
    if (o.bymonthday)
      form.bymonthday = Array.isArray(o.bymonthday)
        ? o.bymonthday[0]
        : (o.bymonthday as number);
    if (o.bysetpos)
      form.bysetpos = Array.isArray(o.bysetpos)
        ? o.bysetpos[0]
        : (o.bysetpos as number);
    if (o.bymonth)
      form.bymonth = Array.isArray(o.bymonth)
        ? o.bymonth[0]
        : (o.bymonth as number);
    return form;
  } catch {
    return {} as Partial<RecurrenceForm>;
  }
}

export function buildRRuleFromForm(
  data: RecurrenceForm,
  dtstart?: Date
): string {
  const options: Partial<Options> = {
    freq:
      data.freq === "HOURLY"
        ? RRule.HOURLY
        : data.freq === "DAILY"
        ? RRule.DAILY
        : data.freq === "WEEKLY"
        ? RRule.WEEKLY
        : data.freq === "MONTHLY"
        ? RRule.MONTHLY
        : RRule.YEARLY,
    interval: Number(data.interval) || 1,
    dtstart: dtstart || new Date(),
  };

  // For quarterly or semiannual, use MONTHLY with interval 3 or 6 via UI interval

  if (data.count) options.count = Number(data.count);
  if (data.until) options.until = new Date(data.until);
  if (data.byweekday) {
    const weekdays = Array.isArray(data.byweekday)
      ? data.byweekday
      : [data.byweekday];
    if (weekdays.length) options.byweekday = weekdays.map(toWeekday);
  }
  if (data.bymonthday) options.bymonthday = Number(data.bymonthday);
  if (data.bysetpos) options.bysetpos = Number(data.bysetpos);
  if (data.bymonth) options.bymonth = Number(data.bymonth);
  (options as any).wkst = RRule.SU; // assume Sunday

  const rule = new RRule(options as Options);
  return rule.toString();
}
