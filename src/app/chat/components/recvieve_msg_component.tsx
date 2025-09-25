import { MessageComponentsProps } from "../model/message_model";
import { CompactFileViewer } from "./file_viewer";

export  function ReceiveMsgComponent({ content, time, sender, name, attachments}: MessageComponentsProps) {
    console.log('[RECEIVE MSG] Component props:', { name, content, attachments });
    return (
            <div className="space-y-4 mt-4">
                    {/* Received Message - Left aligned */}
                    <div className="flex justify-start">
                        <div className="max-w-[70%]">
                            <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-bl-md shadow-md border border-border">
                                {content}
                                {attachments && attachments.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border/30">
                                        <CompactFileViewer attachments={attachments} />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 mt-1 block">
                                {name} • {time}
                            </span>
                        </div>
                    </div>
                    </div>
    )
}