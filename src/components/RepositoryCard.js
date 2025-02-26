import React from "react";
import { motion } from "framer-motion";

const RepositoryCard = ({ repo, onClick }) => {
  return (
    <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center mb-4">
      <div className={`h-3 w-3 rounded-full mr-2 
        ${repo.type === 'private' ? 'bg-red-500' : 'bg-green-500'}`}
      />
      <h3 className="text-xl font-semibold">{repo.name}</h3>
    </div>
    
    <div className="text-sm text-gray-600">
      <p>Owner: {repo.owner?.username || 'Unknown'}</p>
      <p>Type: {repo.type}</p>
      <p>Members: {(repo.members?.length || 0) + 1}</p>
    </div>
  </motion.div>
  );
};

export default RepositoryCard;