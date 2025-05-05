import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useTasks } from "@/hooks/useTasks";
import { TaskType, TaskFrequency } from "@/lib/constants";
import { format } from "date-fns";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: any;
}

export default function CreateTaskModal({ 
  open, 
  onOpenChange,
  editTask 
}: CreateTaskModalProps) {
  const { createTask, updateTask } = useTasks();
  const { categories } = useCategories();
  
  const isEditing = !!editTask;
  
  // Form state
  const [name, setName] = useState(editTask?.name || "");
  const [category, setCategory] = useState<string>(editTask?.category?._id || editTask?.category || "");
  const [taskType, setTaskType] = useState<TaskType>(editTask?.task_type || TaskType.TIME_BASED);
  const [duration, setDuration] = useState<number>(editTask?.duration || 30);
  const [target, setTarget] = useState<number>(editTask?.target || 1);
  const [frequency, setFrequency] = useState<TaskFrequency>(editTask?.task_frequency || TaskFrequency.DAILY);
  const [startDate, setStartDate] = useState<string>(() => {
    // Always use YYYY-MM-DD for input type=date
    if (editTask?.start_date) {
      const d = new Date(editTask.start_date);
      return d.toISOString().slice(0, 10);
    }
    return format(new Date(), "yyyy-MM-dd");
  });
  
  const handleSave = () => {
    if (!name.trim() || !category) return;

    const taskData = {
      name: name.trim(),
      category,
      task_type: taskType,
      task_frequency: frequency,
      start_date: startDate,
      ...(taskType === TaskType.TIME_BASED ? { duration } : { target }),
    };

    if (isEditing) {
      updateTask.mutate({
        id: editTask._id,
        data: taskData
      }, {
        onSuccess: () => {
          handleClose();
        }
      });
    } else {
      createTask.mutate(taskData, {
        onSuccess: () => {
          handleClose();
        }
      });
    }
  };

  const handleClose = () => {
    setName("");
    setCategory("");
    setTaskType(TaskType.TIME_BASED);
    setDuration(30);
    setTarget(1);
    setFrequency(TaskFrequency.DAILY);
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    onOpenChange(false);
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        
        {/* Use grid for perfect alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-2 sm:py-4">
          {/* Row 1 */}
          <div className="flex flex-col">
            <Label htmlFor="task-name" className="text-xs sm:text-sm font-medium">Task Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Workout, Read a Book"
              className="mt-1 h-9 text-xs sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <Label className="text-xs sm:text-sm font-medium">Task Type</Label>
            <div className="mt-1 flex gap-2">
              <RadioGroup
                value={taskType}
                onValueChange={(value) => setTaskType(value as TaskType)}
                className="flex flex-row gap-2 w-full"
              >
                <div className="flex items-center space-x-2 p-2 border rounded-lg w-full min-w-0">
                  <RadioGroupItem value={TaskType.TIME_BASED} id="task-time-based" />
                  <div className="min-w-0">
                    <Label htmlFor="task-time-based" className="font-medium text-xs sm:text-sm text-gray-700">
                      Time Based
                    </Label>
                    <p className="text-gray-500 text-xs leading-tight">Track duration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded-lg w-full min-w-0">
                  <RadioGroupItem value={TaskType.YES_NO} id="task-yes-no" />
                  <div className="min-w-0">
                    <Label htmlFor="task-yes-no" className="font-medium text-xs sm:text-sm text-gray-700">
                      Yes/No
                    </Label>
                    <p className="text-gray-500 text-xs leading-tight">Track completion</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col">
            <Label htmlFor="task-category" className="text-xs sm:text-sm font-medium">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger id="task-category" className="mt-1 h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id} className="text-xs sm:text-sm">
                    <div className="flex items-center">
                      <span 
                        className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-1.5 sm:mr-2"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            {taskType === TaskType.TIME_BASED ? (
              <>
                <Label htmlFor="task-duration" className="text-xs sm:text-sm font-medium">Duration (minutes)</Label>
                <Input
                  id="task-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="e.g. 30"
                  className="mt-1 h-9 text-xs sm:text-sm"
                  min={1}
                />
              </>
            ) : (
              <>
                <Label htmlFor="task-target" className="text-xs sm:text-sm font-medium">Target (times)</Label>
                <Input
                  id="task-target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  placeholder="e.g. 8"
                  className="mt-1 h-9 text-xs sm:text-sm"
                  min={1}
                />
              </>
            )}
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <Label htmlFor="task-start-date" className="text-xs sm:text-sm font-medium">Start Date</Label>
            <Input
              id="task-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 h-9 text-xs sm:text-sm w-full"
              pattern="\d{4}-\d{2}-\d{2}"
              style={{ maxWidth: '100%' }}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="task-frequency" className="text-xs sm:text-sm font-medium">Frequency</Label>
            <Select 
              value={frequency} 
              onValueChange={(value) => setFrequency(value as TaskFrequency)}
            >
              <SelectTrigger id="task-frequency" className="mt-1 h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskFrequency.DAILY} className="text-xs sm:text-sm">Daily</SelectItem>
                <SelectItem value={TaskFrequency.WEEKLY} className="text-xs sm:text-sm">Weekly</SelectItem>
                <SelectItem value={TaskFrequency.MONTHLY} className="text-xs sm:text-sm">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between mt-4 sm:mt-6 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="mt-2 sm:mt-0 h-8 sm:h-9 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={!name.trim() || !category || isPending}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
