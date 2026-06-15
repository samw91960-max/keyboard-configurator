import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/repository";

export async function GET() {
  const health = await checkDatabaseConnection();
  const status = health.connected || health.database === "mock" ? 200 : 503;

  return NextResponse.json(
    {
      status: status === 200 ? "ok" : "error",
      time: new Date().toISOString(),
      database: health.database,
      message: health.message,
    },
    { status },
  );
}
