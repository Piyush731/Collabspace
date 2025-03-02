import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

const FileActions = ({ path, onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isDirectory, setIsDirectory] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    onCreate({
      path: path ? `${path}/${name}` : name,
      isDirectory,
      content
    });
    setIsOpen(false);
    setName('');
    setContent('');
  };

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Create New
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Create New {isDirectory ? 'Directory' : 'File'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Enter ${isDirectory ? 'directory' : 'file'} name`}
                />
              </div>

              {!isDirectory && (
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    className="w-full p-2 border rounded h-32"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDirectory}
                  onChange={(e) => setIsDirectory(e.target.checked)}
                />
                <span className="text-sm">Create Directory</span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default FileActions;