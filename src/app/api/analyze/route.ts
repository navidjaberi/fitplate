import { activeProvider, AnalysisError, analyzeImage, AuthError, RateLimitError } from "@/lib/analyze";
import { mockAnalysis } from "@/lib/mock";
import { AnalyzeRequestSchema, type AnalyzeResponse } from "@/lib/schema";

// About 5 MB of base64; the client resizes photos well below this.
const MAX_IMAGE_CHARS = 7_000_000;

export const maxDuration = 60;

function json(body: AnalyzeResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: "invalid_request" }, 400);

  const { image, locale } = parsed.data;
  if (image.length > MAX_IMAGE_CHARS) return json({ ok: false, error: "image_too_large" }, 413);

  const provider = activeProvider();
  if (!provider) {
    // Simulate model latency so the demo feels like the real thing.
    await new Promise((r) => setTimeout(r, 1400));
    return json({ ok: true, mode: "demo", analysis: mockAnalysis(image, locale) });
  }

  try {
    const analysis = await analyzeImage(provider, image, locale);
    return json({ ok: true, mode: "live", analysis });
  } catch (error) {
    if (error instanceof AnalysisError) return json({ ok: false, error: "analysis_failed" }, 422);
    if (error instanceof RateLimitError) return json({ ok: false, error: "rate_limited" }, 429);
    if (error instanceof AuthError) return json({ ok: false, error: "bad_api_key" }, 500);
    console.error(`analyze failed (${provider})`, error);
    return json({ ok: false, error: "server_error" }, 500);
  }
}

export async function GET() {
  const provider = activeProvider();
  return Response.json({ mode: provider ? "live" : "demo", provider });
}
