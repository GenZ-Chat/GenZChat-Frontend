"use client"

import { AppSidebar } from "@/components/ui/app-sidebar";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Camera, Send } from "lucide-react"
import {MessageComponentsProps} from "@/app/home/model/message_model";
import {ReceiveMsgComponent} from "@/app/home/components/recvieve_msg_component"
import { SentMessageComponent } from "@/app/home/components/sent_msg_component";
import { useState } from "react";
import {ChatService} from "@/app/home/service/chat_service"


export default function HomePage({children}: {children: React.ReactNode}) {

    const [messages,setMessages] = useState<MessageComponentsProps[]>([])
    const [input_text, setInputText] = useState<string>("");
    var chatService = new ChatService();

    chatService.connect();
    chatService.onMessage((message: string) => {
        const newMessage: MessageComponentsProps = {
            msg: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: false
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        console.log("Received message:", message);
        console.log("Updated messages:", [...messages, newMessage]);
    });

  return (
    <SidebarProvider>
        <AppSidebar />        
        <main className="flex flex-col min-h-screen w-full">
            <div className="flex-1 p-4 overflow-y-auto">
                <SidebarTrigger />
                {children}
                
                {/* Messages Container */}
                <div className="space-y-4">
                    {messages.map((message, index) => 
                        message.sender ? 
                            <SentMessageComponent key={index} {...message} /> : 
                            <ReceiveMsgComponent key={index} {...message} />
                    )}
                </div>
            </div>
            {/* Input Box at Bottom - Properly positioned within main */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4 z-50">
                <div className="flex items-center gap-3 max-w-full">
                    <div className="relative flex-1">
                        <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={input_text}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message..." 
                            className="pl-12 pr-4 h-12 w-full rounded-xl border-2 focus:border-primary transition-all duration-200" 
                        />
                    </div>
                    <button
                    onClick={
                        () => {
                        if (input_text.trim() !== "") {
                            const newMessage: MessageComponentsProps = {
                                msg: input_text,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                sender: true
                            };
                            setMessages([...messages, newMessage]);
                            chatService.sendMessage(input_text);
                            setInputText("");
                        }
                    }}
                    className="flex items-center justify-center h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95">
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </main>
    </SidebarProvider>
  );
}