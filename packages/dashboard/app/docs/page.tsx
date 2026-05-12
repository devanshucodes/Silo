'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#d0bcff] hover:underline mb-8 block">← Back to Home</Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Silo Documentation</h1>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <p className="text-[rgba(255,255,255,0.6)] mb-4">
              Silo is a four-layer on-chain firewall for Solana AI agents. 
              It intercepts every transaction, analyzes it with Claude AI, 
              and only releases it after a cryptographically-verified verdict.
            </p>
          </section>

          <section className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
            <pre className="text-sm text-[#4ADE80] font-mono bg-[rgba(255,255,255,0.03)] p-6 rounded-xl overflow-x-auto border border-[rgba(255,255,255,0.1)]">
{`npm install @silo-sol/sdk

import { Silo } from '@silo-sol/sdk';

const silo = new Silo({
  rpcUrl: 'https://devnet.helius-rpc.com',
  relayUrl: 'https://relay.silo.xyz',
  agentId: 'my-agent',
  agentOwner: wallet,
  programId: 'Si1o...',
});

const result = await silo.protect({
  prompt: 'Swap 10 SOL for USDC',
  transaction: tx,
});

if (result.status === 'approved') {
  await sendAndConfirm(result.transaction);
}`}
            </pre>
          </section>

          <section className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-4">The Four Layers</h2>
            <ol className="list-decimal list-inside space-y-4 text-[rgba(255,255,255,0.6)]">
              <li>
                <strong className="text-white">Encrypt</strong> - Agent intent is encrypted with NaCl (X25519 + XSalsa20) and stored off-chain
              </li>
              <li>
                <strong className="text-white">Queue</strong> - Anchor program receives SHA-256 hash, runs simulateTransaction, emits ActionQueued event
              </li>
              <li>
                <strong className="text-white">Analyze</strong> - Helius webhook triggers oracle worker, fetches payload, sends to Claude, writes verdict on-chain
              </li>
              <li>
                <strong className="text-white">Human-in-the-Loop</strong> - ESCALATE verdicts pause for operator approval via CLI/Ledger
              </li>
            </ol>
          </section>

          <section className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-4">Threat Scoring</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)]">
                  <th className="text-left py-3 text-[rgba(255,255,255,0.6)]">Score Range</th>
                  <th className="text-left py-3 text-[rgba(255,255,255,0.6)]">Verdict</th>
                  <th className="text-left py-3 text-[rgba(255,255,255,0.6)]">Description</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-3 text-[#4ADE80]">0-20,000</td>
                  <td>APPROVE</td>
                  <td>Routine DeFi operations</td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-3 text-[#F5A524]">20,001-60,000</td>
                  <td>ESCALATE</td>
                  <td>Unusual but not clearly malicious</td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-3 text-[#F31260]">60,001-100,000</td>
                  <td>BLOCK</td>
                  <td>Active attack pattern detected</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}