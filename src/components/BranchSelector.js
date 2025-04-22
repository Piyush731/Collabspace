import React from 'react';

const BranchSelector = ({ branches, activeBranch, onChange }) => {
  return (
    <select 
      className="px-3 py-1 border rounded-md text-sm"
      value={activeBranch}
      onChange={(e) => onChange(e.target.value)}
    >
      {branches.map(branch => {
        const name = typeof branch === 'string' ? branch : branch.name;
        const isProtected = typeof branch === 'object' && branch.protected;
        return (
          <option key={name} value={name}>
            🌿 {name}
            {isProtected && ' 🔒'}
          </option>
        );
      })}
    </select>
  );
};

export default BranchSelector;