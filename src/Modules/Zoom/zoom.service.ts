import { BaseService } from '../Shared/base.service';
import Zoom, { IZoom } from '../../Database/models/Zoom.model';
import database from '../../Database';
import { differenceInMinutes } from 'date-fns';
class ZoomService extends BaseService<Zoom, number> {
  constructor(zoom = database.getRepository(Zoom)) {
    super(zoom);
  }

  async storeZoomCredentials(userId: number, data: IZoom): Promise<void> {
    const zoom = await this.model.findOne({ where: { userId } });
    if (zoom) {
      await this.model.update(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          zoomId: data.zoomId,
        },
        { where: { userId }, returning: true },
      );
    } else {
      await this.model.create({
        userId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        zoomId: data.zoomId,
      });
    }
  }

  async updateZoomCredentials(userId: number, data: IZoom) {
    return this.model.update(data, { where: { userId } });
  }

  async checkIfUserIntegratedZoom(userId: number) {
    return (await this.model.findOne({ where: { userId } })) !== null;
  }

  async checkIfAccessTokenIsValid(
    userId: number,
  ): Promise<{ valid: boolean; refresh_token?: string; access_token?: string }> {
    const result = await this.model.findOne({
      where: { userId },
      attributes: ['updatedAt', 'refreshToken', 'accessToken'],
    });
    const difference = differenceInMinutes(new Date(), new Date(result?.updatedAt));

    return difference > 60
      ? { valid: false, refresh_token: result?.refreshToken }
      : { valid: true, access_token: result?.accessToken };
  }

  async getZoomId(userId: number): Promise<string | undefined | null> {
    const result = await this.model.findOne({
      where: { userId },
      attributes: ['zoomId'],
    });
    return result?.zoomId;
  }
}

export const zoomService = new ZoomService();
