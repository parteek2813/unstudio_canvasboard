// Combined.tsx
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId, useRoom } from "@/common/recoil/room";
import RoomContextProvider from "../context/Room.context";
import Canvas from "./board/Canvas";
import MousePosition from "./board/MousePosition";
import MousesRenderer from "./board/MousesRenderer";
import MoveImage from "./board/MoveImage";
import SelectionBtns from "./board/SelectionBtns";
import NameInput from "./NameInput";
import ToolBar from "./toolbar/ToolBar";
import UserList from "./UserList";

interface RoomProps {
  setShowRoom: boolean | any;
}

const Home: React.FC<RoomProps> = ({ setShowRoom }) => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  // const [showRoom, setShowRoom] = useState(false); // Local state to control rendering

  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    socket.on("created", (idFromSr) => {
      console.log(idFromSr);
      setAtomRoomId(idFromSr);
      router.push(idFromSr);
    });

    return () => {
      socket.off("created");
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
    setShowRoom(true); // Set showRoom to true after clicking "Start"
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

const Room = () => {
  return (
    <RoomContextProvider>
      <div className="relative h-full w-full overflow-hidden">
        <UserList />
        <ToolBar />
        <SelectionBtns />
        <MoveImage />
        <Canvas />
        <MousePosition />
        <MousesRenderer />
      </div>
    </RoomContextProvider>
  );
};

const Combined = () => {
  const [showRoom, setShowRoom] = useState(false);

  return <>{showRoom ? <Room /> : <Home setShowRoom={setShowRoom} />}</>;
};

export default Combined;
