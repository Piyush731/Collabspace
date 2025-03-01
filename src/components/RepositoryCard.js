import React from "react";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";

const RepositoryCard = ({ repo }) => { 
  const navigate = useNavigate(); 
  const handleNavigate = () => {
    navigate(`/repo/${repo._id}`); // Navigate to repository view page
  };
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="flex items-center mb-4">
        <div className={`h-3 w-3 rounded-full mr-2 
          ${repo.visibility === 'private' ? 'bg-red-500' : 'bg-green-500'}`}
        />
        <h3 className="text-xl font-semibold">{repo.name}</h3>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Owner: {repo.owner.username}</p>
        <p>Visibility: {repo.visibility}</p>
        <p>Collaborators: {repo.collaborators.length}</p>
        <p>Default Branch: {repo.defaultBranch}</p>
      </div>
    </motion.div>
  );
};

export default RepositoryCard;