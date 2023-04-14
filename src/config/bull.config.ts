import Bull, { DoneCallback, Job } from 'bull';
import { REDIS_URL } from './config';
// import { setQueues } from 'bull-board';

export const EmailNotification = new Bull('email notification', { redis: REDIS_URL });
export const ClearCalendar = new Bull('Clear Calendar', { redis: REDIS_URL });
export const workspaceInviteNotification = new Bull('workspace invites', { redis: REDIS_URL });
export const joinMeetingNotification = new Bull('join Invites', { redis: REDIS_URL });

EmailNotification.process(async (job, done) => {
  // await sendBulkEmailNotification(job.data);
  done();
});

workspaceInviteNotification.process(async (job: Job, done: DoneCallback) => {
  // await workspaceInviteWorker(job.data);
  done();
});

// joinMeetingNotification.process(async (job, done) => {
//   //await sendJoinInvitations(job.data);
// });

ClearCalendar.process(async (job, done) => {
  // await calendarClearance(job.data);
  done();
});

interface IConsumer {
  className: any;
  method: string;
}

export interface IBackground {
  taskId: string;
  data: any;
  consumerFn: IConsumer;
}

// let tasks: any = [];

export async function runInBackground<T extends IBackground>(args: T): Promise<void> {
  // initiate bull
  const job = new Bull(args.taskId, { redis: REDIS_URL });

  // add the data to be processed
  await job.add(args.data);

  // bull board monitoring
  // tasks = [...tasks, job];
  // setQueues(tasks);

  // process the job in the background
  await job.process(async (job: Job<T>, done: DoneCallback) => {
    await args.consumerFn.className[args.consumerFn.method](job);
    done();
  });
}
