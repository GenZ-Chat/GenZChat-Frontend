
import {auth} from "@/auth";
import { ChatModel } from "../model/chat_model";

 class UserService {
    private baseUrl: string | undefined;

  
    public async setUserId(userId: string) {
        this.baseUrl = `http://localhost:9060/api/chat?userId=${userId}`;
    }

    public async getUserId() {
        return this.baseUrl;
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

export const userService = new UserService();