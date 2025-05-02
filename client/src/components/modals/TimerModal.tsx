import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTimeSessions } from "@/hooks/useTimeSessions";
import { Task } from "@/types";
import { formatDuration } from "@/lib/utils";
import { SessionStatus } from "@/lib/constants";
import { formatDateForAPI } from "@/lib/utils";

interface TimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export default function TimerModal({ open, onOpenChange, task }: TimerModalProps) {
  const { createTimeSession } = useTimeSessions();
  
  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Convert to minutes for easier calculation
  const durationInMinutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const taskDuration = task.duration || 30;
  const progressPercent = Math.min((seconds / (taskDuration * 60)) * 100, 100);
  
  // Start timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);
  
  // Reset timer when modal is closed
  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);
  
  const handleStart = () => {
    setIsRunning(true);
    setTimerStatus('running');
    startTimeRef.current = Date.now();
  };

  const handlePause = () => {
    setIsRunning(false);
    setTimerStatus('paused');
  };

  const handleResume = () => {
    setIsRunning(true);
    setTimerStatus('running');
  };

  const handleComplete = () => {
    setIsRunning(false);
    setTimerStatus('completed');
    
    // Create time session
    createTimeSession.mutate({
      task: task._id,
      date: formatDateForAPI(new Date()),
      status: SessionStatus.COMPLETED,
      duration_minutes: durationInMinutes,
      completed_target: durationInMinutes // For task completion tracking
    }, {
      onSuccess: () => {
        // Close modal after successfully saving
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    });
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    setTimerStatus('idle');
    startTimeRef.current = null;
  };

  const handleCancel = () => {
    // If timer was running, maybe ask for confirmation
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Time Tracking - <span className="text-emerald-600">{task.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 sm:mt-6 text-center">
          <div className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-wider py-6 sm:py-8">
            <span>{String(Math.floor(durationInMinutes)).padStart(2, '0')}</span>:
            <span>{String(remainingSeconds).padStart(2, '0')}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-4">
            {timerStatus === 'idle' && (
              <Button
                className="col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                onClick={handleStart}
              >
                Start
              </Button>
            )}
            {timerStatus === 'running' && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                >
                  Pause
                </Button>
                <Button
                  className="col-span-2 h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={handleComplete}
                >
                  Complete
                </Button>
              </>
            )}
            {timerStatus === 'paused' && (
              <>
                <Button
                  onClick={handleResume}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                >
                  Resume
                </Button>
                <Button
                  className="col-span-2 h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={handleComplete}
                >
                  Complete
                </Button>
              </>
            )}
            {timerStatus === 'completed' && (
              <Button
                className="col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                variant="ghost"
                onClick={handleCancel}
              >
                Done
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Task duration goal: <span className="font-medium">{formatDuration(taskDuration)}</span>
          </p>
          <Progress
            value={progressPercent}
            className="h-2 sm:h-2.5 mt-2"
          />
        </div>
        <DialogFooter className="mt-4 sm:mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createTimeSession.isPending}
            className="mt-2 h-8 sm:h-9 text-xs sm:text-sm mx-auto sm:mx-0"
          >
            {createTimeSession.isPending ? "Saving..." : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
