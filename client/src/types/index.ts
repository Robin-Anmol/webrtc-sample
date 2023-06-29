export type handleUserJoinedProps = {
  email: string;
  id: string;
  roomCounts: number;
};

export type handleIncommingCallProps = {
  from: string;
  offer: RTCSessionDescriptionInit;
};
export type handleCallAcceptedProps = {
  from: string;
  answer: RTCSessionDescriptionInit;
};
