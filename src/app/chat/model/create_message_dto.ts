
export class CreateMessageDto {
    chatId: string;
    senderId: string;
    receiverId: string;
    content: string;
    attatchments?: [];

    constructor(chatId:string,senderId:string,recieverId:string,content:string,attachments?:[]){
        this.chatId = chatId;
        this.senderId = senderId;
        this.receiverId = recieverId;
        this.content = content;
        this.attatchments = attachments
    }

    convertToJson(){
        return {
            chatId:this.chatId,
            senderId:this.senderId,
            receiverId:this.receiverId,
            content:this.content,
            attatchments:this.attatchments
        }
    }
}
