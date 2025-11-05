import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your e-commerce assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE = "http://localhost:3000/api/chat";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/message`,
        {
          message: text,
        },
        { withCredentials: true }
      );

      const botMessage = {
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Where is my order?",
    "How to reset password?",
    "What's your return policy?",
    "Shipping times and costs?",
  ];

  if (!isOpen) {
    return (
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(true)}
        title="AI Assistant"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L5 9.5V15.5L3 16V18L9 16.5V18H15V16.5L21 18V16L19 15.5V9.5L21 9Z"
            fill="currentColor"
          />
          <circle cx="8" cy="12" r="1" fill="currentColor" />
          <circle cx="16" cy="12" r="1" fill="currentColor" />
        </svg>
      </button>
    );
  }

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <strong>AI Assistant</strong>
          <span className="status-indicator">● Online</span>
        </div>
        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
          ×
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.isUser ? "user-message" : "bot-message"
            }`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            className="quick-question"
            onClick={() => sendMessage(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!inputMessage.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
