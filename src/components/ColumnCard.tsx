'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '@/types/kanban';
import TaskCard from './TaskCard';

interface ColumnCardProps {
  column: Column;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function ColumnCard({ 
  column, 
  onAddTask, 
  onEditTask, 
  onDeleteTask 
}: ColumnCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const columnColors: Record<string, string> = {
    'todo': 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    'doing': 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', 
    'done': 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
  };

  const buttonColors: Record<string, string> = {
    'todo': 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50',
    'doing': 'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50',
    'done': 'border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50'
  };

  return (
    <div className={`${columnColors[column.id] || columnColors.todo} backdrop-blur-sm border-2 p-6 rounded-2xl min-h-96 w-80 kanban-column shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-gray-800">{column.title}</h2>
        <span className="bg-white/80 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-gray-200">
          {column.tasks.length}
        </span>
      </div>
      
      <button
        onClick={() => onAddTask(column.id)}
        className={`w-full p-4 border-2 border-dashed ${buttonColors[column.id] || buttonColors.todo} rounded-xl font-medium mb-6 transition-all duration-200 hover:scale-105 active:scale-95`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">+</span>
          <span>Adicionar tarefa</span>
        </div>
      </button>

      <div
        ref={setNodeRef}
        className={`space-y-4 min-h-64 ${isOver ? 'bg-white/30 backdrop-blur-sm border-2 border-dashed border-gray-400' : ''} p-3 rounded-xl transition-all duration-200`}
      >
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}