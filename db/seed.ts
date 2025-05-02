import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Check if categories already exist
    const existingCategories = await db.select().from(schema.categories);
    
    // Only seed if no categories exist
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      
      // Default categories
      const categoryData = [
        { name: "Work", color: "#3B82F6" },        // Blue
        { name: "Personal", color: "#3B82F6" },    // Blue
        { name: "Fitness", color: "#22C55E" },     // Green
        { name: "Learning", color: "#A855F7" }     // Purple
      ];
      
      const categories = await db.insert(schema.categories)
        .values(categoryData)
        .returning();
      
      console.log(`Added ${categories.length} categories`);
      
      // Get current date and format it
      const today = new Date();
      const formattedDate = format(today, 'dd-MM-yyyy');
      
      // Default tasks
      const taskData = [
        // Time-based tasks
        {
          name: "Morning Workout",
          task_type: "TIME_BASED",
          task_frequency: "DAILY",
          duration: 45,
          start_date: formattedDate,
          category_id: categories.find(c => c.name === "Fitness")?.id || categories[0].id,
          is_template: true,
          period_start_date: formattedDate,
          period_end_date: format(new Date(today.setDate(today.getDate() + 1)), 'dd-MM-yyyy'),
          completed_count: 0,
          is_completed: false
        },
        {
          name: "Study Spanish",
          task_type: "TIME_BASED",
          task_frequency: "DAILY",
          duration: 30,
          start_date: formattedDate,
          category_id: categories.find(c => c.name === "Learning")?.id || categories[0].id,
          is_template: true,
          period_start_date: formattedDate,
          period_end_date: format(new Date(today.setDate(today.getDate() + 1)), 'dd-MM-yyyy'),
          completed_count: 0,
          is_completed: false
        },
        
        // Yes/No tasks
        {
          name: "Drink Water",
          task_type: "YES_NO",
          task_frequency: "DAILY",
          target: 8,
          start_date: formattedDate,
          category_id: categories.find(c => c.name === "Personal")?.id || categories[0].id,
          is_template: true,
          period_start_date: formattedDate,
          period_end_date: format(new Date(today.setDate(today.getDate() + 1)), 'dd-MM-yyyy'),
          completed_count: 4,
          is_completed: false
        },
        {
          name: "Read a Book",
          task_type: "YES_NO",
          task_frequency: "DAILY",
          target: 1,
          start_date: formattedDate,
          category_id: categories.find(c => c.name === "Learning")?.id || categories[0].id,
          is_template: true,
          period_start_date: formattedDate,
          period_end_date: format(new Date(today.setDate(today.getDate() + 1)), 'dd-MM-yyyy'),
          completed_count: 1,
          is_completed: true
        }
      ];
      
      const tasks = await db.insert(schema.tasks)
        .values(taskData)
        .returning();
      
      console.log(`Added ${tasks.length} tasks`);
      
      // Default time sessions
      const timeSessionData = [
        {
          task_id: tasks.find(t => t.name === "Study Spanish")?.id || tasks[0].id,
          date: formattedDate,
          status: "COMPLETED",
          duration_minutes: 30,
          completed_target: 30,
          remaining_duration: 0,
          is_period_completed: true,
          period_id: `${tasks.find(t => t.name === "Study Spanish")?.id || tasks[0].id}_${formattedDate}`
        },
        {
          task_id: tasks.find(t => t.name === "Drink Water")?.id || tasks[0].id,
          date: formattedDate,
          status: "COMPLETED",
          duration_minutes: null,
          completed_target: 4,
          remaining_duration: null,
          is_period_completed: false,
          period_id: `${tasks.find(t => t.name === "Drink Water")?.id || tasks[0].id}_${formattedDate}`
        },
        {
          task_id: tasks.find(t => t.name === "Read a Book")?.id || tasks[0].id,
          date: formattedDate,
          status: "COMPLETED",
          duration_minutes: null,
          completed_target: 1,
          remaining_duration: null,
          is_period_completed: true,
          period_id: `${tasks.find(t => t.name === "Read a Book")?.id || tasks[0].id}_${formattedDate}`
        }
      ];
      
      const timeSessions = await db.insert(schema.timeSessions)
        .values(timeSessionData)
        .returning();
      
      console.log(`Added ${timeSessions.length} time sessions`);
      
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
