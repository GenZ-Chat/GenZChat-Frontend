import { FileAttachment } from './file_attachment_model';

export type MessageComponentsProps = {
    content: string;
    name?:string;
    sender?:string;
    reciever?:string;
    time: string;
    isSender:boolean;
    attachments?: FileAttachment[];
}

// Enhanced message model matching the backend schema
export interface Message {
    _id?: string;
    sender: string;
    receiver?: string;
    chat: string;
    content: string;
    attachments: string[]; // Array of file IDs from the backend
    createdAt?: Date;
    updatedAt?: Date;
    sentAt?: Date;
}

// Message with populated file attachments for UI
export interface MessageWithAttachments extends Omit<Message, 'attachments'> {
    attachments: FileAttachment[];
}

// Note: CreateMessageDto and GroupCreateMessageDto are defined as classes in their respective files
