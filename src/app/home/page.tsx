"use client"

import { AppSidebar } from "@/components/ui/app-sidebar";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Camera, Send } from "lucide-react"
import {MessageComponentsProps} from "@/app/home/model/message_model";
import {ReceiveMsgComponent} from "@/app/home/components/recvieve_msg_component"
import { SentMessageComponent } from "@/app/home/components/sent_msg_component";
import { useEffect, useState } from "react";
import {UserService} from "@/app/home/service/user_service";
import {ChatService} from "@/app/home/service/chat_service";
import { FriendModel } from "@/app/home/model/friend_model";


export default function HomePage({children}: {children: React.ReactNode}) {

    const [messages,setMessages] = useState<MessageComponentsProps[]>([])
    const [input_text, setInputText] = useState<string>("");
    const [friends,setFriends] = useState<FriendModel[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<FriendModel | null>(null);
    const [chatService] = useState(() => new ChatService());
    const [userService] = useState(() => new UserService());

    useEffect(() => {
        // Fetch friends
        userService.getFriends().then(friends => {
            setFriends(friends);
            console.log("Fetched friends:", friends);
        });

        // Setup Socket.IO connection
        chatService.connect();

        // Setup message listener
        const handleMessage = (data: any) => {
            console.log("Received message data:", data);
            const newMessage: MessageComponentsProps = {
                msg: data.message || data,
                senderId: data.senderId || (selectedFriend ? selectedFriend.id : 'unknown'),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: false
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        chatService.onMessage(handleMessage);

        // Cleanup function
        return () => {
        
        };
    }, [chatService, userService]);

    // Clear messages when friend changes
    useEffect(() => {
        if (selectedFriend) {
            setMessages([]); // Clear messages when switching friends
            console.log("Selected friend changed:", selectedFriend);
        }
    }, [selectedFriend]);

    const handleSendMessage = () => {
        if (input_text.trim() !== "" && selectedFriend && chatService.isConnected()) {
            const newMessage: MessageComponentsProps = {
                senderId: selectedFriend.id,
                msg: input_text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: true
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            chatService.sendMessage(input_text, selectedFriend.id);
            setInputText("");
        } else if (!chatService.isConnected()) {
            console.error("Cannot send message: Socket is not connected");
            // You might want to show a toast notification here
        }
    };



  return (
    <SidebarProvider>
        <AppSidebar 
            friends={friends} 
            selectedFriend={selectedFriend} 
            setSelectedFriend={setSelectedFriend} 
        />        
        <main className="flex flex-col min-h-screen w-full">
            {/* Chat Header */}
            {selectedFriend && (
                <div className="bg-background border-b border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {selectedFriend.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{selectedFriend.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{selectedFriend.status}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex-1 p-4 overflow-y-auto">
                <SidebarTrigger />
                {children}
                
                {/* Messages Container */}
                {selectedFriend ? (
                    <div className="space-y-4">
                        {messages.map((message, index) => 
                            message.sender ? 
                                <SentMessageComponent key={index} {...message} /> : 
                                <ReceiveMsgComponent key={index} {...message} />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold mb-2">Welcome to GenZChat</h3>
                        <p className="text-muted-foreground">Select a friend to start chatting</p>
                    </div>
                )}
            </div>
            {/* Input Box at Bottom - Only show when friend is selected */}
            {selectedFriend && (
                <div className="sticky bottom-0 bg-white border-t border-border p-4 z-50">
                    <div className="flex items-center gap-3 max-w-full">
                        <div className="relative flex-1">
                            <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={input_text}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Message ${selectedFriend.name}...`} 
                                className="pl-12 pr-4 h-12 w-full rounded-xl border-2 focus:border-primary transition-all duration-200"
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </div>
                        <button
                        onClick={handleSendMessage}
                        className="flex items-center justify-center h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </main>
    </SidebarProvider>
  );
}