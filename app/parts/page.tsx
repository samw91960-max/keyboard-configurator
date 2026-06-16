"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/v2/PageShell";
import { PartCard } from "@/components/v2/PartCard";
import { partTypeLabels, partTypes } from "@/lib/labels";
import type { KeyboardPart, PartType } from "@/types/keyboard";

const pageSize = 9;

export default function PartsPage() {
  const [items, setItems] = useState<KeyboardPart[]>([]);
  const [filter, setFilter] = useState<PartType | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("正在加载部件库...");
  const [loading, setLoading] = useState(false);
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();

    return items.filter((part) => {
      const key = `${part.type}:${part.id}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [items]);

  useEffect(() => {
    async function loadParts() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (filter !== "all") {
          params.set("type", filter);
        }

        const response = await fetch(`/api/parts?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "读取部件库失败");
        }

        setItems(data.items ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "读取部件库失败");
      } finally {
        setLoading(false);
      }
    }

    void loadParts();
  }, [filter, page]);

  return (
    <PageShell
      description="展示已经导入的部件库。生产环境会从 Supabase 读取，并支持分页加载。"
      title="部件库"
    >
      <section className="mb-5 flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <label className="block max-w-xs">
          <span className="mb-1 block text-sm font-semibold text-ink">类型筛选</span>
          <select
            className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            onChange={(event) => {
              setFilter(event.target.value as PartType | "all");
              setPage(1);
            }}
            value={filter}
          >
            <option value="all">全部部件</option>
            {partTypes.map((partType, index) => (
              <option key={`parts-type-${partType}-${index}`} value={partType}>
                {partTypeLabels[partType]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 text-sm text-stone-600">
          <button
            className="h-9 rounded-md border border-stone-300 px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            type="button"
          >
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <button
            className="h-9 rounded-md border border-stone-300 px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            下一页
          </button>
        </div>
      </section>

      {message ? (
        <p className="rounded-md bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {uniqueItems.map((part, index) => (
          <PartCard key={`part-${part.type}-${part.id}-${index}`} part={part} />
        ))}
      </section>
    </PageShell>
  );
}
