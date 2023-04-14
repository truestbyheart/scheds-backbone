import MailerService, { ISender } from '../Mailer';
import { Job } from 'bull';
import async from 'async';

export interface IWorkspaceInvite {
  members: Array<ISender>;
  workspaceName: string;
  description: string;
}

export interface IFriendlyInvite {
  guests: ISender[];
  title: string;
  description: string;
  photoUrl: string;
  slot: { from: string; to: string };
  user: { name: string; email: string };
  meeting: { recursionId: string; meetingId: number };
}

class EmailWorker extends MailerService {
  async testEmailService(job: Job<Array<ISender>>) {
    // progress variables
    const size = job.data.length;
    let increment = 1;

    // progress initiation
    await job.progress(0);

    // looping through the data
    await async.each(job.data, async (person, _callback) => {
      try {
        await this.testEmail(person);
        await job.progress((increment / size) * 100);
        increment++;
      } catch (error) {
        // await job.progress((increment / size) * 100);
        // increment++;
        // callback();
        console.log(error);
      }
    });
  }

  async sendWorkspaceInvites(job: Job<IWorkspaceInvite>): Promise<void> {
    console.log(job.data);
    const { members, description, workspaceName } = job.data;
    // progress variables
    const size = members.length;
    let increment = 1;

    // progress initiation
    await job.progress(0);

    // looping through the data
    await async.each(members, async (person, callback) => {
      try {
        await this.sendWorkspaceInvitation({ member: person, workspaceName, description });
        await job.progress((increment / size) * 100);
        increment++;
      } catch (error) {
        console.log(error);
        await job.progress((increment / size) * 100);
        increment++;
        callback();
      }
    });
  }

  async sendFriendlyInvitation(job: Job<IFriendlyInvite>): Promise<void> {
    const { guests, title, description, photoUrl, slot, user, meeting } = job.data;
    // progress variables
    console.log(guests);
    const size = guests.length;
    let increment = 1;

    // progress initiation
    await job.progress(0);

    // looper
    await async.each(guests, async (guest, callback) => {
      try {
        await this.sendFriendlyInvites({
          member: guest,
          title,
          description,
          photoUrl,
          slot,
          user,
          meeting: { ...meeting, email: guest.receiver },
        });
        await job.progress((increment / size) * 100);
        increment++;
      } catch (error) {
        console.log(error);
        await job.progress((increment / size) * 100);
        increment++;
        callback();
      }
    });
  }
}

export const emailWorker = new EmailWorker();
