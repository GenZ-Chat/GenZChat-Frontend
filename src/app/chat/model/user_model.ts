import { FriendStatus } from "./friend_model";

export interface UpdateUserDto {
  name?: string;
  email?: string;
  googleUserId?: string;
  publicKey?: string;
  signedPublicKey?: string;
  signedKey?: string;
}

export interface UserModel {
    id: string;
    name: string;
    email: string;
    status: FriendStatus;
    publicKey?: string;
    signedPublicKey?: string;
    signedKey?: string;
}
