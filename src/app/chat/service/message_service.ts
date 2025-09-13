 class MessageService{
    private userId:string|undefined;

   
    private baseUrl:string = "http://localhost:9060/api/chat/messages"

    async getMessages(){
        const messages = await fetch(this.baseUrl+`?userId=${this.userId}`);
        return messages.json();
    }

     setUserId(userId:string){
        this.userId = userId;
    }
}

export const  messageService = new MessageService();
