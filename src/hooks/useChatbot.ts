import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function useChatbot(_pageContext?: string) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm BridgeLink's assistant. This feature will be enhanced with AI capabilities soon.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 500);
  }, [session?.access_token]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
  }, []);

  const stopGeneration = useCallback(() => {
    setIsLoading(false);
  }, []);

  const loadHistory = useCallback(async () => {}, []);

  return {
    messages,
    isLoading,
    error,
    conversationId: null,
    sendMessage,
    clearHistory,
    stopGeneration,
    loadHistory,
  };
}
