import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserCircleIcon,
  TagIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  TrashIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';

const TaskView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState({
    title: 'Implement user authentication',
    description: 'Create secure login system with JWT tokens and refresh tokens',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2024-03-15',
    assignees: ['Alex Chen', 'Samira Khan'],
    labels: ['Authentication', 'Security', 'Backend'],
    comments: [
      {
        id: 1,
        user: 'Alex Chen',
        text: 'Need to integrate with existing user database',
        timestamp: '2h ago'
      }
    ],
    attachments: ['auth_spec.pdf'],
    activity: [
      { id: 1, text: 'Task created by Samira Khan', timestamp: '3 days ago' },
      { id: 2, text: 'Assigned to Alex Chen', timestamp: '2 days ago' }
    ]
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 border-b border-gray-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ArrowLeftIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
            </motion.span>
            {isEditing ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                className="text-2xl font-bold flex-1 px-3 py-2 border rounded-lg"
              />
            ) : (
              <motion.h1 
                variants={itemVariants}
                className="text-2xl font-bold flex-1"
              >
                {task.title}
              </motion.h1>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <PencilIcon className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Status Bar */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <select 
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
                className="bg-transparent outline-none capitalize"
              >
                {['todo', 'in-progress', 'done'].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
              <TagIcon className="h-5 w-5 text-red-600" />
              <select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                className="bg-transparent outline-none capitalize"
              >
                {['low', 'medium', 'high'].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className="bg-transparent outline-none"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 p-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <motion.div 
              variants={itemVariants}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                Description
              </div>
              {isEditing ? (
                <textarea
                  value={task.description}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  className="w-full p-3 border rounded-lg min-h-[120px]"
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </motion.div>

            {/* Comments */}
            <motion.div 
              variants={itemVariants}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                Comments ({task.comments.length})
              </div>
              
              <div className="space-y-4">
                {task.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.user}</span>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  className="flex-1 p-3 border rounded-lg focus:outline-blue-500"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Details */}
            <motion.div 
              variants={itemVariants}
              className="space-y-4"
            >
              <div className="text-lg font-semibold">Details</div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Assigned to:</span>
                  <div className="flex-1 flex items-center gap-1">
                    {task.assignees.map((assignee, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {assignee}
                      </span>
                    ))}
                    <ChevronUpDownIcon className="h-4 w-4 cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Labels:</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {task.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PaperClipIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Attachments:</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    {task.attachments.map((file, index) => (
                      <span key={index} className="cursor-pointer hover:underline">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Activity Log */}
            <motion.div 
              variants={itemVariants}
              className="space-y-4"
            >
              <div className="text-lg font-semibold">Activity</div>
              <div className="space-y-3">
                {task.activity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      {index !== task.activity.length - 1 && (
                        <div className="w-px h-6 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700">{activity.text}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskView;

// // src/pages/TasksPage.js
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { FaTasks, FaPlus, FaFilter, FaSearch } from "react-icons/fa";
// import { useParams } from "react-router-dom";
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import Sidebar from "../components/sidebar";
// import UserNavbar from "../components/UserNavbar";
// import KanbanBoard from "../components/KanbanBoard";
// import TaskForm from "../components/TaskForm";
// import { useTasks } from "../context/TaskContext";
// import TaskFilters from "../components/TaskFilters";

// const TasksPage = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [filters, setFilters] = useState({ 
//     status: "", 
//     priority: "", 
//     assignee: "",
//     search: ""
//   });
//   const { repoId } = useParams();
//   const { tasks, fetchTasks } = useTasks();

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   useEffect(() => {
//     if (repoId) fetchTasks(repoId);
//   }, [repoId]);

//   const filteredTasks = tasks.filter(task => {
//     const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//       task.description?.toLowerCase().includes(filters.search.toLowerCase());
    
//     return (
//       (filters.status ? task.status === filters.status : true) &&
//       (filters.priority ? task.priority === filters.priority : true) &&
//       (filters.assignee ? task.assignee?._id === filters.assignee : true) &&
//       matchesSearch
//     );
//   });

//   return (
//     <motion.div
//       className="min-h-screen  w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
//                      w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//     >
//       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')] opacity-20" />
      
//       <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
//       <main className="ml-0 transition-all duration-300 lg:ml-64 pt-16 min-h-screen">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//             <motion.h1 
//               initial={{ x: -20 }}
//               animate={{ x: 0 }}
//               className="text-3xl font-bold flex items-center gap-3"
//             >
//               <FaTasks className="text-blue-400 text-4xl" />
//               <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                 Project Tasks
//               </span>
//             </motion.h1>
            
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
//               onClick={() => setShowTaskForm(true)}
//             >
//               <FaPlus className="text-lg" />
//               Create New Task
//             </motion.button>
//           </div>

//           <TaskFilters filters={filters} setFilters={setFilters} />
          
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="mt-8"
//           >
//             {tasks.length === 0 ? (
//               <div className="text-center py-12 text-gray-400 text-xl">
//                 🎉 No tasks found! Start by creating your first task.
//               </div>
//             ) : (
//               <DndProvider backend={HTML5Backend}>
//                 <KanbanBoard tasks={filteredTasks} />
//               </DndProvider>
//             )}
//           </motion.div>
//         </div>

//         {showTaskForm && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-slate-800 p-6 rounded-xl w-full max-w-2xl mx-4 border border-slate-700 shadow-2xl"
//             >
//               <TaskForm 
//                 onClose={() => setShowTaskForm(false)}
//                 repoId={repoId}
//               />
//             </motion.div>
//           </div>
//         )}
//       </main>
//     </motion.div>
//   );
// };

// export default TasksPage;