import { useSocket } from "@/context/socketProvider";
import peer from "@/services/peer";
import {
  handleCallAcceptedProps,
  handleIncommingCallProps,
  handleUserJoinedProps,
} from "@/types";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const RoomPage = () => {
  const [remoteSocketId, setRemoteSocketId] = useState<string>("");
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const router = useRouter();
  const socket = useSocket();
  const { roomid } = router.query;

  const handleUserJoined = useCallback(
    ({ email, id, roomCounts }: handleUserJoinedProps) => {
      setRemoteSocketId(id);
      console.log(`email ${email}joined the room ${roomCounts} `);
    },
    []
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();

    socket?.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [socket, remoteSocketId]);

  // incomming call handler
  const handleIncommingCall = useCallback(
    async ({ from, offer }: handleIncommingCallProps) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const answer = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, answer });
      console.log(`Incomming call ${from}  ${offer} `);
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer?.addTrack(track, myStream);
      }
    }
  }, [myStream]);
  // handle call accepted
  const handleCallAccepted = useCallback(
    async ({ from, answer }: handleCallAcceptedProps) => {
      await peer.setLocalDescriptionOffer(answer);
      console.log("call accepted !!");

      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();

    socket?.emit("peer:nego:needed", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  // handleNegoNeededIncomming
  const handleNegoNeededIncomming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      console.log(offer);
      socket?.emit("peer:neego:done", { to: from, answer });
    },
    [socket]
  );

  const handleNegoNeededFinal = useCallback(async ({ from, answer }) => {
    console.log(answer, "line no 90");
    await peer.setLocalDescriptionOffer(answer);
  }, []);
  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer?.addEventListener("track", async (event) => {
      const remoteStream = event.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);
  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incomming:call", handleIncommingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeededIncomming);
    socket?.on("peer:nego:final", handleNegoNeededFinal);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incomming:call", handleIncommingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeededIncomming);
      socket?.off("peer:nego:final", handleNegoNeededFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleNegoNeededIncomming,
    handleCallAccepted,
    handleNegoNeededFinal,
  ]);

  return (
    <div className="min-h-screen w-full flex gap-3 flex-col items-center ">
      <h1 className="text-3xl font-medium mt-16">{`RoomName-> ${roomid}`}</h1>

      {/* {myStream && (
        <button
          onClick={sendStreams}
          className="p-3 rounded-md bg-green-500 mt-2 text-xl w-[20%] "
        >
          send Stream
        </button>
      )} */}
      {remoteSocketId && (
        <button
          onClick={handleCallUser}
          className="p-3 rounded-md bg-green-500 mt-2 text-xl w-[20%] "
        >
          Call to {remoteSocketId}
        </button>
      )}
      <div className="flex w-full h-[60vh] ">
        {myStream && (
          <div className=" flex flex-col items-start ">
            <h1>My stream</h1>
            <ReactPlayer playing muted url={myStream} />
          </div>
        )}
      </div>
      <div className="flex w-full h-[60vh] ">
        {myStream && (
          <div className=" flex flex-col items-start ">
            <h1>remote stream</h1>
            <ReactPlayer playing muted url={remoteStream} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
