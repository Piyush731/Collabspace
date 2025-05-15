import React from "react";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCode, FiUsers, FiLock, FiGlobe } from "react-icons/fi";

const RepositoryCard = ({ repo, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative bg-slate-800/50 hover:bg-slate-700/30 rounded-xl p-6 cursor-pointer border border-slate-700/50 hover:border-indigo-500/30 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${repo.visibility === 'private' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            {repo.visibility === 'private' ? (
              <FiLock className="text-red-400 w-5 h-5" />
            ) : (
              <FiGlobe className="text-green-400 w-5 h-5" />
            )}
          </div>
          <h3 className="text-lg font-semibold truncate">{repo.name}</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
          {repo.language || 'Code'}
        </span>
      </div>

      <div className="space-y-3 text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <FiCode className="w-4 h-4 text-slate-400" />
          <span className="truncate">{repo.description || 'No description'}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FiUsers className="w-4 h-4 text-slate-400" />
            <span>{repo.collaborators.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10 rounded-xl" />
    </motion.div>
  );
};

export default RepositoryCard;