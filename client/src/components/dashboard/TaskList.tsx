import { useTasks } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskType } from "@/lib/constants";
import { useUI } from "@/contexts/UIContext";
import { formatDateForAPI } from "@/lib/utils";

export function TaskList() {
  const { selectedDate, activeTab } = useUI();
  const formattedDate = formatDateForAPI(selectedDate);
  
  const { tasks, isLoading } = useTasks({
    period_start_date: formattedDate,
    frequency: activeTab.toUpperCase(),
  });

  // Filter tasks by type
  const timeTasks = tasks.filter(task => task.task_type === TaskType.TIME_BASED);
  const yesNoTasks = tasks.filter(task => task.task_type === TaskType.YES_NO);

  return (
    <>
      {/* Time Based Tasks */}
      <Card className="mb-6 md:mb-8 shadow-sm">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 flex flex-row justify-between items-center">
          <CardTitle className="text-base sm:text-lg font-medium text-gray-900">
            Time Based Tasks
          </CardTitle>
          <a href="/tasks?type=TIME_BASED" className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-500">
            View all
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="px-4 py-4 sm:py-5 sm:px-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 sm:space-y-3 w-2/3">
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 w-12 sm:w-16" />
                </div>
              </div>
            ))
          ) : timeTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {timeTasks.map(task => (
                <li key={task._id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500">
              No time-based tasks scheduled for this period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yes/No Tasks */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 flex flex-row justify-between items-center">
          <CardTitle className="text-base sm:text-lg font-medium text-gray-900">
            Yes/No Tasks
          </CardTitle>
          <a href="/tasks?type=YES_NO" className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-500">
            View all
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="px-4 py-4 sm:py-5 sm:px-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 sm:space-y-3 w-2/3">
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 w-12 sm:w-16" />
                </div>
              </div>
            ))
          ) : yesNoTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {yesNoTasks.map(task => (
                <li key={task._id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500">
              No yes/no tasks scheduled for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
