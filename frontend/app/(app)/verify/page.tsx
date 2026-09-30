'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/lib/wallet';
import { findKreditContract, logTxError, type KreditContractHandle } from '@/lib/providers';
import { ContractPanel } from '@/components/app/ContractPanel';
import { TxProgress } from '@/components/app/TxProgress';
import { useLedger } from '@/hooks/useLedger';
import { useContractAddress } from '@/hooks/useContractAddress';
import { Page, PageHeader, Panel, Field, TextInput, Button, Banner, GateNotice, Result, FactList } from '@/components/ui/console';

const CONTRACT_ADDRESS_KEY = 'kredit-contract-address';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

export default function VerifyPage() {
  const { isConnected, connectedApi } = useWallet();
  const [threshold, setThreshold] = useState('');
  const [result, setResult] = useState<{ eligible: boolean; revoked: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractAddress = useContractAddress();
  const { state: ledger, refresh: refreshLedger } = useLedger(contractAddress);

  const handleVerify = useCallback(async () => {
    if (!threshold.trim() || !connectedApi) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const contractAddr = localStorage.getItem(CONTRACT_ADDRESS_KEY) || CONTRACT_ADDRESS;
      if (!contractAddr) {
        throw new Error('No contract deployed. Deploy the Kredit contract first from the issuer console.');
      }

      const found = await findKreditContract(connectedApi, contractAddr);
      const { callTx } = found as unknown as KreditContractHandle;
      const t = BigInt(threshold.trim());

      const eligible = await callTx.proveEligibility(t);
      const notRevoked = await callTx.proveNotRevoked();

      setResult({
        eligible: Boolean(eligible),
        revoked: !Boolean(notRevoked),
      });
      refreshLedger();
    } catch (err) {
      logTxError('Verify error', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [threshold, connectedApi, refreshLedger]);

  const passed = result && result.eligible && !result.revoked;
  const outcome = loading ? null : error ? 'error' : result ? 'success' : null;
  const orb = loading ? 'working' : error ? 'fail' : result ? (passed ? 'pass' : 'fail') : 'idle';

  return (
    <Page>
      <PageHeader eyebrow="Verifier" title="Check the claim, not the score">
        Connect the holder&apos;s wallet and enter a threshold. You&apos;ll
        learn pass or fail and whether the credential is still valid — never
        the number behind it.
      </PageHeader>

      <ContractPanel address={contractAddress} ledger={ledger} orb={orb} />

      {!isConnected ? (
        <GateNotice>Connect your wallet to verify credentials.</GateNotice>
      ) : (
        <div className="mt-(--page-pad)">
          <Panel title="Verify" index="01">
            <div className="space-y-5">
              <Field label="Threshold">
                <TextInput
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="700"
                />
              </Field>
              <Button
                onClick={handleVerify}
                disabled={loading || !threshold.trim() || !contractAddress}
              >
                {loading ? 'Verifying…' : 'Verify eligibility'}
              </Button>
              {!contractAddress && (
                <p className="text-[0.75rem] text-dim">
                  No contract deployed. Deploy the Kredit contract first from the issuer console.
                </p>
              )}
            </div>
          </Panel>

          <TxProgress running={loading} outcome={outcome} />

          {result && (
            <Result pass={!!passed} label={passed ? 'Pass' : 'Fail'}>
              <dl className="flex flex-wrap gap-x-10 gap-y-5">
                <div>
                  <dt className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">Eligible</dt>
                  <dd className="mt-2 font-mono text-[0.9375rem] text-chalk">{result.eligible ? 'yes' : 'no'}</dd>
                </div>
                <div>
                  <dt className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">Revoked</dt>
                  <dd className="mt-2 font-mono text-[0.9375rem] text-chalk">{result.revoked ? 'yes' : 'no'}</dd>
                </div>
              </dl>
              <p className="mt-5 text-[0.75rem] text-dim">
                The holder&apos;s actual score was never disclosed to you.
              </p>
            </Result>
          )}

          {error && <Banner tone="fail">{error}</Banner>}

          <section className="mt-(--page-pad) grid border-t border-hair-soft sm:grid-cols-2">
            <div className="pt-(--row-pad) sm:pr-12">
              <h3 className="text-label leading-none font-medium tracking-[0.13em] text-signal uppercase">You can see</h3>
              <div className="mt-6">
                <FactList
                  items={[
                    'Pass or fail, as a boolean.',
                    'That a credential exists on-chain.',
                    'Revocation status.',
                  ]}
                />
              </div>
            </div>
            <div className="mt-(--row-pad) border-t border-hair-soft pt-(--row-pad) sm:mt-0 sm:border-t-0 sm:border-l sm:pl-12">
              <h3 className="text-label leading-none font-medium tracking-[0.13em] text-amber uppercase">You cannot see</h3>
              <div className="mt-6">
                <FactList
                  items={[
                    'The actual score value.',
                    'The commitment salt.',
                    <>The issuer&apos;s private key.</>,
                    'Which exact tier qualifies.',
                  ]}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </Page>
  );
}
