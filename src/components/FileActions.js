import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion'; 
import { AiOutlineFileAdd, AiOutlineFolderAdd, AiOutlineUpload, AiOutlineFile, AiOutlineDownload } from 'react-icons/ai';

const FileActions = ({ 
  path, 
  onCreateFile, 
  onCreateDirectory, 
  onFolderUpload, 
  onFileUpload, 
  onDownloadZip 
}) => {
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [dirModalOpen, setDirModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dirName, setDirName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false); 
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingFile(true);
    try {
      const fullPath = path ? `${path}/${fileName}` : fileName;
      await onCreateFile({
        path: fullPath,
        content: fileContent
      });
      setFileModalOpen(false);
      setFileName('');
      setFileContent('');
    } finally {
      setIsCreatingFile(false);
    }
  };

  const handleDirSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingDir(true);
    try {
      const fullPath = path ? `${path}/${dirName}` : dirName;
      await onCreateDirectory(fullPath);
      setDirModalOpen(false);
      setDirName('');
    } finally {
      setIsCreatingDir(false);
    }
  };

  const handleFolderUpload = async (e) => {
    setIsUploadingFolder(true);
    try {
      await onFolderUpload(e);
    } finally {
      setIsUploadingFolder(false);
    }
  };

  const handleFileUpload = async (e) => {
    setIsUploadingFile(true);
    try {
      await onFileUpload(e);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadZip();
    } finally {
      setIsDownloading(false);
    }
  };

  // Custom Spinner Component
  const Spinner = ({ size = 20 }) => (
    <div className="flex items-center justify-center">
      <div 
        className="animate-spin rounded-full border-t-2 border-b-2 border-white"
        style={{ width: size, height: size }}
      />
    </div>
  );

  return (
    <div className="flex items-center gap-4 p-0.5 border-b border-gray-200 bg-white shadow-sm -mt-5 -mb-5 -ml-3 -mr-3">
      {/* File Creation */}
      <motion.button 
        onClick={() => setFileModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <AiOutlineFileAdd size={18} /> Create File
      </motion.button>

      {/* Directory Creation */}
      <motion.button 
        onClick={() => setDirModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        <AiOutlineFolderAdd size={18} /> Create Directory
      </motion.button>

      {/* Folder Upload */}
      <motion.label
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 ${
          isUploadingFolder ? 'bg-purple-500' : 'bg-purple-600'
        } text-white rounded-lg hover:bg-purple-700 cursor-pointer`}
      >
        {isUploadingFolder ? (
          <>
            <Spinner size={16} />
            Uploading...
          </>
        ) : (
          <>
            <AiOutlineUpload size={18} />
            Upload Folder
          </>
        )}
        <input 
          type="file"
          multiple 
          webkitdirectory="true" 
          onChange={handleFolderUpload} 
          className="hidden" 
          disabled={isUploadingFolder}
        />
      </motion.label>

      {/* File Upload */}
      <motion.label
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 ${
          isUploadingFile ? 'bg-red-500' : 'bg-red-600'
        } text-white rounded-lg hover:bg-red-700 cursor-pointer`}
      >
        {isUploadingFile ? (
          <>
            <Spinner size={16} />
            Uploading...
          </>
        ) : (
          <>
            <AiOutlineFile size={18} />
            Upload File
          </>
        )}
        <input 
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploadingFile}
        />
      </motion.label>

      {/* Download ZIP */}
      <motion.button 
        onClick={handleDownload}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 ${
          isDownloading ? 'bg-yellow-500' : 'bg-yellow-600'
        } text-white rounded-lg hover:bg-yellow-700`}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <Spinner size={16} />
            Downloading...
          </>
        ) : (
          <>
            <AiOutlineDownload size={18} /> 
            Download ZIP
          </>
        )}
      </motion.button>

      {/* File Creation Modal */}
      <Dialog open={fileModalOpen} onClose={() => setFileModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Create New File
            </Dialog.Title>
            <form onSubmit={handleFileSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">File Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    className="w-full p-2 border rounded h-32"
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFileModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 min-w-[120px]"
                    disabled={isCreatingFile}
                  >
                    {isCreatingFile ? (
                      <>
                        <Spinner size={16} />
                        Creating...
                      </>
                    ) : "Create File"}
                  </motion.button>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Directory Creation Modal */}
      <Dialog open={dirModalOpen} onClose={() => setDirModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Create New Directory
            </Dialog.Title>
            <form onSubmit={handleDirSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Directory Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={dirName}
                    onChange={(e) => setDirName(e.target.value)}
                    placeholder="Enter directory name"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDirModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 min-w-[120px]"
                    disabled={isCreatingDir}
                  >
                    {isCreatingDir ? (
                      <>
                        <Spinner size={16} />
                        Creating...
                      </>
                    ) : "Create Directory"}
                  </motion.button>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default FileActions;