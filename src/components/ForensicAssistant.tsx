import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ForensicAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello. I am the VeriSight Forensic Assistant. How can I help you with your image analysis today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const nextMessages: Message[] = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are the VeriSight Forensic AI Assistant. Help users understand deepfake detection, forensic analysis, manipulated images, and technical forensic findings. Be professional, technical, and helpful.",
          },
          ...nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      const reply =
        completion.choices[0]?.message?.content ||
        "No response received from the forensic assistant.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("Groq chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please check your Groq API key and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`flex w-[400px] flex-col ${isMinimized ? "h-auto" : "h-[500px]"}`}
          >
            <Card className="flex-1 overflow-hidden border-zinc-800 bg-zinc-950 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-400" />
                  <CardTitle className="text-xs font-mono uppercase tracking-widest">
                    Forensic AI Assistant
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-3 w-3" />
                    ) : (
                      <Minimize2 className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
                      <div className="space-y-4">
                        {messages.map((m, i) => (
                          <div
                            key={i}
                            className={`flex ${
                              m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl p-3 text-sm ${
                                m.role === "user"
                                  ? "rounded-tr-none bg-zinc-800 text-white"
                                  : "rounded-tl-none border border-zinc-800 bg-zinc-900 text-zinc-300"
                              }`}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                {m.role === "assistant" ? (
                                  <Bot className="h-3 w-3 text-zinc-500" />
                                ) : (
                                  <User className="h-3 w-3 text-zinc-500" />
                                )}
                                <span className="text-[10px] font-mono uppercase text-zinc-500">
                                  {m.role}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap">{m.content}</div>
                            </div>
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="rounded-xl rounded-tl-none border border-zinc-800 bg-zinc-900 p-3">
                              <div className="flex gap-1">
                                <motion.div
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="h-1.5 w-1.5 rounded-full bg-zinc-500"
                                />
                                <motion.div
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                  className="h-1.5 w-1.5 rounded-full bg-zinc-500"
                                />
                                <motion.div
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                  className="h-1.5 w-1.5 rounded-full bg-zinc-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <div className="border-t border-zinc-800 bg-zinc-900/30 p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about forensic analysis..."
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs transition-colors focus:border-zinc-600 focus:outline-none"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-white text-black hover:bg-zinc-200"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};