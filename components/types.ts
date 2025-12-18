export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  senderName: string;
  text: string;
  ts: number;
  status?: MessageStatus;
}

export interface Chat {
  id: string;
  name: string;
  type: '1-to-1' | 'group';
  participants: string[];
  participantNames: string[];
  unreadCount: number;
  lastMessage?: Message;
}

export interface User {
  id: string;
  name: string;
  token: string;
}

export interface OnlineUser {
  id: string;
  name: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';