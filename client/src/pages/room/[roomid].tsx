import { useSocket } from "@/context/socketProvider";
import peer from "@/services/peer";
import {
  handleCallAccepted,
  handleIncommingCall,
  handleUserJoined,
} from "@/types";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const RoomPage = () => {
  const router = useRouter();
  const [remoteSocketId, setRemoteSocketId] = useState<string>("");
  const socket = useSocket();
  const [myStream, setMyStream] = useState<MediaStream>();
  const { roomid } = router.query;
  const handleUserJoined = useCallback(
    ({ email, id, roomCounts }: handleUserJoined) => {
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
    async ({ from, offer }: handleIncommingCall) => {
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
  // handle call accepted
  const handleCallAccepted = useCallback(
    async ({ from, answer }: handleCallAccepted) => {
      peer.setLocalDescription(answer);
      console.log("call accepted !!");
      console.log(`call accepted ${from} ${answer}`);
    },
    []
  );
  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incomming:call", handleIncommingCall);
    socket?.on("call:accepted", handleCallAccepted);
    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incomming:call", handleIncommingCall);
      socket?.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted]);

  return (
    <div className="min-h-screen w-full flex gap-3 flex-col items-center ">
      <h1 className="text-3xl font-medium mt-16">{`RoomName-> ${roomid}`}</h1>
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
    </div>
  );
};

export default RoomPage;
