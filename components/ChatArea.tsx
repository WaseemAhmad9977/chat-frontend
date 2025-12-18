import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Chat, Message } from './types';

interface ChatAreaProps {
  activeChat: string | null;
  chats: Chat[];
  messages: Message[];
  typers: string[];
  currentUserId: string;
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
}

export default function ChatArea({
  activeChat,
  chats,
  messages,
  typers,
  currentUserId,
  text,
  onTextChange,
  onSend,
}: ChatAreaProps) {
  const currentChat = chats.find(c => c.id === activeChat);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 scrollbar-hide">
        <div className="text-center px-6">
          <div className="text-xl font-semibold text-slate-300 mb-2">Select a chat to start messaging</div>
          <div className="text-sm text-slate-500">Choose a conversation from the sidebar to begin</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 h-full bg-slate-900'>
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="font-semibold text-white text-lg">{currentChat?.name}</div>
        <div className="text-sm text-slate-400 mt-1">
          {currentChat?.participantNames.join(', ')}
        </div>
        {typers.length > 0 && (
          <div className="text-sm text-indigo-400 mt-2 font-medium">
            {typers.join(', ')} {typers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageInput text={text} onTextChange={onTextChange} onSend={onSend} />
    </div>
  );
}