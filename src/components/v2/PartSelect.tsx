import type { KeyboardPart } from "@/types/keyboard";

interface PartSelectProps {
  label: string;
  value: string;
  parts: KeyboardPart[];
  onChange: (value: string) => void;
}

export function PartSelect({ label, value, parts, onChange }: PartSelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <select
        className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {parts.map((part) => (
          <option key={part.id} value={part.id}>
            {part.name}
          </option>
        ))}
      </select>
    </label>
  );
}
