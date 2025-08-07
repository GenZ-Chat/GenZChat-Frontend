export enum FriendStatus {
    Online = 'online',
    Offline = 'offline',
}

export interface FriendModel {
    id: string;
    name: string;
    status: FriendStatus;
    googleUserId:string
}
