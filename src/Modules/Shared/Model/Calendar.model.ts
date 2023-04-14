export interface ICalendar {
  google: string;
  yahoo: string;
  outlook: string;
  ics: string;
}

export interface ICalendarColors {
  status: number;
  colors: {
    background: string;
    foreground: string;
  }[];
}

export interface ICalendarList {
  status: number;
  list: { id: string; summary: string }[];
}
