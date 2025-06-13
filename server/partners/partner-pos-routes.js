"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerPosRouter = void 0;
const express_1 = require("express");
const pos_service_1 = require("../services/pos-service");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
// Middleware to ensure user is a partner
function isPartner(req, res, next) {
    if (!req.isAuthenticated() || req.user.role !== "partner") {
        return res.status(403).json({ error: "Access denied. Partner role required." });
    }
    next();
}
// Routes for partner POS operations
exports.partnerPosRouter = (0, express_1.Router)();
// Get POS integration status for the partner
exports.partnerPosRouter.get("/status", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partnerId = req.user.id;
        // Get partner details
        const [partner] = yield db_1.db.select().from(schema_1.partners).where((0, drizzle_orm_1.eq)(schema_1.partners.userId, partnerId));
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
    }
    catch (error) {
        console.error("Error getting POS status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Get available POS providers
exports.partnerPosRouter.get("/providers", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield pos_service_1.posService.getAvailableProviders();
        return res.json(providers);
    }
    catch (error) {
        console.error("Error getting POS providers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Configure POS integration
exports.partnerPosRouter.post("/configure", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const schema = zod_1.z.object({
            posProvider: zod_1.z.string(),
            posApiKey: zod_1.z.string(),
            posStoreId: zod_1.z.string()
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
        }
        const { posProvider, posApiKey, posStoreId } = validationResult.data;
        // Get partner ID
        const [partner] = yield db_1.db.select().from(schema_1.partners).where((0, drizzle_orm_1.eq)(schema_1.partners.userId, req.user.id));
        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }
        // Configure integration
        const result = yield pos_service_1.posService.configurePosIntegration(partner.id, posProvider, posApiKey, posStoreId);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }
        return res.json(result);
    }
    catch (error) {
        console.error("Error configuring POS integration:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Sync transactions
exports.partnerPosRouter.post("/sync", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get partner ID
        const [partner] = yield db_1.db.select().from(schema_1.partners).where((0, drizzle_orm_1.eq)(schema_1.partners.userId, req.user.id));
        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }
        // Sync transactions
        const result = yield pos_service_1.posService.syncPartnerSales(partner.id);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }
        return res.json(result);
    }
    catch (error) {
        console.error("Error syncing POS transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Get transactions
exports.partnerPosRouter.get("/transactions", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get query parameters for date filtering
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        // Get partner ID
        const [partner] = yield db_1.db.select().from(schema_1.partners).where((0, drizzle_orm_1.eq)(schema_1.partners.userId, req.user.id));
        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }
        // Get transactions
        const transactions = yield pos_service_1.posService.getPartnerTransactions(partner.id, startDate, endDate);
        return res.json(transactions);
    }
    catch (error) {
        console.error("Error getting POS transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Get sales summary
exports.partnerPosRouter.get("/summary", isPartner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get query parameters for date filtering
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        // Get partner ID
        const [partner] = yield db_1.db.select().from(schema_1.partners).where((0, drizzle_orm_1.eq)(schema_1.partners.userId, req.user.id));
        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }
        // Get summary
        const summary = yield pos_service_1.posService.getPartnerSalesSummary(partner.id, startDate, endDate);
        return res.json(summary);
    }
    catch (error) {
        console.error("Error getting POS summary:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
