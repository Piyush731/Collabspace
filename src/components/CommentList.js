import React from 'react';

const CommentList = ({ comments }) => {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-gray-400">No comments yet</p>
      ) : (
        comments.map(comment => (
          <div key={comment._id} className="bg-slate-700 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold">{comment.author?.name || 'Anonymous'}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p>{comment.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;