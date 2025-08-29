import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabaseClient';

const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return '';
  }
};

const Comments = () => {
  const { address, isConnected } = useAccount();
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('comments')
        .select('id,address,content,created_at')
        .order('created_at', { ascending: false });
      if (error) {
        setError('댓글을 불러오는 중 오류가 발생했습니다.');
      } else {
        setComments(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };
    fetchComments();

    const channel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newRow = payload.new;
          setComments((prev) => {
            if (prev.find((c) => c.id === newRow.id)) return prev;
            return [newRow, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const canSubmit = useMemo(() => text.trim().length > 0, [text]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canSubmit || !isConnected) return;
    setError('');
    const { data, error } = await supabase
      .from('comments')
      .insert({ address, content: text.trim() })
      .select('id,address,content,created_at')
      .single();
    if (error) {
      setError('댓글 등록에 실패했습니다.');
      return;
    }
    if (data) {
      setComments((prev) => [data, ...prev]);
      setText('');
    }
  };

  return (
    <div className="comments-container animate-fade-in-up">
      <h3 className="comments-title">💬 댓글</h3>

      {isConnected ? (
        <form className="comments-form animate-fade-in-scale animate-delay-200" onSubmit={handleAdd}>
          <div className="comments-form-row">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="댓글을 입력하세요... 📝"
              rows={3}
              className="comments-textarea focus-ring"
            />
          </div>
          <div className="comments-actions">
            <button 
              type="submit" 
              className="comments-submit hover-lift" 
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  등록 중...
                </>
              ) : (
                <>🚀 등록</>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="comments-guard animate-fade-in-scale animate-delay-200">
          <span className="animate-pulse">🔒</span> 지갑을 연결해야 댓글을 작성할 수 있어요.
        </div>
      )}

      <div className="comments-list animate-fade-in-up animate-delay-300">
        {loading ? (
          <div className="comments-empty">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span style={{ marginLeft: '12px' }}>댓글을 불러오는 중...</span>
          </div>
        ) : error ? (
          <p className="comments-empty">
            <span className="animate-pulse">⚠️</span> {error}
          </p>
        ) : comments.length === 0 ? (
          <p className="comments-empty">
            <span className="animate-float">🎆</span> 첫 댓글을 남겨보세요!
          </p>
        ) : (
          <div className="stagger-children">
            {comments.map((c, index) => (
              <div key={c.id} className="comment-item hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="comment-header">
                  <span className="comment-address hover-scale">
                    👤 {c.address?.slice(0, 6)}...{c.address?.slice(-4)}
                  </span>
                  <span className="comment-date">🕰️ {formatDateTime(c.created_at)}</span>
                </div>
                <p className="comment-text">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .comments-container { 
          margin-top: 32px; 
          background: var(--glass-bg); 
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); 
          border-radius: var(--radius-lg); 
          padding: 24px; 
          color: var(--text-primary);
          transition: all 0.3s ease;
        }
        .comments-container:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-light);
        }
        .comments-title { 
          margin: 0 0 20px 0; 
          font-size: 1.4rem; 
          font-weight: 700; 
          color: var(--text-primary);
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .comments-form-row { margin-bottom: 16px; }
        .comments-textarea { 
          width: 100%; 
          padding: 16px; 
          border: 1px solid var(--border-color); 
          border-radius: var(--radius-md); 
          outline: none; 
          font-size: 1rem; 
          color: var(--text-primary); 
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }
        .comments-textarea::placeholder { 
          color: var(--text-muted); 
        }
        .comments-textarea:focus { 
          border-color: var(--primary-color); 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: var(--surface-hover);
        }
        .comments-actions { 
          display: flex; 
          justify-content: flex-end; 
        }
        .comments-submit { 
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none; 
          border-radius: var(--radius-md); 
          padding: 12px 24px; 
          cursor: pointer; 
          font-size: 1rem; 
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .comments-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        .comments-submit:hover::before {
          left: 100%;
        }
        .comments-submit:hover {
          background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }
        .comments-submit[disabled] { 
          background: var(--surface-color);
          cursor: not-allowed; 
          opacity: 0.5;
          transform: none;
        }
        .comments-submit[disabled]::before { display: none; }
        .comments-list { 
          margin-top: 24px; 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
        }
        .comments-empty { 
          color: var(--text-secondary); 
          margin: 0; 
          font-size: 1rem;
          text-align: center;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .comment-item { 
          border: 1px solid var(--glass-border); 
          border-radius: var(--radius-md); 
          padding: 20px; 
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .comment-item:hover {
          border-color: var(--primary-color);
          background: var(--surface-hover);
        }
        .comment-header { 
          display: flex; 
          gap: 12px; 
          align-items: center; 
          margin-bottom: 12px; 
          flex-wrap: wrap; 
        }
        .comment-address { 
          font-weight: 600; 
          color: var(--accent-color); 
          font-size: 0.85rem; 
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; 
          background: rgba(6, 182, 212, 0.1);
          padding: 6px 12px; 
          border-radius: var(--radius-sm);
          border: 1px solid rgba(6, 182, 212, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .comment-address:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: var(--accent-color);
        }
        .comment-date { 
          color: var(--text-muted); 
          font-size: 0.8rem;
          font-weight: 500;
        }
        .comment-text { 
          margin: 0; 
          white-space: pre-wrap; 
          color: var(--text-primary); 
          font-size: 1rem; 
          line-height: 1.7;
          word-break: break-word;
        }
        .comments-guard { 
          color: var(--text-secondary); 
          font-size: 1rem; 
          background: var(--surface-color);
          border: 1px dashed var(--border-color); 
          padding: 20px; 
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .comments-container { 
            padding: 20px; 
            margin-top: 24px;
          }
          .comments-title { 
            font-size: 1.3rem; 
          }
          .comments-textarea { 
            font-size: 16px;
            padding: 14px;
            min-height: 100px;
          }
          .comments-submit {
            padding: 14px 20px;
            font-size: 0.95rem;
            width: 100%;
          }
          .comment-text { 
            font-size: 1rem; 
          }
          .comment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .comments-container {
            padding: 16px;
          }
          .comments-title { 
            font-size: 1.2rem; 
          }
          .comments-textarea { 
            font-size: 16px;
            padding: 12px;
          }
          .comment-text { 
            font-size: 0.95rem; 
          }
        }
      `}</style>
    </div>
  );
};

export default Comments;


