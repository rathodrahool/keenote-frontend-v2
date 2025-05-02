import { Link } from "wouter";
import { Calendar, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, Category } from "@/types";
import { formatDuration } from "@/lib/utils";
import { useState } from "react";
import { TaskType } from "@/lib/constants";
import { useTasks } from "@/hooks/useTasks";
import TimerModal from "../modals/TimerModal";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const { updateTaskCompletion } = useTasks();
  
  // Handle expanding category object
  const category = typeof task.category === 'string'
    ? { _id: task.category, name: 'Loading...', color: '#CCCCCC' } as Category
    : task.category as Category;
  
  const handleComplete = () => {
    if (task.task_type === TaskType.YES_NO) {
      updateTaskCompletion.mutate({ 
        id: task._id, 
        completedTarget: 1 
      });
    } else {
      setShowTimerModal(true);
    }
  };

  return (
    <>
      <div className="px-4 py-5 sm:px-6 flex items-center">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
            <div>
              <p className="text-base font-medium text-gray-900 truncate">
                {task.name}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500">
                <span 
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></span>
                <span className="truncate">{category.name}</span>
              </p>
            </div>
            <div className="hidden md:block">
              {task.task_type === TaskType.TIME_BASED && (
                <div className="flex items-center mt-2">
                  <Clock className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {formatDuration(task.duration || 0)}
                  </span>
                </div>
              )}
              {task.task_type === TaskType.YES_NO && (
                <div className="flex items-center mt-2">
                  <Check className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {task.completed_count}/{task.target} completed
                  </span>
                </div>
              )}
              <div className="flex items-center mt-2">
                <Calendar className="h-5 w-5 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">
                  {task.task_frequency.charAt(0) + task.task_frequency.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          {task.is_completed ? (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Completed
            </span>
          ) : (
            <Button onClick={handleComplete}>
              {task.task_type === TaskType.TIME_BASED ? 'Start' : 'Complete'}
            </Button>
          )}
        </div>
      </div>

      <TimerModal
        open={showTimerModal}
        onOpenChange={setShowTimerModal}
        task={task}
      />
    </>
  );
}
