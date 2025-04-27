import { Router, Request, Response } from "express";
import { posService } from "../services/pos-service";
import { db } from "../db";
import { partners, posProviders, posTransactions } from "@shared/schema";
import { eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

// Middleware to ensure user is an admin
function isAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }
  next();
}

// Admin routes for POS management
export const adminPosRouter = Router();

// Add a new POS provider
adminPosRouter.post("/providers", isAdmin, async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      name: z.string(),
      displayName: z.string(),
      apiBaseUrl: z.string().url(),
      apiDocumentationUrl: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
      requiredFields: z.record(z.any()),
      isActive: z.boolean().default(true)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
    }
    
    // Insert provider
    const [provider] = await db.insert(posProviders).values(validationResult.data).returning();
    
    return res.status(201).json(provider);
  } catch (error) {
    console.error("Error adding POS provider:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all POS providers (including inactive)
adminPosRouter.get("/providers", isAdmin, async (req, res) => {
  try {
    const providers = await db.select().from(posProviders);
    return res.json(providers);
  } catch (error) {
    console.error("Error getting all POS providers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update a POS provider
adminPosRouter.put("/providers/:id", isAdmin, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    
    // Validate request body
    const schema = z.object({
      displayName: z.string().optional(),
      apiBaseUrl: z.string().url().optional(),
      apiDocumentationUrl: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
      requiredFields: z.record(z.any()).optional(),
      isActive: z.boolean().optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
    }
    
    // Update provider
    const [updatedProvider] = await db.update(posProviders)
      .set(validationResult.data)
      .where(eq(posProviders.id, providerId))
      .returning();
    
    if (!updatedProvider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    
    return res.json(updatedProvider);
  } catch (error) {
    console.error("Error updating POS provider:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Sync transactions for a specific partner (admin)
adminPosRouter.post("/partners/:id/sync", isAdmin, async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    
    // Sync transactions
    const result = await posService.syncPartnerSales(partnerId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    return res.json(result);
  } catch (error) {
    console.error("Error syncing partner transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all transactions across all partners (with filtering)
adminPosRouter.get("/transactions", isAdmin, async (req, res) => {
  try {
    const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    let query = db.select({
      transaction: posTransactions,
      partner: {
        id: partners.id,
        name: partners.storeName
      }
    })
    .from(posTransactions)
    .leftJoin(partners, eq(posTransactions.partnerId, partners.id));
    
    if (partnerId) {
      query = query.where(eq(posTransactions.partnerId, partnerId));
    }
    
    if (startDate) {
      query = query.where(gte(posTransactions.transactionDate, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(posTransactions.transactionDate, endDate));
    }
    
    const transactions = await query.orderBy(posTransactions.transactionDate);
    
    return res.json(transactions);
  } catch (error) {
    console.error("Error getting all transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get sales summary for all partners
adminPosRouter.get("/summary", isAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Get all partners
    const partnersList = await db.select().from(partners);
    
    // Get summary for each partner
    const summaries = await Promise.all(
      partnersList.map(async (partner) => {
        const summary = await posService.getPartnerSalesSummary(partner.id, startDate, endDate);
        return {
          partnerId: partner.id,
          partnerName: partner.storeName,
          ...summary
        };
      })
    );
    
    // Calculate overall totals
    const totalTransactions = summaries.reduce((sum, s) => sum + s.totalTransactions, 0);
    const totalAmount = summaries.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCommission = summaries.reduce((sum, s) => sum + s.totalCommission, 0);
    
    return res.json({
      partners: summaries,
      overall: {
        totalPartners: partnersList.length,
        totalTransactions,
        totalAmount,
        totalCommission
      }
    });
  } catch (error) {
    console.error("Error getting overall summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Seed initial POS providers
adminPosRouter.post("/seed-providers", isAdmin, async (req, res) => {
  try {
    // Check if providers already exist
    const existingProviders = await db.select().from(posProviders);
    if (existingProviders.length > 0) {
      return res.status(400).json({ 
        error: "Providers already exist", 
        count: existingProviders.length 
      });
    }
    
    // Sample providers for Chile
    const providers = [
      {
        name: "transbank",
        displayName: "Transbank",
        apiBaseUrl: "https://api.transbank.cl/v1/pos",
        apiDocumentationUrl: "https://www.transbankdevelopers.cl/",
        logoUrl: "https://www.transbankdevelopers.cl/static/logo-transbank-developers-navbar.svg",
        requiredFields: {
          apiKey: "API Key de Transbank",
          storeId: "ID de la tienda"
        },
        isActive: true
      },
      {
        name: "flow",
        displayName: "Flow",
        apiBaseUrl: "https://www.flow.cl/api",
        apiDocumentationUrl: "https://www.flow.cl/docs/api.html",
        logoUrl: "https://www.flow.cl/images/logo-flow.svg",
        requiredFields: {
          apiKey: "API Key de Flow",
          storeId: "ID comercio Flow"
        },
        isActive: true
      },
      {
        name: "khipu",
        displayName: "Khipu",
        apiBaseUrl: "https://khipu.com/api/2.0",
        apiDocumentationUrl: "https://khipu.com/page/api-para-integradores",
        logoUrl: "https://khipu.com/static/img/logo-khipu-65px.png",
        requiredFields: {
          apiKey: "Llave secreta",
          storeId: "ID de cobrador"
        },
        isActive: true
      }
    ];
    
    // Insert providers
    const insertedProviders = await db.insert(posProviders).values(providers).returning();
    
    return res.status(201).json(insertedProviders);
  } catch (error) {
    console.error("Error seeding POS providers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});