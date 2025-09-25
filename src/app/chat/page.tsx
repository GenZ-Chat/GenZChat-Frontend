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
import { chatService } from "./service/chat_service";
import { ChatModel } from "./model/chat_model";
import { CallDialog } from "./components/call_dialog";
import { useRouter } from "next/navigation";

export default function Chat(){

    //router 
    const router = useRouter()

    //session details
    const { data:session, status } = useSession(); 
    const userId = session?.user?.id;
    
    //fetching user details
    useEffect(() => {
        if(!userId) return;
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



    if(status === "loading"){
        return <div>Loading...</div>
    }

    async function callFriend(callUserId: string) {
        try {
            // Navigate to call page first
            router.push(`/call/${callUserId}`);
            // The offer will be created in the call page
        } catch (error) {
            console.error('Error initiating call:', error);
        }
    }

    function handleAcceptCall() {
        // const call = acceptCall();
        // if (call) {
        //     // Navigate to call page with the caller's ID
        //     router.push(`/call/${call.callerId}`);
        // }
    }

    function handleDeclineCall() {
        // declineCall();
    }

    // Test function for manual dialog trigger (remove in production)
    function testIncomingCall() {
        // setDialogOpen(true);
        console.log('[Chat] Manual dialog trigger - dialogOpen should be true');
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
            dialogOpen={false} 
            setDialogOpen={()=>{} }
            handleAcceptCall={handleAcceptCall}
            handleDeclineCall={handleDeclineCall}
            callerName={undefined}
        />
        
        {/* Temporary test button - remove in production */}
        <div className="fixed top-4 right-4 z-50">
            <button 
                onClick={testIncomingCall}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Test Dialog
            </button>
        </div>
        
        <div className="flex flex-col w-full">
            {selectedChat == null ? (
                <ChatPreview />
            ) : (
                <>
                    <SelectedChat messages={messageHistory} chat={selectedChat} userId={userId} />
                    <ChatFooter selectedChat={selectedChat} userId={userId} />
                </>
            )}
        </div>
    </SidebarProvider>
);
}