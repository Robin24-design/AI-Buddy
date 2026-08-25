import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Copy, Check, Save, Sparkles } from "lucide-react";
import PageHeader from "@/components/ai/PageHeader";
import AiDisclaimer from "@/components/ai/AiDisclaimer";
import LoadingCard from "@/components/ai/LoadingCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

const TONES = ["Professional", "Friendly", "Formal", "Persuasive", "Concise", "Apologetic"];
const AUDIENCES = ["Colleague", "Manager", "Client", "Team", "Vendor", "Job Applicant"];

export default function EmailGenerator() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    purpose: "",
    tone: "Professional",
    audience: "Colleague",
    keyPoints: "",
    senderName: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!form.purpose.trim()) {
      toast({ title: "Please describe the email's purpose.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("GenerateEmail", form);
      setResult(res.data);
    } catch (e) {
      toast({ title: "Generation failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await base44.entities.SavedContent.create({
        type: "email",
        title: result.subject,
        content: `Subject: ${result.subject}\n\n${result.body}`,
        metadata: JSON.stringify({ tone: form.tone, audience: form.audience }),
      });
      toast({ title: "Email saved to your library." });
    } catch (e) {
      toast({ title: "Save failed.", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Smart Email Generator"
        subtitle="Draft polished, ready-to-send emails tuned to your tone and audience."
        icon={Mail}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="purpose">Email purpose *</Label>
            <Textarea
              id="purpose"
              placeholder="e.g. Request a project deadline extension by one week due to scope changes"
              rows={4}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Key points to include (optional)</Label>
            <Textarea
              id="points"
              placeholder="One point per line"
              rows={3}
              value={form.keyPoints}
              onChange={(e) => setForm({ ...form, keyPoints: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Your name (optional)</Label>
            <Input
              id="name"
              placeholder="Used for the sign-off"
              value={form.senderName}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Generating…" : "Generate Email"}
          </Button>
        </div>

        <div className="space-y-4">
          {loading && <LoadingCard label="Crafting your email…" />}
          {!loading && !result && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <Mail className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Your generated email will appear here.</p>
            </div>
          )}
          {result && (
            <div className="space-y-3 rounded-xl border bg-card p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</p>
                <p className="mt-1 font-semibold">{result.subject}</p>
              </div>
              <div className="border-t pt-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.body}</p>
              </div>
              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-1.5 h-4 w-4" /> Save
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
