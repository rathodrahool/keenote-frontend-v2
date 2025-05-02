import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { TaskList } from "@/components/dashboard/TaskList";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useUI } from "@/contexts/UIContext";
import { format } from "date-fns";

export default function Dashboard() {
  const { 
    selectedDate, 
    setSelectedDate, 
    activeTab, 
    setActiveTab, 
    formattedDate 
  } = useUI();

  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  return (
    <MainLayout>
      {/* Tabs for frequency selection */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
              activeTab === "daily"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily
          </button>
          <button
            className={`whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
              activeTab === "weekly"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
              activeTab === "monthly"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
        </nav>
      </div>

      {/* Dashboard header with date selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-0">
          {activeTab === "daily" 
            ? "Today's Tasks" 
            : activeTab === "weekly" 
              ? "This Week's Tasks" 
              : "This Month's Tasks"}
        </h2>
        <div className="flex flex-wrap items-center">
          <span className="text-xs sm:text-sm text-gray-500 mr-2 sm:mr-4">{formattedDate}</span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 text-xs sm:text-sm border-gray-300 text-gray-700"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">Change Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Dashboard content */}
      <div id="dashboard-content">
        {/* Progress summary cards */}
        <ProgressSummary />

        {/* Task lists */}
        <TaskList />
      </div>
    </MainLayout>
  );
}
