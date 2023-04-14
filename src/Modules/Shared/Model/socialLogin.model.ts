export interface Socialusers {
  provider: string;
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  token?: string;
  type: string;
  gRefreshToken?: string;
}

export interface UserModel {
  id: number;
  name: string;
  email: string;
  photoUrl: string;
}

export interface IRefreshTokenHTTPResponse {
  status: number;
  credentials: {
    access_token: string;
    refresh_token: string;
  };
  user: Socialusers;
}
