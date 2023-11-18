import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    // generate created connection, gen room id , get room id from server and push on to that room id
    socket.on("created", (idFromSr) => {
      console.log(idFromSr);
      setAtomRoomId(idFromSr);
      router.push(idFromSr);
    });

    return () => {
      socket.off("created");
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  // on roomId change, emit the leave_room event to socket and empty the roomId
  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  return (
    <div className="flex flex-col items-center py-24">
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
        unstudio
      </h1>
      <h3 className="text-xl sm:text-2xl">Real-time Canvas Board</h3>

      <div className="my-8 h-px w-96 bg-zinc-200" />

      <div className="flex flex-col items-center gap-2">
        <h5 className="self-start font-bold leading-tight">
          Click to start drawing
        </h5>

        <button className="btn" onClick={handleCreateRoom}>
          Start
        </button>
      </div>
    </div>
  );
};

export default Home;
