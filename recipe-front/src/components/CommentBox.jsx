import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/AuthStore';
import useFormValidation from '../hooks/useFormValidation';
import { commentSchema } from '../utils/validators';

const CommentBox = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingErrors, setEditingErrors] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { isAuthenticated, userId } = useAuthStore();

  // Form validation for new comment
  const {
    values: newCommentForm,
    errors,
    handleChange,
    handleBlur,
    validate,
    reset
  } = useFormValidation(commentSchema, {
    content: ''
  });

  // Fetch comments
  useEffect(() => {
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/recipes/${recipeId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    // Validate comment
    const isValid = await validate();
    if (!isValid) {
      toast.error('Por favor corrige los errores en el comentario');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/comments', {
        content: newCommentForm.content,
        recipe_id: recipeId
      });
      
      reset();
      toast.success('Comment added successfully');
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId) => {
    // Validate edited comment
    try {
      await commentSchema.validate({ content: editingContent });
      setEditingErrors('');
    } catch (error) {
      setEditingErrors(error.message);
      toast.error(error.message);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.put(`/comments/${commentId}`, {
        content: editingContent
      });
      
      toast.success('Comment updated successfully');
      setEditingCommentId(null);
      setEditingContent('');
      setEditingErrors('');
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(error.response?.data?.error || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await apiClient.delete(`/comments/${commentId}`);
      toast.success('Comment deleted successfully');
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Icon icon="mdi:comment-multiple" className="mr-2 text-orange-500" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form (only for authenticated users) */}
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              name="content"
              value={newCommentForm.content}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Share your thoughts about this recipe..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="4"
              disabled={submitting}
              aria-invalid={errors.content ? 'true' : 'false'}
              aria-describedby={errors.content ? 'comment-error' : undefined}
            />
            {errors.content && (
              <p id="comment-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.content}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" className="mr-2" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-gray-700 text-center">
            <Icon icon="mdi:lock" className="inline mr-2" />
            Please <a href="/login" className="text-orange-500 font-semibold hover:underline">login</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Icon icon="mdi:loading" className="animate-spin text-orange-500 text-4xl" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon icon="mdi:comment-off-outline" className="text-6xl mb-2 mx-auto" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(comments) && comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Icon icon="mdi:account-circle" className="text-gray-400 text-3xl mr-2" />
                  <div>
                    <p className="font-semibold text-gray-800">{comment.user_name}</p>
                    <p className="text-sm text-gray-500">{formatDate(comment.comment_date)}</p>
                  </div>
                </div>
                
                {/* Edit/Delete buttons for comment owner */}
                {isAuthenticated && userId === comment.user_id && (
                  <div className="flex gap-2">
                    {editingCommentId !== comment.id && (
                      <>
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-500 hover:text-blue-600 transition"
                          title="Edit comment"
                        >
                          <Icon icon="mdi:pencil" className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-600 transition"
                          title="Delete comment"
                        >
                          <Icon icon="mdi:delete" className="text-xl" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Comment content or edit form */}
              {editingCommentId === comment.id ? (
                <div className="mt-3">
                  <textarea
                    value={editingContent}
                    onChange={(e) => {
                      setEditingContent(e.target.value);
                      setEditingErrors('');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      editingErrors ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="3"
                    disabled={submitting}
                    aria-invalid={editingErrors ? 'true' : 'false'}
                    aria-describedby={editingErrors ? `edit-comment-error-${comment.id}` : undefined}
                  />
                  {editingErrors && (
                    <p id={`edit-comment-error-${comment.id}`} className="mt-1 text-sm text-red-600" role="alert">
                      {editingErrors}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={submitting}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentBox;
