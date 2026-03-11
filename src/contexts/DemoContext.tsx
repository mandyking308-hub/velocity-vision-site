import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

interface DemoContextType {
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  guardAction: (actionName?: string) => boolean;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  enterDemoMode: () => {},
  exitDemoMode: () => {},
  guardAction: () => true,
});

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return sessionStorage.getItem("velocity_demo") === "true";
  });

  const enterDemoMode = () => {
    sessionStorage.setItem("velocity_demo", "true");
    setIsDemoMode(true);
  };

  const exitDemoMode = () => {
    sessionStorage.removeItem("velocity_demo");
    setIsDemoMode(false);
  };

  const guardAction = (actionName?: string): boolean => {
    if (isDemoMode) {
      toast.info(`This feature is disabled in the demo environment.${actionName ? ` (${actionName})` : ""}`);
      return false;
    }
    return true;
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, enterDemoMode, exitDemoMode, guardAction }}>
      {children}
    </DemoContext.Provider>
  );
};
