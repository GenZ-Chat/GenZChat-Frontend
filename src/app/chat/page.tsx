"use client";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import useChat from "./hooks/useChat";
import {  useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useMessageHistory from "./hooks/useMessage";
import SelectedChat from "./components/selectedChat";
import { ChatPreview } from "./components/chat_preview";
import ChatFooter from "./components/chat_footer";
import useReceiveMessage from "./hooks/useReceiveMessage";
import useIncomingCall from "./hooks/useIncomingCall";
import { chatService } from "./service/chat_service";
import { ChatModel } from "./model/chat_model";
import { CallDialog } from "./components/call_dialog";
import { useRouter } from "next/navigation";
import { CallModel } from "./model/call_model";

export default function Chat(){

    //router 
    const router = useRouter()

    //session details
    const { data:session, status } = useSession(); 
    const userId = session?.user?.id;
    
    //fetching user details
    useEffect(() => {
        if(!userId || chatService.isConnected()) return;
        chatService.connect(userId);
    }, [userId]);

   


    //fetching chates
    const { chats, isLoading, error } = useChat(userId!);
    const [selectedChat, setSelectedChat] = useState<ChatModel | null>(null);

    //fetch messages
    const {messageHistory,setMessageHistory} = useMessageHistory(userId!, chats);
    
    //recieve messages in real-time
    useReceiveMessage(setMessageHistory,userId,chats);
    
    // Call functionality
    const { dialogOpen, setDialogOpen, callerName, setCallerName,roomId } = useIncomingCall(userId, chats);



    if(status === "loading"){
        return <div>Loading...</div>
    }

    async function callFriend(callUserId: string) {
            try {
                const roomId = crypto.randomUUID();
                const callModel = new CallModel(userId!, callUserId, roomId);
                chatService.callFriend(callModel);
                // Navigate to call page first
                router.push(`/call/${roomId}`);
        } catch (error) {
            console.error('Error initiating call:', error);
        }
    }

    function handleAcceptCall() {
      
         router.push(`/call/${roomId}`);
    }

    function handleDeclineCall() {
        // declineCall();
    }

return (
    <SidebarProvider>
        <AppSidebar
            chats={chats}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            isLoading={isLoading}
            onPhoneClick={callFriend}
        />
        <CallDialog 
            dialogOpen={dialogOpen} 
            setDialogOpen={setDialogOpen}
            handleAcceptCall={handleAcceptCall}
            handleDeclineCall={handleDeclineCall}
            callerName={callerName}
        />
        
        <div className="flex flex-col w-full">
            {selectedChat == null ? (
                <ChatPreview />
            ) : (
                <>
                    <SelectedChat messages={messageHistory} chat={selectedChat} userId={userId} />
                    <ChatFooter selectedChat={selectedChat} userId={userId} setMessageHistory={setMessageHistory} />
                </>
            )}
        </div>
    </SidebarProvider>
);
}