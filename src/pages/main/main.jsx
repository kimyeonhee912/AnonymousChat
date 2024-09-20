import React, { useState, useRef, useEffect } from "react";
import "./main.scss";
import supabase from "./supabaseClient.js";
import moon from "../../assets/dark-moon.svg";
import sun from "../../assets/dark-sun.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const fetchMessages = async () => {
  const { data: messages, error } = await supabase.from("message").select("*");
  if (error) throw new Error("Error fetching messages");
  return messages;
};

const insertMessages = async (newMessage) => {
  const { data, error } = await supabase.from("message").insert([newMessage]);
  if (error) throw new Error("Error inserting message");
  return data;
};

export const Main = () => {
  const [message, setMessage] = useState("");
  const messageListRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const queryClient = useQueryClient();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const sortMessagesByTime = (msgs) => {
    return [...msgs].sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages, // 데이터를 반환하는 함수
  });

  // 메시지가 로딩 중이거나 에러가 발생한 경우 빈 배열을 반환
  const messages = isLoading || isError ? [] : data;

  // 메시지 정렬
  const sortedMessages = sortMessagesByTime(messages);

  const mutation = useMutation({
    mutationFn: insertMessages,
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
    onError: (error) => {
      console.log("insert message failed:", error);
    },
  });

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (shouldAutoScroll && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [data, shouldAutoScroll]);

  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px의 여유를 둠
      setShouldAutoScroll(isAtBottom);
    }
  };

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

      // 메시지 전송
      mutation.mutate(newMessage, {
        onSettled: () => {
          setMessage("");
        },
      });
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
      <div
        className="message-list"
        ref={messageListRef}
        onScroll={handleScroll}
      >
        {sortedMessages.map((msg, index) => {
          const currentDate = formatDate(msg.time);
          const prevDate =
            index > 0 ? formatDate(sortedMessages[index - 1].time) : null;

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
