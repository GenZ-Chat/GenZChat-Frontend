import { UserModel } from "./user_model";

export enum ChatType {
    DIRECT = "direct",
    GROUP = "group"
}

export interface ChatModel{
    id:string;
    users: UserModel[] | UserModel;
    type: ChatType;
    group?: GroupModel;
}

export interface GroupModel{
    name:string;
    description:string;
    image?:string
}