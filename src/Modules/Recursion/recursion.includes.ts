import User from '../../Database/models/User.model';
import Event from '../../Database/models/Event.model';
import Colors from '../../Database/models/Colors.model';
import Guest from '../../Database/models/Guest.model';

export const include = {
  paginatedRecursion: [
    { model: Event, attributes: [], include: [{ model: User, attributes: [] }] },
    { model: Guest, attributes: [] },
    { model: Colors, attributes: [] },
  ],
  minimalInclude: [
    {
      model: User,
      attributes: ['name', 'email', 'photoUrl'],
    },
  ],
};
