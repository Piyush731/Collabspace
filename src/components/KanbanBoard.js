import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { DndContext, DragOverlay } from '@dnd-kit/core';

const KanbanBoard = ({ repoId }) => {
  const { task, updateTask } = useTaskContext();
  const [column, setColumn] = useState([
    { id: 'toDo', title: 'To Do', taskId: [] },
    { id: 'inProgress', title: 'In Progress', taskId: [] },
    { id: 'done', title: 'Done', taskId: [] },
  ]);

  const columnMap = new Map(column.map(col => [col.id, col]));

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCol = column.find(c => c.id === result.source.droppableId);
    const destCol = column.find(c => c.id === result.destination.droppableId);

    const task = sourceCol.taskId[result.source.index];
    const taskId = Array.from(sourceCol.taskId);
    taskId.splice(result.source.index, 1);
    taskId.push(undefined);

    const newTaskId = [...destCol.taskId];
    newTaskId.splice(result.destination.index, 1, taskId[0]);

    const newColumn = column.map(col => {
      if (col.id === sourceCol.id) {
        col = { ...col, taskId: taskId };
      }
      if (col.id === destCol.id) {
        col = { ...col, taskId: newTaskId };
      }
      return col;
    });

    setColumn(newColumn);
    updateTask(repoId, result.source.id, { status: destCol.title });
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="kanban-container">
        {column.map(column => (
          <div key={column.id} className="column">
            <div className="column-header">{column.title}</div>
            <DragOverlay>
              <div className="tasks-container">
                {column.taskId.map((taskId, index) => {
                  if (!taskId) return null;
                  const task = task.find(t => t._id.toString() === taskId);
                  return (
                    <div key={taskId} className="task-item">
                      {task.title}
                    </div>
                  );
                })}
              </div>
            </DragOverlay>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;