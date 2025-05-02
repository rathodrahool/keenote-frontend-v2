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
  const [startDate, setStartDate] = useState<string>(
    editTask?.start_date
      ? format(new Date(), "yyyy-MM-dd") // This would need to be converted from DD-MM-YYYY format
      : format(new Date(), "yyyy-MM-dd")
  );
  
  const handleSave = () => {
    if (!name.trim() || !category) return;

    const taskData = {
      name: name.trim(),
      category,
      task_type: taskType,
      task_frequency: frequency,
      start_date: startDate ? new Date(startDate) : new Date(),
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Workout, Read a Book"
              className="mt-1"
            />
          </div>
        
          <div>
            <Label htmlFor="task-category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger id="task-category" className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    <div className="flex items-center">
                      <span 
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        
          <div>
            <Label>Task Type</Label>
            <RadioGroup
              value={taskType}
              onValueChange={(value) => setTaskType(value as TaskType)}
              className="mt-2 space-y-4"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value={TaskType.TIME_BASED} id="task-time-based" />
                <div>
                  <Label htmlFor="task-time-based" className="font-medium text-gray-700">
                    Time Based
                  </Label>
                  <p className="text-gray-500 text-sm">Track duration spent on this task</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value={TaskType.YES_NO} id="task-yes-no" />
                <div>
                  <Label htmlFor="task-yes-no" className="font-medium text-gray-700">
                    Yes/No
                  </Label>
                  <p className="text-gray-500 text-sm">Track completion with targets</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        
          {taskType === TaskType.TIME_BASED ? (
            <div>
              <Label htmlFor="task-duration">Duration (minutes)</Label>
              <Input
                id="task-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="e.g. 30"
                className="mt-1"
                min={1}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="task-target">Target (times)</Label>
              <Input
                id="task-target"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                placeholder="e.g. 8"
                className="mt-1"
                min={1}
              />
            </div>
          )}
        
          <div>
            <Label htmlFor="task-frequency">Frequency</Label>
            <Select 
              value={frequency} 
              onValueChange={(value) => setFrequency(value as TaskFrequency)}
            >
              <SelectTrigger id="task-frequency" className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskFrequency.DAILY}>Daily</SelectItem>
                <SelectItem value={TaskFrequency.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={TaskFrequency.MONTHLY}>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          <div>
            <Label htmlFor="task-start-date">Start Date</Label>
            <Input
              id="task-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={!name.trim() || !category || isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
