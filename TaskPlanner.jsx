import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ListChecks, Sparkles, Save, Trash2, Circle, CheckCircle2, Loader } from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";
import AiDisclaimer from "@/components/ai/AiDisclaimer";
import LoadingCard from "@/components/ai/LoadingCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function TaskPlanner() {
  const { toast } = useToast();
  const [taskList, setTaskList] = useState("");
  const [context, setContext] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);

  const handlePlan = async () => {
    if (!taskList.trim()) {
      toast({ title: "Please list your tasks first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const res = await base44.functions.invoke("PlanTasks", {
        taskList,
        context,
        workingHours,
      });
      setPlan(res.data);
    } catch (e) {
      toast({ title: "Planning failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan?.tasks?.length) return;
    try {
      await base44.entities.Task.bulkCreate(
        plan.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
          estimatedMinutes: t.estimatedMinutes,
          timeBlock: t.timeBlock,
          status: "planned",
        }))
      );
      toast({ title: `${plan.tasks.length} tasks saved to your plan.` });
      loadTasks();
    } catch (e) {
      toast({ title: "Save failed.", variant: "destructive" });
    }
  };

  const loadTasks = async () => {
    try {
      const items = await base44.entities.Task.list("-created_date", 100);
      setTasks(items || []);
    } catch (e) {
      /* ignore */
    }
  };

  const toggleStatus = async (task) => {
    const next = task.status === "done" ? "planned" : "done";
    try {
      await base44.entities.Task.update(task.id, { status: next });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    } catch (e) {
      toast({ title: "Update failed.", variant: "destructive" });
    }
  };

  const deleteTask = async (id) => {
    try {
      await base44.entities.Task.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      toast({ title: "Delete failed.", variant: "destructive" });
    }
  };

  React.useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div>
      <PageHeader
        title="AI Task Planner"
        subtitle="Prioritize and schedule your tasks into an intelligent daily plan."
        icon={ListChecks}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="tasks">Your tasks *</Label>
            <Textarea
              id="tasks"
              placeholder={"One task per line, e.g.\nFinalize Q3 budget deck\nReply to vendor emails\nReview pull requests"}
              rows={6}
              value={taskList}
              onChange={(e) => setTaskList(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Input
              id="context"
              placeholder="e.g. Big client demo on Thursday"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Working hours (optional)</Label>
            <Input
              id="hours"
              placeholder="e.g. 9am - 5pm"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
            />
          </div>
          <Button onClick={handlePlan} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Planning…" : "Generate Plan"}
          </Button>
        </div>

        <div className="space-y-4">
          {loading && <LoadingCard label="Building your plan…" />}
          {!loading && !plan && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <ListChecks className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Your AI-optimized schedule will appear here.</p>
            </div>
          )}
          {plan && (
            <div className="space-y-4 rounded-xl border bg-card p-5">
              <p className="text-sm leading-relaxed">{plan.planOverview}</p>
              <div className="space-y-2">
                {plan.tasks?.map((t, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>⏱ {t.timeBlock}</span>
                      <span>~{t.estimatedMinutes} min</span>
                      <span className="rounded bg-secondary px-1.5 py-0.5">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleSavePlan}>
                  <Save className="mr-1.5 h-4 w-4" /> Save All Tasks
                </Button>
              </div>
              <AiDisclaimer />
            </div>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Your Saved Tasks</h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                <button onClick={() => toggleStatus(t)} className="text-muted-foreground hover:text-primary">
                  {t.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                    {t.title}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {t.timeBlock && <span>⏱ {t.timeBlock}</span>}
                    {t.category && <span className="rounded bg-secondary px-1.5 py-0.5">{t.category}</span>}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[t.priority] || ""}`}>
                  {t.priority}
                </span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
