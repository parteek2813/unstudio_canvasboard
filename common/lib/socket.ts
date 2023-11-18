import { io, Socket } from "socket.io-client";

console.log("Socket.ts file running");

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
