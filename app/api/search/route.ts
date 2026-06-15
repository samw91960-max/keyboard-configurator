import { NextRequest, NextResponse } from "next/server";
import { searchMockParts } from "@/lib/mockDb";
import type { PartType, SearchRequest, SearchResult } from "@/types/keyboard";

const supportedTypes: PartType[] = [
  "keyboard_template",
  "keycap",
  "switch",
  "pcb",
  "plate",
  "case",
  "diffuser",
  "sound_pack",
];

const searchCache = new Map<
  string,
  { expiresAt: number; results: SearchResult[] }
>();
const searchCacheTtl = 1000 * 60 * 10;

function cacheKey(request: SearchRequest) {
  return `${request.type}:${request.query.trim().toLowerCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SearchRequest>;
    const query = body.query?.trim() ?? "";
    const type = body.type;

    if (!type || !supportedTypes.includes(type)) {
      return NextResponse.json(
        { error: "搜索类型无效" },
        { status: 400 },
      );
    }

    const normalizedRequest: SearchRequest = { query, type };
    const key = cacheKey(normalizedRequest);
    const cached = searchCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        provider: "mock",
        cached: true,
        nextProviders: ["tavily", "firecrawl", "serpapi", "openai_web_search"],
        results: cached.results,
      });
    }

    const results = searchMockParts(normalizedRequest);
    searchCache.set(key, {
      expiresAt: Date.now() + searchCacheTtl,
      results,
    });

    return NextResponse.json({
      provider: "mock",
      cached: false,
      nextProviders: ["tavily", "firecrawl", "serpapi", "openai_web_search"],
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "搜索请求解析失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
