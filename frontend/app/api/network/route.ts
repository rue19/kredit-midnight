import { network } from '@/config/network';
import { NextResponse } from 'next/server';


// Latest block from the network's public indexer. Proxied server-side so the
// status readouts don't depend on the indexer's CORS policy.
export async function GET() {
  try {
    const res = await fetch(network.indexer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ block { height timestamp } }' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { data?: { block?: { height: number; timestamp: number } } };
    const block = json.data?.block;
    if (!res.ok || !block) throw new Error(`Indexer responded ${res.status}`);
    return NextResponse.json({ ok: true, height: block.height, timestamp: block.timestamp });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
