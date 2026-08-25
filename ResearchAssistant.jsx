import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Sparkles, Save, Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";
import AiDisclaimer from "@/components/ai/AiDisclaimer";
import LoadingCard from "@/components/ai/LoadingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const DEPTHS = ["Brief overview", "Standard", "In-depth"];

export default function ResearchAssistant() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState("");
  const [depth, setDepth] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleResearch = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a research topic.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("ResearchTopic", { topic, focus, depth });
      setResult(res.data);
    } catch (e) {
      toast({ title: "Research failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await base44.entities.SavedContent.create({
        type: "research",
        title: topic,
        content: JSON.stringify(result),
        metadata: JSON.stringify({ depth, focus }),
      });
      toast({ title: "Research saved to your library." });
    } catch (e) {
      toast({ title: "Save failed.", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Research Assistant"
        subtitle="Get structured insights, summaries, and next steps on any topic."
        icon={Search}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="topic">Research topic *</Label>
            <Input
              id="topic"
              placeholder="e.g. Adoption of AI in healthcare"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">Specific focus (optional)</Label>
            <Input
              id="focus"
              placeholder="e.g. Regulatory challenges"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPTHS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleResearch} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Researching…" : "Run Research"}
          </Button>
        </div>

        <div className="space-y-4">
          {loading && <LoadingCard label="Gathering insights…" />}
          {!loading && !result && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Your research briefing will appear here.</p>
            </div>
          )}
          {result && (
            <div className="space-y-5 rounded-xl border bg-card p-5">
              <div>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h3>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="h-4 w-4" /> Key Insights
                </h3>
                <ul className="space-y-1.5">
                  {result.insights?.map((ins, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span> {ins}
                    </li>
                  ))}
                </ul>
              </div>

              {result.sections?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="h-4 w-4" /> Analysis
                  </h3>
                  <div className="space-y-3">
                    {result.sections.map((s, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-semibold">{s.heading}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.nextSteps?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <ArrowRight className="h-4 w-4" /> Next Steps
                  </h3>
                  <ul className="space-y-1.5">
                    {result.nextSteps.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.searchQueries?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dig Deeper</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.searchQueries.map((q, i) => (
                      <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs">{q}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-1.5 h-4 w-4" /> Save Research
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
