import React from "react";
import {
  CheckCircle2,
  ListTodo,
  CalendarClock,
  Lightbulb,
  ArrowRight,
  BookOpen,
} from "lucide-react";

// Renders saved content intelligently: structured for summaries/research (when
// stored as JSON), plain text otherwise (emails or user-edited content).
export default function SavedContentViewer({ type, content }) {
  if (type === "email") {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
  }

  let data = null;
  try {
    data = JSON.parse(content);
  } catch {
    data = null;
  }

  if (!data || typeof data !== "object") {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
  }

  // Meeting summary shape
  if (data.summary && Array.isArray(data.actionItems)) {
    return (
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</h4>
          <p className="leading-relaxed">{data.summary}</p>
        </div>
        {data.keyPoints?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Key Points
            </h4>
            <ul className="space-y-1">
              {data.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {data.actionItems?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ListTodo className="h-3.5 w-3.5" /> Action Items
            </h4>
            <div className="space-y-1.5">
              {data.actionItems.map((a, i) => (
                <div key={i} className="rounded-md border p-2">
                  <p className="font-medium">{a.task}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Owner: {a.owner} · Due: {a.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.deadlines?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> Deadlines
            </h4>
            <ul className="space-y-1">
              {data.deadlines.map((d, i) => (
                <li key={i} className="flex justify-between rounded-md bg-secondary px-2 py-1">
                  <span>{d.item}</span><span className="font-medium">{d.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Research shape
  if (data.summary && Array.isArray(data.insights)) {
    return (
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h4>
          <p className="leading-relaxed">{data.summary}</p>
        </div>
        {data.insights?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" /> Key Insights
            </h4>
            <ul className="space-y-1">
              {data.insights.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {data.sections?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Analysis
            </h4>
            <div className="space-y-2">
              {data.sections.map((s, i) => (
                <div key={i} className="rounded-md border p-2">
                  <p className="font-semibold">{s.heading}</p>
                  <p className="mt-1 text-muted-foreground">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.nextSteps?.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ArrowRight className="h-3.5 w-3.5" /> Next Steps
            </h4>
            <ol className="list-inside list-decimal space-y-1">
              {data.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}
        {data.searchQueries?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.searchQueries.map((q, i) => (
              <span key={i} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{q}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
}
