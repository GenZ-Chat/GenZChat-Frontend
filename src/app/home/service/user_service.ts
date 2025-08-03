import { FriendModel } from "../model/friend_model";

export class UserService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'http://localhost:9060/api/users/688ca973240cb78b0cdec73c';
    }

    public async getFriends(): Promise<FriendModel[]> {
        const response: Response = await fetch(`${this.baseUrl}/friends`);
        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        const friends: FriendModel[] = await response.json();
        return friends;
    }
}