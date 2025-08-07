"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPosRouter = void 0;
const express_1 = require("express");
const pos_service_1 = require("../services/pos-service");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
// Middleware to ensure user is an admin
function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
}
// Admin routes for POS management
exports.adminPosRouter = (0, express_1.Router)();
// Add a new POS provider
exports.adminPosRouter.post("/providers", isAdmin, async (req, res) => {
    try {
        // Validate request body
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            displayName: zod_1.z.string(),
            apiBaseUrl: zod_1.z.string().url(),
            apiDocumentationUrl: zod_1.z.string().url().optional(),
            logoUrl: zod_1.z.string().url().optional(),
            requiredFields: zod_1.z.record(zod_1.z.any()),
            isActive: zod_1.z.boolean().default(true)
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
        }
        // Insert provider
        const [provider] = await db_1.db.insert(schema_1.posProviders).values(validationResult.data).returning();
        return res.status(201).json(provider);
    }
    catch (error) {
        console.error("Error adding POS provider:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Get all POS providers (including inactive)
exports.adminPosRouter.get("/providers", isAdmin, async (req, res) => {
    try {
        const providers = await db_1.db.select().from(schema_1.posProviders);
        return res.json(providers);
    }
    catch (error) {
        console.error("Error getting all POS providers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Update a POS provider
exports.adminPosRouter.put("/providers/:id", isAdmin, async (req, res) => {
    try {
        const providerId = parseInt(req.params.id);
        // Validate request body
        const schema = zod_1.z.object({
            displayName: zod_1.z.string().optional(),
            apiBaseUrl: zod_1.z.string().url().optional(),
            apiDocumentationUrl: zod_1.z.string().url().optional(),
            logoUrl: zod_1.z.string().url().optional(),
            requiredFields: zod_1.z.record(zod_1.z.any()).optional(),
            isActive: zod_1.z.boolean().optional()
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
        }
        // Update provider
        const [updatedProvider] = await db_1.db.update(schema_1.posProviders)
            .set(validationResult.data)
            .where((0, drizzle_orm_1.eq)(schema_1.posProviders.id, providerId))
            .returning();
        if (!updatedProvider) {
            return res.status(404).json({ error: "Provider not found" });
        }
        return res.json(updatedProvider);
    }
    catch (error) {
        console.error("Error updating POS provider:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Sync transactions for a specific partner (admin)
exports.adminPosRouter.post("/partners/:id/sync", isAdmin, async (req, res) => {
    try {
        const partnerId = parseInt(req.params.id);
        // Sync transactions
        const result = await pos_service_1.posService.syncPartnerSales(partnerId);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }
        return res.json(result);
    }
    catch (error) {
        console.error("Error syncing partner transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Get all transactions across all partners (with filtering)
exports.adminPosRouter.get("/transactions", isAdmin, async (req, res) => {
    try {
        const partnerId = req.query.partnerId ? parseInt(req.query.partnerId) : undefined;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        let query = db_1.db.select({
            transaction: schema_1.posTransactions,
            partner: {
                id: schema_1.partners.id,
                name: schema_1.partners.storeName
            }
        })
            .from(schema_1.posTransactions)
            .leftJoin(schema_1.partners, (0, drizzle_orm_1.eq)(schema_1.posTransactions.partnerId, schema_1.partners.id));
        if (partnerId) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.posTransactions.partnerId, partnerId));
        }
        if (startDate) {
            query = query.where((0, drizzle_orm_1.gte)(schema_1.posTransactions.transactionDate, startDate));
        }
        if (endDate) {
            query = query.where((0, drizzle_orm_1.lte)(schema_1.posTransactions.transactionDate, endDate));
        }
        const transactions = await query.orderBy(schema_1.posTransactions.transactionDate);
        return res.json(transactions);
    }
    catch (error) {
        console.error("Error getting all transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Get sales summary for all partners
exports.adminPosRouter.get("/summary", isAdmin, async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        // Get all partners
        const partnersList = await db_1.db.select().from(schema_1.partners);
        // Get summary for each partner
        const summaries = await Promise.all(partnersList.map(async (partner) => {
            const summary = await pos_service_1.posService.getPartnerSalesSummary(partner.id, startDate, endDate);
            return {
                partnerId: partner.id,
                partnerName: partner.storeName,
                ...summary
            };
        }));
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
    }
    catch (error) {
        console.error("Error getting overall summary:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Seed initial POS providers
exports.adminPosRouter.post("/seed-providers", isAdmin, async (req, res) => {
    try {
        // Check if providers already exist
        const existingProviders = await db_1.db.select().from(schema_1.posProviders);
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
        const insertedProviders = await db_1.db.insert(schema_1.posProviders).values(providers).returning();
        return res.status(201).json(insertedProviders);
    }
    catch (error) {
        console.error("Error seeding POS providers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
