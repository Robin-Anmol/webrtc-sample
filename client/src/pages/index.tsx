import { useSocket } from "@/context/socketProvider";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

const LobbyScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const router = useRouter();
  const socket = useSocket();
  console.log(socket);
  const SubmitHandler = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log(email, room);
      socket?.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoom(e.target.value);
  };
  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleJoinRoom = useCallback(
    (data: { email: string; room: string }) => {
      console.log(data);
      router.push(`room/${data.room}`);
    },
    []
  );
  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);
    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 ">
      <h1 className="text-3xl  capitalize ">webrtc Lobby</h1>
      <form className="flex flex-col gap-3 w-[30%]" onSubmit={SubmitHandler}>
        <label htmlFor="email" className="text-xl font-semibold">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={onChangeEmail}
          className="text-gray-800 px-3  font-medium text-xl rounded-sm py-3"
          placeholder="Enter your email"
        />
        <label htmlFor="room" className="text-xl font-semibold">
          Room code
        </label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={onChangeRoom}
          className="text-gray-800 px-3  font-medium text-xl rounded-sm py-3"
          placeholder="Enter room code "
        />
        <button
          className=" px-3 mt-2 py-3 rounded-sm text-xl  bg-green-500"
          type="submit"
        >
          Join Room
        </button>
      </form>
    </div>
  );
};

export default LobbyScreen;
