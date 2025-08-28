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
    <div className="comments-container">
      <h3 className="comments-title">댓글</h3>

      {isConnected ? (
        <form className="comments-form" onSubmit={handleAdd}>
          <div className="comments-form-row">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
              className="comments-textarea"
            />
          </div>
          <div className="comments-actions">
            <button type="submit" className="comments-submit" disabled={!canSubmit}>
              등록
            </button>
          </div>
        </form>
      ) : (
        <div className="comments-guard">지갑을 연결해야 댓글을 작성할 수 있어요.</div>
      )}

      <div className="comments-list">
        {loading ? (
          <p className="comments-empty">불러오는 중...</p>
        ) : error ? (
          <p className="comments-empty">{error}</p>
        ) : comments.length === 0 ? (
          <p className="comments-empty">첫 댓글을 남겨보세요!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-address">작성자: {c.address}</span>
                <span className="comment-date">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="comment-text">{c.content}</p>
            </div>
          ))
        )}
      </div>

      <style>{`
        .comments-container { margin-top: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; color: #111827; }
        .comments-title { margin: 0 0 14px 0; font-size: 20px; font-weight: 700; color: #111827; }
        .comments-form-row { margin-bottom: 10px; }
        .comments-textarea { width: 100%; padding: 12px 12px; border: 1px solid #d1d5db; border-radius: 10px; outline: none; font-size: 16px; color: #111827; background: #ffffff; }
        .comments-textarea::placeholder { color: #6b7280; }
        .comments-textarea:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .comments-actions { display: flex; justify-content: flex-end; }
        .comments-submit { background: #4f46e5; color: #ffffff; border: none; border-radius: 10px; padding: 10px 16px; cursor: pointer; font-size: 16px; font-weight: 600; }
        .comments-submit[disabled] { background: #c7c9ff; cursor: not-allowed; }
        .comments-list { margin-top: 18px; display: flex; flex-direction: column; gap: 14px; }
        .comments-empty { color: #374151; margin: 0; font-size: 15px; }
        .comment-item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; background: #ffffff; }
        .comment-header { display: flex; gap: 10px; align-items: baseline; margin-bottom: 8px; flex-wrap: wrap; }
        .comment-address { font-weight: 600; color: #111827; font-size: 13px; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 6px; }
        .comment-date { color: #6b7280; font-size: 12px; }
        .comment-text { margin: 8px 0 12px 0; white-space: pre-wrap; color: #111827; font-size: 16px; line-height: 1.7; }
        .comments-guard { color: #374151; font-size: 14px; background: #f3f4f6; border: 1px dashed #d1d5db; padding: 10px 12px; border-radius: 10px; }

        @media (max-width: 480px) {
          .comments-title { font-size: 18px; }
          .comments-textarea { font-size: 15px; }
          .comment-text { font-size: 15px; }
        }
      `}</style>
    </div>
  );
};

export default Comments;


