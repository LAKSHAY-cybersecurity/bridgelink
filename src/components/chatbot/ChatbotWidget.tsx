import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Trash2, StopCircle, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot, ChatMessage } from "@/hooks/useChatbot";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  student: [
    "How can I improve my trust score?",
    "Best referrals for me right now",
    "Why was my application rejected?",
    "What skills should I learn next?",
    "Analyze my profile strengths",
  ],
  referrer: [
    "Best candidates for my open slot",
    "Show candidate risk analysis",
    "How to improve my referrer reputation",
    "Application quality summary",
  ],
  admin: [
    "Show suspicious users today",
    "Platform health summary",
    "Unresolved fraud alerts",
    "User growth analytics",
  ],
};

interface Props {
  pageContext?: string;
}

export default function ChatbotWidget({ pageContext }: Props) {
  const { session, roles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const role = roles[0] || "student";
  const { messages, isLoading, error, sendMessage, clearHistory, stopGeneration } = useChatbot(pageContext);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  if (!session) return null;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const prompts = SUGGESTED_PROMPTS[role] || SUGGESTED_PROMPTS.student;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">RefNet AI</h3>
                  <p className="text-xs text-muted-foreground">
                    {role === "admin" ? "Admin Assistant" : role === "referrer" ? "Referrer Assistant" : "Career Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearHistory} title="Clear chat">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground">Hi! I'm RefNet AI 👋</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      I can help with trust scores, referrals, career guidance, and more.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Try asking:</p>
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(""); sendMessage(prompt); }}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">{error}</div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border bg-muted/20">
              {isLoading && (
                <div className="flex justify-center mb-2">
                  <Button variant="ghost" size="sm" onClick={stopGeneration} className="text-xs text-muted-foreground">
                    <StopCircle className="h-3 w-3 mr-1" /> Stop generating
                  </Button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-[40px] max-h-[100px] resize-none text-sm bg-background"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
      </div>
      <div
        className={`rounded-xl px-3 py-2 max-w-[85%] text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:my-2 [&_h2]:my-1.5 [&_h3]:my-1 [&_code]:text-xs [&_pre]:text-xs [&_pre]:bg-background/50 [&_pre]:rounded-md">
            <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
