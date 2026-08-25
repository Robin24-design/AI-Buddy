import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Save, Sparkles, CheckCircle2, CalendarClock, ListTodo } from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";
import AiDisclaimer from "@/components/ai/AiDisclaimer";
import LoadingCard from "@/components/ai/LoadingCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function MeetingSummarizer() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast({ title: "Please paste your meeting notes.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("SummarizeNotes", {
        notes,
        meetingTitle: title,
      });
      setResult(res.data);
    } catch (e) {
      toast({ title: "Summarization failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await base44.entities.SavedContent.create({
        type: "summary",
        title: title || "Meeting Summary",
        content: JSON.stringify(result),
        metadata: JSON.stringify({ actionCount: result.actionItems?.length || 0 }),
      });
      toast({ title: "Summary saved to your library." });
    } catch (e) {
      toast({ title: "Save failed.", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Meeting Notes Summarizer"
        subtitle="Extract key points, action items, and deadlines from raw meeting notes."
        icon={FileText}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Q3 Product Strategy Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes *</Label>
            <Textarea
              id="notes"
              placeholder="Paste your raw meeting notes here…"
              rows={12}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={handleSummarize} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Analyzing…" : "Summarize Notes"}
          </Button>
        </div>

        <div className="space-y-4">
          {loading && <LoadingCard label="Analyzing your notes…" />}
          {!loading && !result && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Your structured summary will appear here.</p>
            </div>
          )}
          {result && (
            <div className="space-y-5 rounded-xl border bg-card p-5">
              <div>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Summary</h3>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" /> Key Points
                </h3>
                <ul className="space-y-1.5">
                  {result.keyPoints?.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <ListTodo className="h-4 w-4" /> Action Items
                </h3>
                <div className="space-y-2">
                  {result.actionItems?.map((a, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{a.task}</p>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>Owner: {a.owner}</span>
                        <span>Due: {a.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.deadlines?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <CalendarClock className="h-4 w-4" /> Deadlines
                  </h3>
                  <ul className="space-y-1.5">
                    {result.deadlines.map((d, i) => (
                      <li key={i} className="flex justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                        <span>{d.item}</span>
                        <span className="font-medium">{d.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-1.5 h-4 w-4" /> Save Summary
                </Button>
              </div>
              <AiDisclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
