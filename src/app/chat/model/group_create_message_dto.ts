import { FileViewResponse } from "./file/file_response";

export class GroupCreateMessageDto {
    chatId: string;
    senderId: string
    content: string;
    attachments?: FileViewResponse[];

    constructor(chatId:string,senderId:string,content:string,attachments?:any[]){
        this.chatId = chatId;
        this.senderId = senderId;
        this.content = content;
        this.attachments = attachments
    }

    convertToJson(){
        return {
            chatId:this.chatId,
            senderId:this.senderId,
            content:this.content,
            attachments:this.attachments
        }
    }
}