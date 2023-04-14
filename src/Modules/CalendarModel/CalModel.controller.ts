import { NextFunction, Request, Response } from 'express';
import { GoogleCalendar } from '../GCalendar';
import { colorsService } from '../Colors/colors.service';
import { OK } from 'http-status';

class CalModelController {
  async getCalendarList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        // @ts-ignore
        data: { gRefreshToken },
      } = req;
      const calendar = new GoogleCalendar(gRefreshToken);
      const list = await calendar.getAllCalendarsList();
      let calendarList: any[] = [];
      list?.map((l) => {
        calendarList = [...calendarList, { id: l.id, summary: l.summary }];
      });
      res.status(OK).json({
        status: OK,
        list: calendarList,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCalendarColors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const colorList = await colorsService.getAllcolors();
      res.status(OK).json({
        status: OK,
        colors: colorList,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CalModelController();
