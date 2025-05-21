import React, { useEffect, useState , useMemo} from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import UserNavbar from '../components/UserNavbar';
import Sidebar from '../components/sidebar';
import TaskDetailsModal from '../components/TaskDetailsModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import Notifications from '../pages/notifications';
import { Toaster, toast } from 'react-hot-toast';
import { Switch } from '@headlessui/react';
import axios from 'axios';
import API_URL from '../config';
const statuses = ['backlog', 'todo', 'in-progress', 'review', 'done'];
const statusLabels = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'In Review',
  done: 'Done'
};

const TasksPage = () => {
  const { user } = useAuth();
  const { 
    fetchRepos,
    board,
    repos,
    fetchTasks,
    dispatch,
    currentRepo,
    setCurrentRepo,
    fetchBoard,
    createTask,
    syncWithGitea,
    getUserTasks
  } = useTask();
  const [viewMode, setViewMode] = useState('repo');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
   const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [collaborators, setCollaborators] = useState([]);


   // Enhanced task filtering
const filteredTasks = useMemo(() => {
  if (viewMode === 'repo') {
    return Object.entries(board?.columns || {}).reduce((acc, [statusKey, tasks]) => {
      acc[statusKey] = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLabel = selectedLabel === 'all' || task.labels?.includes(selectedLabel);
        const matchesAssignee = selectedAssignee === 'all' || 
          task.assignees?.some(a => a._id === selectedAssignee);
        return matchesSearch && matchesLabel && matchesAssignee;
      });
      return acc;
    }, {});
  } else {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = selectedLabel === 'all' || task.labels?.includes(selectedLabel);
      return matchesSearch && matchesLabel;
    });
  }
}, [board, tasks, searchQuery, selectedLabel, selectedAssignee, viewMode]);

  // Fetch collaborators when repo changes
  useEffect(() => {
    const fetchCollaborators = async () => {
      if (currentRepo?._id) {
        try {
          const res = await axios.get(`${API_URL}/api/repos/${currentRepo._id}/collaborators`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setCollaborators(res.data);
        } catch (error) {
           console.error('collab loading error:', error.response?.data || error.message);
          toast.error('Failed to load collaborators');
        }
      }
    };
    fetchCollaborators();
  }, [currentRepo]); 

  useEffect(() => {
  const loadData = async () => {
    try {
      await fetchRepos();
      if (viewMode === 'user') {
        const data = await getUserTasks(user._id);
        setTasks(data);
      }
      else if (currentRepo) {
        await fetchBoard(currentRepo._id);
      }
    } catch (error) {
         console.error('Data loading error:', error.response?.data || error.message);
    toast.error('Failed to load data');
    }
  };
  loadData();
}, [viewMode, currentRepo]);

const handleViewModeChange = (mode) => {
  setViewMode(mode);
  setCurrentRepo(null);
};

  const handleRepoSelect = async (repoId) => {
    try {
    const repo = repos.find(r => r._id === repoId);
    setCurrentRepo(repo);
    if (repo) {
      await fetchBoard(repo._id);
    }
  } catch (error) {
     console.error('Repo loading error:', error.response?.data || error.message);
    toast.error('Failed to load repository data');
  }
};

const handleDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  
  // 1. Validate destination
  if (!destination || !statuses.includes(destination.droppableId)) {
    toast.error('Invalid drop location');
    return;
  }

  // 2. Validate repository context
  const repoId = viewMode === 'repo' 
    ? currentRepo?._id 
    : tasks.find(t => t._id === draggableId)?.repository?._id;
  
  if (!repoId) {
    toast.error('Invalid repository context');
    return;
  }

  try {
    // 3. Make API call
    const response = await axios.patch(
      `${API_URL}/api/repos/tasks/${draggableId}/status`,
      {
        status: destination.droppableId,
        repositoryId: repoId
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
    );

    // 4. Validate response format
    if (!response.data?.from || !response.data?.to) {
      throw new Error('Invalid server response');
    }

    // 5. Update UI
    dispatch({
      type: 'MOVE_TASK',
      payload: {
        task: response.data.task,
        from: response.data.from,
        to: response.data.to
      }
    });

  } catch (err) {
    console.error('Drag error:', err);
    toast.error(err.response?.data?.error || 'Failed to move task');
    if (viewMode === 'repo') fetchBoard(currentRepo._id); // Revert UI
  }
};

  const handleCreateTask = async (taskData) => {
  try {
    await createTask({
      ...taskData,
      repository: currentRepo._id,
      createdBy: user._id
    });
    setShowCreateModal(false);
    toast.success('Task created successfully!');
    fetchBoard(currentRepo._id); // Refresh board data
  } catch (error) {
     console.error('create task error:', error.response?.data || error.message);
    toast.error(error.message || 'Failed to create task');
  }
};

   const handleTaskUpdate = (updatedTask) => {
        //  dispatch({ type: 'UPDATE_TASK', payload: updatedTask }); (no defined dispatched)
        setSelectedTask(null);
    };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white"
    >
      <UserNavbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
        notifications={<Notifications />}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-4">
  {viewMode === 'repo' && (
    <select 
      value={currentRepo?._id || ''}
      onChange={(e) => handleRepoSelect(e.target.value)}
      className="bg-slate-700 text-white px-4 py-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select Repository</option>
      
      {repos.map(repo => 
        <option key={repo._id} value={repo._id}>
          {repo.name}
        </option>
      )}

    </select>
  )}
  <h1 className="text-3xl font-bold">
    {viewMode === 'repo' 
      ? (currentRepo ? `${currentRepo.name} Tasks` : 'Repository Tasks')
      : 'My Tasks'}
  </h1>
</div>


    <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
      <button
        onClick={() => handleViewModeChange('repo')}
        className={`px-4 py-2 rounded-md ${
          viewMode === 'repo' ? 'bg-blue-600' : 'hover:bg-slate-600'
        }`}
      >
        Repository Tasks
      </button>
      <button
        onClick={() => handleViewModeChange('user')}
        className={`px-4 py-2 rounded-md ${
          viewMode === 'user' ? 'bg-blue-600' : 'hover:bg-slate-600'
        }`}
      >
        My Tasks
      </button>
    </div>
  </div>
  
  {viewMode === 'repo' && currentRepo && (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        New Task +
      </button>
      <button 
        onClick={() => syncWithGitea(currentRepo._id)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Sync with Gitea
      </button>
    </div>
  )}
</div>

          {currentRepo || viewMode === 'user' ? (
  <DragDropContext onDragEnd={handleDragEnd}>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statuses.map(columnStatus => (
        <Droppable key={columnStatus} droppableId={columnStatus}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="bg-slate-700 p-4 rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4">
                {statusLabels[columnStatus]}
                <span className="ml-2 text-sm text-slate-300">
                  {viewMode === 'repo'
                    ? (board?.columns[columnStatus]?.length || 0)
                    : filteredTasks.filter(t => t.status === columnStatus).length}
                </span>
              </h3>

               {/* Empty state message inside the column */}
                        {(board?.columns[columnStatus]?.length || 0) === 0 && (
                          <div className="text-slate-400 text-sm text-center py-4">
                            No tasks in this column
                          </div>
                        )}

              {viewMode === 'repo' ? (
                // Repository View - Use board columns directly
                (board?.columns[columnStatus] || []).map((task, index) => (
                  <Draggable 
                    key={task._id} 
                    draggableId={task._id} 
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard 
                          task={task} 
                          onClick={setSelectedTask}
                          showRepo={false}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                // User View - Use filtered tasks
                filteredTasks
                  .filter(t => t.status === columnStatus)
                  .map((task, index) => (
                    <Draggable 
                      key={task._id} 
                      draggableId={task._id} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard 
                            task={task} 
                            onClick={setSelectedTask}
                            showRepo={true}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  </DragDropContext>
) : (
  <div className="text-center py-20">
    <p className="text-xl text-slate-400">
     {repos.length === 0 
        ? 'No repositories available. Create one first!'
        : 'Select a repository to view its tasks'}
    </p>
  </div>
)}
        </div>
      </main>

      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        collaborators={collaborators}
      />

      <CreateTaskModal
        visible={showCreateModal}
        currentRepo={currentRepo}
          collaborators={collaborators}
         onCreate={handleCreateTask}
         onCancel={() => setShowCreateModal(false)}
      />

      <Toaster position="bottom-right" />
    </motion.div>
  );
};

export default TasksPage;