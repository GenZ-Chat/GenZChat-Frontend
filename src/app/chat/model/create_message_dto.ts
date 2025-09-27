import { FileViewResponse } from "./file/file_response";

export class CreateMessageDto {
    chatId: string;
    senderId: string;
    receiverId: string;
    content: string;
    attachments?: FileViewResponse[];

    constructor(chatId:string,senderId:string,receiverId:string,content:string,attachments?:any[]){
        this.chatId = chatId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.attachments = attachments
    }

    convertToJson(){
        return {
            chatId:this.chatId,
            senderId:this.senderId,
            receiverId:this.receiverId,
            content:this.content,
            attachments:this.attachments
        }
    }
}
