import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";

const TOOLS = [
  {
    title: "Smart Email Generator",
    description: "Draft polished emails tuned by tone and audience.",
    path: "/email",
    icon: Mail,
    accent: "from-indigo-500 to-violet-500",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Turn raw notes into key points, actions & deadlines.",
    path: "/notes",
    icon: FileText,
    accent: "from-sky-500 to-cyan-500",
  },
  {
    title: "AI Task Planner",
    description: "Prioritize and schedule your day intelligently.",
    path: "/tasks",
    icon: ListChecks,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "AI Research Assistant",
    description: "Get insights, summaries & next steps on any topic.",
    path: "/research",
    icon: Search,
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "AI Chatbot",
    description: "Ask anything and get practical, work-ready answers.",
    path: "/chat",
    icon: MessageSquare,
    accent: "from-fuchsia-500 to-pink-500",
  },
];

export default function Dashboard() {
  const [recent, setRecent] = useState([]);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const items = await base44.entities.SavedContent.list("-created_date", 4);
        setRecent(items || []);
        const tasks = await base44.entities.Task.list("-created_date", 100);
        setTaskCount((tasks || []).filter((t) => t.status !== "done").length);
      } catch (e) {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Welcome back"
        subtitle="Your AI-powered workspace for getting more done, faster."
        icon={Sparkles}
      />

      {/* Stat row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tools</p>
          <p className="mt-1 text-2xl font-semibold">5</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Open Tasks</p>
          <p className="mt-1 text-2xl font-semibold">{taskCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saved Items</p>
          <p className="mt-1 text-2xl font-semibold">{recent.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> All systems ready
          </p>
        </div>
      </div>

      {/* Tool cards */}
      <h2 className="mb-4 text-lg font-semibold">AI Tools</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tool.accent} text-white shadow-sm`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{tool.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open tool <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{item.type}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(item.created_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
