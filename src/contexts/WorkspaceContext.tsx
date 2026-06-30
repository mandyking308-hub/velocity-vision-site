import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentId: string | null;
  setCurrentId: (id: string) => void;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaces: [],
  currentId: null,
  setCurrentId: () => {},
  loading: true,
});

const STORAGE_KEY = "vv.currentWorkspaceId";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentId, setCurrentIdState] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("client_workspaces")
        .select("id, name")
        .order("created_at", { ascending: false });
      const list = (data || []) as Workspace[];
      setWorkspaces(list);
      if (list.length && !list.find((w) => w.id === currentId)) {
        setCurrentIdState(list[0].id);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      }
      setLoading(false);
    })();
  }, [user]);

  const setCurrentId = (id: string) => {
    setCurrentIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentId, setCurrentId, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
