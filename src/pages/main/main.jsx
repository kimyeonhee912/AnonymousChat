import React, { useState } from "react";
import "./main.scss";

export const Main = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages([newMessage, ...messages]);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="main-container">
      <div className="message-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>

      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            <p>{msg.text}</p>
            <span>{msg.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
