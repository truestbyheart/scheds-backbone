import { BaseService } from '../Shared/base.service';
import database from '../../Database';
import ResponseT from '../../Database/models/Response.model';

class ResponseService extends BaseService<ResponseT, string> {
  constructor(response = database.getRepository(ResponseT)) {
    super(response);
  }

  deleteResponse(userId: number) {
    return this.model.destroy({ where: { responder: userId }, force: true });
  }
}

export const responseService = new ResponseService();
