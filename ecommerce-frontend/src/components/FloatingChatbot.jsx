import React, { useState, useEffect, useRef, useCallback } from "react";

import "./FloatingChatbot.css";

// Constants
const API_ENDPOINT = "http://localhost:3000/api/chat";
const SUGGESTED_QUESTIONS = [
  "Show me socks under $10",
  "Find affordable shoes",
  "What's on sale?",
  "Recommend popular items",
];

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, products]);

  // Message limit to prevent memory issues
  useEffect(() => {
    if (messages.length > 100) {
      setMessages((prev) => prev.slice(-50));
    }
  }, [messages.length]);

  // ESC key to close chat
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.keyCode === 27 && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen]);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Clear chat function
  const clearChat = useCallback(() => {
    setMessages([]);
    setProducts([]);
    // Optional: Clear from localStorage if you're using it
    localStorage.removeItem("chatMessages");
  }, []);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
  }, []);

  // Handle add to cart (you can integrate with your cart system)
  const handleAddToCart = useCallback((product) => {
    // TODO: Integrate with your cart context/state management
    console.log("Adding to cart:", product);
    alert(`Added ${product.name} to cart!`);
  }, []);

  // Send message to API
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chat-toggle-button"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className="floating-chat-widget"
          role="dialog"
          aria-label="Shopping Assistant Chat"
        >
          <div className="chat-header">
            <h3>Shopping Assistant</h3>
            <button
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="floating-chat-body">
            {/* Messages */}
            <div className="floating-messages-container">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <p>
                    👋 Hi! I'm your shopping assistant. Ask me to help you find
                    products!
                  </p>
                  <div className="suggestions">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`floating-message ${
                    msg.role === "user" ? "user" : "assistant"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {loading && <div className="floating-loading">Typing...</div>}

              <div ref={messagesEndRef} />
            </div>

            {/* Products Display */}
            {products.length > 0 && (
              <div className="floating-products">
                <h4>Found {products.length} product(s):</h4>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="floating-product-card"
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className="product-info">
                      <strong>{product.name}</strong>
                      <span className="price">
                        ${product.price?.toFixed(2)}
                      </span>
                      {product.rating && (
                        <span className="product-rating">
                          ⭐ {product.rating}
                        </span>
                      )}
                    </div>
                    <button
                      className="mini-add-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Form with Clear Button */}
          <form onSubmit={sendMessage} className="floating-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              aria-label="Type your message"
            />
            <button
              type="button"
              className="clear-chat-button"
              onClick={clearChat}
              disabled={messages.length === 0 && products.length === 0}
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              clear
            </button>
            <button type="submit" disabled={loading} aria-label="Send message">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

FloatingChatbot.propTypes = {
  // Add any props you might want to pass in the future
};

export default FloatingChatbot;
