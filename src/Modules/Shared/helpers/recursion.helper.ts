import { User } from '../../../Database';

export const getHostId = async (email: string): Promise<any> => {
  return (await User.findOne({ where: { email } }))?.id;
};
