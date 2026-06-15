import { NextRequest, NextResponse } from "next/server";
import { importPart } from "@/lib/repository";
import type { ExtractedPart } from "@/types/keyboard";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { extractedPart?: ExtractedPart };

    if (!body.extractedPart) {
      return NextResponse.json(
        { error: "缺少 extractedPart" },
        { status: 400 },
      );
    }

    const part = await importPart(body.extractedPart);

    return NextResponse.json({ part }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导入部件失败";
    const status = message.includes("已存在") ? 409 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
