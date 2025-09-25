export class CallModel {
    callerId:string;
    calleeId:string;
    offer:any;

    constructor(callerId:string,calleeId:string,offer:any){
        this.calleeId = calleeId;
        this.callerId = callerId;
        this.offer = offer
    }

     convertToJson(){
        return {
            callerId: this.callerId,
            calleeId:this.calleeId,
            offer:this.offer
        }
     }
}