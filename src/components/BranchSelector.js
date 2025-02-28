import React from 'react';

const BranchSelector = ({ branches, activeBranch, onChange }) => {
  return (
    <select 
      className="px-3 py-1 border rounded-md text-sm"
      value={activeBranch}
      onChange={(e) => onChange(e.target.value)}
    >
      {branches.map(branch => (
        <option key={branch.name} value={branch.name}>
          🌿 {branch.name}
          {branch.protected && ' 🔒'}
        </option>
      ))}
    </select>
  );
};

export default BranchSelector;