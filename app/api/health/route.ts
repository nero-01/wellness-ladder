import { NextResponse } from "next/server"

/** Liveness for load balancers / deploy checks (no auth, no DB). */
export async function GET() {
  return NextResponse.json({ ok: true, service: "wellness-app" })
}
