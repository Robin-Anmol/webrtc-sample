import { createContext, useMemo, useContext, ReactNode, Children } from "react";
import { io, Socket } from "socket.io-client";
type SocketContextProps = Socket | null;
const SocketContext = createContext<SocketContextProps>(null);

export const useSocket = (): SocketContextProps => useContext(SocketContext);

type SocketProviderProps = {
  children: ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useMemo(() => io("localhost:8080"), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
