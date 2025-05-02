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
      <div className="px-4 py-4 sm:py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {task.name}
              </p>
              <div className="flex items-center mt-1">
                <span 
                  className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                ></span>
                <span className="text-xs sm:text-sm text-gray-500 truncate">{category.name}</span>
              </div>
              
              {/* Mobile view: show task details in-line */}
              <div className="flex flex-wrap items-center mt-2 sm:hidden space-x-3">
                {task.task_type === TaskType.TIME_BASED && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {formatDuration(task.duration || 0)}
                    </span>
                  </div>
                )}
                {task.task_type === TaskType.YES_NO && (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {task.completed_count}/{task.target}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {task.task_frequency.charAt(0) + task.task_frequency.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop view: show task details in separate column */}
            <div className="hidden sm:block flex-shrink-0 sm:w-40 lg:w-48">
              {task.task_type === TaskType.TIME_BASED && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    {formatDuration(task.duration || 0)}
                  </span>
                </div>
              )}
              {task.task_type === TaskType.YES_NO && (
                <div className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    {task.completed_count}/{task.target} completed
                  </span>
                </div>
              )}
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-1" />
                <span className="text-xs sm:text-sm text-gray-500">
                  {task.task_frequency.charAt(0) + task.task_frequency.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-0 flex-shrink-0">
          {task.is_completed ? (
            <span className="inline-flex items-center px-2 sm:px-3 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
              Completed
            </span>
          ) : (
            <Button 
              onClick={handleComplete}
              className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
            >
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
