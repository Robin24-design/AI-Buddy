import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bookmark, Search, Trash2, Pencil, Mail, FileText, Loader2, Eye } from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";
import SavedContentViewer from "@/components/ai/SavedContentViewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const TYPE_META = {
  email: { label: "Email", icon: Mail, badge: "bg-indigo-100 text-indigo-700" },
  summary: { label: "Summary", icon: FileText, badge: "bg-sky-100 text-sky-700" },
  research: { label: "Research", icon: Search, badge: "bg-amber-100 text-amber-700" },
};

const FILTERS = ["all", "email", "summary", "research"];

// Flatten structured JSON content into readable editable text.
function toEditableText(type, content) {
  if (type === "email") return content;
  try {
    const obj = JSON.parse(content);
    if (obj.summary && Array.isArray(obj.actionItems)) {
      let text = `Summary:\n${obj.summary}\n\nKey Points:\n${(obj.keyPoints || []).map((p) => `- ${p}`).join("\n")}\n\nAction Items:\n${(obj.actionItems || []).map((a) => `- ${a.task} (Owner: ${a.owner}, Due: ${a.dueDate})`).join("\n")}`;
      if (obj.deadlines?.length) text += `\n\nDeadlines:\n${obj.deadlines.map((d) => `- ${d.item}: ${d.date}`).join("\n")}`;
      return text;
    }
    if (obj.summary && Array.isArray(obj.insights)) {
      let text = `Summary:\n${obj.summary}\n\nInsights:\n${(obj.insights || []).map((p) => `- ${p}`).join("\n")}`;
      if (obj.sections?.length) text += `\n\n${obj.sections.map((s) => `${s.heading}\n${s.content}`).join("\n\n")}`;
      if (obj.nextSteps?.length) text += `\n\nNext Steps:\n${obj.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      return text;
    }
  } catch {
    /* not JSON */
  }
  return content;
}

export default function SavedLibrary() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SavedContent.list("-created_date", 200);
      setItems(data || []);
    } catch (e) {
      toast({ title: "Failed to load library.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const matchType = filter === "all" || i.type === filter;
    const q = query.toLowerCase();
    const matchQuery =
      !q || i.title?.toLowerCase().includes(q) || i.content?.toLowerCase().includes(q);
    return matchType && matchQuery;
  });

  const openEdit = (item) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditContent(toEditableText(item.type, item.content));
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      toast({ title: "Title cannot be empty.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.SavedContent.update(editItem.id, {
        title: editTitle,
        content: editContent,
      });
      toast({ title: "Changes saved." });
      setEditItem(null);
      load();
    } catch (e) {
      toast({ title: "Save failed.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.SavedContent.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (viewItem?.id === id) setViewItem(null);
      toast({ title: "Item deleted." });
    } catch (e) {
      toast({ title: "Delete failed.", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Saved Library"
        subtitle="View, search, and edit everything you've saved across your AI tools."
        icon={Bookmark}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : TYPE_META[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Bookmark className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No saved items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate content in any tool and save it to see it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.email;
            const Icon = meta.icon;
            return (
              <div key={item.id} className="flex flex-col rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
                    <Icon className="h-3 w-3" /> {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 line-clamp-3 flex-1 text-xs text-muted-foreground">
                  {item.type === "email"
                    ? item.content
                    : toEditableText(item.type, item.content)}
                </p>
                <div className="mt-4 flex gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => setViewItem(item)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewItem && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${(TYPE_META[viewItem.type] || TYPE_META.email).badge}`}>
                  {(TYPE_META[viewItem.type] || TYPE_META.email).label}
                </span>
              )}
              {viewItem?.title}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <SavedContentViewer type={viewItem.type} content={viewItem.content} />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => openEdit(viewItem)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDelete(viewItem.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Saved Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  rows={12}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Structured summaries and research are shown as readable text. Editing saves them as plain text.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
