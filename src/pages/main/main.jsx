import React, { useState, useRef, useEffect } from "react";
import "./main.scss";
import supabase from "./supabaseClient.js";

export const Main = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  console.log("🚀 ~ Main ~ messages:", messages);
  const messageListRef = useRef(null); // 메시지 목록 참조
  const textareaRef = useRef(null);

  const sortMessagesByTime = (msgs) => {
    return [...msgs].sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  useEffect(() => {
    const fetchMessage = async () => {
      const { data: message, error } = await supabase
        .from("message")
        .select("*");

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(sortMessagesByTime(message)); // 정렬된 메시지를 설정
      }
    };

    fetchMessage();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      const now = new Date();
      const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 한국 시간으로 변환

      const newMessage = {
        text: message,
        time: kstTime.toISOString(), // 한국 시간을 ISO 문자열로 변환
      };

      await supabase.from("message").insert([newMessage]);

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

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return ""; // 유효하지 않은 날짜인 경우 빈 문자열 반환
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 시간 포맷 함수
  const formatTime = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="main-container">
      <div className="message-list" ref={messageListRef}>
        {messages.map((msg, index) => {
          const currentDate = formatDate(msg.time);
          const prevDate =
            index > 0 ? formatDate(messages[index - 1].time) : null;

          return (
            <React.Fragment key={index}>
              {/* 날짜 구분선 표시 */}
              {currentDate !== prevDate && (
                <div className="date-divider">{currentDate}</div>
              )}

              <div className="message-item">
                <div className="message">
                  <p>{msg.text}</p>
                </div>
                <span>{formatTime(msg.time)}</span>
              </div>
            </React.Fragment>
          );
        })}
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
