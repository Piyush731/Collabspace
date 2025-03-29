import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from "framer-motion";
import API_URL from '../config';

const FileTree = ({ contents, onFileSelect, currentPath, onPathChange, isLoading, repoId, activeBranch,  selectedDirectory,
  setSelectedDirectory }) => {
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

  const handleChevronClick = async (e, item) => {
    e.stopPropagation();
    const isExpanded = !expandedDirs[item.path];
    setExpandedDirs(prev => ({ ...prev, [item.path]: isExpanded }));

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

  const handleDirClick = async (item) => {
    // Toggle expansion state
    const isExpanded = !expandedDirs[item.path];
    setExpandedDirs(prev => ({ ...prev, [item.path]: isExpanded }));
    setSelectedDirectory(item.path); 

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

   // GitHub-like directory structure with proper indentation
   const renderTree = (items, depth = 0) => {
    return items.map((item) => (
      <div key={item.path} className="relative">
        {/* Directory/File Row */}
        <motion.div
          className={`flex items-center group hover:bg-gray-100 rounded-md px-2 py-1 cursor-pointer ${
            item.type === 'dir' ? 'font-medium' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => {
            if (item.type === 'dir') {
              handleDirClick(item);
              onPathChange(item.path);
            } else {
              onFileSelect(item);
            }
          }}
          onMouseEnter={() => setHoveredFile(item.path)}
          onMouseLeave={() => setHoveredFile(null)}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Directory Chevron and Icon */}
          {item.type === 'dir' && (
            <>
            <button
              onClick={(e) => handleChevronClick(e, item)}
              className="mr-1 hover:bg-gray-200 rounded p-1"
            >
              {expandedDirs[item.path] ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <div 
              className="flex items-center flex-1"
              onClick={() => handleDirClick(item)}
            >
              <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
              <span className="truncate">{item.name}</span>
            </div>
          </>
          )}

          {/* File Icon */}
          {item.type === 'file' && (
            <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
          )}

          {/* Name */}
          <span className="truncate">{item.name}</span>

          {/* GitHub-like Delete Button */}
          {item.type === 'file' && hoveredFile === item.path && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(item.path);
              }}
              className="absolute right-2 bg-red-50 text-red-600 p-1 rounded-full hover:bg-red-100"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <TrashIcon className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>

        {/* Nested Children */}
        {item.type === 'dir' && expandedDirs[item.path] && childrenMap[item.path] && (
          <div className="ml-2 border-l-2 border-gray-100">
            {renderTree(childrenMap[item.path], depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // GitHub-style Breadcrumb Navigation
  const Breadcrumb = () => {
    const pathParts = currentPath.split('/').filter(p => p);
    
    return (
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <button
          onClick={() => {
            onPathChange('');
            setExpandedDirs({});
          }}
          className="hover:text-blue-600 hover:underline"
        >
          root
        </button>
        {pathParts.map((part, index) => {
          const pathSoFar = pathParts.slice(0, index + 1).join('/');
          return (
            <span key={pathSoFar} className="flex items-center">
              <span className="mx-1">/</span>
              <button
                onClick={() => onPathChange(pathSoFar)}
                className="hover:text-blue-600 hover:underline"
              >
                {part}
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <Breadcrumb />
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">
            Loading directory contents...
          </div>
        ) : (
          renderTree(sortedContents)
        )}
      </div>
    </div>
  );
};

export default FileTree;