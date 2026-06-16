"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { PageShell } from "@/components/v2/PageShell";
import { partTypeLabels, partTypes } from "@/lib/labels";
import type { PartType, SearchResult } from "@/types/keyboard";

export default function SearchPage() {
  const [query, setQuery] = useState("Neo65");
  const [type, setType] = useState<PartType>("keyboard_template");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingKey, setImportingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const uniqueResults = useMemo(() => {
    const seen = new Set<string>();

    return results.filter((result) => {
      const key = `${result.extractedPart.type}:${result.url}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [results]);

  async function handleSearch() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "搜索失败");
      }

      setResults(data.results ?? []);
      setMessage(
        `找到 ${data.results?.length ?? 0} 条${data.cached ? "缓存" : "mock"}搜索结果`,
      );
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : "搜索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(result: SearchResult) {
    const key = `${result.extractedPart.type}:${result.url}`;
    setImportingKey(key);
    setMessage("");

    try {
      const response = await fetch("/api/parts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedPart: { ...result.extractedPart, sourceUrl: result.url },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "导入失败");
      }

      setMessage(`已导入：${data.part.name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败，请稍后重试");
    } finally {
      setImportingKey(null);
    }
  }

  return (
    <PageShell
      description="先用 mock 搜索结果模拟网络资料抽取；接口已预留 Tavily、Firecrawl、SerpAPI 和 OpenAI Web Search。"
      title="网络搜索与部件导入"
    >
      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label>
            <span className="mb-1 block text-sm font-semibold text-ink">关键词</span>
            <input
              className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Neo65 / Gateron Oil King / PBT keycaps"
              value={query}
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-ink">搜索类型</span>
            <select
              className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              onChange={(event) => setType(event.target.value as PartType)}
              value={type}
            >
              {partTypes.map((partType, index) => (
                <option key={`search-type-${partType}-${index}`} value={partType}>
                  {partTypeLabels[partType]}
                </option>
              ))}
            </select>
          </label>

          <button
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={handleSearch}
            type="button"
          >
            <Search className="h-4 w-4" />
            {loading ? "搜索中" : "搜索"}
          </button>
        </div>

        {message ? (
          <p className="mt-3 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700">
            {message}
          </p>
        ) : null}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        {uniqueResults.map((result, index) => {
          const importKey = `${result.extractedPart.type}:${result.url}`;

          return (
            <article
              className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"
              key={`search-${result.extractedPart.type}-${index}-${result.url}`}
            >
              <div className="mb-3 flex gap-3">
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-md bg-stone-100 text-xs font-semibold text-stone-500">
                  MOCK
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-ink">{result.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {result.snippet}
                  </p>
                  <a
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-sky-700 hover:text-sky-900"
                    href={result.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{result.url}</span>
                  </a>
                </div>
              </div>

              <div className="rounded-md bg-stone-50 p-3 text-sm text-stone-700">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    抽取为：{partTypeLabels[result.extractedPart.type]}
                  </span>
                  <span className="text-xs text-stone-500">
                    confidence {result.confidence.toFixed(2)}
                  </span>
                </div>
                <p>{result.extractedPart.name}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {(result.extractedPart.tags ?? []).join(" / ")}
                </p>
              </div>

              <button
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-ink transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={importingKey === importKey}
                onClick={() => handleImport(result)}
                type="button"
              >
                <Download className="h-4 w-4" />
                {importingKey === importKey ? "导入中" : "导入部件库"}
              </button>
            </article>
          );
        })}
      </section>
    </PageShell>
  );
}
