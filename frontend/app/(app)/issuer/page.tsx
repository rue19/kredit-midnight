'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/lib/wallet';
import {
  deployKreditContract,
  findKreditContract,
  stringifyError,
  updatePrivateState,
  type KreditContractHandle,
} from '@/lib/providers';
import { ContractPanel } from '@/components/app/ContractPanel';
import { TxProgress } from '@/components/app/TxProgress';
import { useLedger } from '@/hooks/useLedger';
import { Page, PageHeader, Panel, Field, TextInput, Button, Banner, GateNotice, Aside, FactList } from '@/components/ui/console';

const CONTRACT_ADDRESS_KEY = 'kredit-contract-address';

function getContractAddress(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONTRACT_ADDRESS_KEY);
}

function setContractAddress(addr: string) {
  localStorage.setItem(CONTRACT_ADDRESS_KEY, addr);
}

function toBytes32(input: string): Uint8Array {
  const raw = new TextEncoder().encode(input);
  const buf = new Uint8Array(32);
  buf.set(raw.slice(0, 32));
  return buf;
}

export default function IssuerPage() {
  const { isConnected, connectedApi } = useWallet();
  const [subjectAddress, setSubjectAddress] = useState('');
  const [score, setScore] = useState('750');
  const [issuerId, setIssuerId] = useState('');
  const [contractAddr, setContractAddr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { state: ledger, refresh: refreshLedger } = useLedger(contractAddr);

  useEffect(() => {
    const saved = getContractAddress();
    // localStorage cannot be read during render without risking a hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setContractAddr(saved);
  }, []);

  const handleDeploy = useCallback(async () => {
    if (!connectedApi) return;
    setLoading(true);
    setStatus('Deploying contract… this can take a minute for proof generation.');
    try {
      const raw = new TextEncoder().encode('kredit-admin-001');
      const adminId = new Uint8Array(32);
      adminId.set(raw);
      const deployed = await deployKreditContract(connectedApi, adminId);

      const addr = deployed.contractAddress ?? 'unknown';
      setContractAddr(addr);
      setContractAddress(addr);
      setStatus(`Contract deployed at ${addr}`);
      refreshLedger();
    } catch (err) {
      const deployErr = err as Error & { cause?: unknown; finalizedTxData?: unknown };
      console.error('Deploy error:', deployErr, deployErr.cause, deployErr.finalizedTxData);
      setStatus(`Deploy error: ${stringifyError(err)}`);
    } finally {
      setLoading(false);
    }
  }, [connectedApi, refreshLedger]);

  const handleRegisterIssuer = useCallback(async () => {
    if (!connectedApi || !issuerId.trim()) return;
    setLoading(true);
    setStatus('Registering issuer…');
    try {
      const addr = contractAddr ?? getContractAddress();
      if (!addr) throw new Error('No contract deployed. Deploy the Kredit contract above first.');
      const found = await findKreditContract(connectedApi, addr);
      const { callTx } = found as unknown as KreditContractHandle;
      const issuerIdBytes = toBytes32(issuerId.trim());
      await callTx.registerIssuer(issuerIdBytes);
      setStatus(`Issuer "${issuerId}" registered on-chain`);
      refreshLedger();
    } catch (err) {
      console.error('Register issuer error:', err);
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }, [connectedApi, issuerId, contractAddr, refreshLedger]);

  const handleIssue = useCallback(async () => {
    if (!connectedApi || !subjectAddress.trim()) return;
    setLoading(true);
    setStatus('Issuing credential…');
    try {
      const addr = contractAddr ?? getContractAddress();
      if (!addr) throw new Error('No contract deployed. Deploy the Kredit contract above first.');
      const found = await findKreditContract(connectedApi, addr);
      const { callTx } = found as unknown as KreditContractHandle;
      const subjectBytes = toBytes32(subjectAddress.trim());
      // The holder later proves with holderSecret, so bind it to this subject, and commit to the entered score.
      updatePrivateState({ score: BigInt(parseInt(score, 10) || 0), holderSecretKey: subjectBytes });
      await callTx.issueCredential(subjectBytes);
      setStatus(`Credential issued for ${subjectAddress.slice(0, 16)}… commitment stored on-chain`);
      refreshLedger();
    } catch (err) {
      console.error('Issue credential error:', err);
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }, [connectedApi, subjectAddress, score, contractAddr, refreshLedger]);

  const handleRevoke = useCallback(async () => {
    if (!connectedApi || !subjectAddress.trim()) return;
    setLoading(true);
    setStatus('Revoking credential…');
    try {
      const addr = contractAddr ?? getContractAddress();
      if (!addr) throw new Error('No contract deployed. Deploy the Kredit contract above first.');
      const found = await findKreditContract(connectedApi, addr);
      const { callTx } = found as unknown as KreditContractHandle;
      const subjectBytes = toBytes32(subjectAddress.trim());
      await callTx.revokeCredential(subjectBytes);
      setStatus(`Credential revoked for ${subjectAddress.slice(0, 16)}…`);
      refreshLedger();
    } catch (err) {
      console.error('Revoke credential error:', err);
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }, [connectedApi, subjectAddress, contractAddr, refreshLedger]);

  const isError = status?.toLowerCase().includes('error');
  const outcome = loading || !status ? null : isError ? 'error' : 'success';
  const orb = loading ? 'working' : outcome === 'error' ? 'fail' : outcome === 'success' ? 'pass' : 'idle';

  return (
    <Page>
      <PageHeader eyebrow="Issuer console" title="Commit credentials without the score">
        As admin you deploy the contract and register trusted issuers. As an
        issuer, you commit a subject&apos;s score on-chain — the number itself
        stays with you, off-chain.
      </PageHeader>

      <ContractPanel
        address={contractAddr}
        ledger={ledger}
        orb={orb}
        emptyNote="No contract deployed from this browser yet. Connect a wallet and deploy one below."
      />

      {!isConnected ? (
        <GateNotice>Connect a wallet with admin or issuer rights to continue.</GateNotice>
      ) : (
        <div className="mt-(--page-pad)">
          <Panel title="Contract" index="01">
            {contractAddr ? (
              <div className="mb-8">
                <p className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">Deployed at</p>
                <p className="mt-3 font-mono text-[0.9375rem] break-all text-chalk">{contractAddr}</p>
              </div>
            ) : (
              <Button onClick={handleDeploy} disabled={loading} className="mb-8">
                Deploy Kredit contract
              </Button>
            )}

            <div className="space-y-5">
              <Field label="Issuer id" hint="e.g. bank-acme-001">
                <TextInput
                  value={issuerId}
                  onChange={(e) => setIssuerId(e.target.value)}
                  placeholder="bank-acme-001"
                />
              </Field>
              <Button
                variant="outline"
                onClick={handleRegisterIssuer}
                disabled={loading || !issuerId.trim() || !contractAddr}
              >
                Register issuer
              </Button>
            </div>
          </Panel>

          <Panel title="Credential" index="02">
            <div className="space-y-5">
              <Field label="Subject address" hint="The raw score and salt never touch the chain — only their commitment does.">
                <TextInput
                  value={subjectAddress}
                  onChange={(e) => setSubjectAddress(e.target.value)}
                  placeholder="mn_addr…"
                />
              </Field>
              <Field label="Credit score" hint="Committed on-chain; the number itself stays off-chain.">
                <TextInput
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 750"
                />
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleIssue}
                  disabled={loading || !subjectAddress.trim() || !contractAddr}
                >
                  Issue credential
                </Button>
                <Button
                  variant="danger"
                  onClick={handleRevoke}
                  disabled={loading || !subjectAddress.trim() || !contractAddr}
                >
                  Revoke credential
                </Button>
              </div>
            </div>
          </Panel>

          <TxProgress running={loading} outcome={outcome} />

          {status && <Banner tone={isError ? 'fail' : 'info'}>{status}</Banner>}

          <Aside title="Sequence">
            <FactList
              ordered
              items={[
                'Deploy the contract — you become admin.',
                'Register issuer identities.',
                'Issue: commitment = persistentCommit(score, salt), stored on-chain.',
                'The subject receives the raw score through a channel off this protocol.',
                'The subject proves eligibility later, without revealing the score.',
              ]}
            />
          </Aside>
        </div>
      )}
    </Page>
  );
}
