import React, { useState } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';

export default function TerminalWidget() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'System initialization... OK',
    'mac1 Sovereign Orchestrator online.',
    'Type "help" to list available commands.'
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    let response = '';

    switch (cmd) {
      case 'help':
        response = 'Available commands: help, status, verify, clear';
        break;
      case 'status':
        response = 'NODE: maclab-iMacPro1,1 | CPU Temp: 41.8°C | Status: STABLE | PM2: 3 Online';
        break;
      case 'verify':
        response = 'Verification success: EIP-712 Signature verified. Payload public-safe.';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        response = `Command not found: "${cmd}". Type "help" for options.`;
    }

    setHistory((prev) => [...prev, `mac1$ ${input}`, response]);
    setInput('');
  };

  return (
    <div className="bg-[oklch(11%_0.006_95)] border border-[oklch(78%_0_0_/_0.16)] rounded p-4 font-mono text-sm shadow-lg hover:border-[var(--color-kinpaku-gold)] transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-[oklch(78%_0_0_/_0.16)] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-[var(--color-kinpaku-gold)]" />
          <span className="text-xs font-bold text-[var(--color-text-muted)]">mac1-orchestrator-shell</span>
        </div>
        <div className="flex space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
        </div>
      </div>
      <div className="h-48 overflow-y-auto space-y-1.5 mb-3 text-xs text-[var(--color-text-warm)]">
        {history.map((line, idx) => (
          <div key={idx} className={line.startsWith('mac1$') ? 'text-[var(--color-kinpaku-gold)]' : line.includes('error') || line.includes('not found') ? 'text-red-400' : 'text-[var(--color-text-muted)]'}>
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="flex items-center">
        <span className="text-[var(--color-kinpaku-gold)] mr-1.5">mac1$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none outline-none text-[var(--color-champagne)] placeholder-[oklch(52%_0_0)] text-xs"
        />
        <button type="submit" className="text-gray-500 hover:text-white transition-colors cursor-pointer">
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
