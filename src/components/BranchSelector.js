import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

// Renders a dropdown of branches with a delete button for the selected branch
const BranchSelector = ({ branches, activeBranch, onChange, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <select
        className="px-3 py-1 border rounded-md text-sm"
        value={activeBranch}
        onChange={(e) => onChange(e.target.value)}
      >
        {branches.map((branch) => {
          const name = typeof branch === 'string' ? branch : branch.name;
          return (
            <option key={name} value={name}>
              {name}
            </option>
          );
        })}
      </select>
      <button
        onClick={() => onDelete(activeBranch)}
        className="text-red-500 hover:text-red-700 p-1"
        title={`Delete branch ${activeBranch}`}
      >
        <FiTrash2 />
      </button>
    </div>
  );
};

export default BranchSelector;