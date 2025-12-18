import { useState } from 'react';

interface AuthPopupProps {
  onAuth: (name: string) => void;
}

export default function AuthPopup({ onAuth }: AuthPopupProps) {
  const [authName, setAuthName] = useState('');

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = authName.trim();
    if (!trimmed) return;
    onAuth(trimmed);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 border border-slate-700/50">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to Chat</h1>
          <p className="text-xs sm:text-sm text-slate-400">Enter your name to get started</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            autoFocus
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Your name"
          />
          <button type="submit" className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}