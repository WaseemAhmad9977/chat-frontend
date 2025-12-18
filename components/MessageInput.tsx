interface MessageInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
}

export default function MessageInput({ text, onTextChange, onSend }: MessageInputProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50 px-6 py-4">
      <div className="flex gap-3 items-center">
        <input
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
          placeholder="Type a message..."
          className="flex-1 bg-slate-900/70 border border-slate-600 rounded-full px-5 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <button 
          onClick={onSend}
          disabled={!text.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40">
          Send
        </button>
      </div>
    </div>
  );
}