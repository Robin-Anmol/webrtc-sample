class PeerService {
  peer: RTCPeerConnection | null;
  constructor() {
    this.peer = null;
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans as RTCSessionDescriptionInit;
    }
  }
  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();

      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer as RTCSessionDescriptionInit;
    }
  }

  async setLocalDescription(answer: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new PeerService();
