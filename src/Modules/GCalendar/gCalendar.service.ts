import { BaseService } from '../Shared/base.service';
import CalendarModel, { ICalendarModel } from '../../Database/models/Calendar.model';
import database from '../../Database';
import User from '../../Database/models/User.model';

// @ts-ignore
export default class CalendarModelService extends BaseService<CalendarModel, string> {
  constructor(calendarModel = database.getRepository(CalendarModel)) {
    super(calendarModel);
  }

  private defaultInclude = [
    {
      model: User,
    },
  ];

  async findOrCreateCalendarModel(calendarModel: ICalendarModel): Promise<{ isNew: boolean; calendar: CalendarModel }> {
    const [createdCalendarModel, isNew] = await this.model.findOrCreate<CalendarModel>({
      where: { id: calendarModel.id as number },
      defaults: calendarModel,
    });
    return {
      isNew,
      calendar: createdCalendarModel.get() as CalendarModel,
    };
  }

  async findCalendarModelById(id: string) {
    return await this.findById(id, this.defaultInclude);
  }

  deleteRecursionCalendar(recursionId: string) {
    return this.model.destroy({ where: { recursionId }, force: true });
  }

  // async findCalendarModelByUserId(id: number) {
  //   return await this.findOneByProp({ prop: 'eventId', value: id });
  // }

  // async findCalendarByEventId(event_id: string) {
  //   return await this.findOneByProp({ prop: 'eventId', value: event_id });
  // }
}

export const calendarModelService = new CalendarModelService();
