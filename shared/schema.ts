import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  task_type: text("task_type").notNull(),
  task_frequency: text("task_frequency").notNull(),
  duration: integer("duration"),
  target: integer("target"),
  start_date: text("start_date").notNull(),
  end_date: text("end_date"),
  category_id: integer("category_id").references(() => categories.id).notNull(),
  status: text("status").notNull().default("ACTIVE"),
  parent_task_id: text("parent_task_id"),
  is_template: boolean("is_template").notNull().default(true),
  period_start_date: text("period_start_date"),
  period_end_date: text("period_end_date"),
  completed_count: integer("completed_count").notNull().default(0),
  is_completed: boolean("is_completed").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Time Sessions table
export const timeSessions = pgTable("time_sessions", {
  id: serial("id").primaryKey(),
  task_id: integer("task_id").references(() => tasks.id).notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
  duration_minutes: integer("duration_minutes"),
  completed_target: integer("completed_target"),
  remaining_duration: integer("remaining_duration"),
  is_period_completed: boolean("is_period_completed").notNull().default(false),
  period_id: text("period_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  category: one(categories, { fields: [tasks.category_id], references: [categories.id] }),
  timeSessions: many(timeSessions),
}));

export const timeSessionsRelations = relations(timeSessions, ({ one }) => ({
  task: one(tasks, { fields: [timeSessions.task_id], references: [tasks.id] }),
}));

// Define schemas for validation
export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  color: (schema) => schema.min(4, "Color must be a valid hex value")
});

export const taskInsertSchema = createInsertSchema(tasks, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  task_type: (schema) => schema.refine(val => ['YES_NO', 'TIME_BASED'].includes(val), "Invalid task type"),
  task_frequency: (schema) => schema.refine(val => ['DAILY', 'WEEKLY', 'MONTHLY'].includes(val), "Invalid task frequency")
});

export const timeSessionInsertSchema = createInsertSchema(timeSessions, {
  status: (schema) => schema.refine(val => ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(val), "Invalid session status")
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof taskInsertSchema>;

export type TimeSession = typeof timeSessions.$inferSelect;
export type InsertTimeSession = z.infer<typeof timeSessionInsertSchema>;
