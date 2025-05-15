import React,{ useState} from "react";
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { useSocketEvent} from '../context/SocketContext'
import {
  FaBell,
  FaUserPlus,
  FaCodeBranch,
  FaTasks,
  FaCommentAlt,
  FaUsersCog,
} from "react-icons/fa";
const notifications = [
  {
    id: 1,
    icon: <FaUserPlus className="text-green-400" />,
    title: "New Collaborator Added",
    message: "Alice has been added to your repository \"ML Toolkit\".",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    icon: <FaCodeBranch className="text-purple-400" />,
    title: "Repository Forked",
    message: "Your repository \"CollabSpace-UI\" was forked by John.",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    icon: <FaCommentAlt className="text-blue-400" />,
    title: "New Comment",
    message: "Sam commented on issue #14 in \"API-Backend\".",
    timestamp: "8 hours ago",
  },
  {
    id: 4,
    icon: <FaUsersCog className="text-yellow-300" />,
    title: "Role Updated",
    message: "Your collaborator role in \"Vision-X\" has been updated to \"Maintainer\".",
    timestamp: "1 day ago",
  },
  {
    id: 5,
    icon: <FaTasks className="text-pink-400" />,
    title: "Task Assigned",
    message: "You’ve been assigned a new task in \"DevOps Suite\".",
    timestamp: "2 days ago",
  },
];

const NotificationPage = () => {

 const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useSocketEvent('new-notification', (notifications) => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  });

  return (


    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaBell className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        <div className="space-y-4">
          {notifications.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 flex items-start space-x-4 hover:bg-slate-700/70 transition"
            >
              <div className="text-2xl p-3 bg-slate-700 rounded-full">
                {note.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <p className="text-gray-300">{note.message}</p>
                <span className="text-xs text-gray-500 mt-1 block">{note.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationPage;
