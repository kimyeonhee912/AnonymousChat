import React, { useState, useRef, useEffect } from "react";
import "./main.scss";
import supabase from "./supabaseClient.js";
import moon from "../../assets/dark-moon.svg";
import sun from "../../assets/dark-sun.svg";

export const Main = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageListRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

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
        const sortedMessages = sortMessagesByTime(message);
        setMessages(sortedMessages);

        // 페이지가 새로고침된 후 스크롤을 마지막 메시지로 설정
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      }
    };

    fetchMessage();

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      const now = new Date();

      const kstOffset = 9 * 60 * 60 * 1000;
      const kstTime = new Date(now.getTime() + kstOffset);

      const formattedTime = kstTime.toISOString().replace("Z", "");

      const newMessage = {
        text: message,
        time: formattedTime,
      };

      await supabase.from("message").insert([newMessage]);

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");

      setTimeout(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        setMessage((prev) => prev + "\n");
        e.preventDefault();
      } else {
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
      return "";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // 시간 포맷 함수
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid time:", dateString);
      return "";
    }

    const kstDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );

    return new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(kstDate)
      .replace("오후", "오후 ")
      .replace("오전", "오전 ");
  };

  // 줄 수 계산
  const calculateRows = () => {
    return (message.match(/\n/g) || []).length + 1;
  };

  return (
    <div className={`main-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Dark mode switch */}
      <div className="dark-mode-toggle" onClick={toggleDarkMode}>
        <div className={`toggle-switch ${isDarkMode ? "dark" : ""}`}>
          <img src={moon} alt="dark mode" className="icon moon" />
          <img src={sun} alt="light mode" className="icon sun" />
        </div>
      </div>
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
              <div className={`message-item ${isDarkMode ? "dark-mode" : ""}`}>
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

      <div className={`message-input ${isDarkMode ? "dark-mode" : ""}`}>
        <textarea
          ref={textareaRef}
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={calculateRows()}
          style={{ resize: "none", overflow: "hidden" }}
          className={isDarkMode ? "dark-mode" : ""}
        />
        <button
          className={isDarkMode ? "dark-mode" : ""}
          onClick={handleSendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
};
