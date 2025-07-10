'use client';
import { createContext, useContext, useState } from "react";

const DataStreamContext = createContext<{
  dataStream: string;
  setDataStream: React.Dispatch<React.SetStateAction<string>>;
}>({
  dataStream: "",
  setDataStream: () => {},
});

export function DataStreamProvider({ children }: { children: React.ReactNode }) {
  const [dataStream, setDataStream] = useState(""); // string, not array!
  return (
    <DataStreamContext.Provider value={{ dataStream, setDataStream }}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  return useContext(DataStreamContext);
}