// import { IZoomMeeting } from '../../Zoom/zoom.helper';
// import { managesService } from '../../Manages/manages.service';
// import { Request, Response, NextFunction } from 'express';
// import { BAD_REQUEST, UNAUTHORIZED } from 'http-status';
// import { differenceInMinutes } from 'date-fns';
// import catchAsync from './errorHandler.middleware';
// import ApiError from '../helpers/ApiError.helper';
//
// export interface IRecursionRequest extends Request {
//   linkId: number;
// }
//
// export const eventManagement = catchAsync(async (req: IRecursionRequest, res: Response, next: NextFunction) => {
//   const {
//     body: {
//       details: { managed, title, description, location },
//       events,
//     },
//     // @ts-ignore
//     data: { id },
//   } = req;
//
//   // check if the meeting will require a zoom link or not
//   if (location === 'meet') return next();
//
//   // create a meeting payload
//   let linkId: number | null;
//   const meetingDuration = differenceInMinutes(new Date(events[0].time.to), new Date(events[0].time.from));
//   const meetingPayload: IZoomMeeting = {
//     topic: title,
//     start_time: new Date(events[0].time.from).toISOString(),
//     duration: meetingDuration,
//     type: 2,
//     password: `connect123`,
//     agenda: description,
//   };
//
//   // If the managed state is false we continue to controller
//   if (managed === false) {
//     try {
//       linkId = await managesService.generateMeetingLink(id, meetingPayload);
//
//       if (linkId != null) {
//         // pass it with the request object
//         req.linkId = linkId;
//         return next();
//       }
//
//       return new ApiError(BAD_REQUEST, 'Failed to create a meeting link');
//     } catch (e) {
//       console.log(e);
//       return new ApiError(UNAUTHORIZED, 'Error: failed to create a zoom meeting link', true, e);
//     }
//   } else {
//     const { manager, managee } = req.body.zoomDetails;
//     // STEP 1: check if the manager has authority to manage the manageee.
//     linkId = await managesService.generateManageeMeetingLink(Number(manager), Number(managee), meetingPayload);
//
//     // STEP 2: check if the user is allowed to manage the user
//     if (linkId === null) {
//       return new ApiError(UNAUTHORIZED, 'You have no permission to create meeting for this user.');
//     }
//     req.linkId = linkId;
//
//     return next();
//   }
// });
