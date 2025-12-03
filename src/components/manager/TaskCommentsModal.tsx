import { useState, useEffect } from "react";
import { Task, Comment, apiClient } from "../../lib/api";
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface TaskCommentsModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskCommentsModal = ({
  task,
  onClose,
}: TaskCommentsModalProps) => {
  const { user } = useAuth();
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task.task_id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await apiClient.getTaskComments(task.task_id);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await apiClient.createComment(
        task.task_id,
        newComment.trim()
      );
      setComments([...comments, response.comment]);
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;

    try {
      const response = await apiClient.updateComment(
        commentId,
        editingCommentText.trim()
      );
      setComments(
        comments.map((c) => (c.comment_id === commentId ? response.comment : c))
      );
      setEditingCommentId(null);
      setEditingCommentText("");
      setSuccess("Comment updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update comment"
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await apiClient.deleteComment(commentId);
      setComments(comments.filter((c) => c.comment_id !== commentId));
      setSuccess("Comment deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="glass rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--tile)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
              Task Comments
            </h2>
            <p className="text-sm opacity-70 mt-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="neo-icon hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Messages */}
          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-12 opacity-70">
              <div className="inline-block w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3">Loading comments...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="opacity-50">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  // Check if this comment belongs to the current user
                  // Compare with both user.id and user.user_id to handle different response formats
                  const currentUserId = user?.id || user?.user_id;
                  const commentUserId =
                    comment.user_id || comment.user?.user_id;
                  const isOwnComment = commentUserId === currentUserId;

                  return (
                    <div
                      key={comment.comment_id}
                      className="glass rounded-lg p-4 space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.user?.username || "Unknown"}
                            </span>
                            {isOwnComment && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)]/20 text-[var(--brand)]">
                                You
                              </span>
                            )}
                            <span className="text-xs opacity-50">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          {editingCommentId === comment.comment_id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingCommentText}
                                onChange={(e) =>
                                  setEditingCommentText(e.target.value)
                                }
                                className="flex-1 px-3 py-2 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 outline-none text-sm"
                                style={{ background: "var(--tile-dark)" }}
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  handleUpdateComment(comment.comment_id)
                                }
                                className="neo-icon w-8 h-8 hover:bg-green-500/20"
                              >
                                <Check className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText("");
                                }}
                                className="neo-icon w-8 h-8 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <p className="opacity-80 text-sm">
                              {comment.comment_text}
                            </p>
                          )}
                        </div>
                        {isOwnComment &&
                          editingCommentId !== comment.comment_id && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.comment_id);
                                  setEditingCommentText(comment.comment_text);
                                }}
                                className="neo-icon w-8 h-8 hover:bg-blue-500/20"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment.comment_id)
                                }
                                className="neo-icon w-8 h-8 hover:bg-red-500/20"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer - Add Comment */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !submittingComment) {
                  handleAddComment();
                }
              }}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none"
              style={{ background: "var(--tile-dark)" }}
              disabled={submittingComment}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submittingComment}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6"
            >
              {submittingComment ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
