import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingCard({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card py-16 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{label || "Generating…"}</p>
    </div>
  );
}
