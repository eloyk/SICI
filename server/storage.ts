import { db } from "./db";
import { eq, and, sql, desc, asc, ilike, or } from "drizzle-orm";
import {
  users, products, categories, warehouses, stock, movements, movementDetails,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type Warehouse, type InsertWarehouse,
  type Stock, type InsertStock,
  type Movement, type InsertMovement,
  type MovementDetail, type InsertMovementDetail,
  Category as CategoryType,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  getWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, data: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: string): Promise<boolean>;

  getStock(warehouseId?: string): Promise<(Stock & { product: Product; warehouse: Warehouse })[]>;
  getStockByProduct(productId: string, warehouseId: string): Promise<Stock | undefined>;
  updateStock(productId: string, warehouseId: string, quantity: number): Promise<Stock>;

  getMovements(type?: string): Promise<Movement[]>;
  getMovement(id: string): Promise<Movement | undefined>;
  createMovement(movement: InsertMovement, details: InsertMovementDetail[]): Promise<Movement>;
  getMovementDetails(movementId: string): Promise<MovementDetail[]>;
  getNextFolio(type: string): Promise<string>;

  getLowStockAlerts(): Promise<(Stock & { product: Product; warehouse: Warehouse })[]>;
  getDashboardStats(): Promise<{ totalProducts: number; totalWarehouses: number; movementsToday: number; lowStockCount: number }>;
}

const SYSTEM_USER_ID = "system";

export class DatabaseStorage implements IStorage {
  async initializeSystemUser(): Promise<void> {
    const existing = await this.getUser(SYSTEM_USER_ID);
    if (!existing) {
      await db.insert(users).values({
        id: SYSTEM_USER_ID,
        username: "system",
        password: "not-used",
        name: "Sistema",
        email: "system@sici.local",
        role: "admin",
        isActive: true,
      }).onConflictDoNothing();
    }
  }

  getSystemUserId(): string {
    return SYSTEM_USER_ID;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.code));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return true;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses).orderBy(asc(warehouses.code));
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse;
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [created] = await db.insert(warehouses).values(warehouse).returning();
    return created;
  }

  async updateWarehouse(id: string, data: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const [warehouse] = await db.update(warehouses).set(data).where(eq(warehouses.id, id)).returning();
    return warehouse;
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    await db.update(warehouses).set({ isActive: false }).where(eq(warehouses.id, id));
    return true;
  }

  async getStock(warehouseId?: string): Promise<(Stock & { product: Product; warehouse: Warehouse; category?: Category | null })[]> {
    const baseQuery = db
      .select({
        id: stock.id,
        productId: stock.productId,
        warehouseId: stock.warehouseId,
        quantity: stock.quantity,
        lastUpdated: stock.lastUpdated,
        product: products,
        warehouse: warehouses,
        category: categories,
      })
      .from(stock)
      .innerJoin(products, eq(stock.productId, products.id))
      .innerJoin(warehouses, eq(stock.warehouseId, warehouses.id))
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (warehouseId) {
      return await baseQuery.where(and(eq(products.isActive, true), eq(stock.warehouseId, warehouseId)));
    }

    return await baseQuery.where(eq(products.isActive, true));
  }

  async getStockByProduct(productId: string, warehouseId: string): Promise<Stock | undefined> {
    const [stockItem] = await db
      .select()
      .from(stock)
      .where(and(eq(stock.productId, productId), eq(stock.warehouseId, warehouseId)));
    return stockItem;
  }

  async updateStock(productId: string, warehouseId: string, quantityChange: number, allowNegative: boolean = false): Promise<Stock> {
    const existing = await this.getStockByProduct(productId, warehouseId);
    
    if (existing) {
      const newQuantity = existing.quantity + quantityChange;
      
      if (!allowNegative && newQuantity < 0) {
        throw new Error(`Stock insuficiente. Disponible: ${existing.quantity}, Requerido: ${Math.abs(quantityChange)}`);
      }
      
      const [updated] = await db
        .update(stock)
        .set({ 
          quantity: newQuantity,
          lastUpdated: new Date(),
        })
        .where(eq(stock.id, existing.id))
        .returning();
      return updated;
    } else {
      if (quantityChange < 0 && !allowNegative) {
        throw new Error(`No existe stock del producto en este almacén`);
      }
      
      const [created] = await db
        .insert(stock)
        .values({ productId, warehouseId, quantity: quantityChange })
        .returning();
      return created;
    }
  }

  async getMovements(type?: string): Promise<Movement[]> {
    if (type) {
      return await db
        .select()
        .from(movements)
        .where(eq(movements.type, type as any))
        .orderBy(desc(movements.createdAt));
    }
    return await db.select().from(movements).orderBy(desc(movements.createdAt));
  }

  async getMovement(id: string): Promise<Movement | undefined> {
    const [movement] = await db.select().from(movements).where(eq(movements.id, id));
    return movement;
  }

  async getNextFolio(type: string): Promise<string> {
    const prefix = type.toUpperCase().slice(0, 3);
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(movements)
      .where(eq(movements.type, type as any));
    const num = (result?.count || 0) + 1;
    return `${prefix}-${String(num).padStart(4, "0")}`;
  }

  async createMovement(movement: InsertMovement, details: InsertMovementDetail[], userId?: string): Promise<Movement> {
    const folio = await this.getNextFolio(movement.type);
    
    const [created] = await db
      .insert(movements)
      .values({ ...movement, folio, userId: userId || SYSTEM_USER_ID })
      .returning();

    for (const detail of details) {
      await db.insert(movementDetails).values({
        ...detail,
        movementId: created.id,
      });

      let quantityChange = detail.quantity;
      let allowNegative = false;
      
      if (movement.type === "salida") {
        quantityChange = -detail.quantity;
      } else if (movement.type === "ajuste") {
        allowNegative = true;
      }

      if (movement.type === "transferencia" && movement.warehouseDestinationId) {
        await this.updateStock(detail.productId, movement.warehouseId, -detail.quantity, false);
        await this.updateStock(detail.productId, movement.warehouseDestinationId, detail.quantity, true);
      } else {
        await this.updateStock(detail.productId, movement.warehouseId, quantityChange, allowNegative);
      }
    }

    return created;
  }

  async getMovementDetails(movementId: string): Promise<MovementDetail[]> {
    return await db
      .select()
      .from(movementDetails)
      .where(eq(movementDetails.movementId, movementId));
  }

  async getLowStockAlerts(): Promise<(Stock & { product: Product; warehouse: Warehouse })[]> {
    return await db
      .select({
        id: stock.id,
        productId: stock.productId,
        warehouseId: stock.warehouseId,
        quantity: stock.quantity,
        lastUpdated: stock.lastUpdated,
        product: products,
        warehouse: warehouses,
      })
      .from(stock)
      .innerJoin(products, eq(stock.productId, products.id))
      .innerJoin(warehouses, eq(stock.warehouseId, warehouses.id))
      .where(and(
        eq(products.isActive, true),
        sql`${stock.quantity} < ${products.minStock}`
      ))
      .orderBy(asc(stock.quantity));
  }

  async getDashboardStats(): Promise<{ totalProducts: number; totalWarehouses: number; movementsToday: number; lowStockCount: number }> {
    const [productsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true));

    const [warehousesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
      .where(eq(warehouses.isActive, true));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [movementsTodayCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(movements)
      .where(sql`${movements.createdAt} >= ${today}`);

    const [lowStockCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stock)
      .innerJoin(products, eq(stock.productId, products.id))
      .where(and(
        eq(products.isActive, true),
        sql`${stock.quantity} < ${products.minStock}`
      ));

    return {
      totalProducts: productsCount?.count || 0,
      totalWarehouses: warehousesCount?.count || 0,
      movementsToday: movementsTodayCount?.count || 0,
      lowStockCount: lowStockCountResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
