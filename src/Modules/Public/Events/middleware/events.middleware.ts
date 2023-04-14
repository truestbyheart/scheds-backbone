// import { Request, Response, NextFunction } from 'express';
// import { CONFLICT, INTERNAL_SERVER_ERROR } from 'http-status';
// import { decode } from 'jsonwebtoken';
// import { recursionService } from '../../../Recursion/recursion.service';
// import { meetingService } from '../../../Meetings/Meeting.service';
// import { guestsService } from '../../../Guests/guest.service';
// import { generateCalendarLinks } from '../../../Shared/helpers/calendarLink.generator';
// import { FRONTEND_URL } from '../../../../config/config';
// import format from 'date-fns/format';
//
// export async function getEventDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const {
//       params: { token },
//     } = req;
//
//     const data: any = decode(token);
//
//     const recursionData = await recursionService.getBookingInfo(data.recursionId as string);
//     const meetingData = await meetingService.getBookingInfo(data.meetingId as number);
//     console.log({ recursion: recursionData, meeting: meetingData, client: data.email ? data.email : null });
//     // @ts-ignore
//     req.info = { recursion: recursionData, meeting: meetingData, recursionId: data.recursionId, client: data.email };
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(INTERNAL_SERVER_ERROR).json({
//       status: INTERNAL_SERVER_ERROR,
//       message: 'Failure to gather event data',
//     });
//   }
// }
//
// export async function checkIfBooked(req: Request, res: Response, next: NextFunction): Promise<any> {
//   try {
//     const {
//       // @ts-ignore
//       info: {
//         meeting: { id, time },
//         recursion: { title, description, guests },
//         client,
//       },
//     } = req;
//
//     const slot: { date?: string; from?: string; to?: string } = {};
//     slot.date = format(new Date(time.from), 'EEEE d	MMMM yyy');
//     slot.from = format(new Date(time.from), 'hh:mm bbbb');
//     slot.to = format(new Date(time.to), 'hh:mm bbbb');
//
//     const exists = await guestsService.checkGuestExistance({ email: client, id });
//     if (exists) {
//       // generate calendar links
//       const calendarLinks = await generateCalendarLinks(time, title, description);
//       return res.status(CONFLICT).render('invite', {
//         hasBooked: true,
//         message: 'You Already booked the meeting',
//         frontend: FRONTEND_URL + '/auth/login',
//         title: title,
//         description: description,
//         date: slot.date,
//         from: slot.from,
//         to: slot.to,
//         calendarLinks,
//         year: new Date().getFullYear(),
//       });
//     }
//
//     return next();
//   } catch (error) {
//     console.log(error);
//     return res.status(INTERNAL_SERVER_ERROR).json({
//       status: INTERNAL_SERVER_ERROR,
//       message: 'Failure to check if user has booked',
//     });
//   }
// }
