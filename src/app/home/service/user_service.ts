import { FriendModel } from "../model/friend_model";
import {auth} from "@/auth";

export class UserService {
    private baseUrl: string;

    constructor(userId?: string) {
        if (userId) {
            this.baseUrl = `http://localhost:9060/api/users/${userId}`;
        } else {
            this.baseUrl = '';
        }
    }

    public async setUserId(userId: string) {
        this.baseUrl = `http://localhost:9060/api/users/${userId}`;
    }

    public async getFriends(): Promise<FriendModel[]> {
        if (!this.baseUrl) {
            throw new Error('User ID not set. Cannot fetch friends.');
        }
        
        const response: Response = await fetch(`${this.baseUrl}/friends`);
        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        const friends: FriendModel[] = await response.json();
        return friends;
    }
}