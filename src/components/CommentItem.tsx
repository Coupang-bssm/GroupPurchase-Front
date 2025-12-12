import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { commentAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import type { Comment } from '@/types';
import './CommentItem.css';

interface CommentItemProps {
  comment: Comment;
  gpId: number;
  depth?: number;
}

export default function CommentItem({ comment, gpId, depth = 0 }: CommentItemProps) {
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const userId = getCurrentUserId();
  const isOwner = comment.userId === userId;

  const deleteMutation = useMutation(() => commentAPI.delete(comment.id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', gpId]);
    },
  });

  const createReplyMutation = useMutation(
    (content: string) => commentAPI.create(gpId, { content, parentId: comment.id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', gpId]);
        setReplyContent('');
        setIsReplying(false);
      },
    }
  );

  const handleDelete = () => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      createReplyMutation.mutate(replyContent);
    }
  };

  const getInitials = (userId: number) => {
    return `U${userId}`.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else if (minutes > 0) {
      return `${minutes}분 전`;
    } else {
      return '방금 전';
    }
  };

  const hasReplies = comment.children && comment.children.length > 0;

  return (
    <div className="comment-item">
      <div className="comment-avatar">{getInitials(comment.userId)}</div>
      <div className="comment-content-wrapper">
        <div className="comment-header">
          <span className="comment-author">사용자 {comment.userId}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          {!isReplying && (
            <button onClick={() => setIsReplying(true)} className="comment-action-btn reply-btn">
              <svg viewBox="0 0 24 24">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
              </svg>
              답글
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="comment-action-btn delete-btn"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="reply-form">
            <div className="reply-avatar">{getInitials(userId || 0)}</div>
            <div className="reply-form-content">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글 추가..."
                rows={1}
                className="reply-input"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              {replyContent.trim() && (
                <div className="reply-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                    className="cancel-btn"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={createReplyMutation.isLoading}
                  >
                    {createReplyMutation.isLoading ? '등록 중...' : '답글'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
        {hasReplies && (
          <>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="view-replies-btn"
            >
              <svg
                viewBox="0 0 24 24"
                style={{
                  transform: showReplies ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
              답글 {comment.children.length}개 {showReplies ? '숨기기' : '보기'}
            </button>
            {showReplies && (
              <div className="comment-children">
                {comment.children.map((child) => (
                  <CommentItem key={child.id} comment={child} gpId={gpId} depth={depth + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

