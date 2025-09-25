import { MessageComponentsProps } from "../model/message_model";
import { CompactFileViewer } from "./file_viewer";


export function SentMessageComponent({ content, time, isSender, attachments }: MessageComponentsProps) {
    return (
                <div className="flex justify-end">
                        <div className="max-w-[70%]">
                            <div className="bg-green-500 dark:bg-green-600 text-white p-3 rounded-2xl rounded-br-md shadow-md">
                                {content}
                                {attachments && attachments.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-green-400/30">
                                        <CompactFileViewer attachments={attachments} />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground mr-2 mt-1 block text-right">
                                {isSender ? "You" : "Alex"} • {time}
                            </span>
                        </div>
                    </div>
    );
}