export class FileViewResponse{
    id:string;
    url:string
    fileId:string;
    filename:string;
    size:number
    type:string
    uploadedAt:string
    
    constructor(id:string,url:string,fileId:string,filename:string,size:number,type:string,uploadedAt:string){
        this.id = id;
        this.url = url;
        this.fileId = fileId;
        this.filename = filename;
        this.size = size;
        this.type = type;
        this.uploadedAt = uploadedAt
    }

    convertToJson(){
        return {
            id:this.id,
            url:this.url,
            fileId:this.fileId,
            filename:this.filename,
            size:this.size,
            type:this.type,
            uploadedAt:this.uploadedAt
        }
    }
    fromJson(json:any){
        return new FileViewResponse(
            json.id,
            json.url,
            json.fileId,
            json.filename,
            json.size,
            json.type,
            json.uploadedAt
        )
    }
}