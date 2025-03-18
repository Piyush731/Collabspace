import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, FolderIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from "framer-motion";
import API_URL from '../config';

const FileTree = ({ contents, onFileSelect, currentPath, onPathChange, isLoading, repoId, activeBranch }) => {
  const [expandedDirs, setExpandedDirs] = useState({});
  const [childrenMap, setChildrenMap] = useState({});
  const [hoveredFile, setHoveredFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null); 
  const sortedContents = [...contents].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });
  const fetchChildren = async (path) => {
    try {
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/contents?path=${encodeURIComponent(path)}&ref=${activeBranch}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch directory contents');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.sort((a, b) => a.type === 'dir' ? -1 : 1);
      }
      console.error('Unexpected response format:', data);
      return [];
    } catch (error) {
      console.error('Error fetching children:', error);
      return [];
    }
  };
  const handleDirClick = async (item) => {
    // Toggle expansion state
    const isExpanded = !expandedDirs[item.path];
    setExpandedDirs(prev => ({ ...prev, [item.path]: isExpanded }));

    // Only fetch contents if not already loaded
    if (isExpanded && !childrenMap[item.path]) {
      try {
        const children = await fetchChildren(item.path);
        setChildrenMap(prev => ({
          ...prev,
          [item.path]: children
        }));
      } catch (error) {
        console.error('Error fetching directory:', error);
      }
    }
  };

  const handleDeleteFile = async (filePath) => {
    if (!window.confirm(`Are you sure you want to delete ${filePath}?`)) return;
    setDeletingFile(filePath);

    try {
      const res = await fetch(`${API_URL}/api/repos/${repoId}/delete-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ path: filePath, branch: activeBranch }),
      });

      if (!res.ok) throw new Error("Failed to delete file");

      // Remove the deleted file from UI
      setChildrenMap((prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach((dir) => {
          updatedMap[dir] = updatedMap[dir].filter((file) => file.path !== filePath);
        });
        return updatedMap;
      });

      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file.");
    } finally {
      setDeletingFile(null);
    }
  };

  const renderTree = (items, depth = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <motion.div
          className="relative w-full overflow-visible flex items-center group hover:bg-gray-200 rounded-md p-1 cursor-pointer transition-all"
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => (item.type === "dir" ? handleDirClick(item) : onFileSelect(item))}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          {item.type === "dir" ? (
            <>
              <ChevronRightIcon
                className={`w-4 h-4 mr-1 transition-transform ${
                  expandedDirs[item.path] ? "rotate-90" : ""
                }`}
              />
              <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
            </>
          ) : (
            <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
          )}
          <span className="text-sm flex-1 truncate">{item.name}</span>

          {item.type === "file" && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(item.path);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-100 text-black w-8 h-8 flex items-center justify-center 
                rounded-full transition-opacity border border-gray-300 shadow-lg z-50 opacity-0 group-hover:opacity-100 overflow-visible"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={deletingFile === item.path}
            >
              {deletingFile === item.path ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <TrashIcon className="w-5 h-5 text-black" />
              )}
            </motion.button>
          )}
        </motion.div>

        {item.type === 'dir' && expandedDirs[item.path] && childrenMap[item.path] && (
          <div className="ml-4">
            {renderTree(childrenMap[item.path], depth + 1)}
          </div>
        )}
      </div>
    ));
  };
  
    

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">File Explorer</h3>
        {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
      </div>
      
      <div className="flex items-center mb-2 text-sm">
        {currentPath.split('/').map((part, index) => (
          <button
            key={index}
            onClick={() => onPathChange(currentPath.split('/').slice(0, index).join('/'))}
            className="text-blue-600 hover:text-blue-800"
          >
            {part || 'root'} {index > 0 && '/'}
          </button>
        ))}
      </div>

      <div className="mt-2">
      {renderTree(sortedContents)}
      </div>
    </div>
  );
};

export default FileTree;