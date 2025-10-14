// FloatingChatbot.jsx
import React, { useState } from "react";
import "./FloatingChatbot.css";

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await response.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="floating-chat-widget">
          <div className="chat-header">
            <h3>Shopping Assistant</h3>
            <button className="close-button" onClick={toggleChat}>
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
                    <button onClick={() => setInput("Show me socks under $10")}>
                      Socks under $10
                    </button>
                    <button onClick={() => setInput("Find affordable shoes")}>
                      Affordable shoes
                    </button>
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
            </div>

            {/* Products Display */}
            {products.length > 0 && (
              <div className="floating-products">
                <h4>Found {products.length} product(s):</h4>
                {products.map((product) => (
                  <div key={product.id} className="floating-product-card">
                    <div className="product-info">
                      <strong>{product.name}</strong>
                      <span className="price">${product.price.toFixed(2)}</span>
                    </div>
                    <button className="mini-add-button">Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="floating-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default FloatingChatbot;
