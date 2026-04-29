import { appendFileSync, mkdirSync } from "fs"
import { join } from "path"
import type { TelemetryPayload } from "@/lib/types"

const DATA_DIR = join(process.cwd(), "data")
const TELEMETRY_FILE = join(DATA_DIR, "telemetry.jsonl")

function ensureDataDir() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
  } catch {}
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TelemetryPayload

    if (!body.instanceId || !body.sentAt) {
      return Response.json({ error: "Invalid payload" }, { status: 400 })
    }

    ensureDataDir()

    // Append one JSON line — safe for concurrent writes on single-server deployments
    appendFileSync(TELEMETRY_FILE, JSON.stringify(body) + "\n", "utf8")

    return Response.json({ ok: true })
  } catch (err) {
    console.error("[telemetry] write error:", err)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
}
