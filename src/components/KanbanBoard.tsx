'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Column } from '@/types/kanban';
import ColumnCard from './ColumnCard';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const STORAGE_KEY = 'kanban-board-data';

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'A Fazer',
    tasks: [],
  },
  {
    id: 'doing',
    title: 'Fazendo',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Concluído',
    tasks: [],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setColumns(parsedData);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTaskById(activeId);
    if (!activeTask) return;

    const activeColumn = findColumnByTaskId(activeId);
    const overColumn = findColumnById(overId) || findColumnByTaskId(overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((columns) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;

      const activeIndex = activeItems.findIndex((task) => task.id === activeId);
      const overIndex = overItems.findIndex((task) => task.id === overId);

      let newIndex;
      if (overId in overColumn.tasks.map(task => task.id)) {
        newIndex = overIndex;
      } else {
        const isBelowOverItem = over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return columns.map((column) => {
        if (column.id === activeColumn.id) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== activeId),
          };
        } else if (column.id === overColumn.id) {
          return {
            ...column,
            tasks: [
              ...column.tasks.slice(0, newIndex),
              activeTask,
              ...column.tasks.slice(newIndex),
            ],
          };
        }
        return column;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    const overColumn = findColumnById(overId) || findColumnByTaskId(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);
      const overIndex = activeColumn.tasks.findIndex((task) => task.id === overId);

      if (activeIndex !== overIndex) {
        setColumns((columns) =>
          columns.map((column) => {
            if (column.id === activeColumn.id) {
              return {
                ...column,
                tasks: arrayMove(column.tasks, activeIndex, overIndex),
              };
            }
            return column;
          })
        );
      }
    }
  };

  const findTaskById = (id: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === id);
      if (task) return task;
    }
    return null;
  };

  const findColumnByTaskId = (taskId: string): Column | null => {
    for (const column of columns) {
      if (column.tasks.some((task) => task.id === taskId)) {
        return column;
      }
    }
    return null;
  };

  const findColumnById = (id: string): Column | null => {
    return columns.find((column) => column.id === id) || null;
  };

  const handleAddTask = (columnId: string) => {
    setCurrentColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setColumns((columns) =>
        columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === editingTask.id
              ? { ...editingTask, ...taskData }
              : task
          ),
        }))
      );
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        ...taskData,
      };

      setColumns((columns) =>
        columns.map((column) =>
          column.id === currentColumnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        )
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setColumns((columns) =>
        columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Kanban Board
          </h1>
          <p className="text-gray-700 text-lg">Organize suas tarefas de forma visual e eficiente</p>
        </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-8 overflow-x-auto pb-6 kanban-container md:flex-row flex-col">
          {columns.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
      </div>
    </div>
  );
}