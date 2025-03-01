import { useState } from "react";
import { Dialog } from "@headlessui/react"; 

const CommitDialog = ({ isOpen, onClose, onCommit }) => {
    const [message, setMessage] = useState('');
  
    return (
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">Commit Changes</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
            placeholder="Commit message"
            rows="3"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onCommit(message);
                setMessage('');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Commit
            </button>
          </div>
        </div>
      </Dialog>
    );
  };
  export default CommitDialog;