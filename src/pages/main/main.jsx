import React, { useState, useRef, useEffect } from "react";
import "./main.scss";

export const Main = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageListRef = useRef(null); // 메시지 목록 참조
  const textareaRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");

      // 전송 후 약간 지연 후 메시지 목록이 보이도록 스크롤
      setTimeout(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      }, 0); // 0ms 지연
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="main-container">
      <div className="message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            <div className="message">
              <p>{msg.text}</p>
            </div>
            <span>{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea
          ref={textareaRef}
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ resize: "none", overflow: "hidden" }}
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
};
