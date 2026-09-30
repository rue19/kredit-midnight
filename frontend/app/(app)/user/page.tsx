'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/lib/wallet';
import { findKreditContract, logTxError, type KreditContractHandle } from '@/lib/providers';
import { loadPrivateState, generateInitialPrivateState, savePrivateState } from '@/lib/prover';
import { ContractPanel } from '@/components/app/ContractPanel';
import { TxProgress } from '@/components/app/TxProgress';
import { useLedger } from '@/hooks/useLedger';
import { useContractAddress } from '@/hooks/useContractAddress';
import { Page, PageHeader, Panel, Field, TextInput, Button, Banner, GateNotice, Result, Aside, FactList } from '@/components/ui/console';

const CONTRACT_ADDRESS_KEY = 'kredit-contract-address';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

export default function UserPage() {
  const { isConnected, connectedApi } = useWallet();
  const [threshold, setThreshold] = useState('');
  const [result, setResult] = useState<{ eligible: boolean; threshold: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privateStateInfo, setPrivateStateInfo] = useState<string | null>(null);
  const contractAddress = useContractAddress();
  const { state: ledger, refresh: refreshLedger } = useLedger(contractAddress);

  const handleGenerateKeys = useCallback(() => {
    // Reuse existing keys: regenerating would replace the admin/issuer secrets and orphan the issued credential.
    const existing = loadPrivateState();
    if (existing) {
      setPrivateStateInfo(`Local keys loaded. Score: ${existing.score} (stored locally only)`);
      return;
    }
    const state = generateInitialPrivateState();
    savePrivateState(state);
    setPrivateStateInfo(`Keys generated. Score: ${state.score} — stored locally only`);
  }, []);

  const handleProve = useCallback(async () => {
    const t = parseInt(threshold, 10);
    if (isNaN(t) || t < 0) {
      setError('Enter a valid threshold');
      return;
    }
    if (!connectedApi) {
      setError('Connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const contractAddr = localStorage.getItem(CONTRACT_ADDRESS_KEY) || CONTRACT_ADDRESS;
      if (!contractAddr) {
        throw new Error('No contract deployed. Ask the admin to deploy the Kredit contract first.');
      }

      const found = await findKreditContract(connectedApi, contractAddr);
      const { callTx } = found as unknown as KreditContractHandle;
      const eligible = await callTx.proveEligibility(BigInt(t));
      setResult({ eligible: Boolean(eligible), threshold: t });
      refreshLedger();
    } catch (err) {
      logTxError('Prove error', err);
      setError(err instanceof Error ? err.message : 'Proof generation failed');
    } finally {
      setLoading(false);
    }
  }, [threshold, connectedApi, refreshLedger]);

  const outcome = loading ? null : error ? 'error' : result ? 'success' : null;
  const orb = loading ? 'working' : error ? 'fail' : result ? (result.eligible ? 'pass' : 'fail') : 'idle';

  return (
    <Page>
      <PageHeader eyebrow="Holder" title="Prove eligibility, keep the number">
        Your score and salt live only in this browser. A proof crosses the
        privacy boundary as a single boolean — the value behind it never does.
      </PageHeader>

      <ContractPanel address={contractAddress} ledger={ledger} orb={orb} />

      {!isConnected ? (
        <GateNotice>Connect your wallet to generate a proof.</GateNotice>
      ) : (
        <div className="mt-(--page-pad)">
          <Panel title="Local keys" index="01">
            <p className="text-fine mb-6 max-w-[46ch] leading-relaxed text-faint">
              Generate a keypair and score. They stay in this browser and are
              never transmitted.
            </p>
            {privateStateInfo ? (
              <Banner tone="pass">{privateStateInfo}</Banner>
            ) : (
              <Button variant="outline" onClick={handleGenerateKeys}>
                Generate local keys
              </Button>
            )}
          </Panel>

          <Panel title="Eligibility proof" index="02">
            <div className="space-y-5">
              <Field
                label="Threshold"
                hint={`The verifier will learn only whether your score ≥ ${threshold || '?'}`}
              >
                <TextInput
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="700"
                />
              </Field>
              <Button onClick={handleProve} disabled={loading || !threshold || !contractAddress}>
                {loading ? 'Generating proof…' : 'Generate proof'}
              </Button>
              {!contractAddress && (
                <p className="text-[0.75rem] text-dim">
                  No contract deployed. Ask the admin to deploy the Kredit contract first.
                </p>
              )}
            </div>
          </Panel>

          <TxProgress running={loading} outcome={outcome} />

          {result && (
            <Result pass={result.eligible} label={result.eligible ? 'Eligible' : 'Not eligible'}>
              score &ge; {result.threshold} was proven on-chain. Your actual
              score was never disclosed.
            </Result>
          )}

          {error && <Banner tone="fail">{error}</Banner>}

          <Aside title="What stays local">
            <FactList
              items={[
                'Your score is never sent over the network.',
                'Only the boolean result — eligible or not — reaches the chain.',
                'The commitment salt is never revealed.',
                'Proof generation runs locally; private inputs never leave this machine.',
              ]}
            />
          </Aside>
        </div>
      )}
    </Page>
  );
}
