import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CompatibilityIssue } from "../utils/compatibility";

interface CompatibilityNoticeProps {
  issues: CompatibilityIssue[];
}

export function CompatibilityNotice({ issues }: CompatibilityNoticeProps) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        当前组合兼容，可以进入装配预览。
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        需要处理的兼容性问题
      </div>
      <ul className="space-y-1">
        {issues.map((issue) => (
          <li key={`${issue.partType}-${issue.partName}-${issue.reason}`}>
            {issue.partName}：{issue.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
