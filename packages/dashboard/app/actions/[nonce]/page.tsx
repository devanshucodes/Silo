'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const actionData = {
  nonce: '142',
  agent: 'jupiter-swapper',
  owner: 'ABC...123DEF',
  payloadHash: 'a1b2c3d4e5f6...',
  relayKey: 'uuid-1234-5678',
  targetProgram: 'JUP4Fb2cHQi2uK4Z3M2Yq2oYmT6GrqU',
  lamports: 5e9,
  simAccountsTouched: 3,
  status: 'Decided',
  verdict: 'Approve',
  threatScore: 12450,
  reasoningCid: 'QmXyZ123...abc',
  reasoning: 'Routine Jupiter swap on verified program. Standard DeFi operation with known target.',
  createdAt: Date.now() - 60000,
  decidedAt: Date.now() - 30000,
};

export default function ActionDetailPage() {
  const params = useParams();
  const nonce = params.nonce as string;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Approve': return '#4ADE80';
      case 'Escalate': return '#F5A524';
      case 'Block': return '#F31260';
      default: return '#7070a0';
    }
  };

  const verdictColor = getVerdictColor(actionData.verdict);

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-[#d0bcff] hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Action #{nonce}</h1>
                <p className="text-[rgba(255,255,255,0.6)]">Agent: {actionData.agent}</p>
              </div>
              <span 
                className="px-6 py-3 rounded-full text-lg font-bold"
                style={{ 
                  backgroundColor: `${verdictColor}20`,
                  color: verdictColor
                }}
              >
                {actionData.verdict.toUpperCase()}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-[rgba(255,255,255,0.6)] mb-2">Threat Score</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${actionData.threatScore / 1000}%`,
                        backgroundColor: actionData.threatScore < 30000 ? '#4ADE80' : 
                          actionData.threatScore < 60000 ? '#F5A524' : '#F31260'
                      }}
                    />
                  </div>
                  <span className="text-white font-mono">{actionData.threatScore.toLocaleString()}</span>
                  <span className="text-[rgba(255,255,255,0.6)]">/ 100,000</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-[rgba(255,255,255,0.6)] mb-2">Claude's Reasoning</h3>
                <p className="text-white p-6 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.1)]">
                  {actionData.reasoning}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4">On-Chain Proof</h2>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[rgba(255,255,255,0.6)]">Payload Hash</span>
                <span className="text-white">{actionData.payloadHash}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[rgba(255,255,255,0.6)]">Relay Key</span>
                <span className="text-white">{actionData.relayKey}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[rgba(255,255,255,0.6)]">IPFS CID</span>
                <span className="text-[#d0bcff]">{actionData.reasoningCid}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4">Transaction Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Target Program</div>
                <div className="text-white font-mono">{actionData.targetProgram}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Value</div>
                <div className="text-[#4ADE80] text-xl">{(actionData.lamports / 1e9).toFixed(2)} SOL</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Accounts Touched</div>
                <div className="text-white">{actionData.simAccountsTouched}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4">Timestamps</h2>
            <div className="space-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Created</div>
                <div className="text-white">1 minute ago</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Decided</div>
                <div className="text-white">30 seconds ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}