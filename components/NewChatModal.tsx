import { useState } from 'react';
import { OnlineUser } from './types';

interface NewChatModalProps {
  show: boolean;
  onlineUsers: OnlineUser[];
  onClose: () => void;
  onCreate: (name: string, type: '1-to-1' | 'group', participants: string[]) => void;
}

export default function NewChatModal({ show, onlineUsers, onClose, onCreate }: NewChatModalProps) {
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<'1-to-1' | 'group'>('1-to-1');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  function toggleParticipant(userId: string) {
    setSelectedParticipants(prev => {
      if (newChatType === '1-to-1') {   
        if (prev[0] === userId) return [];
        return [userId];
      }
      return prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newChatName.trim() || selectedParticipants.length === 0) return;
    if (newChatType === '1-to-1' && selectedParticipants.length !== 1) return;
    
    onCreate(newChatName.trim(), newChatType, selectedParticipants);
    setNewChatName('');
    setSelectedParticipants([]);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-5">Create New Chat</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="Chat name"
            className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input type="radio" checked={newChatType === '1-to-1'} onChange={() => setNewChatType('1-to-1')} className="accent-indigo-600" />
              <span className="text-sm font-medium">1-to-1</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input type="radio" checked={newChatType === 'group'} onChange={() => setNewChatType('group')} className="accent-indigo-600" />
              <span className="text-sm font-medium">Group</span>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-300 mb-3">Select Participants</p>
            {onlineUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No users online</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-900/50 border border-slate-700 rounded-xl p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {onlineUsers.map(u => (
                  <label key={u.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 px-3 py-2.5 rounded-lg transition-colors">
                    <input type="checkbox" checked={selectedParticipants.includes(u.id)} onChange={() => toggleParticipant(u.id)} className="accent-indigo-600" />
                    <span className="text-sm text-slate-200">{u.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={selectedParticipants.length === 0} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}