import { FriendStatus } from "./friend_model";

export interface UserModel {
    id: string;
    name: string;
    email: string;
    status: FriendStatus;
}
