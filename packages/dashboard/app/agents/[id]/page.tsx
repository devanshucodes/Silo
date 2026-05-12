'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const agentData = {
  id: 'jupiter-swapper',
  owner: 'ABC...123DEF',
  trustScore: 94500,
  strikes: 1,
  maxStrikes: 5,
  frozen: false,
  registeredAt: 1704067200000,
  lastActionAt: Date.now() - 120000,
  actionNonce: 142,
  totalActions: 456,
  totalApproved: 421,
  totalBlocked: 12,
  totalEscalated: 23,
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const scoreColor = agentData.trustScore > 80000 ? '#4ADE80' : agentData.trustScore > 40000 ? '#F5A524' : '#F31260';

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-8">
      <div className="mb-8">
        <Link href="/agents" className="text-[#d0bcff] hover:underline">← All Agents</Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h1 className="text-4xl font-bold text-white mb-2">{id}</h1>
            <p className="text-[rgba(255,255,255,0.6)] font-mono mb-8">Owner: {agentData.owner}</p>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-[rgba(255,255,255,0.6)]">Trust Score</span>
              <span className="text-5xl font-bold" style={{ color: scoreColor }}>
                {agentData.trustScore.toLocaleString()}
              </span>
              <span className="text-[rgba(255,255,255,0.6)]">/ 100,000</span>
            </div>

            <div className="w-full h-4 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden mb-8">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${agentData.trustScore / 1000}%`,
                  background: `linear-gradient(to right, #4ADE80 0%, #F5A524 50%, #F31260 100%)`
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 glass-card rounded-xl">
                <div className="text-2xl font-bold text-white">{agentData.strikes}</div>
                <div className="text-xs text-[rgba(255,255,255,0.6)]">Strikes</div>
              </div>
              <div className="text-center p-4 glass-card rounded-xl">
                <div className="text-2xl font-bold text-white">{agentData.maxStrikes}</div>
                <div className="text-xs text-[rgba(255,255,255,0.6)]">Max Strikes</div>
              </div>
              <div className="text-center p-4 glass-card rounded-xl">
                <div className={`text-2xl font-bold ${agentData.frozen ? 'text-[#F31260]' : 'text-[#4ADE80]'}`}>
                  {agentData.frozen ? 'FROZEN' : 'ACTIVE'}
                </div>
                <div className="text-xs text-[rgba(255,255,255,0.6)]">Status</div>
              </div>
              <div className="text-center p-4 glass-card rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {Math.round((agentData.totalApproved / agentData.totalActions) * 100)}%
                </div>
                <div className="text-xs text-[rgba(255,255,255,0.6)]">Approval Rate</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-xl font-bold text-white mb-6">Recent Actions</h2>
            <div className="space-y-3">
              {[
                { nonce: 142, verdict: 'APPROVE', time: '2m ago' },
                { nonce: 141, verdict: 'APPROVE', time: '5m ago' },
                { nonce: 140, verdict: 'ESCALATE', time: '8m ago' },
                { nonce: 139, verdict: 'APPROVE', time: '12m ago' },
                { nonce: 138, verdict: 'BLOCK', time: '15m ago' },
              ].map(action => (
                <div key={action.nonce} className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono">#{action.nonce}</span>
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: action.verdict === 'APPROVE' ? '#4ADE8020' : 
                          action.verdict === 'ESCALATE' ? '#F5A52420' : '#F3126020',
                        color: action.verdict === 'APPROVE' ? '#4ADE80' : 
                          action.verdict === 'ESCALATE' ? '#F5A524' : '#F31260'
                      }}
                    >
                      {action.verdict}
                    </span>
                  </div>
                  <span className="text-[rgba(255,255,255,0.4)] text-sm">{action.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4">Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Total Actions</span>
                <span className="text-white font-bold">{agentData.totalActions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Approved</span>
                <span className="text-[#4ADE80] font-bold">{agentData.totalApproved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Blocked</span>
                <span className="text-[#F31260] font-bold">{agentData.totalBlocked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Escalated</span>
                <span className="text-[#F5A524] font-bold">{agentData.totalEscalated}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4">Timestamps</h2>
            <div className="space-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Registered</div>
                <div className="text-white">Jan 1, 2024</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">Last Action</div>
                <div className="text-white">2 minutes ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}