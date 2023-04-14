import { TokenPayload } from '../../Modules/Shared/helpers/token.helper';
import Recursion from '../../Database/models/Recursion.model';
import Meeting from '../../Database/models/Meeting.model';

declare global {
  namespace Express {
    interface Request {
      data: TokenPayload;
      session: { token: string; reason: number };
      info: {
        recursion: Recursion;
        meeting: Meeting;
        host: { id: number; name: string; email: string };
        gRefreshToken: string | null;
        toBeIncluded: 'manager' | 'managee';
      };
    }
  }
}
