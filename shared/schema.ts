import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  productId: varchar("product_id").notNull().references(() => products.id),
  managerId: varchar("manager_id").notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments);
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

// Employees table
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  role: text("role").notNull().default("employee"),
});

export const insertEmployeeSchema = createInsertSchema(employees);
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Managers table
export const managers = pgTable("managers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  role: text("role").notNull().default("manager"),
});

export const insertManagerSchema = createInsertSchema(managers);
export type InsertManager = z.infer<typeof insertManagerSchema>;
export type Manager = typeof managers.$inferSelect;

// Directors table
export const directors = pgTable("directors", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  productId: varchar("product_id").notNull().references(() => products.id),
  role: text("role").notNull().default("director"),
});

export const insertDirectorSchema = createInsertSchema(directors);
export type InsertDirector = z.infer<typeof insertDirectorSchema>;
export type Director = typeof directors.$inferSelect;

// CEO table
export const ceo = pgTable("ceo", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("ceo"),
});

export const insertCeoSchema = createInsertSchema(ceo);
export type InsertCeo = z.infer<typeof insertCeoSchema>;
export type Ceo = typeof ceo.$inferSelect;

// Employee Contributions table
export const employeeContributions = pgTable("employee_contributions", {
  id: varchar("id").primaryKey(),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  contributionPercent: integer("contribution_percent").notNull(),
  status: text("status").notNull().default("submitted_to_manager"),
  rejectionComment: text("rejection_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmployeeContributionSchema = createInsertSchema(employeeContributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeContribution = z.infer<typeof insertEmployeeContributionSchema>;
export type EmployeeContribution = typeof employeeContributions.$inferSelect;

// Status type for contributions
export type ContributionStatus = 
  | "submitted_to_manager" 
  | "approved_by_manager" 
  | "rejected_by_manager"
  | "approved_by_director"
  | "rejected_by_director";

// User roles
export type UserRole = "employee" | "manager" | "director" | "ceo";

// Extended types for frontend use
export interface ContributionWithDetails extends EmployeeContribution {
  employeeName?: string;
  productName?: string;
  departmentName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  productId?: string;
}
