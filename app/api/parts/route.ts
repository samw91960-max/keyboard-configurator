import { NextRequest, NextResponse } from "next/server";
import { getAllParts } from "@/lib/repository";
import type { KeyboardPart, PartType } from "@/types/keyboard";

function flattenParts(parts: Awaited<ReturnType<typeof getAllParts>>) {
  return Object.values(parts).flat() as KeyboardPart[];
}

export async function GET(request: NextRequest) {
  try {
    const parts = await getAllParts();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as PartType | null;
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize") ?? "24"), 1),
      100,
    );
    const filteredParts = type && type in parts ? parts[type] : flattenParts(parts);
    const start = (page - 1) * pageSize;
    const pagedParts = filteredParts.slice(start, start + pageSize);

    return NextResponse.json(
      {
        parts,
        items: pagedParts,
        pagination: {
          page,
          pageSize,
          total: filteredParts.length,
          totalPages: Math.max(Math.ceil(filteredParts.length / pageSize), 1),
        },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取部件库失败";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
