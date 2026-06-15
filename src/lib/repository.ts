import {
  getAllParts as getMockAllParts,
  getBuilds as getMockBuilds,
  importPart as importMockPart,
  normalizeExtractedPart,
  saveBuild as saveMockBuild,
} from "@/lib/mockDb";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ExtractedPart,
  KeyboardBuild,
  KeyboardPart,
  PartType,
  PartsByType,
} from "@/types/keyboard";

type PartRow = {
  id: string;
  type: PartType;
  name: string;
  data: KeyboardPart;
};

type BuildRow = {
  id: string;
  user_id: string;
  name: string;
  data: KeyboardBuild;
  created_at: string;
  updated_at: string;
};

function mergePart(parts: PartsByType, part: KeyboardPart) {
  const target = parts[part.type] as KeyboardPart[];
  const existingIndex = target.findIndex((item) => item.id === part.id);

  if (existingIndex >= 0) {
    target[existingIndex] = part;
    return;
  }

  target.push(part);
}

function cloneInitialParts() {
  return getMockAllParts();
}

export async function getAllParts(): Promise<PartsByType> {
  const parts = cloneInitialParts();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return parts;
  }

  const { data, error } = await supabase
    .from("keyboard_parts")
    .select("id,type,name,data")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`读取部件库失败：${error.message}`);
  }

  for (const row of (data ?? []) as PartRow[]) {
    mergePart(parts, row.data);
  }

  return parts;
}

export async function getBuilds(userId = "demo-user"): Promise<KeyboardBuild[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return getMockBuilds(userId);
  }

  const { data, error } = await supabase
    .from("keyboard_builds")
    .select("id,user_id,name,data,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`读取配置失败：${error.message}`);
  }

  return ((data ?? []) as BuildRow[]).map((row) => row.data);
}

export async function saveBuild(build: KeyboardBuild): Promise<KeyboardBuild> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return saveMockBuild(build);
  }

  const { error } = await supabase.from("keyboard_builds").insert({
    id: build.id,
    user_id: build.userId,
    name: build.name,
    data: build,
    created_at: build.createdAt,
    updated_at: build.updatedAt,
  });

  if (error) {
    throw new Error(`保存配置失败：${error.message}`);
  }

  return build;
}

export async function importPart(extractedPart: ExtractedPart): Promise<KeyboardPart> {
  if (!extractedPart?.type || !extractedPart.name?.trim()) {
    throw new Error("导入失败：缺少部件类型或名称");
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return importMockPart(extractedPart);
  }

  const currentParts = await getAllParts();
  const normalizedName = extractedPart.name.trim().toLowerCase();
  const localDuplicate = currentParts[extractedPart.type].some(
    (part) => part.name.trim().toLowerCase() === normalizedName,
  );

  if (localDuplicate) {
    throw new Error(`部件已存在：${extractedPart.name}`);
  }

  const normalizedPart = normalizeExtractedPart(extractedPart);
  const { error } = await supabase.from("keyboard_parts").insert({
    id: normalizedPart.id,
    type: normalizedPart.type,
    name: normalizedPart.name,
    data: normalizedPart,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`部件已存在：${extractedPart.name}`);
    }

    throw new Error(`导入部件失败：${error.message}`);
  }

  return normalizedPart;
}

export async function checkDatabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      database: "mock",
      message: "Supabase 环境变量未配置，当前使用本地 mock 存储。",
    };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      connected: false,
      database: "unavailable",
      message: "Supabase 客户端初始化失败。",
    };
  }

  const { error } = await supabase
    .from("keyboard_parts")
    .select("id")
    .limit(1);

  if (error) {
    return {
      connected: false,
      database: "error",
      message: error.message,
    };
  }

  return {
    connected: true,
    database: "connected",
    message: "Supabase connected",
  };
}
