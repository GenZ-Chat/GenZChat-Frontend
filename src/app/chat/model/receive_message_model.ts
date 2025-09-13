export class ReceivedMessageModel {
    sender:string;
    receiver?:string;
    content:string;
    timestamp:string;
    chat:string;
    createdAt:string;
    updatedAt:string;
    attatchments?:any;

    constructor(sender:string,receiver:string,content:string,timestamp:string,chat:string,createdAt:string,updatedAt:string,attatchments?:any) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.chat = chat;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.attatchments = attatchments;
    }

    static fromJson(json:any): ReceivedMessageModel {
        return new ReceivedMessageModel(
            json.sender,
            json.receiver,
            json.content,
            json.timestamp,
            json.chat,
            json.createdAt,
            json.updatedAt,
            json.attatchments
        );
    }
}