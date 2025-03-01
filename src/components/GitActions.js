import { motion } from 'framer-motion';

const GitActions = ({ onCommit, onPush, onPull }) => (
  <motion.div 
    className="fixed bottom-8 right-96 flex flex-col gap-3 z-50"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <button
      onClick={onCommit}
      className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
    >
      Commit
    </button>
    <button
      onClick={onPush}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition"
    >
      Push
    </button>
    <button
      onClick={onPull}
      className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-lg hover:bg-purple-600 transition"
    >
      Pull
    </button>
  </motion.div>
);
export default GitActions;