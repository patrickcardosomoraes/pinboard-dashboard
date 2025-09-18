'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-emerald-100/50',
    medium: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 shadow-amber-100/50',
    high: 'bg-gradient-to-br from-rose-50 to-red-100 border-rose-200 shadow-rose-100/50',
  };

  const priorityLabels = {
    low: { text: 'Baixa', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    medium: { text: 'Média', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    high: { text: 'Alta', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-5 rounded-2xl border-2 cursor-grab backdrop-blur-sm task-card-hover animate-fade-in ${
        priorityColors[task.priority]
      } ${
        isDragging ? 'opacity-50 scale-105 rotate-1' : ''
      } group`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 text-lg leading-tight">{task.title}</h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{task.description}</p>
      )}
      <div className="flex justify-between items-center">
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${priorityLabels[task.priority].color}`}>
          {priorityLabels[task.priority].text}
        </span>
        <span className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded-full border border-gray-200">
          {new Date(task.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}