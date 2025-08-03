import { Socket,io } from "socket.io-client";

export class ChatService {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:9060/chat",{
      query: {
        userId: "688ca973240cb78b0cdec73c"
      }
    });
  }
    public connect() {    
        this.socket.connect();
    }

  

  public sendMessage(message: string,receiver: string) {
    this.socket.emit("events", {message:message,receiver:receiver});
  }

  public onMessage(callback: (message: string) => void) {
    this.socket.on("events", callback);
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}
