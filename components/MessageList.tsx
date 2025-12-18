import { useRef, useEffect } from 'react';
import { Message } from './types';
import moment from 'moment';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    
  function formatTime(ts: number) {
    return moment(ts).format('HH:mm');
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
      {messages.map(msg => {
        const isMine = msg.sender === currentUserId;
        return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-lg ${
              isMine ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700/50'
            }`}>
              {!isMine && <div className="text-xs font-semibold mb-1.5 text-indigo-300">{msg.senderName}</div>}
              <div className="break-words leading-relaxed">{msg.text}</div>
              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                <span>{formatTime(msg.ts)}</span>
                {isMine && msg.status && (
                  <span>
                    {msg.status === 'sending' && 'sending'}
                    {msg.status === 'sent' && 'sent'}
                    {msg.status === 'failed' && 'failed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}