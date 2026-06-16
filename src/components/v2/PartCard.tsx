import { ExternalLink } from "lucide-react";
import { partTypeLabels } from "@/lib/labels";
import type { KeyboardPart } from "@/types/keyboard";

interface PartCardProps {
  part: KeyboardPart;
}

function partMeta(part: KeyboardPart): string {
  switch (part.type) {
    case "keyboard_template":
      return `${part.brand} / ${part.layout} / ${part.mount}`;
    case "keycap":
      return `${part.brand} / ${part.material} / ${part.profile}`;
    case "switch":
      return `${part.brand} / ${part.switchType} / ${part.actuationForce} gf / ${part.soundProfile}`;
    case "pcb":
      return `${part.brand} / ${part.layout} / ${
        part.hotswap ? "热插拔" : "焊接"
      } / ${part.rgb ? "RGB" : "无 RGB"}`;
    case "plate":
      return `${part.brand} / ${part.layout} / ${part.material}`;
    case "case":
      return `${part.brand} / ${part.layout} / ${part.material}`;
    case "diffuser":
      return `${part.brand} / ${part.color}`;
    case "sound_pack":
      return `${part.brand} / ${part.soundProfile} / ${part.compatibleSwitchTypes.join(", ")}`;
  }
}

function sourceUrl(part: KeyboardPart) {
  return "sourceUrl" in part ? part.sourceUrl : undefined;
}

export function PartCard({ part }: PartCardProps) {
  const url = sourceUrl(part);
  const tags = Array.from(new Set(part.tags));

  return (
    <article className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{part.name}</h3>
          <p className="mt-1 text-sm text-stone-500">{partMeta(part)}</p>
          {url ? (
            <a
              className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-sky-700 hover:text-sky-900"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">资料链接：{url}</span>
            </a>
          ) : null}
        </div>
        <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
          {partTypeLabels[part.type]}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600"
            key={`part-tag-${part.type}-${part.id}-${index}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
