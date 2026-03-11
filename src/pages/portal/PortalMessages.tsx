import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const PortalMessages = () => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["portal-messages", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("messages").select("*").eq("company_id", companyId).order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel("portal-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `company_id=eq.${companyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["portal-messages", companyId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!companyId || !user) throw new Error("Not ready");
      const { error } = await supabase.from("messages").insert({
        company_id: companyId,
        sender_id: user.id,
        content: text,
        is_from_client: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["portal-messages", companyId] });
    },
  });

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-[calc(100vh-0px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Communicate with the Velocity team</p>
      </div>

      <div className="flex-1 overflow-auto bg-card border border-border/50 rounded-xl p-4 shadow-card space-y-3 mb-4">
        {(messages ?? []).map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_from_client ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
              msg.is_from_client
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-foreground"
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.is_from_client ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                {format(new Date(msg.created_at), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <p className="text-muted-foreground text-sm text-center py-12">No messages yet. Start the conversation!</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="resize-none"
          rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button variant="cta" onClick={handleSend} disabled={!content.trim() || sendMutation.isPending} className="self-end">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default PortalMessages;
