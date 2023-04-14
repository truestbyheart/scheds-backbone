import { FRONTEND_URL } from '../../../../config/config';
import moment from 'moment';

export default (userData: any) => {
  const {
    event_id,
    title: event_title,
    description: event_description,
    duration: { endTime, startTime },
    reason,
  } = userData;
  return `
     <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <tr>
          <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
          <td class="logo" style="text-align: center;">
            <h1 class="primary-color"><a href="#">Connectedly</a></h1>
          </td>
          </tr>
          </table>
          </td>
      </tr><!-- end tr -->
<tr>
          <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="padding: 0 2.5em; text-align: center; padding-bottom: 3em;">
            <div class="text">
            <h2>Event Reschedule Notification</h2>
            <p style="font-size: 14px; text-align: justify; background: #eee; padding: 2%; color: #000">
              <span style="font-weight: bolder"> Reason: &nbsp;</span>${reason}
             </p>
            </div>
            </td>
            </tr>
            <tr>
          <td style="text-align: center;">
          <div class="text-author">
          <h3 class="name"><span style="font-weight: bolder">Event Title: &nbsp;</span>${event_title}</h3>
          <p style="text-align: justify"> <span style="font-weight: bolder">Description: &nbsp;</span>${event_description}</p>
          <span class="position">
          <span style="font-weight: bolder">Date: ${moment(startTime).format('Do MMM YYY')} - </span>
         <span style="font-weight: bolder"> ${moment(startTime).format('h:mm a')} ~ ${moment(endTime).format(
    'h:mm a',
  )}</span>
          </span>
           <p><a href="${FRONTEND_URL}/client/event/${event_id}" class="btn btn-black-outline">Reschedule</a></p>
           </div>
          </td>
        </tr>
            </table>
          </td>
      </tr><!-- end tr -->
      <!-- 1 Column Text + Button : END -->
      </table>
  `;
};
