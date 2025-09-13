import { MessageComponentsProps } from "../model/message_model"

export  function ReceiveMsgComponent({ content, time, sender,name}: MessageComponentsProps) {
    console.log(name)
    return (
            <div className="space-y-4 mt-4">
                    {/* Received Message - Left aligned */}
                    <div className="flex justify-start">
                        <div className="max-w-[70%]">
                            <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-bl-md shadow-md border border-border">
                                {content}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 mt-1 block">
                                {name} • {time}
                            </span>
                        </div>
                    </div>
                    </div>
    )
}