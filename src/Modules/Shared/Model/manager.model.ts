import { PageMeta } from './pageMeta.model';
import { UserModel } from './socialLogin.model';

export interface Managee {
  id: number;
  manager: number;
  managee: number;
}

export interface ManageeList {
  data: {
    id: number;
    manager: number;
    managee: number;
    controlled: UserModel;
  }[];
  pageMeta: PageMeta;
}

export interface ManagerRequestResponse {
  status: number;
  message: string;
  link: string;
}
