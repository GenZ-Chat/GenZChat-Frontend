import {MessageComponentsProps} from "@/app/home/model/message_model";


export function SentMessageComponent({ content, time, sender }: MessageComponentsProps) {
    return (
                <div className="flex justify-end">
                        <div className="max-w-[70%]">
                            <div className="bg-green-500 dark:bg-green-600 text-white p-3 rounded-2xl rounded-br-md shadow-md">
                                {content}
                            </div>
                            <span className="text-xs text-muted-foreground mr-2 mt-1 block text-right">
                                {sender ? "You" : "Alex"} • {time}
                            </span>
                        </div>
                    </div>
    );
}