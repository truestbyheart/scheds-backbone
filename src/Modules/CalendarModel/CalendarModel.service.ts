import { BaseService } from '../Shared/base.service';
import CalendarModel, { ICalendarModel } from '../../Database/models/Calendar.model';
import database from '../../Database';

// @ts-ignore
class CalendarModelService extends BaseService<CalendarModel, string> {
  constructor(calModel = database.getRepository(CalendarModel)) {
    super(calModel);
  }

  async createCalendar(calendar: ICalendarModel): Promise<{ isNew: boolean; calendar: ICalendarModel }> {
    const [createdCalendar, isNew] = await this.model.findOrCreate({
      where: { calendarId: calendar.calendarId as string },
      defaults: calendar,
    });
    return {
      isNew,
      calendar: createdCalendar,
    };
  }

  async updateCalendar(id: string, data: any) {
    return this.update(id, data, { returning: true });
  }

  getCalendarInfoFromRecursionId(recursionId: string) {
    return this.model.findOne({
      where: { recursionId },
      attributes: ['calendarId', 'summary'],
    });
  }
}

export const calendarModelService = new CalendarModelService();
