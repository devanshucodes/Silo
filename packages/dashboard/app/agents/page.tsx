'use client';

import Link from 'next/link';

const agents = [
  {
    id: 'jupiter-swapper',
    owner: 'ABC...123',
    trustScore: 94500,
    strikes: 1,
    maxStrikes: 5,
    frozen: false,
    totalActions: 456,
    totalApproved: 421,
    totalBlocked: 12,
  },
  {
    id: 'yield-optimizer',
    owner: 'DEF...456',
    trustScore: 87200,
    strikes: 2,
    maxStrikes: 5,
    frozen: false,
    totalActions: 289,
    totalApproved: 267,
    totalBlocked: 8,
  },
  {
    id: 'nft-hunter',
    owner: 'GHI...789',
    trustScore: 63400,
    strikes: 3,
    maxStrikes: 5,
    frozen: false,
    totalActions: 178,
    totalApproved: 142,
    totalBlocked: 23,
  },
  {
    id: 'compromised-bot',
    owner: 'JKL...012',
    trustScore: 12000,
    strikes: 5,
    maxStrikes: 5,
    frozen: true,
    totalActions: 34,
    totalApproved: 12,
    totalBlocked: 18,
  },
  {
    id: 'cautious-trader',
    owner: 'MNO...345',
    trustScore: 78000,
    strikes: 1,
    maxStrikes: 3,
    frozen: false,
    totalActions: 156,
    totalApproved: 148,
    totalBlocked: 3,
  },
];

const getScoreColor = (score: number) => {
  if (score > 80000) return '#4ADE80';
  if (score > 40000) return '#F5A524';
  return '#F31260';
};

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Agents</h1>
        <Link 
          href="/dashboard"
          className="text-[#d0bcff] hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Agent ID</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Owner</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Trust Score</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Strikes</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Status</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Actions</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Approved</th>
              <th className="text-left py-4 px-6 text-[rgba(255,255,255,0.6)] uppercase text-xs tracking-widest">Blocked</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr 
                key={agent.id} 
                className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                <td className="py-4 px-6">
                  <Link href={`/agents/${agent.id}`} className="text-white hover:text-[#d0bcff] font-bold">
                    {agent.id}
                  </Link>
                </td>
                <td className="py-4 px-6 text-[rgba(255,255,255,0.6)] font-mono">{agent.owner}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${agent.trustScore / 1000}%`,
                          backgroundColor: getScoreColor(agent.trustScore)
                        }}
                      />
                    </div>
                    <span style={{ color: getScoreColor(agent.trustScore) }} className="font-bold">
                      {agent.trustScore.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[rgba(255,255,255,0.6)]">
                  {agent.strikes} / {agent.maxStrikes}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    agent.frozen 
                      ? 'bg-[#F31260]/20 text-[#F31260]' 
                      : 'bg-[#4ADE80]/20 text-[#4ADE80]'
                  }`}>
                    {agent.frozen ? 'FROZEN' : 'ACTIVE'}
                  </span>
                </td>
                <td className="py-4 px-6 text-[rgba(255,255,255,0.6)]">{agent.totalActions}</td>
                <td className="py-4 px-6 text-[#4ADE80]">{agent.totalApproved}</td>
                <td className="py-4 px-6 text-[#F31260]">{agent.totalBlocked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}