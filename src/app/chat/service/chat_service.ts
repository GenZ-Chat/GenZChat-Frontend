
import { Socket,io } from "socket.io-client";
import { CreateMessageDto } from "../model/create_message_dto";
import { GroupCreateMessageDto } from "../model/group_create_message_dto";

class ChatService {
  private socket: Socket | null = null;


    public connect(userId: string) {
        if (this.socket?.connected) {
            console.log("Socket already connected");
            return;
        }

        try {
            this.socket = io("http://localhost:9060/chat", {
                query: { userId },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });

            this.socket.on('connect', () => {
                console.log("Socket connected successfully");
            });

            this.socket.on('connect_error', (error) => {
                console.error("Socket connection error:", error);
            });

            this.socket.on('disconnect', (reason) => {
                console.log("Socket disconnected:", reason);
            });

            this.socket.connect();
        } catch (error) {
            console.error("Error creating socket connection:", error);
        }
    }

    getSocket():Socket | null{
        return this.socket;
    }
  

  public sendMessage(messageDto:CreateMessageDto) {

    this.socket?.emit("sendDirectMessage", messageDto.convertToJson());
  }

  public sendGroupMessage(messageDto:GroupCreateMessageDto) {
    this.socket?.emit("sendGroupMessage", messageDto.convertToJson());
  }

  public receiveGroupMessage(callback: (message: string) => void) 
  {
    
    this.socket?.on("recieveGroupMessage", callback);
  }

  public onMessage(callback: (message: CreateMessageDto) => void) {
    this.socket?.on("receiveDirectMessage", callback);

  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public offMessage() {
    this.socket?.off("receiveDirectMessage");
  }

  public offGroupMessage(callback: (message: string) => void) {
    this.socket?.off("recieveGroupMessage", callback);
  }


  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

}
//sing
export const chatService = new ChatService();