
import {auth} from "@/auth";
import { ChatModel } from "../model/chat_model";
import { UpdateUserDto } from "../model/user_model";
import { api } from "@/app/config/api_config";

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

    public async updateUser(userId: string, updateData: UpdateUserDto): Promise<any> {
        try {
            const response = await api.patch(`/users/${userId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    
}

export const userService = new UserService();