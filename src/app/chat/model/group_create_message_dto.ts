export class GroupCreateMessageDto {
    chatId: string;
    senderId: string
    content: string;
    attachments?: [];

    constructor(chatId:string,senderId:string,content:string,attachments?:[]){
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