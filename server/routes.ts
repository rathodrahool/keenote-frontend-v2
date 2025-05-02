import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, like, desc, asc, or, isNull, not } from "drizzle-orm";
import { z } from "zod";
import { formatISO, addDays, addWeeks, addMonths, format, parse } from "date-fns";

// Input validations
const findAllQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
  category_id: z.coerce.number().optional(),
  task_type: z.enum(["YES_NO", "TIME_BASED"]).optional(),
  task_frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  period_start_date: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

// Helper functions
function calculatePeriodDates(frequency: string, startDate: string) {
  // Parse the date in DD-MM-YYYY format
  const [day, month, year] = startDate.split('-').map(num => parseInt(num));
  const start = new Date(year, month - 1, day); // month is 0-based in Date constructor

  let end: Date;

  switch (frequency) {
    case "DAILY":
      end = addDays(start, 1);
      break;
    case "WEEKLY":
      end = addWeeks(start, 1);
      break;
    case "MONTHLY":
      end = addMonths(start, 1);
      break;
    default:
      end = addDays(start, 1);
  }

  return {
    period_start_date: format(start, 'dd-MM-yyyy'),
    period_end_date: format(end, 'dd-MM-yyyy'),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Categories endpoints
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const query = findAllQuerySchema.parse(req.query);
      
      // Build query
      let dbQuery = db.select().from(schema.categories)
        .where(eq(schema.categories.status, "ACTIVE"))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit);
        
      // Apply search if provided
      if (query.search) {
        dbQuery = dbQuery.where(like(schema.categories.name, `%${query.search}%`));
      }
      
      // Apply sorting
      if (query.sort_by && query.sort_order) {
        const column = query.sort_by as keyof typeof schema.categories.$inferSelect;
        dbQuery = query.sort_order === 'asc' 
          ? dbQuery.orderBy(asc(schema.categories[column])) 
          : dbQuery.orderBy(desc(schema.categories[column]));
      } else {
        dbQuery = dbQuery.orderBy(asc(schema.categories.name));
      }
      
      // Execute query
      const results = await dbQuery;
      
      // Count total
      const countQuery = await db.select({ count: schema.categories.id }).from(schema.categories)
        .where(eq(schema.categories.status, "ACTIVE"));
      const total = countQuery.length > 0 ? Number(countQuery[0].count) : 0;
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Categories fetched successfully",
        data: results,
        page: query.page,
        limit: query.limit,
        total
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.get(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid category ID"
        });
      }
      
      const category = await db.select().from(schema.categories)
        .where(eq(schema.categories.id, id))
        .limit(1);
      
      if (!category || category.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Category not found"
        });
      }
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Category found successfully",
        data: category[0]
      });
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categoryData = schema.categoryInsertSchema.parse(req.body);
      
      const result = await db.insert(schema.categories).values({
        name: categoryData.name,
        color: categoryData.color,
        status: categoryData.status || "ACTIVE"
      }).returning();
      
      return res.status(201).json({
        status: 201,
        success: true,
        message: "Category created successfully",
        data: result[0]
      });
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.patch(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid category ID"
        });
      }
      
      // Check if category exists
      const existingCategory = await db.select().from(schema.categories)
        .where(eq(schema.categories.id, id))
        .limit(1);
      
      if (!existingCategory || existingCategory.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Category not found"
        });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // Update category
      await db.update(schema.categories)
        .set({
          name: updateData.name !== undefined ? updateData.name : existingCategory[0].name,
          color: updateData.color !== undefined ? updateData.color : existingCategory[0].color,
          status: updateData.status !== undefined ? updateData.status : existingCategory[0].status,
          updated_at: new Date()
        })
        .where(eq(schema.categories.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Category updated successfully",
        data: []
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.delete(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid category ID"
        });
      }
      
      // Check if category exists
      const existingCategory = await db.select().from(schema.categories)
        .where(eq(schema.categories.id, id))
        .limit(1);
      
      if (!existingCategory || existingCategory.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Category not found"
        });
      }
      
      // Soft delete (update status)
      await db.update(schema.categories)
        .set({
          status: "ARCHIVED",
          updated_at: new Date()
        })
        .where(eq(schema.categories.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Category deleted successfully",
        data: []
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  // Tasks endpoints
  app.get(`${apiPrefix}/tasks`, async (req, res) => {
    try {
      const query = findAllQuerySchema.parse(req.query);
      
      // Build query
      let dbQuery = db.select({
        id: schema.tasks.id,
        name: schema.tasks.name,
        task_type: schema.tasks.task_type,
        task_frequency: schema.tasks.task_frequency,
        duration: schema.tasks.duration,
        target: schema.tasks.target,
        start_date: schema.tasks.start_date,
        end_date: schema.tasks.end_date,
        category_id: schema.tasks.category_id,
        status: schema.tasks.status,
        parent_task_id: schema.tasks.parent_task_id,
        is_template: schema.tasks.is_template,
        period_start_date: schema.tasks.period_start_date,
        period_end_date: schema.tasks.period_end_date,
        completed_count: schema.tasks.completed_count,
        is_completed: schema.tasks.is_completed,
        created_at: schema.tasks.created_at,
        updated_at: schema.tasks.updated_at,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
          color: schema.categories.color
        }
      })
      .from(schema.tasks)
      .leftJoin(schema.categories, eq(schema.tasks.category_id, schema.categories.id))
      .where(eq(schema.tasks.status, "ACTIVE"))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
      
      // Apply filters
      if (query.category_id) {
        dbQuery = dbQuery.where(eq(schema.tasks.category_id, query.category_id));
      }
      
      if (query.task_type) {
        dbQuery = dbQuery.where(eq(schema.tasks.task_type, query.task_type));
      }
      
      if (query.task_frequency) {
        dbQuery = dbQuery.where(eq(schema.tasks.task_frequency, query.task_frequency));
      }
      
      if (query.period_start_date) {
        dbQuery = dbQuery.where(eq(schema.tasks.period_start_date, query.period_start_date));
      }
      
      // Apply search if provided
      if (query.search) {
        dbQuery = dbQuery.where(like(schema.tasks.name, `%${query.search}%`));
      }
      
      // Apply sorting
      if (query.sort_by && query.sort_order) {
        const column = query.sort_by as keyof typeof schema.tasks.$inferSelect;
        dbQuery = query.sort_order === 'asc' 
          ? dbQuery.orderBy(asc(schema.tasks[column])) 
          : dbQuery.orderBy(desc(schema.tasks[column]));
      } else {
        dbQuery = dbQuery.orderBy(desc(schema.tasks.created_at));
      }
      
      // Execute query
      const results = await dbQuery;
      
      // Transform results to match expected structure for frontend
      const transformedResults = results.map(task => ({
        _id: task.id.toString(),
        name: task.name,
        task_type: task.task_type,
        task_frequency: task.task_frequency,
        duration: task.duration,
        target: task.target,
        start_date: task.start_date,
        end_date: task.end_date,
        category: task.category,
        status: task.status,
        parent_task_id: task.parent_task_id,
        is_template: task.is_template,
        period_start_date: task.period_start_date,
        period_end_date: task.period_end_date,
        completed_count: task.completed_count,
        is_completed: task.is_completed,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      // Count total
      const countQuery = await db.select({ count: schema.tasks.id }).from(schema.tasks)
        .where(eq(schema.tasks.status, "ACTIVE"));
      const total = countQuery.length > 0 ? Number(countQuery[0].count) : 0;
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Tasks fetched successfully",
        data: transformedResults,
        page: query.page,
        limit: query.limit,
        total
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.get(`${apiPrefix}/tasks/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid task ID"
        });
      }
      
      const taskResult = await db.select({
        id: schema.tasks.id,
        name: schema.tasks.name,
        task_type: schema.tasks.task_type,
        task_frequency: schema.tasks.task_frequency,
        duration: schema.tasks.duration,
        target: schema.tasks.target,
        start_date: schema.tasks.start_date,
        end_date: schema.tasks.end_date,
        category_id: schema.tasks.category_id,
        status: schema.tasks.status,
        parent_task_id: schema.tasks.parent_task_id,
        is_template: schema.tasks.is_template,
        period_start_date: schema.tasks.period_start_date,
        period_end_date: schema.tasks.period_end_date,
        completed_count: schema.tasks.completed_count,
        is_completed: schema.tasks.is_completed,
        created_at: schema.tasks.created_at,
        updated_at: schema.tasks.updated_at,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
          color: schema.categories.color
        }
      })
      .from(schema.tasks)
      .leftJoin(schema.categories, eq(schema.tasks.category_id, schema.categories.id))
      .where(eq(schema.tasks.id, id))
      .limit(1);
      
      if (!taskResult || taskResult.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      const task = taskResult[0];
      
      // Transform result to match expected structure for frontend
      const transformedTask = {
        _id: task.id.toString(),
        name: task.name,
        task_type: task.task_type,
        task_frequency: task.task_frequency,
        duration: task.duration,
        target: task.target,
        start_date: task.start_date,
        end_date: task.end_date,
        category: task.category,
        status: task.status,
        parent_task_id: task.parent_task_id,
        is_template: task.is_template,
        period_start_date: task.period_start_date,
        period_end_date: task.period_end_date,
        completed_count: task.completed_count,
        is_completed: task.is_completed,
        created_at: task.created_at,
        updated_at: task.updated_at
      };
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Task found successfully",
        data: transformedTask
      });
    } catch (error) {
      console.error("Error fetching task:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.post(`${apiPrefix}/tasks`, async (req, res) => {
    try {
      const taskData = schema.taskInsertSchema.parse(req.body);
      
      // Format date and calculate period dates
      const startDate = req.body.start_date; // This should be in DD-MM-YYYY format
      const periodDates = calculatePeriodDates(taskData.task_frequency, startDate);
      
      const result = await db.insert(schema.tasks).values({
        name: taskData.name,
        task_type: taskData.task_type,
        task_frequency: taskData.task_frequency,
        duration: taskData.duration,
        target: taskData.target,
        start_date: startDate,
        end_date: taskData.end_date,
        category_id: parseInt(taskData.category_id.toString()),
        status: taskData.status || "ACTIVE",
        parent_task_id: taskData.parent_task_id,
        is_template: true,
        period_start_date: periodDates.period_start_date,
        period_end_date: periodDates.period_end_date,
        completed_count: 0,
        is_completed: false
      }).returning();
      
      // Transform result to match expected structure for frontend
      const transformedTask = {
        _id: result[0].id.toString(),
        name: result[0].name,
        task_type: result[0].task_type,
        task_frequency: result[0].task_frequency,
        duration: result[0].duration,
        target: result[0].target,
        start_date: result[0].start_date,
        end_date: result[0].end_date,
        category: result[0].category_id,
        status: result[0].status,
        parent_task_id: result[0].parent_task_id,
        is_template: result[0].is_template,
        period_start_date: result[0].period_start_date,
        period_end_date: result[0].period_end_date,
        completed_count: result[0].completed_count,
        is_completed: result[0].is_completed,
        created_at: result[0].created_at,
        updated_at: result[0].updated_at
      };
      
      return res.status(201).json({
        status: 201,
        success: true,
        message: "Task created successfully",
        data: transformedTask
      });
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.patch(`${apiPrefix}/tasks/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid task ID"
        });
      }
      
      // Check if task exists
      const existingTask = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, id))
        .limit(1);
      
      if (!existingTask || existingTask.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // Update period dates if needed
      let periodStartDate = existingTask[0].period_start_date;
      let periodEndDate = existingTask[0].period_end_date;
      
      if (updateData.task_frequency || updateData.start_date) {
        const frequency = updateData.task_frequency || existingTask[0].task_frequency;
        const startDate = updateData.start_date || existingTask[0].start_date;
        const periodDates = calculatePeriodDates(frequency, startDate);
        periodStartDate = periodDates.period_start_date;
        periodEndDate = periodDates.period_end_date;
      }
      
      // Update task
      await db.update(schema.tasks)
        .set({
          name: updateData.name !== undefined ? updateData.name : existingTask[0].name,
          task_type: updateData.task_type !== undefined ? updateData.task_type : existingTask[0].task_type,
          task_frequency: updateData.task_frequency !== undefined ? updateData.task_frequency : existingTask[0].task_frequency,
          duration: updateData.duration !== undefined ? updateData.duration : existingTask[0].duration,
          target: updateData.target !== undefined ? updateData.target : existingTask[0].target,
          start_date: updateData.start_date !== undefined ? updateData.start_date : existingTask[0].start_date,
          end_date: updateData.end_date !== undefined ? updateData.end_date : existingTask[0].end_date,
          category_id: updateData.category_id !== undefined ? parseInt(updateData.category_id.toString()) : existingTask[0].category_id,
          status: updateData.status !== undefined ? updateData.status : existingTask[0].status,
          period_start_date: periodStartDate,
          period_end_date: periodEndDate,
          updated_at: new Date()
        })
        .where(eq(schema.tasks.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Task updated successfully",
        data: []
      });
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.patch(`${apiPrefix}/tasks/:id/completion`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid task ID"
        });
      }
      
      // Check if task exists
      const existingTask = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, id))
        .limit(1);
      
      if (!existingTask || existingTask.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      const task = existingTask[0];
      const completedTarget = req.body.completed_target || 1;
      
      // Update completion count
      const updatedCompletedCount = (task.completed_count || 0) + completedTarget;
      
      // Check if task is completed based on its type
      let isCompleted = false;
      if (task.task_type === "YES_NO") {
        isCompleted = updatedCompletedCount >= (task.target || 1);
      } else if (task.task_type === "TIME_BASED") {
        isCompleted = updatedCompletedCount >= (task.duration || 30);
      }
      
      // Update task
      await db.update(schema.tasks)
        .set({
          completed_count: updatedCompletedCount,
          is_completed: isCompleted,
          updated_at: new Date()
        })
        .where(eq(schema.tasks.id, id));
      
      // If task is completed and it's a template, create new instance
      if (isCompleted && task.is_template) {
        const periodDates = calculatePeriodDates(
          task.task_frequency,
          task.period_end_date
        );
        
        // Create new task instance
        await db.insert(schema.tasks).values({
          name: task.name,
          task_type: task.task_type,
          task_frequency: task.task_frequency,
          duration: task.duration,
          target: task.target,
          start_date: task.start_date,
          end_date: task.end_date,
          category_id: task.category_id,
          status: task.status,
          parent_task_id: task.id.toString(),
          is_template: false,
          period_start_date: periodDates.period_start_date,
          period_end_date: periodDates.period_end_date,
          completed_count: 0,
          is_completed: false
        });
      }
      
      // Get updated task
      const updatedTask = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, id))
        .limit(1);
      
      // Transform result
      const transformedTask = {
        _id: updatedTask[0].id.toString(),
        name: updatedTask[0].name,
        task_type: updatedTask[0].task_type,
        task_frequency: updatedTask[0].task_frequency,
        duration: updatedTask[0].duration,
        target: updatedTask[0].target,
        start_date: updatedTask[0].start_date,
        end_date: updatedTask[0].end_date,
        category: updatedTask[0].category_id,
        status: updatedTask[0].status,
        parent_task_id: updatedTask[0].parent_task_id,
        is_template: updatedTask[0].is_template,
        period_start_date: updatedTask[0].period_start_date,
        period_end_date: updatedTask[0].period_end_date,
        completed_count: updatedTask[0].completed_count,
        is_completed: updatedTask[0].is_completed,
        created_at: updatedTask[0].created_at,
        updated_at: updatedTask[0].updated_at
      };
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Task completion updated successfully",
        data: transformedTask
      });
    } catch (error) {
      console.error("Error updating task completion:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.delete(`${apiPrefix}/tasks/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid task ID"
        });
      }
      
      // Check if task exists
      const existingTask = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, id))
        .limit(1);
      
      if (!existingTask || existingTask.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      // Soft delete (update status)
      await db.update(schema.tasks)
        .set({
          status: "ARCHIVED",
          updated_at: new Date()
        })
        .where(eq(schema.tasks.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Task deleted successfully",
        data: []
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  // Time Session endpoints
  app.get(`${apiPrefix}/time-sessions`, async (req, res) => {
    try {
      const query = findAllQuerySchema.parse(req.query);
      
      // Build query
      let dbQuery = db.select({
        id: schema.timeSessions.id,
        task_id: schema.timeSessions.task_id,
        date: schema.timeSessions.date,
        status: schema.timeSessions.status,
        duration_minutes: schema.timeSessions.duration_minutes,
        completed_target: schema.timeSessions.completed_target,
        remaining_duration: schema.timeSessions.remaining_duration,
        is_period_completed: schema.timeSessions.is_period_completed,
        period_id: schema.timeSessions.period_id,
        created_at: schema.timeSessions.created_at,
        updated_at: schema.timeSessions.updated_at,
        task: {
          id: schema.tasks.id,
          name: schema.tasks.name,
          task_type: schema.tasks.task_type,
          duration: schema.tasks.duration,
          target: schema.tasks.target
        }
      })
      .from(schema.timeSessions)
      .leftJoin(schema.tasks, eq(schema.timeSessions.task_id, schema.tasks.id))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
      
      // Apply filters
      if (query.date) {
        dbQuery = dbQuery.where(eq(schema.timeSessions.date, query.date));
      }
      
      // Apply sorting
      if (query.sort_by && query.sort_order) {
        const column = query.sort_by as keyof typeof schema.timeSessions.$inferSelect;
        dbQuery = query.sort_order === 'asc' 
          ? dbQuery.orderBy(asc(schema.timeSessions[column])) 
          : dbQuery.orderBy(desc(schema.timeSessions[column]));
      } else {
        dbQuery = dbQuery.orderBy(desc(schema.timeSessions.created_at));
      }
      
      // Execute query
      const results = await dbQuery;
      
      // Transform results
      const transformedResults = results.map(session => ({
        _id: session.id.toString(),
        task: session.task,
        date: session.date,
        status: session.status,
        duration_minutes: session.duration_minutes,
        completed_target: session.completed_target,
        remaining_duration: session.remaining_duration,
        is_period_completed: session.is_period_completed,
        period_id: session.period_id,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));
      
      // Count total
      const countQuery = await db.select({ count: schema.timeSessions.id }).from(schema.timeSessions);
      const total = countQuery.length > 0 ? Number(countQuery[0].count) : 0;
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Time sessions fetched successfully",
        data: transformedResults,
        page: query.page,
        limit: query.limit,
        total
      });
    } catch (error) {
      console.error("Error fetching time sessions:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.get(`${apiPrefix}/time-sessions/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid time session ID"
        });
      }
      
      const sessionResult = await db.select({
        id: schema.timeSessions.id,
        task_id: schema.timeSessions.task_id,
        date: schema.timeSessions.date,
        status: schema.timeSessions.status,
        duration_minutes: schema.timeSessions.duration_minutes,
        completed_target: schema.timeSessions.completed_target,
        remaining_duration: schema.timeSessions.remaining_duration,
        is_period_completed: schema.timeSessions.is_period_completed,
        period_id: schema.timeSessions.period_id,
        created_at: schema.timeSessions.created_at,
        updated_at: schema.timeSessions.updated_at,
        task: {
          id: schema.tasks.id,
          name: schema.tasks.name,
          task_type: schema.tasks.task_type,
          duration: schema.tasks.duration,
          target: schema.tasks.target
        }
      })
      .from(schema.timeSessions)
      .leftJoin(schema.tasks, eq(schema.timeSessions.task_id, schema.tasks.id))
      .where(eq(schema.timeSessions.id, id))
      .limit(1);
      
      if (!sessionResult || sessionResult.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Time session not found"
        });
      }
      
      const session = sessionResult[0];
      
      // Transform result
      const transformedSession = {
        _id: session.id.toString(),
        task: session.task,
        date: session.date,
        status: session.status,
        duration_minutes: session.duration_minutes,
        completed_target: session.completed_target,
        remaining_duration: session.remaining_duration,
        is_period_completed: session.is_period_completed,
        period_id: session.period_id,
        created_at: session.created_at,
        updated_at: session.updated_at
      };
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Time session found successfully",
        data: transformedSession
      });
    } catch (error) {
      console.error("Error fetching time session:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.post(`${apiPrefix}/time-sessions`, async (req, res) => {
    try {
      const sessionData = schema.timeSessionInsertSchema.parse(req.body);
      
      // Check if task exists
      const taskId = parseInt(sessionData.task_id.toString());
      const taskResult = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, taskId))
        .limit(1);
      
      if (!taskResult || taskResult.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      const task = taskResult[0];
      
      // Calculate remaining duration for time-based tasks
      let remainingDuration = null;
      if (task.task_type === "TIME_BASED" && sessionData.duration_minutes) {
        remainingDuration = Math.max(0, (task.duration || 0) - sessionData.duration_minutes);
      }
      
      // Check if this session completes the period
      const periodId = `${taskId}_${sessionData.date}`;
      let isPeriodCompleted = false;
      
      const existingSessions = await db.select().from(schema.timeSessions)
        .where(eq(schema.timeSessions.task_id, taskId))
        .where(eq(schema.timeSessions.date, sessionData.date));
      
      const totalCompleted = existingSessions.reduce((sum, session) => {
        return sum + (session.completed_target || 0);
      }, 0) + (sessionData.completed_target || 0);
      
      if (task.task_type === "YES_NO") {
        isPeriodCompleted = totalCompleted >= (task.target || 1);
      } else if (task.task_type === "TIME_BASED") {
        isPeriodCompleted = totalCompleted >= (task.duration || 30);
      }
      
      // Create time session
      const result = await db.insert(schema.timeSessions).values({
        task_id: taskId,
        date: sessionData.date,
        status: sessionData.status,
        duration_minutes: sessionData.duration_minutes,
        completed_target: sessionData.completed_target,
        remaining_duration: remainingDuration,
        is_period_completed: isPeriodCompleted,
        period_id: periodId
      }).returning();
      
      // Update task completion status if period is completed
      if (isPeriodCompleted) {
        await db.update(schema.tasks)
          .set({
            completed_count: task.completed_count + (sessionData.completed_target || sessionData.duration_minutes || 1),
            is_completed: true,
            updated_at: new Date()
          })
          .where(eq(schema.tasks.id, taskId));
          
        // If task is a template, create new instance
        if (task.is_template) {
          const periodDates = calculatePeriodDates(
            task.task_frequency,
            task.period_end_date
          );
          
          // Create new task instance
          await db.insert(schema.tasks).values({
            name: task.name,
            task_type: task.task_type,
            task_frequency: task.task_frequency,
            duration: task.duration,
            target: task.target,
            start_date: task.start_date,
            end_date: task.end_date,
            category_id: task.category_id,
            status: task.status,
            parent_task_id: task.id.toString(),
            is_template: false,
            period_start_date: periodDates.period_start_date,
            period_end_date: periodDates.period_end_date,
            completed_count: 0,
            is_completed: false
          });
        }
      }
      
      // Transform result
      const transformedSession = {
        _id: result[0].id.toString(),
        task: taskId,
        date: result[0].date,
        status: result[0].status,
        duration_minutes: result[0].duration_minutes,
        completed_target: result[0].completed_target,
        remaining_duration: result[0].remaining_duration,
        is_period_completed: result[0].is_period_completed,
        period_id: result[0].period_id,
        created_at: result[0].created_at,
        updated_at: result[0].updated_at
      };
      
      return res.status(201).json({
        status: 201,
        success: true,
        message: "Time session created successfully",
        data: transformedSession
      });
    } catch (error) {
      console.error("Error creating time session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.patch(`${apiPrefix}/time-sessions/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid time session ID"
        });
      }
      
      // Check if session exists
      const existingSession = await db.select().from(schema.timeSessions)
        .where(eq(schema.timeSessions.id, id))
        .limit(1);
      
      if (!existingSession || existingSession.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Time session not found"
        });
      }
      
      const session = existingSession[0];
      const updateData = req.body;
      
      // Check if task exists
      const taskResult = await db.select().from(schema.tasks)
        .where(eq(schema.tasks.id, session.task_id))
        .limit(1);
      
      if (!taskResult || taskResult.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Task not found"
        });
      }
      
      const task = taskResult[0];
      
      // Calculate remaining duration if updating duration_minutes
      let remainingDuration = session.remaining_duration;
      if (updateData.duration_minutes !== undefined && task.task_type === "TIME_BASED") {
        remainingDuration = Math.max(0, (task.duration || 0) - updateData.duration_minutes);
      }
      
      // Check if this update completes the period
      let isPeriodCompleted = session.is_period_completed;
      if (updateData.completed_target !== undefined || updateData.duration_minutes !== undefined) {
        const date = updateData.date || session.date;
        const periodId = `${session.task_id}_${date}`;
        
        const existingSessions = await db.select().from(schema.timeSessions)
          .where(eq(schema.timeSessions.task_id, session.task_id))
          .where(eq(schema.timeSessions.date, date))
          .where(not(eq(schema.timeSessions.id, id)));
        
        const completedTarget = updateData.completed_target !== undefined 
          ? updateData.completed_target 
          : session.completed_target;
          
        const totalCompleted = existingSessions.reduce((sum, s) => {
          return sum + (s.completed_target || 0);
        }, completedTarget || 0);
        
        if (task.task_type === "YES_NO") {
          isPeriodCompleted = totalCompleted >= (task.target || 1);
        } else if (task.task_type === "TIME_BASED") {
          isPeriodCompleted = totalCompleted >= (task.duration || 30);
        }
        
        // Update task completion status if period is completed
        if (isPeriodCompleted && !session.is_period_completed) {
          await db.update(schema.tasks)
            .set({
              completed_count: task.completed_count + (completedTarget || session.duration_minutes || 1),
              is_completed: true,
              updated_at: new Date()
            })
            .where(eq(schema.tasks.id, session.task_id));
            
          // If task is a template, create new instance
          if (task.is_template) {
            const periodDates = calculatePeriodDates(
              task.task_frequency,
              task.period_end_date
            );
            
            // Create new task instance
            await db.insert(schema.tasks).values({
              name: task.name,
              task_type: task.task_type,
              task_frequency: task.task_frequency,
              duration: task.duration,
              target: task.target,
              start_date: task.start_date,
              end_date: task.end_date,
              category_id: task.category_id,
              status: task.status,
              parent_task_id: task.id.toString(),
              is_template: false,
              period_start_date: periodDates.period_start_date,
              period_end_date: periodDates.period_end_date,
              completed_count: 0,
              is_completed: false
            });
          }
        }
      }
      
      // Update time session
      await db.update(schema.timeSessions)
        .set({
          date: updateData.date !== undefined ? updateData.date : session.date,
          status: updateData.status !== undefined ? updateData.status : session.status,
          duration_minutes: updateData.duration_minutes !== undefined ? updateData.duration_minutes : session.duration_minutes,
          completed_target: updateData.completed_target !== undefined ? updateData.completed_target : session.completed_target,
          remaining_duration: remainingDuration,
          is_period_completed: isPeriodCompleted,
          updated_at: new Date()
        })
        .where(eq(schema.timeSessions.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Time session updated successfully",
        data: []
      });
    } catch (error) {
      console.error("Error updating time session:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  app.delete(`${apiPrefix}/time-sessions/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 400,
          success: false,
          message: "Invalid time session ID"
        });
      }
      
      // Check if session exists
      const existingSession = await db.select().from(schema.timeSessions)
        .where(eq(schema.timeSessions.id, id))
        .limit(1);
      
      if (!existingSession || existingSession.length === 0) {
        return res.status(404).json({ 
          status: 404,
          success: false,
          message: "Time session not found"
        });
      }
      
      // Delete time session
      await db.delete(schema.timeSessions)
        .where(eq(schema.timeSessions.id, id));
      
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Time session deleted successfully",
        data: []
      });
    } catch (error) {
      console.error("Error deleting time session:", error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
