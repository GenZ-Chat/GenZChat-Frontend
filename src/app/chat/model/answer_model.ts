export class AnswerModel {
    answer: any;
    callerId:string;
    calleeId:string;

    constructor(callerId:string,calleeId:string,answer:any){
        this.calleeId = calleeId;
        this.callerId = callerId;
        this.answer = answer
    }
    
     convertToJson(){
        return {
            callerId: this.callerId,
            calleeId:this.calleeId,
            answer:this.answer
        }
     }
}