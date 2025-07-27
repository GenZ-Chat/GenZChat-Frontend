import { Socket,io } from "socket.io-client";

export class ChatService {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:8020/chat");
  }
    public connect() {
        this.socket.connect();
    }

  public sendMessage(message: string) {
    this.socket.emit("events", message);
  }

  public onMessage(callback: (message: string) => void) {
    this.socket.on("events", callback);
  }
}
