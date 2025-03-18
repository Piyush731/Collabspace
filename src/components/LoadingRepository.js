import { motion } from "framer-motion";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoadingRepository = () => {
  return (
    <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 text-gray-600 glass-effect shadow-lg w-screen h-screen z-50"
    initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Animated Spinner */}
      <motion.div
        className="custom-spinner"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <AiOutlineLoading3Quarters size={40} className="text-blue-500" />
      </motion.div>

      {/* Floating Animated Text */}
      <motion.p
        className="animated-gradient-text text-xl font-semibold mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Loading Repository...
      </motion.p>
    </motion.div>
  );
};

export default LoadingRepository;
