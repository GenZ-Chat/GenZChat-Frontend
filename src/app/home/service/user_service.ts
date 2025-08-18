import { ChatModel } from "../model/chat_model";
import { FriendModel } from "../model/friend_model";
import {auth} from "@/auth";

export class UserService {
    private baseUrl: string;

    constructor(userId?: string) {
        if (userId) {
            this.baseUrl = `http://localhost:9060/api/chat?userId=${userId}`;
        } else {
            this.baseUrl = '';
        }
    }

    public async setUserId(userId: string) {
        this.baseUrl = `http://localhost:9060/api/chat?userId=${userId}`;
    }

    public async getChats(): Promise<ChatModel[]> {
        if (!this.baseUrl) {
            throw new Error('User ID not set. Cannot fetch chats.');
        }
        
        const response: Response = await fetch(`${this.baseUrl}`);
        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        const friends: ChatModel[] = await response.json();
        return friends;
    }
}