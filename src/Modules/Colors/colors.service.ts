import { BaseService } from '../Shared/base.service';
import Colors from '../../Database/models/Colors.model';
import database from '../../Database';

class ColorsService extends BaseService<Colors, number> {
  constructor(colors = database.getRepository(Colors)) {
    super(colors);
  }

  async getAllcolors() {
    return this.model.findAll({ attributes: ['id', 'background', 'foreground'] });
  }
}

export const colorsService = new ColorsService();
