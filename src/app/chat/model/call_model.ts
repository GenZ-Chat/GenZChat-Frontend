export class CallModel {
    callerId:string;
    calleeId:string;
    roomId:string ;
    constructor(callerId:string,calleeId:string,roomId?:string){
        this.calleeId = calleeId;
        this.callerId = callerId;
        this.roomId = roomId || "";
    }

     convertToJson(){
        return {
            callerId: this.callerId,
            calleeId:this.calleeId,
            roomId: this.roomId
        }
     }
}