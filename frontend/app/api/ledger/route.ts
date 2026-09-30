import { network } from '@/config/network';
import { NextRequest, NextResponse } from 'next/server';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { ledger } from 'kredit-contract';


const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

// Public ledger of a Kredit contract, reduced to what the UI shows.
export async function GET(req: NextRequest) {
  const address = new URL(req.url).searchParams.get('address');
  if (!address || !/^[0-9a-f]{64}$/i.test(address)) {
    return NextResponse.json({ ok: false, error: 'Expected a 64-character hex contract address' }, { status: 400 });
  }

  try {
    setNetworkId(network.id);
    const state = await indexerPublicDataProvider(network.indexer, network.indexerWs).queryContractState(address);
    if (!state) return NextResponse.json({ ok: false, error: 'No contract at this address' }, { status: 404 });

    const l = ledger(state.data);
    return NextResponse.json({
      ok: true,
      credentials: Number(l.credentials.size()),
      issuers: Number(l.issuerRegistry.size()),
      revoked: Number(l.revoked.size()),
      admin: toHex(l.contractAdmin),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
