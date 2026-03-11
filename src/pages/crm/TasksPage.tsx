import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TaskStatus = Database["public"]["Enums"]["task_status"];

const statusIcons: Record<TaskStatus, typeof Circle> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

const statusColors: Record<TaskStatus, string> = {
  pending: "text-muted-foreground",
  in_progress: "text-accent",
  completed: "text-green-500",
};

const TasksPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", due_date: "", status: "pending" as TaskStatus });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["crm-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        title: form.title, description: form.description || null,
        due_date: form.due_date || null, status: form.status,
        assigned_to: user?.id, created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast.success("Task created");
      setOpen(false);
      setForm({ title: "", description: "", due_date: "", status: "pending" });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const next: TaskStatus = status === "pending" ? "in_progress" : status === "in_progress" ? "completed" : "pending";
      const { error } = await supabase.from("tasks").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-tasks"] }),
  });

  const filtered = tasks.filter((t) => filterStatus === "all" || t.status === filterStatus);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks.filter((t) => t.status !== "completed").length} open tasks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta"><Plus size={16} /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Task title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Button type="submit" variant="cta" className="w-full" disabled={createMutation.isPending}>Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks found</p>
        ) : (
          filtered.map((task) => {
            const Icon = statusIcons[task.status];
            return (
              <div key={task.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-card flex items-start gap-3">
                <button onClick={() => toggleStatus.mutate({ id: task.id, status: task.status })} className="mt-0.5">
                  <Icon size={20} className={cn(statusColors[task.status], "transition-colors")} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-foreground", task.status === "completed" && "line-through text-muted-foreground")}>{task.title}</p>
                  {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-2">Due: {format(new Date(task.due_date), "MMM d, yyyy")}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TasksPage;
