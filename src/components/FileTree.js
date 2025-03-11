import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';
import API_URL from '../config';

const FileTree = ({ contents, onFileSelect, currentPath, onPathChange, isLoading, repoId, activeBranch }) => {
  const [expandedDirs, setExpandedDirs] = useState({});
  const [childrenMap, setChildrenMap] = useState({});

  const fetchChildren = async (path) => {
    try {
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/contents?path=${encodeURIComponent(path)}&ref=${activeBranch}`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching children:', error);
      return [];
    }
  };
  const handleDirClick = async (item) => {
    if (!expandedDirs[item.path]) {
      try {
        const children = await fetchChildren(item.path);
        setChildrenMap(prev => ({
          ...prev,
          [item.path]: children
        })); 
      setExpandedDirs(prev => ({
        ...prev,
        [item.path]: !prev[item.path]
      })); 
      } catch (error) {
        console.error('Error fetching directory:', error);
      }
    }
  };
  const renderItem = (item, depth = 0) => {
    // Add pathParts here, inside the renderItem function
    const pathParts = item.path ? item.path.split('/') : [];

    return (
      <div key={`${item.path}-${depth}`} className="ml-4">
        <div
          className="flex items-center hover:bg-gray-50 rounded p-1 cursor-pointer"
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => item.type === 'dir' ? handleDirClick(item) : onFileSelect(item)}
        >
          {item.type === 'dir' ? (
            <>
              <ChevronRightIcon
                className={`w-4 h-4 mr-1 transition-transform ${
                  expandedDirs[item.path] ? 'rotate-90' : ''
                }`}
              />
              <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
            </>
          ) : (
            <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
          )}
          <span className="text-sm">{item.name}</span>
        </div>
        {expandedDirs[item.path] && childrenMap[item.path]?.map(child => 
          renderItem(child, depth + 1)
        )}
      </div> 
    );
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
        {contents.map(item => renderItem(item))}
      </div>
    </div>
  );
};

export default FileTree;