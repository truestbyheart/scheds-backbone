import { NextFunction, Request, Response } from 'express';
import { recursionService } from './recursion.service';
import { CREATED, OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status';
import { eventService } from '../Events/events.service';
import { v4 as uuid } from 'uuid';
import { calendarModelService } from '../CalendarModel/CalendarModel.service';
import { questionService } from '../Questions/question.service';
import { IRecursion } from '../../Database/models/Recursion.model';
import ApiError from '../Shared/helpers/ApiError.helper';
import { EventBuilder, recursionUpdateFlow } from './recursion.helper';
import { updateRecursionQn } from '../ResponseT/qn.helper';
import logger from '../../config/logger.config';

class RecursionController {
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { id },
      } = req;

      const event = await recursionService.getOne(id);
      return res.status(OK).json(event);
    } catch (e) {
      return next(e);
    }
  }

  /**
   *
   * @Author Daniel Mwangila
   * @description This controller retrieve all the recursion with events and relative details.
   * @param req
   * @param res
   * @param next
   */
  async getPaginated(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        query: { page = 1, limit = 10, q },
        // @ts-ignore
        data: { id },
      } = req;

      // get the paginated data from the db
      const pagedResult = await recursionService.getPaginateRecursions(
        id,
        limit as number,
        page as number,
        q as string | undefined,
      );

      // proper response of there is no data on specified page
      if (pagedResult.pageMeta.page < page) {
        return res.status(OK).json({
          status: OK,
          message: 'There is no data on the requested page',
        });
      }

      // if the search result is empty
      if (q && pagedResult.data.length === 0) {
        return res.status(NOT_FOUND).json({
          status: NOT_FOUND,
          isSearching: true,
          message: 'There is no data matching the search parameters',
        });
      }

      // if there is no event created by the client
      if (pagedResult.data.length === 0) {
        return res.status(NOT_FOUND).json({
          status: NOT_FOUND,
          message: 'You have no event at the moment',
        });
      }

      // if all is well we return the data
      return res.status(OK).json(pagedResult);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @Author: Daniel Charles Mwangila
   * @Description this is the method used for the creation of the event in the recursion format.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { details, events: eventArray, questions = [] },
        data: { id: creator },
        query: { manageeId, workspaceId },
      } = req;

      logger.debug(JSON.stringify(req.body, null, 3));

      // store the calendar info
      const {
        calendar: { id },
      } = await calendarModelService.createCalendar({
        calendarId: details.calendar.id,
        summary: details.calendar.summary,
      });

      // store the recursion info and get the id
      const recursionBody: IRecursion = {
        id: uuid(),
        title: details.title,
        description: details.description,
        creator,
        colorId: details.colorId,
        calendarId: id,
        location: details.location,
      };

      if (manageeId !== 'undefined') recursionBody.manageeId = Number(manageeId);
      if (workspaceId !== 'undefined') recursionBody.workspaceId = workspaceId as string;

      // store the recursion info
      const recursionId = (await recursionService.createRecursion(recursionBody)).id;

      // creating events
      await Promise.all([EventBuilder(eventArray, recursionId)]);

      // questions
      await Promise.all(
        questions.map(async (qn: { inquiry: string }) => {
          await questionService.createQuestion({
            inquiry: qn.inquiry,
            recursionId,
          });
        }),
      );

      res.status(CREATED).json({
        status: CREATED,
        message: 'Event created successfully',
        id: recursionId,
      });
    } catch (error) {
      return next(new ApiError(INTERNAL_SERVER_ERROR, 'Failed to create recursion', false, error));
    }
  }

  async deleteRecursion(req: Request, res: Response) {
    const {
      params: { id },
    } = req;

    await recursionService.deleteRecursion(id);
    return res.status(OK).json({ status: OK, message: 'Recursion Deleted successfully' });
  }

  async update(req: Request, res: Response) {
    const {
      body: { details, questions, time },
      params: { id },
    } = req;

    // // 1. update recursion
    // // TODO: work on updating calendar
    // await recursionService.updateRecursion(id, { ...details });
    // 1. update time
    await eventService.updateRecursionEvents(time, id);
    // 2. update questions
    await updateRecursionQn(questions, id);
    // 3. update recursion details and update calendar
    await recursionUpdateFlow(id, details);

    return res.status(OK).json({ status: OK, message: 'Recursion updated successfully' });
  }
}

export const recursionController = new RecursionController();
