'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="text-2xl font-bold text-white tracking-tight">Silo</div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-white font-medium" href="/dashboard">Dashboard</Link>
            <Link className="text-[rgba(255,255,255,0.6)] hover:text-white" href="/agents">Agents</Link>
            <Link className="text-[rgba(255,255,255,0.6)] hover:text-white" href="/docs">Docs</Link>
          </nav>
          <Link href="/dashboard" className="bg-white text-[#0D0D0D] font-bold px-6 py-2.5 rounded-full hover:scale-[1.02] transition-transform text-sm">
            Launch App
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-[180px] pb-[120px] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full glow-purple -z-10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-[36px] md:text-[56px] font-bold mb-4 text-white leading-tight">
              The On-Chain<br/><span className="text-[#d0bcff]">Firewall</span>
            </h1>
            <p className="text-lg text-[rgba(255,255,255,0.6)] max-w-xl mx-auto mb-8">
              Every transaction your AI agent wants to make — analyzed by Claude before a single lamport moves.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link href="/dashboard" className="bg-white text-[#0D0D0D] font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:scale-105 transition-all">
                npm install @silo-sol/sdk<span className="material-symbols-outlined text-lg"></span>
              </Link>
            </div>

            {/* Data Flow */}
            <div className="relative max-w-3xl mx-auto aspect-[2/1] glass-card rounded-2xl p-8 overflow-hidden flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 items-center w-full">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                    <span className="flex items-center gap-2 text-white/80 text-sm"><span className="material-symbols-outlined text-lg">terminal</span> Agent</span>
                    <span className="text-[#4ADE80] text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[12px] pulse-dot">check_circle</span> CLEAN</span>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                    <span className="flex items-center gap-2 text-white/80 text-sm"><span className="material-symbols-outlined text-lg">send</span> Transaction</span>
                    <span className="text-[#4ADE80] text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[12px] pulse-dot">check_circle</span> CLEAN</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-white">security</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] rounded-full text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span> VERDICT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-3 gap-4 p-6 glass-card rounded-2xl border-white/5">
            <div className="text-center">
              <p className="text-white text-3xl font-bold">1,247</p>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Total Agents</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-white text-3xl font-bold">89%</p>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-white text-3xl font-bold">47</p>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Blocked</p>
            </div>
          </div>
        </section>

        {/* The Four Layers */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl text-center hover:border-[#d0bcff] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-xl text-white">lock</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Encrypt</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-xs">NaCl X25519</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center hover:border-[#d0bcff] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-xl text-white">queue</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Queue</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-xs">simulateTransaction</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center hover:border-[#d0bcff] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-xl text-white">psychology</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Analyze</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-xs">Claude AI (0-100k)</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center hover:border-[#d0bcff] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-xl text-white">person</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Human Gate</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-xs">CLI + Ledger</p>
            </div>
          </div>
        </section>

        {/* Quick Start Cards */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Start</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/docs" className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer text-center">
              <span className="material-symbols-outlined text-3xl text-white mb-3 block">terminal</span>
              <h4 className="font-bold text-white text-sm">SDK</h4>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">npm i @silo-sol/sdk</p>
            </Link>
            <Link href="/dashboard" className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer text-center">
              <span className="material-symbols-outlined text-3xl text-white mb-3 block">dashboard</span>
              <h4 className="font-bold text-white text-sm">Dashboard</h4>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Real-time feed</p>
            </Link>
            <Link href="/agents" className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer text-center">
              <span className="material-symbols-outlined text-3xl text-white mb-3 block">hub</span>
              <h4 className="font-bold text-white text-sm">Agents</h4>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Manage agents</p>
            </Link>
            <Link href="/docs" className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer text-center">
              <span className="material-symbols-outlined text-3xl text-white mb-3 block">description</span>
              <h4 className="font-bold text-white text-sm">Docs</h4>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">Get started</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="relative p-10 glass-card rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full glow-purple -z-10 opacity-30"></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Protect Your Agents</h2>
              <p className="text-[rgba(255,255,255,0.6)] mb-6">Add Silo in minutes. Start with devnet.</p>
              <div className="flex justify-center gap-4">
                <span className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.6)]"><span className="material-symbols-outlined text-[#4ADE80] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Free Devnet</span>
                <span className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.6)]"><span className="material-symbols-outlined text-[#4ADE80] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Open Source</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.1)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-bold text-white">Silo</div>
          <div className="flex gap-6 text-sm text-[rgba(255,255,255,0.6)]">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/agents" className="hover:text-white">Agents</Link>
            <Link href="/docs" className="hover:text-white">Docs</Link>
          </div>
          <p className="text-[rgba(255,255,255,0.4)] text-sm">© 2026 Silo</p>
        </div>
      </footer>
    </div>
  );
}