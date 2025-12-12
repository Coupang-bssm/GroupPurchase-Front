import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commentAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import CommentItem from './CommentItem';
import './CommentSection.css';

interface CommentSectionProps {
  gpId: number;
}

export default function CommentSection({ gpId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const userId = getCurrentUserId();

  const { data: comments, isLoading } = useQuery(
    ['comments', gpId],
    () => commentAPI.getList(gpId),
    {
      enabled: !!gpId,
    }
  );

  const createMutation = useMutation(
    (content: string) => commentAPI.create(gpId, { content, parentId: null }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', gpId]);
        setNewComment('');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createMutation.mutate(newComment);
    }
  };

  if (isLoading) {
    return <div className="loading">댓글을 불러오는 중...</div>;
  }

  const getInitials = (userId: number | null) => {
    if (!userId) return 'U';
    return `U${userId}`.slice(0, 2).toUpperCase();
  };

  return (
    <div className="comment-section">
      <h3>댓글 {comments?.length || 0}개</h3>
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-avatar">{getInitials(userId)}</div>
        <div className="comment-form-content">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="공개 댓글 추가..."
            rows={1}
            className="comment-input"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {newComment.trim() && (
            <div className="comment-form-actions">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="comment-cancel-btn"
              >
                취소
              </button>
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? '등록 중...' : '댓글'}
              </button>
            </div>
          )}
        </div>
      </form>
      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} gpId={gpId} />)
        ) : (
          <p className="no-comments">댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

