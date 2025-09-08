"use client"

import { AppSidebar } from "@/components/ui/app-sidebar";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Camera, ChartColumn, Send, Mic, Video, PhoneOff, PhoneIncoming } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {MessageComponentsProps} from "@/app/home/model/message_model";
import {ReceiveMsgComponent} from "@/app/home/components/recvieve_msg_component"
import { SentMessageComponent } from "@/app/home/components/sent_msg_component";
import { useCallback, useEffect, useRef, useState } from "react";
import {UserService} from "@/app/home/service/user_service";
import {ChatService} from "@/app/home/service/chat_service";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatModel, ChatType } from "./model/chat_model";
import { CreateMessageDto } from "./model/create_message_dto";
import { MessageService } from "./service/message_service";
import { GroupCreateMessageDto } from "./model/group_create_message_dto";

// Small internal component for the dialog body when call is active
function CallDialogBody({ callType, onEnd }: { callType: 'audio' | 'video' | null, onEnd: () => void }) {
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // when camOn is true and callType is video, try to attach local preview
    useEffect(() => {
        let mounted = true;
        async function startPreview() {
            if (!mounted) return;
            if (callType !== 'video') return;
            if (!camOn) return;
            if (!navigator?.mediaDevices?.getUserMedia) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                }
            } catch (err) {
                console.error('Failed to get camera preview', err);
            }
        }

        if (camOn) startPreview();

        return () => {
            mounted = false;
            // stop tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                try { videoRef.current.pause(); videoRef.current.srcObject = null; } catch {}
            }
        };
    }, [camOn, callType]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Video / placeholder area */}
            <div className="flex-1 w-full bg-black/70 rounded-md overflow-hidden flex items-center justify-center">
                {callType === 'video' ? (
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                ) : (
                    <div className="text-center text-white">
                        <div className="text-2xl font-semibold">Audio Call</div>
                        <div className="text-sm mt-2 text-muted-foreground">No video for audio calls</div>
                    </div>
                )}
            </div>

            {/* Controls at bottom */}
            <div className="mt-3 flex items-center justify-center gap-4">
                <Button variant={micOn ? 'default' : 'ghost'} size="icon" onClick={() => setMicOn(prev => !prev)} title={micOn ? 'Mute' : 'Unmute'}>
                    <Mic className="w-5 h-5" />
                </Button>
                <Button variant={camOn ? 'default' : 'ghost'} size="icon" onClick={() => setCamOn(prev => !prev)} title={camOn ? 'Turn off camera' : 'Turn on camera'}>
                    <Video className="w-5 h-5" />
                </Button>
                <Button variant="destructive" size="icon" onClick={onEnd} title="End Call">
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}


export default  function HomePage({children}: {children: React.ReactNode}) {


    const { data:session, status } = useSession();
    console.log(session?.user?.id)
    const router = useRouter();
    const searchParams = useSearchParams();
    const [messages,setMessages] = useState<MessageComponentsProps[]>([])
    const [input_text, setInputText] = useState<string>("");
    const [chats,setChats] = useState<ChatModel[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatModel | null>(null);
    const [chatService] = useState(() => new ChatService(session?.user?.id || ""));
    const [userService, setUserService] = useState<UserService | null>(null);
    const [messageService] = useState(() => new MessageService(session?.user?.id || ""));
    const [messageHistory,setMessageHistory] = useState<any>({});
    // Dialog/call state
    const [callDialogOpen, setCallDialogOpen] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
    const [incomingCall, setIncomingCall] = useState(false);
    // Draggable dialog position
    const [dialogPos, setDialogPos] = useState({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);

    function handleSelectChat(chat: ChatModel | null) {
        setSelectedChat(chat);
        if (chat) {
            router.push(`/home?chatId=${chat.id}`);
        } else {
            router.push(`/home`);
        }
    }
  
    useEffect(()=>{
        if(!session?.user?.id) return;
        messageService.setUserId( session.user?.id)
        const messages = messageService.getMessages();
        messages.then((data)=>{
            setMessageHistory(data);
            console.log("message history:",data)
        })
    },[messageService,session?.user?.id])

    // Redirect to auth if not authenticated
    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        // Initialize user service with session user ID if not already set
        if (session?.user?.id && !userService) {
            setUserService(new UserService(session.user.id));
        }
    }, [session, status, router, userService]);
    

    //selecting friends to chat 
    useEffect(() => {
        const chatId = searchParams.get('chatId');
        if (chatId) {
            const chat = chats.find(f => f.id === chatId);
            setSelectedChat(chat || null);
            var messages = messageHistory[chatId] || [];
            console.log("Messages for chatId", chatId, ":", messages);
            setMessages(messages.map((msg: any) => ({
                content: msg.content,
                name: msg.senderId === session?.user?.id ? (Array.isArray(chat?.users) ? chat.users[0].name : chat?.users.name) : (Array.isArray(chat?.users) ? chat.users[0].name : chat?.users.name),
                senderId: msg.senderId,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: msg.sender === session?.user?.id
            })));
            console.log("Chat message selected from URL:", messages);

        } else {
            setSelectedChat(null);
        }   
    }, [searchParams, chats,messageHistory,session?.user?.id]);





    useEffect(() => {
        if (!session?.user?.id) return;
        if (!userService) return;

        (async () => {
            try {
                await userService.setUserId(session.user?.id!);
                // Fetch chats
                const fetchedChats = await userService.getChats();
                setChats(fetchedChats);
                console.log("Fetched chats:", fetchedChats);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        })();

        // Setup Socket.IO connection
        console.log(session?.user?.id);
    chatService.connect(session.user?.id!);

        // Setup message listener
        const handleMessage = (data: any) => {
            // if(selectedChat?.type === ChatType.DIRECT) {
            console.log("Received message data:", data);
            const newMessage: MessageComponentsProps = {
                content:data.content,
                name: Array.isArray(selectedChat?.users) ? selectedChat.users[0].name : selectedChat?.users.name,
                senderId: data.sender || (selectedChat ? selectedChat.id : 'unknown'),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: false
            };
            
            setMessages(prevMessages => [...prevMessages, newMessage]);
        // }
        };

        const groupMessage = (data: any) => {
            // if(selectedChat?.type === ChatType.GROUP) {
            if(data.sender === session?.user?.id) return;
            console.log("Received group message data:", data);
            const newMessage: MessageComponentsProps = {
                content:data.content,
                name: Array.isArray(selectedChat?.users) ? selectedChat.users[0].name : selectedChat?.users.name,
                senderId: data.sender || (selectedChat ? selectedChat.id : 'unknown'),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: false
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
        // }
        }


        chatService.onMessage(handleMessage);
        chatService.receiveGroupMessage(groupMessage);
        // chatService.receiveGroupMessage(handleMessage);

        // Cleanup function
        return () => {
        
        };
    }, [chatService, userService, session?.user?.id]);



    function handleSendMessage() {
        if (input_text.trim() !== "" && selectedChat && chatService.isConnected()) {
        console.log(selectedChat?.users)

        if(selectedChat.type == "group") {
                 const newMessage: MessageComponentsProps = {
                name:  selectedChat.type === "group" ? Array.isArray(selectedChat?.users) ? selectedChat.users[0].name : selectedChat?.users.name : "Direct Message",
                senderId: Array.isArray(selectedChat?.users) ? selectedChat.id : selectedChat?.users.id,
                content: input_text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: true
            };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        var chat:GroupCreateMessageDto = Array.isArray(selectedChat.users) ? new GroupCreateMessageDto(selectedChat.id,session?.user?.id!,input_text)  :new GroupCreateMessageDto(selectedChat.id,session?.user?.id!,input_text,[])

        chatService.sendGroupMessage(chat);
        }else{

            const newMessage: MessageComponentsProps = {
                name:  Array.isArray(selectedChat?.users) ? selectedChat.users[0].name : selectedChat?.users.name,
                senderId: Array.isArray(selectedChat?.users) ? selectedChat.id : selectedChat?.users.id,
                content: input_text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: true
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            var chat_deirect:CreateMessageDto = Array.isArray(selectedChat.users) ? new CreateMessageDto(selectedChat.id,session?.user?.id!,selectedChat.users[0].id,input_text)  :new CreateMessageDto(selectedChat.id,session?.user?.id!,selectedChat.users.id ,input_text,[])
            chatService.sendMessage(chat_deirect);
        }
        setInputText("");
        } else if (!chatService.isConnected()) {
            console.error("Cannot send message: Socket is not connected");
            // You might want to show a toast notification here
        }
    
    };
    
    

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold mb-2">Loading...</h3>
                    <p className="text-muted-foreground">Please wait while we load your session</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!session) {
        return null;
    }



  return (
    <SidebarProvider>
        <AppSidebar 
            chats={chats} 
            selectedChat={selectedChat} 
            setSelectedChat={handleSelectChat} 
        />        
        <main className="flex flex-col min-h-screen w-full">
            {/* Chat Header */}

            {selectedChat && (
                <div className="bg-background border-b border-border p-4">
                    <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                {selectedChat.type === "group" ? (Array.isArray(selectedChat?.users) ? selectedChat.group?.name.charAt(0).toUpperCase() : selectedChat?.users.name.charAt(0).toUpperCase()) : "DM"}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">{Array.isArray(selectedChat?.users) ? selectedChat.group?.name : selectedChat?.users.name}</h2>
                                <p className="text-sm text-muted-foreground capitalize">{selectedChat.type === "group" ? "Group Chat" : "Direct Message"}</p>
                            </div>
                        </div>
                        {/* Call Control Buttons */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Audio Call" onClick={() => { setCallType('audio'); setIncomingCall(false); setCallDialogOpen(true); }}>
                                <Mic className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Video Call" onClick={() => { setCallType('video'); setIncomingCall(false); setCallDialogOpen(true); }}>
                                <Video className="w-5 h-5" />
                            </Button>
                            <Button variant="destructive" size="icon" title="End Call" onClick={() => { setCallType(null); setCallDialogOpen(false); setIncomingCall(false); }}>
                                <PhoneOff className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto">
                <SidebarTrigger />
                {children}
                {/* Messages Container */}
                {selectedChat ? (
                    <div className="space-y-4">
                        {messages.map((message, index) => {
                            return message.sender  ?
                                <SentMessageComponent key={index} {...message} /> :
                                <ReceiveMsgComponent key={index} content={message.content} time={message.time} sender={message.sender} name={message.name} senderId={message.senderId} />
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold mb-2">Welcome to GenZChat</h3>
                        <p className="text-muted-foreground">Select a friend to start chatting</p>
                    </div>
                )}
            </div>

            {/* Floating Call Dialog - place after header, inside main */}
            <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
                <DialogContent
                    className="max-w-xs min-w-[300px] min-h-[200px] p-4"
                    style={{
                        resize: 'both',
                        overflow: 'auto',
                        cursor: draggingRef.current ? 'grabbing' : 'grab',
                        transform: `translate(${dialogPos.x}px, ${dialogPos.y}px)`,
                        touchAction: 'none',
                    }}
                    onPointerDown={(e) => {
                        // Start dragging only when left button or touch
                        if ((e as any).button !== undefined && (e as any).button !== 0) return;
                        draggingRef.current = true;
                        dragStartRef.current = { x: e.clientX - dialogPos.x, y: e.clientY - dialogPos.y };
                        (e.target as Element).setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={(e) => {
                        if (!draggingRef.current || !dragStartRef.current) return;
                        const newX = e.clientX - dragStartRef.current.x;
                        const newY = e.clientY - dragStartRef.current.y;
                        setDialogPos({ x: newX, y: newY });
                    }}
                    onPointerUp={(e) => {
                        draggingRef.current = false;
                        dragStartRef.current = null;
                        try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
                    }}
                >
                    <DialogTitle className="sr-only">Call dialog</DialogTitle>
                    {incomingCall ? (
                        <div className="flex flex-col items-center justify-center gap-4">
                            <PhoneIncoming className="w-10 h-10 text-green-500" />
                            <div className="text-lg font-semibold">Incoming {callType === 'video' ? 'Video' : 'Audio'} Call</div>
                            <div className="flex gap-4 mt-2">
                                <button className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600" onClick={() => { /* answer logic placeholder */ setIncomingCall(false); setCallDialogOpen(false); }}>Answer</button>
                                <button className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600" onClick={() => { setIncomingCall(false); setCallDialogOpen(false); }}>Decline</button>
                            </div>
                        </div>
                    ) : (
                        <CallDialogBody callType={callType} onEnd={() => { setCallDialogOpen(false); setCallType(null); }} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Input Box at Bottom - Only show when chat is selected */}
            {selectedChat && (
                <div className="sticky bottom-0 bg-white border-t border-border p-4 z-50">
                    <div className="flex items-center gap-3 max-w-full">
                        <div className="relative flex-1">
                            <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={input_text}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Message ${Array.isArray(selectedChat?.users) ? selectedChat.users[0].name : selectedChat?.users.name}...`} 
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