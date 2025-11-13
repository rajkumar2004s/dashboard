import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeContributionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      const productId = req.query.productId as string | undefined;
      
      if (productId) {
        const departments = await storage.getDepartmentsByProduct(productId);
        res.json(departments);
      } else {
        const departments = await storage.getDepartments();
        res.json(departments);
      }
    } catch (error) {
      console.error("Get departments error:", error);
      res.status(500).json({ error: "Failed to get departments" });
    }
  });

  // Contributions - Create
  app.post("/api/contributions", async (req, res) => {
    try {
      const { employeeId, contributions } = req.body;

      if (!employeeId || !contributions || !Array.isArray(contributions)) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const createdContributions = [];

      for (const contrib of contributions) {
        const validatedData = insertEmployeeContributionSchema.parse({
          employeeId,
          productId: contrib.productId,
          departmentId: contrib.departmentId,
          contributionPercent: contrib.contributionPercent,
          status: 'submitted_to_manager',
        });

        const created = await storage.createContribution(validatedData);
        createdContributions.push(created);
      }

      res.status(201).json(createdContributions);
    } catch (error) {
      console.error("Create contribution error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contribution" });
    }
  });

  // Contributions - Get all (for CEO)
  app.get("/api/contributions/all", async (req, res) => {
    try {
      const contributions = await storage.getContributions();
      res.json(contributions);
    } catch (error) {
      console.error("Get all contributions error:", error);
      res.status(500).json({ error: "Failed to get contributions" });
    }
  });

  // Contributions - Get by manager
  app.get("/api/contributions/manager/:managerId", async (req, res) => {
    try {
      const { managerId } = req.params;
      const contributions = await storage.getContributionsByManager(managerId);
      res.json(contributions);
    } catch (error) {
      console.error("Get manager contributions error:", error);
      res.status(500).json({ error: "Failed to get contributions" });
    }
  });

  // Contributions - Get by director
  app.get("/api/contributions/director/:directorId", async (req, res) => {
    try {
      const { directorId } = req.params;
      const contributions = await storage.getContributionsByDirector(directorId);
      res.json(contributions);
    } catch (error) {
      console.error("Get director contributions error:", error);
      res.status(500).json({ error: "Failed to get contributions" });
    }
  });

  // Contributions - Approve
  app.patch("/api/contributions/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { approver } = req.body;

      let newStatus: string;
      if (approver === 'manager') {
        newStatus = 'approved_by_manager';
      } else if (approver === 'director') {
        newStatus = 'approved_by_director';
      } else {
        return res.status(400).json({ error: "Invalid approver role" });
      }

      const updated = await storage.updateContributionStatus(id, newStatus);
      
      if (!updated) {
        return res.status(404).json({ error: "Contribution not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Approve contribution error:", error);
      res.status(500).json({ error: "Failed to approve contribution" });
    }
  });

  // Contributions - Reject
  app.patch("/api/contributions/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { approver, comment } = req.body;

      let newStatus: string;
      if (approver === 'manager') {
        newStatus = 'rejected_by_manager';
      } else if (approver === 'director') {
        newStatus = 'rejected_by_director';
      } else {
        return res.status(400).json({ error: "Invalid approver role" });
      }

      const updated = await storage.updateContributionStatus(id, newStatus, comment);
      
      if (!updated) {
        return res.status(404).json({ error: "Contribution not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Reject contribution error:", error);
      res.status(500).json({ error: "Failed to reject contribution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
