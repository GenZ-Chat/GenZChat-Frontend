import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { chatService } from "../service/chat_service";
import { ChatModel, ChatType } from "../model/chat_model";
import { CreateMessageDto } from "../model/create_message_dto";
import { GroupCreateMessageDto } from "../model/group_create_message_dto";
import { useFileUploadWithFiles } from "../hooks/useEnhancedFileUpload";
import { FileAttachment, AttachmentButton } from "./file_attachment";
import { FileViewResponse } from "../model/file/file_response";
import { FileUploadResponse } from "../service/file_service";
import { MessageComponentsProps } from "../model/message_model";
import { UserModel } from "../model/user_model";


export default function ChatFooter({ selectedChat, userId, setMessageHistory }: {
    selectedChat: ChatModel;
    userId: string | undefined;
    setMessageHistory: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
}) {
    const [input_text, setInputText] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const {
        selectedFiles,
        uploadedFiles,
        fileInputRef,
        isUploading: fileUploadInProgress,
        uploadProgress,
        validationErrors,
        handleAttachmentClick,
        handleFileSelect,
        removeFile,
        clearFiles,
        uploadFiles,
        getFileSize,
        hasFiles
    } = useFileUploadWithFiles();

    // Connection is managed at the page level, no need to connect here

    // Convert FileUploadResponse to FileViewResponse
    function convertToFileViewResponse(uploadResponse: FileUploadResponse, originalFilename: string): FileViewResponse {
        return new FileViewResponse(
            uploadResponse.id,
            uploadResponse.url,
            uploadResponse.fileId,
            originalFilename,
            uploadResponse.size,
            uploadResponse.type,
            uploadResponse.createdAt // Using createdAt as uploadedAt
        );
    }

    async function handleSendMessage() {
        if (input_text.trim() === "" && !hasFiles) return;
        
        console.log(`[CHAT FOOTER] Starting to send message with ${selectedFiles.length} files`);
        setIsUploading(true);
        let attachments: FileViewResponse[] = [];
        
        try {
            // Upload files first if there are any
            if (hasFiles) {
                console.log(`[CHAT FOOTER] Uploading ${selectedFiles.length} files...`);
                console.log('[CHAT FOOTER] Files to upload:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
                
                const uploadResults = await uploadFiles();
                console.log(`[CHAT FOOTER] Upload completed. Got ${uploadResults.length} results:`, uploadResults);
                
                // Validate upload results
                if (uploadResults.length !== selectedFiles.length) {
                    throw new Error(`Upload mismatch: expected ${selectedFiles.length} files, got ${uploadResults.length} results`);
                }
                
                // Convert FileUploadResponse[] to FileViewResponse[]
                attachments = uploadResults.map((uploadResponse, index) => {
                    const originalFile = selectedFiles[index];
                    const converted = convertToFileViewResponse(uploadResponse, originalFile?.name || 'unknown');
                    console.log(`[CHAT FOOTER] Converted file ${index + 1}:`, converted);
                    return converted;
                });
                
                console.log(`[CHAT FOOTER] Final attachments array:`, attachments);
            }
            
            // Create the message object to display immediately
            const sentMessage: MessageComponentsProps = {
                content: input_text,
                name: Array.isArray(selectedChat?.users) ? 
                    selectedChat.users.find((u: UserModel) => u.id === userId)?.name || "You" : 
                    "You",
                sender: userId!,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSender: true,
                attachments: attachments || []
            };

            // Immediately add sent message to local state for better UX
            setMessageHistory((prevHistory) => {
                const updatedChatHistory = prevHistory[selectedChat.id] ? 
                    [...prevHistory[selectedChat.id], sentMessage] : 
                    [sentMessage];
                console.log('[CHAT FOOTER] Added sent message to local state:', sentMessage);
                return { ...prevHistory, [selectedChat.id]: updatedChatHistory };
            });

            // Send the message with file attachments via Socket.IO
            if(selectedChat.type == ChatType.DIRECT && !Array.isArray(selectedChat.users)){
                const receiverId = selectedChat.users.id;
                const message = new CreateMessageDto(selectedChat.id, userId!, receiverId, input_text, attachments);
                console.log('[CHAT FOOTER] Sending direct message:', {
                    chatId: selectedChat.id,
                    attachmentCount: attachments.length,
                    attachments,
                    content: input_text,
                    messageObj: message
                });
                chatService.sendMessage(message);
            } else if(selectedChat.type == ChatType.GROUP){
                const message = new GroupCreateMessageDto(selectedChat.id, userId!, input_text, attachments);
                console.log('[CHAT FOOTER] Sending group message:', {
                    chatId: selectedChat.id, 
                    attachmentCount: attachments.length,
                    attachments,
                    content: input_text,
                    messageObj: message
                });
                chatService.sendGroupMessage(message);
            }
            
            // Clear input and files after successful send
            setInputText("");
            clearFiles();
            console.log('[CHAT FOOTER] Message sent successfully, cleared input and files');
            
        } catch (error: any) {
            console.error('[CHAT FOOTER] Failed to send message:', {
                error: error.message,
                hasFiles,
                fileCount: selectedFiles.length,
                files: selectedFiles.map(f => ({ name: f.name, size: f.size }))
            });
            
            // Don't clear files on error so user can retry
            alert(`Failed to send message: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    }

    return (selectedChat ?
         <div className="sticky bottom-0 bg-white border-t border-border p-4 z-50">
                    <FileAttachment
                        selectedFiles={selectedFiles}
                        onRemoveFile={removeFile}
                        getFileSize={getFileSize}
                        isUploading={fileUploadInProgress || isUploading}
                        uploadProgress={uploadProgress}
                        validationErrors={validationErrors}
                        onUpload={async () => {
                            try {
                                await uploadFiles();
                            } catch (error) {
                                console.error('Upload failed:', error);
                            }
                        }}
                    />
                    <div className="flex items-center gap-3 max-w-full">
                        <div className="relative flex-1">
                            <AttachmentButton
                                onAttachmentClick={handleAttachmentClick}
                                fileInputRef={fileInputRef}
                                onFileSelect={handleFileSelect}
                                isUploading={fileUploadInProgress || isUploading}
                            />
                            <Input
                                value={input_text}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Message here...`} 
                                className="pl-12 pr-4 h-12 w-full rounded-xl border-2 focus:border-primary transition-all duration-200"
                                disabled={fileUploadInProgress || isUploading}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter' && !fileUploadInProgress && !isUploading) {
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </div>
                        <button
                        onClick={handleSendMessage}
                        disabled={fileUploadInProgress || isUploading || (input_text.trim() === "" && !hasFiles)}
                        className="flex items-center justify-center h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            {(fileUploadInProgress || isUploading) ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
        : null
    );
}