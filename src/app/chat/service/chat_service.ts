
import { Socket,io } from "socket.io-client";
import { CreateMessageDto } from "../model/create_message_dto";
import { GroupCreateMessageDto } from "../model/group_create_message_dto";
import { CallModel } from "../model/call_model";
import { AnswerModel } from "../model/answer_model";

class ChatService {
  // ICE candidate exchange
  public sendIceCandidate(candidate: RTCIceCandidateInit, targetUserId: string) {
    this.socket?.emit("iceCandidate", { candidate, targetUserId });
  }

  public onIceCandidate(callback: (candidate: RTCIceCandidateInit, fromUserId: string) => void) {
    this.socket?.on("iceCandidate", (data: { candidate: RTCIceCandidateInit, fromUserId: string }) => {
      callback(data.candidate, data.fromUserId);
    });
  }
  private socket: Socket | null = null;
  private userId: string = "";


    public connect(userId: string) {

      this.userId = userId;

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
  

  public getUserId():string{
    return this.userId;
  }

  public sendMessage(messageDto:CreateMessageDto) {
    const messageData = messageDto.convertToJson();
    console.log('[CHAT SERVICE] Emitting sendDirectMessage:', {
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      hasContent: !!messageData.content,
      attachmentCount: messageData.attatchments?.length || 0,
      attachments: messageData.attatchments
    });
    this.socket?.emit("sendDirectMessage", messageData);
  }

  public sendGroupMessage(messageDto:GroupCreateMessageDto) {
    const messageData = messageDto.convertToJson();
    console.log('[CHAT SERVICE] Emitting sendGroupMessage:', {
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      hasContent: !!messageData.content,
      attachmentCount: messageData.attachments?.length || 0,
      attachments: messageData.attachments
    });
    this.socket?.emit("sendGroupMessage", messageData);
  }

  public receiveGroupMessage(callback: (message: string) => void) 
  {
    
    this.socket?.on("recieveGroupMessage", callback);
  }

  public onMessage(callback: (message: CreateMessageDto) => void) {
    this.socket?.on("receiveDirectMessage", callback);

  }

  // Call service 
  public callFriend(data:CallModel) {
    console.log('[ChatService] callFriend called with data:', data);
    console.log('[ChatService] Socket connected:', this.socket?.connected);
    console.log('[ChatService] Converting to JSON:', data.convertToJson());
    
    if (!this.socket?.connected) {
      console.error('[ChatService] Socket not connected, cannot send call');
      return;
    }
    
    this.socket.emit("callFriend", data.convertToJson());
    console.log('[ChatService] callFriend event emitted');
  }

  public onRecieveCall(callback: (message:any)=>void){
    console.log()
    this.socket?.on("callFriend",callback);
  }

  public answerCall(data:AnswerModel){
    this.socket?.emit("answerFriend",data.convertToJson());
  }

  public onAnswerCall(callback:(message:AnswerModel)=>void){
    this.socket?.on("answerFriend",callback);
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