import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertWarehouseSchema, insertMovementSchema, insertMovementDetailSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { requireAuth, requireRole } from "./auth";
import { getKeycloakUsers, getKeycloakRoles, getUsersWithRoles, getUserRoles, assignRoleToUser, removeRoleFromUser } from "./keycloak-admin";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.initializeSystemUser();
  
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener productos" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener producto" });
    }
  });

  app.post("/api/products", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error al crear producto" });
    }
  });

  app.patch("/api/products/:id", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar producto" });
    }
  });

  app.delete("/api/products/:id", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar producto" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  });

  app.post("/api/categories", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error al crear categoría" });
    }
  });

  app.get("/api/warehouses", async (req, res) => {
    try {
      const warehouses = await storage.getWarehouses();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener almacenes" });
    }
  });

  app.get("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.getWarehouse(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ error: "Almacén no encontrado" });
      }
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener almacén" });
    }
  });

  app.post("/api/warehouses", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      const data = insertWarehouseSchema.parse(req.body);
      const warehouse = await storage.createWarehouse(data);
      res.status(201).json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error al crear almacén" });
    }
  });

  app.patch("/api/warehouses/:id", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      const data = insertWarehouseSchema.partial().parse(req.body);
      const warehouse = await storage.updateWarehouse(req.params.id, data);
      if (!warehouse) {
        return res.status(404).json({ error: "Almacén no encontrado" });
      }
      res.json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar almacén" });
    }
  });

  app.delete("/api/warehouses/:id", requireRole("Administrador", "Supervisor"), async (req, res) => {
    try {
      await storage.deleteWarehouse(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar almacén" });
    }
  });

  app.get("/api/stock", async (req, res) => {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const stockItems = await storage.getStock(warehouseId);
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener existencias" });
    }
  });

  app.get("/api/movements", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const movements = await storage.getMovements(type);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  });

  app.get("/api/movements/:id", async (req, res) => {
    try {
      const movement = await storage.getMovement(req.params.id);
      if (!movement) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      const details = await storage.getMovementDetails(req.params.id);
      res.json({ ...movement, details });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener movimiento" });
    }
  });

  app.get("/api/movements/:id/details", async (req, res) => {
    try {
      const details = await storage.getMovementDetails(req.params.id);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener detalles del movimiento" });
    }
  });

  app.post("/api/movements", requireRole("Administrador", "Supervisor", "Operador"), async (req, res) => {
    try {
      const { details, ...movementData } = req.body;
      const parsedMovement = insertMovementSchema.parse(movementData);
      const parsedDetails = z.array(insertMovementDetailSchema.omit({ movementId: true })).parse(details);
      
      const userId = storage.getSystemUserId();
      
      const movement = await storage.createMovement(parsedMovement, parsedDetails as any, userId);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error creating movement:", error);
      res.status(500).json({ error: "Error al crear movimiento" });
    }
  });

  app.get("/api/alerts/low-stock", async (req, res) => {
    try {
      const alerts = await storage.getLowStockAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener alertas" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  app.get("/api/users", requireRole("Administrador"), async (req, res) => {
    try {
      const users = await getUsersWithRoles();
      const formattedUsers = users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email || "",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username,
        role: u.roles.find((r) => ["Administrador", "Supervisor", "Operador", "Consulta"].includes(r)) || "Consulta",
        roles: u.roles,
        status: u.enabled ? "activo" : "inactivo",
      }));
      res.json(formattedUsers);
    } catch (error: any) {
      console.error("Error al obtener usuarios de Keycloak:", error);
      res.status(500).json({ error: error.message || "Error al obtener usuarios" });
    }
  });

  app.get("/api/users/:id/roles", requireRole("Administrador"), async (req, res) => {
    try {
      const roles = await getUserRoles(req.params.id);
      res.json(roles);
    } catch (error: any) {
      console.error("Error al obtener roles del usuario:", error);
      res.status(500).json({ error: error.message || "Error al obtener roles del usuario" });
    }
  });

  app.post("/api/users/:id/roles", requireRole("Administrador"), async (req, res) => {
    try {
      const { roleId, roleName } = req.body;
      if (!roleId || !roleName) {
        return res.status(400).json({ error: "roleId y roleName son requeridos" });
      }
      await assignRoleToUser(req.params.id, roleId, roleName);
      res.status(200).json({ message: "Rol asignado correctamente" });
    } catch (error: any) {
      console.error("Error al asignar rol:", error);
      res.status(500).json({ error: error.message || "Error al asignar rol" });
    }
  });

  app.delete("/api/users/:id/roles", requireRole("Administrador"), async (req, res) => {
    try {
      const { roleId, roleName } = req.body;
      if (!roleId || !roleName) {
        return res.status(400).json({ error: "roleId y roleName son requeridos" });
      }
      await removeRoleFromUser(req.params.id, roleId, roleName);
      res.status(200).json({ message: "Rol removido correctamente" });
    } catch (error: any) {
      console.error("Error al remover rol:", error);
      res.status(500).json({ error: error.message || "Error al remover rol" });
    }
  });

  app.get("/api/roles", requireRole("Administrador"), async (req, res) => {
    try {
      const roles = await getKeycloakRoles();
      const filteredRoles = roles.filter((r) => 
        !r.name.startsWith("uma_") && 
        !r.name.startsWith("default-roles") && 
        r.name !== "offline_access"
      );
      res.json(filteredRoles);
    } catch (error: any) {
      console.error("Error al obtener roles de Keycloak:", error);
      res.status(500).json({ error: error.message || "Error al obtener roles" });
    }
  });

  return httpServer;
}
