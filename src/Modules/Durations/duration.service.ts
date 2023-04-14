import { BaseService } from '../Shared/base.service';
import Duration from '../../Database/models/Duration.model';
import database from '../../Database';
import { IDuration } from '../../Database/models/Duration.model';

export default class DurationService extends BaseService<Duration, number> {
  constructor(duration = database.getRepository(Duration)) {
    super(duration);
  }

  async createDuration(duration: IDuration): Promise<Duration> {
    const createdDuration = await this.model.create(duration);
    return createdDuration.get() as Duration;
  }

  async checkIfContains(container: IDuration, content: IDuration) {
    return (
      Date.parse(container.from.toISOString()) <= Date.parse(content.from.toISOString()) &&
      Date.parse(container.to.toISOString()) >= Date.parse(content.from.toISOString())
    );
  }

  async updateDuration(id: number, data: any) {
    return this.update(id, { from: new Date(data.startTime), to: new Date(data.endTime) }, { returning: true });
  }

  async deleteDuration(id: number) {
    return this.model.destroy({ where: { id } });
  }
}

export const durationService = new DurationService();
