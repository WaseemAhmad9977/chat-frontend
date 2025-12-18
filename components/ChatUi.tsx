"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AuthPopup from "./AuthPopup";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import NewChatModal from "./NewChatModal";
import {
  User,
  Chat,
  Message,
  OnlineUser,
  ConnectionStatus,
  MessageStatus,
} from "./types";

export default function ChatUI() {
  const socket = useRef<Socket | null>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const [user, setUser] = useState<User | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(true);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const [text, setText] = useState("");
  const [typers, setTypers] = useState<{ [chatId: string]: string[] }>({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setShowAuthPopup(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.current = io("http://localhost:4600", {
      auth: { token: user.token, userId: user.id, userName: user.name },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.on("connect", () => {
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
      socket.current?.emit("registerUser", {
        userId: user.id,
        userName: user.name,
      });
    });

    socket.current.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.current.on("reconnecting", () => {
      setConnectionStatus("reconnecting");
      reconnectAttempts.current++;
    });

    socket.current.on("onlineUsers", (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((u) => u.id !== user.id));
    });

    socket.current.on("initialChats", (userChats: Chat[]) => {
      setChats(userChats);
    });

    socket.current.on("chatInvite", (chat: Chat) => {
      setChats((prev) => {
        const exists = prev.find((c) => c.id === chat.id);
        if (exists) return prev;
        return [...prev, chat];
      });

      socket.current?.emit("joinChat", { chatId: chat.id, userId: user.id });
    });

    socket.current.on(
      "chatHistory",
      ({ chatId, messages: msgs }: { chatId: string; messages: Message[] }) => {
        setMessages((prev) => ({
          ...prev,
          [chatId]: msgs.sort((a, b) => a.ts - b.ts),
        }));
      }
    );

    socket.current.on("chatMessage", (msg: Message) => {
      setMessages((prevMessages) => {
        const chatId = msg.chatId;
        const existingMessages = prevMessages[chatId] || [];
        const isDuplicate = existingMessages.some(
          (message) => message.id === msg.id
        );

        if (isDuplicate) return prevMessages;

        const updatedMessages: Message[] = [
          ...existingMessages,
          {
            ...msg,
            status: "sent" as MessageStatus,
          },
        ].sort((a, b) => a.ts - b.ts);

        return {
          ...prevMessages,
          [chatId]: updatedMessages,
        };
      });

      const isFromAnotherChat = msg.chatId !== activeChat;
      const isFromAnotherUser = msg.sender !== user.id;

      if (isFromAnotherChat && isFromAnotherUser) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id !== msg.chatId
              ? chat
              : {
                  ...chat,
                  unreadCount: chat.unreadCount + 1,
                  lastMessage: msg,
                }
          )
        );
      }
    });

    socket.current.on(
      "messageStatus",
      ({ messageId, status }: { messageId: string; status: MessageStatus }) => {
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((chatId) => {
            updated[chatId] = updated[chatId].map((msg) =>
              msg.id === messageId ? { ...msg, status } : msg
            );
          });
          return updated;
        });
      }
    );

    socket.current.on(
      "typing",
      ({ chatId, userName }: { chatId: string; userName: string }) => {
        setTypers((prev) => {
          const chatTypers = prev[chatId] || [];
          if (chatTypers.includes(userName)) return prev;
          return { ...prev, [chatId]: [...chatTypers, userName] };
        });
      }
    );

    socket.current.on(
      "stopTyping",
      ({ chatId, userName }: { chatId: string; userName: string }) => {
        setTypers((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter(
            (userTyping) => userTyping !== userName
          ),
        }));
      }
    );

    return () => {
      socket.current?.off("connect");
      socket.current?.off("disconnect");
      socket.current?.off("reconnecting");
      socket.current?.off("onlineUsers");
      socket.current?.off("initialChats");
      socket.current?.off("chatInvite");
      socket.current?.off("chatHistory");
      socket.current?.off("chatMessage");
      socket.current?.off("messageStatus");
      socket.current?.off("typing");
      socket.current?.off("stopTyping");
      socket.current?.disconnect();
    };
  }, [user, activeChat]);

  useEffect(() => {
    if (!activeChat || !text.trim()) return;

    if (!text.trim()) {
      socket.current?.emit("stopTyping", user?.name);
      return;
    }

    socket.current?.emit("typing", {
      chatId: activeChat,
      userName: user?.name,
    });

    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      socket.current?.emit("stopTyping", {
        chatId: activeChat,
        userName: user?.name,
      });
    }, 1000);

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [text, activeChat, user?.name]);

  function handleAuth(name: string) {
    const userData: User = {
      id: `user_${Date.now()}`,
      name,
      token: `mock_jwt_${Date.now()}`,
    };

    localStorage.setItem("chatUser", JSON.stringify(userData));
    setUser(userData);
    setShowAuthPopup(false);
  }

  function handleCreateChat(
    name: string,
    type: "1-to-1" | "group",
    participants: string[]
  ) {
    if (!user) return;

    const participantNames = [
      user.name,
      ...participants.map(
        (id) => onlineUsers.find((u) => u.id === id)?.name || "not knows"
      ),
    ];

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      name,
      type,
      participants: [user.id, ...participants],
      participantNames,
      unreadCount: 0,
    };

    socket.current?.emit("createChat", newChat);
    setChats((prev) => [...prev, newChat]);
    socket.current?.emit("joinChat", { chatId: newChat.id, userId: user.id });
    setShowNewChatModal(false);
    setActiveChat(newChat.id);
  }

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || !activeChat || !user) return;

    const msg: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId: activeChat,
      sender: user.id,
      senderName: user.name,
      text: trimmed,
      ts: Date.now(),
      status: "sending",
    };

    setMessages((prev) => {
      const newState = { ...prev };
      const chatId = activeChat;
      const oldMessages = newState[chatId] || [];
      newState[chatId] = [...oldMessages, msg];
      return newState;
    });

    setText("");

    socket.current?.emit("chatMessage", msg, (ack: { success: boolean }) => {
      if (ack.success) {
        setMessages((prev) => ({
          ...prev,
          [activeChat]: prev[activeChat].map((m) =>
            m.id === msg.id ? { ...m, status: "sent" } : m
          ),
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [activeChat]: prev[activeChat].map((m) =>
            m.id === msg.id ? { ...m, status: "failed" } : m
          ),
        }));
      }
    });
  }

  function openChat(chatId: string) {
    setActiveChat(chatId);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );

    if (!messages[chatId]) {
      socket.current?.emit("joinChat", { chatId, userId: user?.id });
    }
  }

  if (showAuthPopup) {
    return <AuthPopup onAuth={handleAuth} />;
  }

  return (
    <div className="h-screen flex bg-zinc-100">
      <Sidebar
        userName={user?.name || ""}
        connectionStatus={connectionStatus}
        onlineUsers={onlineUsers}
        chats={chats}
        activeChat={activeChat}
        onNewChat={() => setShowNewChatModal(true)}
        onOpenChat={openChat}
      />

      <div className="flex-1 flex flex-col">
        <ChatArea
          activeChat={activeChat}
          chats={chats}
          messages={messages[activeChat || ""] || []}
          typers={typers[activeChat || ""] || []}
          currentUserId={user?.id || ""}
          text={text}
          onTextChange={setText}
          onSend={sendMessage}
        />
      </div>

      <NewChatModal
        show={showNewChatModal}
        onlineUsers={onlineUsers}
        onClose={() => setShowNewChatModal(false)}
        onCreate={handleCreateChat}
      />
    </div>
  );
}
