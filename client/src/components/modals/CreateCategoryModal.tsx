import { useState } from "react";
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
import { useCategories } from "@/hooks/useCategories";
import { COLOR_OPTIONS } from "@/lib/constants";

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: any;
}

export default function CreateCategoryModal({ 
  open, 
  onOpenChange,
  editCategory 
}: CreateCategoryModalProps) {
  const { createCategory, updateCategory } = useCategories();
  const [name, setName] = useState(editCategory?.name || "");
  const [selectedColor, setSelectedColor] = useState(editCategory?.color || COLOR_OPTIONS[6].hex);
  
  const isEditing = !!editCategory;

  const handleSave = () => {
    if (!name.trim()) return;

    const categoryData = {
      name: name.trim(),
      color: selectedColor
    };

    if (isEditing) {
      updateCategory.mutate({
        id: editCategory._id,
        data: categoryData
      }, {
        onSuccess: () => {
          handleClose();
        }
      });
    } else {
      createCategory.mutate(categoryData, {
        onSuccess: () => {
          handleClose();
        }
      });
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedColor(COLOR_OPTIONS[6].hex);
    onOpenChange(false);
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {isEditing ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 sm:mt-6">
          <div className="mb-3 sm:mb-4">
            <Label htmlFor="category-name" className="text-xs sm:text-sm font-medium">Category Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Fitness, Learning"
              className="mt-1 h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <Label htmlFor="category-color" className="text-xs sm:text-sm font-medium">Color</Label>
            <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full focus:outline-none ${
                    selectedColor === color.hex ? "ring-2 ring-offset-2 ring-emerald-500" : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.hex)}
                  aria-label={`Select ${color.name}`}
                />
              ))}
            </div>
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
            disabled={!name.trim() || isPending}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
