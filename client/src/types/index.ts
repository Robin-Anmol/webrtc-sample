export type handleUserJoined = {
  email: string;
  id: string;
  roomCounts: number;
};

export type handleIncommingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
};
export type handleCallAccepted = {
  from: string;
  answer: RTCSessionDescriptionInit;
};
