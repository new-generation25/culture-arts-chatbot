'use client'
import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INIT_ASSISTANT_MSG = '당신의 아이디어와 생각을 정리하는데 도움을 드립니다.';

function formatParagraphs(text: string) {
  // 2개 이상의 연속된 줄바꿈은 문단 구분, 1개는 줄바꿈
  return text.split(/\n{2,}/).map((para, idx) => (
    <p key={idx} style={{ margin: '0 0 12px 0', whiteSpace: 'pre-line' }}>{para}</p>
  ));
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INIT_ASSISTANT_MSG }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (input.trim() === "" || loading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      if (data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "답변을 받아오지 못했습니다." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "서버 오류가 발생했습니다." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '70vw', maxWidth: 900, minWidth: 320, height: '80vh', maxHeight: 800, minHeight: 400, background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '28px 0 16px 0', textAlign: 'center', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h2 style={{ fontWeight: 800, fontSize: 26, letterSpacing: -1, margin: 0 }}>MAX의 기획 도우미</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 16px 24px', background: '#f8fafc' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 18
              }}
            >
              <div
                style={{
                  background: msg.role === 'user' ? '#2563eb' : '#e0e7ef',
                  color: msg.role === 'user' ? '#fff' : '#222',
                  borderRadius: 16,
                  padding: '14px 18px',
                  maxWidth: '70%',
                  whiteSpace: 'pre-line',
                  fontSize: 16,
                  lineHeight: 1.7,
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                  wordBreak: 'break-word',
                }}
              >
                {formatParagraphs(msg.content)}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#888', textAlign: 'center', margin: '12px 0' }}>AI 답변 생성 중...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: '18px 24px', borderTop: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            style={{ flex: 1, padding: '14px 16px', borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 16, outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            style={{ padding: "0 28px", borderRadius: 10, background: loading ? '#a5b4fc' : "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 16, height: 48, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            disabled={loading}
          >
            {loading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}
