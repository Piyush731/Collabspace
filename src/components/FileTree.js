import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';

const FileTree = ({ contents, onFileSelect, currentPath, onPathChange, isLoading }) => {
    const [expandedDirs, setExpandedDirs] = useState({});
    const handleDirClick = (item) => {
        setExpandedDirs(prev => ({ ...prev, [item.path]: !prev[item.path] }));
        onPathChange(item.path);
      };
      /*
  const renderTree = (items) => (
    <ul className="pl-4">
      {items?.map((item, index) => (
        <li key={index} className="py-1">
          <div 
            className="flex items-center hover:bg-gray-50 rounded p-1 cursor-pointer"
            onClick={() => !item.type === 'dir' && onFileSelect(item)}
          >
            {item.type === 'dir' ? (
              <>
                <ChevronRightIcon className="w-4 h-4 mr-1" />
                <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
              </>
            ) : (
              <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
            )}
            <span className="text-sm">{item.name}</span>
          </div>
          {item.type === 'dir' && item.contents && renderTree(item.contents)}
        </li>
      ))}
    </ul>
    );
    */ 

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

      <ul className="pl-4">
        {contents?.map((item, index) => (
          <li key={index} className="py-1">
            <div 
              className="flex items-center hover:bg-gray-50 rounded p-1 cursor-pointer"
              onClick={() => item.type === 'dir' ? handleDirClick(item) : onFileSelect(item)}
            >
              {item.type === 'dir' ? (
                <>
                  <ChevronRightIcon className={`w-4 h-4 mr-1 transform ${
                    expandedDirs[item.path] ? 'rotate-90' : ''
                  }`} />
                  <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
                </>
              ) : (
                <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
              )}
              <span className="text-sm">{item.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileTree;