import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  isChatOpen: false,
  toggleChat: () => {},
  openChat: () => {},
  closeChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const value = {
    isChatOpen,
    toggleChat,
    openChat,
    closeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
}
