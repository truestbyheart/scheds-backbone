// import format from 'date-fns/format';
// import { Request, Response } from 'express';
// import { INTERNAL_SERVER_ERROR } from 'http-status';
// import { FRONTEND_URL } from '../../../config/config';
// import db from '../../../Database';
// import { GoogleCalendar } from '../../GCalendar';
// import { guestsService } from '../../Guests/guest.service';
// import { meetingService } from '../../Meetings/Meeting.service';
// import { generateCalendarLinks } from '../../Shared/helpers/calendarLink.generator';
//
// class EventsController {
//   async acceptInvite(req: Request, res: Response): Promise<void> {
//     try {
//       const {
//         // @ts-ignore
//         info,
//       } = req;
//
//       // format date
//       const slot: { date?: string; from?: string; to?: string } = {};
//       slot.date = format(new Date(info.meeting.time.from), 'EEEE d	MMMM yyy');
//       slot.from = format(new Date(info.meeting.time.from), 'hh:mm bbbb');
//       slot.to = format(new Date(info.meeting.time.to), 'hh:mm bbbb');
//
//       // generate calendar links
//       const calendar = new GoogleCalendar(info.recursion.user.gRefreshToken);
//       const calendarLinks = await generateCalendarLinks(
//         info.meeting.time,
//         info.recursion.title,
//         info.recursion.description,
//       );
//
//       if (info.meeting.calendarState === null) {
//         const eventobj = await calendar.createEvent({
//           from: { time: info.meeting.time.from },
//           to: { time: info.meeting.time.to },
//           colorId: String(info.recursion.color.id),
//           description: info.recursion.description,
//           location: ' ',
//           summary: info.recursion.title,
//           calendarId: info.recursion.calendar.calendarId as string,
//           guests: [{ email: info.recursion.user.email }, { email: info.client }],
//         });
//
//         await db.transaction(async () => {
//           // update the meeting state and limit
//           await meetingService.updateMeeting(info.meeting.id, {
//             calendarState: 'created',
//             calmeetId: eventobj.id,
//           });
//
//           // create new guest
//           await guestsService.createGuest({
//             email: info.email,
//             meetingId: info.meeting.id,
//             recursionId: info.recursionId,
//           });
//         });
//       } else {
//         const updatedGuest = [...info.recursion.guests, { email: info.email }];
//         await calendar.addUpdates(info.recursion.calendar.calendarId, info.meeting.calmeetId, updatedGuest);
//
//         await db.transaction(async () => {
//           // create new guest
//           await guestsService.createGuest({
//             email: info.email,
//             meetingId: info.meeting.id,
//             recursionId: info.recursionId,
//           });
//         });
//       }
//
//       res.render('invite', {
//         hasBooked: false,
//         frontend: FRONTEND_URL + '/auth/login',
//         title: info.recursion.title,
//         description: info.recursion.description,
//         date: slot.date,
//         from: slot.from,
//         to: slot.to,
//         calendarLinks,
//         year: new Date().getFullYear(),
//       });
//     } catch (error) {
//       res.status(INTERNAL_SERVER_ERROR).json({
//         status: INTERNAL_SERVER_ERROR,
//         message: 'Failure to add',
//       });
//     }
//   }
// }
//
// export const eventsController = new EventsController();
