"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, X } from "lucide-react";
import styles from "./AIChat.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  remainingQueries?: number;
  maxQueries?: number;
  onLimitReached?: () => void;
}

export default function AIChat({
  isOpen,
  onClose,
  initialQuestion,
  remainingQueries = 3,
  maxQueries = 3,
  onLimitReached,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queriesLeft, setQueriesLeft] = useState(remainingQueries);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSend(initialQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    if (queriesLeft <= 0) {
      onLimitReached?.();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/backend/ai-assist/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vulnerability: messageText,
          }),
        }
      );

      // Try to parse as JSON, but handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(text || 'Server returned non-JSON response');
      }

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setQueriesLeft(data.rate_limit?.remaining ?? queriesLeft - 1);
      } else {
        if (response.status === 429) {
          onLimitReached?.();
        }
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.detail?.message || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.aiIcon}>
              <Sparkles size={24} />
            </div>
            <div className={styles.headerInfo}>
              <h3>AI Security Assistant</h3>
              <span className={styles.queriesLeft}>
                {queriesLeft} / {maxQueries} free queries left
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <Bot size={48} />
              <h4>How can I help you?</h4>
              <p>
                Ask me about smart contract vulnerabilities, security best
                practices, or how to fix specific issues.
              </p>
              <div className={styles.suggestions}>
                <button
                  onClick={() => handleSend("What is a reentrancy attack?")}
                  className={styles.suggestion}
                >
                  What is reentrancy?
                </button>
                <button
                  onClick={() =>
                    handleSend("How do I prevent integer overflow?")
                  }
                  className={styles.suggestion}
                >
                  Prevent overflow
                </button>
                <button
                  onClick={() =>
                    handleSend("Explain access control best practices")
                  }
                  className={styles.suggestion}
                >
                  Access control
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.role === "user" ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageAvatar}>
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={styles.messageContent}>
                <pre className={styles.messageText}>{msg.content}</pre>
                <span className={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.messageAvatar}>
                <Bot size={18} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typing}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          {queriesLeft <= 0 ? (
            <div className={styles.limitReached}>
              <p>You&apos;ve reached your free query limit.</p>
              <button className="btn btn-primary">
                Connect Wallet to Continue
              </button>
            </div>
          ) : (
            <div className={styles.inputWrapper}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vulnerabilities..."
                className={styles.input}
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={styles.sendButton}
              >
                {isLoading ? <Loader2 size={20} className={styles.spinner} /> : <Send size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
