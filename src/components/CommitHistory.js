import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const CommitHistory = ({ commits }) => {
  return (
    <div className="space-y-2">
      {commits.map(commit => (
        <div key={commit.sha} className="p-2 text-sm border rounded hover:bg-gray-50">
          <div className="font-medium text-gray-900 truncate">{commit.commit.message}</div>
          <div className="flex items-center justify-between mt-1 text-gray-500">
            <span className="truncate">{commit.author?.login || 'Unknown'}</span>
            <span>
              {formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitHistory;