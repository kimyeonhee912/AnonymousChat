import React, { useState, useRef, useEffect } from "react";
import "./main.scss";
import supabase from "./supabaseClient.js";

export const Main = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
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

      // 한국 시간으로 변환
      const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
      const kstTime = new Date(now.getTime() + kstOffset);

      // YYYY-MM-DDTHH:MM:SS.sss 형태로 변환
      const formattedTime = kstTime.toISOString().replace("Z", ""); // Z 제거

      const newMessage = {
        text: message,
        time: formattedTime, // 변경된 포맷 시간 사용
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
      if (e.shiftKey) {
        // Shift + Enter: 줄 바꿈
        setMessage((prev) => prev + "\n");
        e.preventDefault(); // 기본 동작 방지
      } else {
        // Enter: 메시지 전송
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return ""; // 유효하지 않은 날짜인 경우 빈 문자열 반환
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid time:", dateString);
      return ""; // 유효하지 않은 시간인 경우 빈 문자열 반환
    }

    const kstDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    ); // KST로 변환

    return new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // 12시간 형식 사용
    })
      .format(kstDate)
      .replace("오후", "오후 ")
      .replace("오전", "오전 "); // "오후"와 "오전" 사이에 공백 추가
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
                  <p>
                    {msg.text.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < msg.text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
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
