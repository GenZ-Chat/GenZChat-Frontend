import { Socket,io } from "socket.io-client";
import { CreateMessageDto } from "../model/create_message_dto";

export class ChatService {
  private socket: Socket;

  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.socket = io("http://localhost:9060/chat", {
      query: {
        userId: this.userId
      }
    });
  }



    public connect(userId:string) {    
       this.socket = io("http://localhost:9060/chat", {
      query: {
        userId: userId
      }
    });
        this.socket.connect();
    }

  

  public sendMessage(messageDto:CreateMessageDto) {

    this.socket.emit("events", messageDto.convertToJson());
  }

  public sendGroupMessage(message:string, groupId:string) {
    this.socket.emit("sendGroupMessage", {message:message,groupId:groupId});
  }

  public receiveGroupMessage(callback: (message: string) => void) 
  {
    
    this.socket.on("receiveGroupMessage", callback);
  }

  public onMessage(callback: (message: CreateMessageDto) => void) {
    this.socket.on("events", callback);
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}
