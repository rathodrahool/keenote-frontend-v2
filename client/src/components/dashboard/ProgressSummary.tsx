import { useTimeSessions } from "@/hooks/useTimeSessions";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, Star } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useUI } from "@/contexts/UIContext";
import { formatDateForAPI } from "@/lib/utils";

export function ProgressSummary() {
  const { selectedDate, activeTab } = useUI();
  const formattedDate = formatDateForAPI(selectedDate);
  
  // Get tasks for the selected date
  const { tasks, isLoading: tasksLoading } = useTasks({
    period_start_date: formattedDate,
    frequency: activeTab.toUpperCase(),
  });

  // Get time sessions for the selected date
  const { timeSessions, isLoading: sessionsLoading } = useTimeSessions({
    date: formattedDate,
  });

  // Calculate tasks progress
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate total tracked time
  const totalMinutes = timeSessions.reduce((total, session) => {
    return total + (session.duration_minutes || 0);
  }, 0);

  // Calculate streak (placeholder)
  const streak = 7; // This would be calculated from actual data

  const isLoading = tasksLoading || sessionsLoading;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Tasks Completed Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Tasks Completed
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {isLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      `${completedTasks}/${totalTasks}`
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  `${completionPercentage.toFixed(1)}% complete`
                )}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <Progress value={completionPercentage} className="h-2" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Time Tracked Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Time Tracked
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {isLoading ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      formatDuration(totalMinutes)
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              View all sessions
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Streak Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Streak
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {isLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      `${streak} days`
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500">
              View statistics
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
