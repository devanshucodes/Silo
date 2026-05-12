'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VerdictEvent {
  type: string;
  agent: string;
  actionNonce: number;
  decision: string;
  threatScore: number;
  reasoning: string;
  targetProgram: string;
  lamports: number;
  confidence: string;
  timestamp: number;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<VerdictEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setConnected(Math.random() > 0.1);
    }, 5000);

    const mockEvents: VerdictEvent[] = [
      {
        type: 'verdict',
        agent: 'jupiter-swapper',
        actionNonce: 142,
        decision: 'APPROVE',
        threatScore: 12450,
        reasoning: 'Routine Jupiter swap, verified program',
        targetProgram: 'JUP4Fb2cHQi2uK4Z3M2Yq2oYmT...',
        lamports: 5e9,
        confidence: 'high',
        timestamp: Date.now() - 60000,
      },
      {
        type: 'verdict',
        agent: 'cautious-trader',
        actionNonce: 89,
        decision: 'ESCALATE',
        threatScore: 47200,
        reasoning: 'Large value transfer requires manual approval',
        targetProgram: 'SystemProgram',
        lamports: 50e9,
        confidence: 'medium',
        timestamp: Date.now() - 120000,
      },
      {
        type: 'verdict',
        agent: 'compromised-bot',
        actionNonce: 23,
        decision: 'BLOCK',
        threatScore: 85000,
        reasoning: 'Prompt injection detected',
        targetProgram: 'SystemProgram',
        lamports: 999e9,
        confidence: 'high',
        timestamp: Date.now() - 180000,
      },
      {
        type: 'verdict',
        agent: 'nft-hunter',
        actionNonce: 67,
        decision: 'ESCALATE',
        threatScore: 38000,
        reasoning: 'New collection, unknown program',
        targetProgram: 'NewMinter123...',
        lamports: 18e9,
        confidence: 'low',
        timestamp: Date.now() - 240000,
      },
    ];
    setEvents(mockEvents);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.decision === filter.toUpperCase());

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return '#4ADE80';
      case 'ESCALATE': return '#F5A524';
      case 'BLOCK': return '#F31260';
      default: return '#7070a0';
    }
  };

  const formatTime = (ts: number) => {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const formatLamports = (lamports: number) => {
    return (lamports / 1e9).toFixed(1) + ' SOL';
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 p-6 border-r border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]">
          <Link href="/" className="text-2xl font-bold text-white mb-8 block">Silo</Link>
          
          <div className="space-y-2 mb-8">
            <div className="text-xs text-[rgba(255,255,255,0.6)] mb-2 uppercase tracking-widest">Verdict Filter</div>
            {['all', 'APPROVE', 'ESCALATE', 'BLOCK'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                  filter === f ? 'bg-[#d0bcff] text-[#0D0D0D] font-bold' : 'bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <Link href="/agents" className="block px-3 py-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-all">
            → All Agents
          </Link>
          <Link href="/docs" className="block px-3 py-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-all">
            → Documentation
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Action Feed</h1>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${connected ? 'bg-[#4ADE80] pulse-dot' : 'bg-[#F31260]'}`}></span>
              <span className="text-sm text-[rgba(255,255,255,0.6)]">Oracle {connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event, i) => (
              <div
                key={i}
                className="p-6 glass-card rounded-2xl border-l-4"
                style={{ borderLeftColor: getDecisionColor(event.decision) }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-bold">🤖 {event.agent}</span>
                      <span 
                        className="px-3 py-1 text-xs rounded-full font-bold"
                        style={{ 
                          backgroundColor: `${getDecisionColor(event.decision)}20`,
                          color: getDecisionColor(event.decision)
                        }}
                      >
                        {event.decision}
                      </span>
                    </div>
                    <p className="text-[rgba(255,255,255,0.6)] mb-3">{event.reasoning}</p>
                    <div className="flex gap-6 text-xs text-[rgba(255,255,255,0.4)]">
                      <span>{event.targetProgram.slice(0, 16)}...</span>
                      <span>{formatLamports(event.lamports)}</span>
                      <span>{event.threatScore.toLocaleString()}/100k</span>
                      <span>{formatTime(event.timestamp)}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/actions/${event.actionNonce}`}
                    className="text-[#d0bcff] text-sm hover:underline"
                  >
                    Inspect →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 p-6 border-l border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]">
          <div className="text-xs text-[rgba(255,255,255,0.6)] mb-4 uppercase tracking-widest">Live Stats</div>
          
          <div className="space-y-4">
            <div className="p-4 glass-card rounded-xl">
              <div className="text-3xl font-bold text-[#4ADE80]">1,247</div>
              <div className="text-xs text-[rgba(255,255,255,0.6)]">Total Actions</div>
            </div>
            <div className="p-4 glass-card rounded-xl">
              <div className="text-3xl font-bold text-[#4ADE80]">89%</div>
              <div className="text-xs text-[rgba(255,255,255,0.6)]">Approved</div>
            </div>
            <div className="p-4 glass-card rounded-xl">
              <div className="text-3xl font-bold text-[#F31260]">47</div>
              <div className="text-xs text-[rgba(255,255,255,0.6)]">Blocked</div>
            </div>
          </div>

          <div className="mt-8 text-xs text-[rgba(255,255,255,0.6)] mb-3 uppercase tracking-widest">Top Agents</div>
          <div className="space-y-3">
            {['jupiter-swapper', 'yield-optimizer', 'nft-hunter'].map((agent, i) => (
              <div key={agent} className="flex justify-between text-sm glass-card p-3 rounded-lg">
                <span className="text-white">{agent}</span>
                <span className="text-[#4ADE80]">{95000 - i * 5000}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}