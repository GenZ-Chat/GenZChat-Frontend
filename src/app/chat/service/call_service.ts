import { chatService } from "./chat_service";
export class CallService{
    private socket = chatService.getSocket();
    private userId = ""; // Set the user ID appropriately
    private pcMap: Record<string, RTCPeerConnection> = {};
    public localStream: MediaStream | null = null
    private remoteStream:Record<string, MediaStream> = {};



    private iceServers: RTCIceServer[] = [
        { urls: "stun:stun.l.google.com:19302" },
    ]

    constructor(private roomId: string, private myId: string) {
    this.registerSocketHandlers();
    this.userId = myId;
    this.roomId = roomId;
  }   

   private registerSocketHandlers() {
    this.socket?.on("all-users", (users: string[]) => {
      users.forEach((id) => this.createOffer(id));
    });

    this.socket?.on("offer", async ({ from, offer }) => {
      await this.handleOffer(from, offer);
    });

    this.socket?.on("answer", async ({ from, answer }) => {
      const pc = this.pcMap[from];
      if (pc) await pc.setRemoteDescription(answer);
    });

    this.socket?.on("ice-candidate", async ({ from, candidate }) => {
      const pc = this.pcMap[from];
      if (pc && candidate) await pc.addIceCandidate(candidate);
    });
  }


    //local stream or to enable video and audio
    async initLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  // Track control methods
  enableAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  async enableVideo(enabled: boolean) {
    if (!this.localStream) return;

    // Stop existing video tracks
    this.localStream.getVideoTracks().forEach(track => {
      track.stop();
      this.localStream?.removeTrack(track);
    });

    if (enabled) {
      try {
        // Get new video track
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = newStream.getVideoTracks()[0];
        this.localStream.addTrack(videoTrack);

        // Update all peer connections with new track
        Object.values(this.pcMap).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      } catch (err) {
        console.error('Error re-enabling video:', err);
      }
    }
  }

  private createPeerConnection(peerId:string,isOfferer:boolean = true): RTCPeerConnection {
    if(this.pcMap[peerId]){
        return this.pcMap[peerId];
    }
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    this.localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream!);
    });
      pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.socket?.emit("ice-candidate", { to: peerId, from: this.userId, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      this.remoteStream[peerId] = e.streams[0];
    };

    if(isOfferer){
        const dc = pc.createDataChannel("chat");
        dc.onopen = () => {
          console.log("Data channel open");
        };
        dc.onmessage = (e) => {
          console.log("Message from data channel:", e.data);
        };
    }else{
        pc.ondatachannel = (event) => {
          const dc = event.channel;
          dc.onopen = () => {
            console.log("Data channel open");
          };
          dc.onmessage = (e) => {
            console.log("Message from data channel:", e.data);
          };
        };
    }
    this.pcMap[peerId] = pc;
    return pc;

  }

    private async createOffer(peerId:string) {
    const pc = this.createPeerConnection(peerId,true);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.socket?.emit("offer", { to: peerId, from: this.userId, offer:pc.localDescription });
  }

  handleOffer = async (from:string, offer: RTCSessionDescriptionInit) => {
    const pc = this.createPeerConnection(from,false);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.socket?.emit("answer", { to: from, from: this.userId, answer: pc.localDescription });
  }


 cleanup() {
     this.socket?.off("all-users");
    this.socket?.off("offer");
    this.socket?.off("answer");
    this.socket?.off("ice-candidate");

    Object.values(this.pcMap).forEach((pc) => pc.close());
    this.pcMap = {};
    this.remoteStream = {};
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
  }
}

