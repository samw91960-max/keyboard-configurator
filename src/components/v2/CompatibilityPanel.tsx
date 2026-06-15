import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { CompatibilityResult } from "@/types/keyboard";

interface CompatibilityPanelProps {
  result: CompatibilityResult;
}

export function CompatibilityPanel({ result }: CompatibilityPanelProps) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {result.compatible ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        )}
        <h2 className="text-base font-semibold text-ink">兼容性检测</h2>
      </div>

      {result.errors.length === 0 ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          当前配置没有严重兼容性错误。
        </p>
      ) : (
        <ul className="space-y-2">
          {result.errors.map((error) => (
            <li
              className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800"
              key={error}
            >
              {error}
            </li>
          ))}
        </ul>
      )}

      {result.warnings.length > 0 ? (
        <div className="mt-3 space-y-2">
          {result.warnings.map((warning) => (
            <div
              className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900"
              key={warning}
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
