import { Router, Request, Response } from "express";
import { posService } from "../services/pos-service";
import { db } from "../db";
import { partners, posProviders, posTransactions } from "@shared/schema";
import { eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

// Middleware to ensure user is a partner
function isPartner(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "partner") {
    return res.status(403).json({ error: "Access denied. Partner role required." });
  }
  next();
}

// Routes for partner POS operations
export const partnerPosRouter = Router();

// Get POS integration status for the partner
partnerPosRouter.get("/status", isPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;
    
    // Get partner details
    const [partner] = await db.select().from(partners).where(eq(partners.userId, partnerId));
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Return integration status
    return res.json({
      posIntegrated: partner.posIntegrated || false,
      posProvider: partner.posProvider || null,
      posStoreId: partner.posStoreId || null,
      lastSyncedAt: partner.lastSyncedAt || null
    });
  } catch (error) {
    console.error("Error getting POS status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get available POS providers
partnerPosRouter.get("/providers", isPartner, async (req, res) => {
  try {
    const providers = await posService.getAvailableProviders();
    return res.json(providers);
  } catch (error) {
    console.error("Error getting POS providers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Configure POS integration
partnerPosRouter.post("/configure", isPartner, async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      posProvider: z.string(),
      posApiKey: z.string(),
      posStoreId: z.string()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
    }
    
    const { posProvider, posApiKey, posStoreId } = validationResult.data;
    
    // Get partner ID
    const [partner] = await db.select().from(partners).where(eq(partners.userId, req.user.id));
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Configure integration
    const result = await posService.configurePosIntegration(partner.id, posProvider, posApiKey, posStoreId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    return res.json(result);
  } catch (error) {
    console.error("Error configuring POS integration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Sync transactions
partnerPosRouter.post("/sync", isPartner, async (req, res) => {
  try {
    // Get partner ID
    const [partner] = await db.select().from(partners).where(eq(partners.userId, req.user.id));
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Sync transactions
    const result = await posService.syncPartnerSales(partner.id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    return res.json(result);
  } catch (error) {
    console.error("Error syncing POS transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get transactions
partnerPosRouter.get("/transactions", isPartner, async (req, res) => {
  try {
    // Get query parameters for date filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Get partner ID
    const [partner] = await db.select().from(partners).where(eq(partners.userId, req.user.id));
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Get transactions
    const transactions = await posService.getPartnerTransactions(partner.id, startDate, endDate);
    
    return res.json(transactions);
  } catch (error) {
    console.error("Error getting POS transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get sales summary
partnerPosRouter.get("/summary", isPartner, async (req, res) => {
  try {
    // Get query parameters for date filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Get partner ID
    const [partner] = await db.select().from(partners).where(eq(partners.userId, req.user.id));
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Get summary
    const summary = await posService.getPartnerSalesSummary(partner.id, startDate, endDate);
    
    return res.json(summary);
  } catch (error) {
    console.error("Error getting POS summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});