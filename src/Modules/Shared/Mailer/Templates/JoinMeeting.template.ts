import { FRONTEND_URL } from '../../../../config/config';

export interface InviteFriend {
  template: string;
  title: string;
  description: string;
  invitees: {
    invitor: string;
    invitee: string;
    eventId: string;
    meetingId: number;
    time: {
      start: Date;
      end: Date;
    };
  }[];
}

export interface FriendInfo {
  template: string;
  title: string;
  description: string;
  invitor: string;
  invitee: string;
  eventId: string;
  meetingId: number;
  time: {
    start: Date;
    end: Date;
  };
}

export default (data: FriendInfo) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> 
  <link href="https://fonts.googleapis.com/css2?family=Lato&family=Montserrat&family=Open+Sans:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Roboto&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.13.0/css/all.css">
  <style>
    html {
     font-size: calc(16px + (24px - 16px) *(100vw - 400px)/(800 - 400));
    }
    
   body {
  font-family: 'Open Sans', 'Lato', 'Montserrat', 'Roboto', sans-serif;
  line-height: 1.0;
  font-weight: 400;
}
    .container,
    .container-fluid,
    .container-sm,
    .container-md,
    .container-lg,
    .container-xl,
    .container-xxl {
      width: 100%;
      padding-right: 1rem;
      padding-left: 1rem;
      margin-right: auto;
      margin-left: auto;
    }

    @media (min-width: 576px) {

      .container,
      .container-sm {
        max-width: 540px;
      }
    }

    @media (min-width: 768px) {

      .container,
      .container-sm,
      .container-md {
        max-width: 720px;
      }
    }

    @media (min-width: 992px) {

      .container,
      .container-sm,
      .container-md,
      .container-lg {
        max-width: 960px;
      }
    }

    @media (min-width: 1200px) {

      .container,
      .container-sm,
      .container-md,
      .container-lg,
      .container-xl {
        max-width: 1140px;
      }
    }

    @media (min-width: 1400px) {

      .container,
      .container-sm,
      .container-md,
      .container-lg,
      .container-xl,
      .container-xxl {
        max-width: 1320px;
      }
    }

    .btn {
      display: inline-block;
      font-weight: 400;
      line-height: 1.5;
      color: #212529;
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-color: transparent;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .btn-dark {
      color: #fff;
      background-color: #343a40;
      border-color: #343a40;
    }

    .btn-dark:hover {
      color: #fff;
      background-color: #23272b;
      border-color: #1d2124;
    }

    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 0;
      word-wrap: break-word;
      background-color: #fff;
      background-clip: border-box;
      border: 1px solid rgba(0, 0, 0, 0.125);
      border-radius: 0.25rem;
    }

    .card-body {
      flex: 1 1 auto;
      padding: 1rem 1rem;
    }

    .card-title {
      margin-bottom: 0.5rem;
    }

    .card-subtitle {
      margin-top: -0.25rem;
      margin-bottom: 0;
    }

    .card-text:last-child {
      margin-bottom: 0;
    }

    .card-link:hover {
      text-decoration: none;
    }

    .card-link+.card-link {
      margin-left: 1rem;
    }

    .card-header {
      padding: 0.5rem 1rem;
      margin-bottom: 0;
      background-color: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    }

    .card-header:first-child {
      border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
    }
      .w-25 {
  width: 25% !important;
}

.w-50 {
  width: 50% !important;
}

.w-75 {
  width: 75% !important;
}

.w-100 {
  width: 100% !important;
}

.w-auto {
  width: auto !important;
}
    .align-middle {
  vertical-align: middle !important;
}
  </style>
</head>
<body>
   <div class="container">
    <div class="card w-50 ">
      <div class="card-body">
        <h2 class="card-title">Invitation to join a meeting</h2>
        <p><b>${data.invitor}</b> has invited you to join a meeting workspace.</p>
        <div class="card">
        <div class="card-header">
        <p><b>Title: </b>${data.title}</p>
        <p>${data.description}</p>
</div>
<div class="card-body">
<span><b>Time:</b>&nbsp; ${new Date(data.time.start)} - ${new Date(data.time.end)}</span>
</div>
</div>
        <div class="w-100" style="text-align: center">
           <a class="btn btn-dark card-link w-50" href="${`${FRONTEND_URL}/client/join?invitee=${data.invitee}&eventId=${data.eventId}&meetingId=${data.meetingId}`}">Accept</a>
        </div>
      </div>
    </div>
  </div>
  </body>
</html>
  `;
