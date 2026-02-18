"use client";

import { createContext, useContext, useState } from "react";

interface WindSpeedContextType {
  windSpeed: number;
  setWindSpeed: (value: number) => void;
}

const WindSpeedContext = createContext<WindSpeedContextType>({
  windSpeed: 0,
  setWindSpeed: () => {},
});

export function WindSpeedProvider({ children }: { children: React.ReactNode }) {
  const [windSpeed, setWindSpeed] = useState(0);
  return (
    <WindSpeedContext.Provider value={{ windSpeed, setWindSpeed }}>
      {children}
    </WindSpeedContext.Provider>
  );
}

export function useWindSpeed() {
  return useContext(WindSpeedContext);
}
