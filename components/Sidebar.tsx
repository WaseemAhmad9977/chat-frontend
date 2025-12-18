import { Chat, OnlineUser, ConnectionStatus } from './types';

interface SidebarProps {
  userName: string;
  connectionStatus: ConnectionStatus;
  onlineUsers: OnlineUser[];
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onOpenChat: (chatId: string) => void;
}

export default function Sidebar({
  userName,
  connectionStatus,
  onlineUsers,
  chats,
  activeChat,
  onNewChat,
  onOpenChat,
}: SidebarProps) {
  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-xl ">
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold text-white text-lg">Messages</h2>
            <p className="text-xs text-slate-400 mt-0.5">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-amber-400 shadow-lg shadow-amber-500/50'} animate-pulse`} />
              {connectionStatus !== 'connected' && (
                <span className="text-xs text-amber-400 font-medium">{connectionStatus}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40">
          + New Conversation
        </button>
      </div>
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
        <p className="text-xs text-slate-300 font-semibold mb-3 uppercase tracking-wide">
          Online User- {onlineUsers.length}
        </p>
        <div className="flex flex-wrap gap-2">
          {onlineUsers.map(u => (
            <span key={u.id} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-medium">
              {u.name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide ">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-sm mb-2">No conversations yet</div>
            <div className="text-slate-500 text-xs">Start a new chat to begin messaging</div>
          </div>
        ) : (
          <div className="py-2">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onOpenChat(chat.id)}
                className={`mx-3 mb-2 px-4 py-3.5 cursor-pointer rounded-xl transition-all ${
                  activeChat === chat.id 
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-800/50 hover:bg-slate-700/70'
                }`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${
                      activeChat === chat.id ? 'text-white' : 'text-slate-200'
                    }`}>
                      {chat.name}
                    </div>
                    <div className={`text-xs mt-1.5 truncate flex items-center gap-1.5 ${
                      activeChat === chat.id ? 'text-indigo-200' : 'text-slate-400'
                    }`}><span>{chat.participantNames.join(', ')}</span>
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className={`text-xs font-bold rounded-full px-2 py-1 flex-shrink-0 ${
                      activeChat === chat.id 
                        ? 'bg-white text-indigo-600' 
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50'
                    }`}>
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}