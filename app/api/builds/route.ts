import { NextRequest, NextResponse } from "next/server";
import { checkBuildCompatibility } from "@/lib/compatibility";
import { getAllParts, getBuilds, saveBuild } from "@/lib/repository";
import type {
  BuildCustomization,
  BuildPartsSelection,
  KeyboardBuild,
} from "@/types/keyboard";

export const runtime = "edge";

const userId = "demo-user";

function createBuildId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `build-${Date.now()}`;
}

export async function GET() {
  try {
    const builds = await getBuilds(userId);

    return NextResponse.json(
      { builds },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取配置失败";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<
      BuildPartsSelection & BuildCustomization
    > & {
      name?: string;
    };

    const requiredFields: (keyof BuildPartsSelection)[] = [
      "templateId",
      "keycapId",
      "switchId",
      "pcbId",
      "plateId",
      "caseId",
      "diffuserId",
      "soundPackId",
    ];
    const missingField = requiredFields.find((field) => !body[field]);

    if (missingField) {
      return NextResponse.json(
        { error: `缺少配置字段：${missingField}` },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const build: KeyboardBuild = {
      id: createBuildId(),
      userId,
      name: body.name?.trim() || "未命名键盘配置",
      templateId: body.templateId!,
      keycapId: body.keycapId!,
      switchId: body.switchId!,
      pcbId: body.pcbId!,
      plateId: body.plateId!,
      caseId: body.caseId!,
      diffuserId: body.diffuserId!,
      soundPackId: body.soundPackId!,
      keyColorMap: body.keyColorMap ?? {},
      defaultKeycapColor: body.defaultKeycapColor ?? "#F4E9D8",
      legendColor: body.legendColor ?? "#151922",
      caseColor: body.caseColor ?? "#4B5563",
      lightingColor: body.lightingColor ?? "#73D8FF",
      keycapMaterialStyle: body.keycapMaterialStyle ?? "normal",
      createdAt: now,
      updatedAt: now,
    };

    const parts = await getAllParts();
    const compatibility = checkBuildCompatibility(build, parts);

    if (!compatibility.compatible) {
      return NextResponse.json(
        { error: "当前配置存在严重兼容性问题", compatibility },
        { status: 422 },
      );
    }

    const savedBuild = await saveBuild(build);

    return NextResponse.json(
      { build: savedBuild, compatibility },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存配置失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
