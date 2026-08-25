import React from "react";
import { Info } from "lucide-react";

export default function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>AI-generated content may require human review before use.</span>
    </div>
  );
}
