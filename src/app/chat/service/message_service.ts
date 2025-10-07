 class MessageService{
    private userId:string|undefined;

   
    private baseUrl:string = "http://localhost:9060/api/chat/messages"

    async getMessages(){
        const messages = await fetch(this.baseUrl+`?userId=${this.userId}`);
        const data = await messages.json();
        console.log('[MESSAGE SERVICE] Raw messages data:', data);
        console.log('[MESSAGE SERVICE] Sample message structure:', 
            Object.keys(data).length > 0 ? data[Object.keys(data)[0]]?.[0] : 'No messages found');
        return data;
    }

     setUserId(userId:string){
        this.userId = userId;
    }
}

export const  messageService = new MessageService();
