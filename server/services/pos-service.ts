import { db } from "../db";
import {
  partners,
  posTransactions,
  posProviders,
  partnerSales,
  PosTransaction,
  InsertPosTransaction
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { Pool } from 'pg';
import axios from 'axios';

// Define interfaces for the different POS providers
interface PosProvider {
  name: string;
  getTransactions: (apiKey: string, storeId: string, startDate: Date, endDate: Date) => Promise<PosTransaction[]>;
  formatTransaction: (rawTransaction: any) => Partial<InsertPosTransaction>;
}

// TransbankPOS implementation
class TransbankPOS implements PosProvider {
  name = 'transbank';

  async getTransactions(apiKey: string, storeId: string, startDate: Date, endDate: Date): Promise<PosTransaction[]> {
    try {
      const response = await axios.get(`https://api.transbank.cl/v1/pos/transactions`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          storeId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      // Map the raw transactions to our format
      return response.data.transactions.map((transaction: any) => 
        this.formatTransaction(transaction)
      );
    } catch (error) {
      console.error('Error fetching Transbank transactions:', error);
      throw new Error('Failed to fetch Transbank transactions');
    }
  }

  formatTransaction(rawTransaction: any): Partial<InsertPosTransaction> {
    return {
      transactionDate: new Date(rawTransaction.dateTime),
      transactionId: rawTransaction.transactionId,
      posReference: rawTransaction.reference,
      amount: Math.round(parseFloat(rawTransaction.amount) * 100), // Convert to cents
      items: rawTransaction.items || null,
      metadata: {
        cardType: rawTransaction.cardType,
        authCode: rawTransaction.authCode,
        lastFourDigits: rawTransaction.lastFourDigits
      }
    };
  }
}

// FlowPOS implementation
class FlowPOS implements PosProvider {
  name = 'flow';

  async getTransactions(apiKey: string, storeId: string, startDate: Date, endDate: Date): Promise<PosTransaction[]> {
    try {
      const response = await axios.get(`https://api.flow.cl/v1/transactions`, {
        headers: {
          'flowApiKey': apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          storeId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      // Map the raw transactions to our format
      return response.data.items.map((transaction: any) => 
        this.formatTransaction(transaction)
      );
    } catch (error) {
      console.error('Error fetching Flow transactions:', error);
      throw new Error('Failed to fetch Flow transactions');
    }
  }

  formatTransaction(rawTransaction: any): Partial<InsertPosTransaction> {
    return {
      transactionDate: new Date(rawTransaction.date),
      transactionId: rawTransaction.id,
      posReference: rawTransaction.reference,
      amount: Math.round(parseFloat(rawTransaction.amount) * 100), // Convert to cents
      items: rawTransaction.detail || null,
      metadata: {
        paymentMethod: rawTransaction.paymentMethod,
        status: rawTransaction.status,
        commerceOrder: rawTransaction.commerceOrder
      }
    };
  }
}

// KhipuPOS implementation
class KhipuPOS implements PosProvider {
  name = 'khipu';

  async getTransactions(apiKey: string, storeId: string, startDate: Date, endDate: Date): Promise<PosTransaction[]> {
    try {
      const response = await axios.get(`https://api.khipu.com/v1/payments`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          receiverId: storeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      // Map the raw transactions to our format
      return response.data.payments.map((transaction: any) => 
        this.formatTransaction(transaction)
      );
    } catch (error) {
      console.error('Error fetching Khipu transactions:', error);
      throw new Error('Failed to fetch Khipu transactions');
    }
  }

  formatTransaction(rawTransaction: any): Partial<InsertPosTransaction> {
    return {
      transactionDate: new Date(rawTransaction.transaction_date),
      transactionId: rawTransaction.payment_id,
      posReference: rawTransaction.subject,
      amount: Math.round(parseFloat(rawTransaction.amount) * 100), // Convert to cents
      items: null, // Khipu doesn't provide detailed items
      metadata: {
        status: rawTransaction.status,
        currency: rawTransaction.currency,
        payment_method: rawTransaction.payment_method
      }
    };
  }
}

// Factory to get the right POS provider
const getPosProvider = (providerName: string): PosProvider => {
  switch (providerName) {
    case 'transbank':
      return new TransbankPOS();
    case 'flow':
      return new FlowPOS();
    case 'khipu':
      return new KhipuPOS();
    default:
      throw new Error(`Unknown POS provider: ${providerName}`);
  }
};

// Main POS service
export class PosService {
  // Sync sales for a specific partner
  async syncPartnerSales(partnerId: number): Promise<{ 
    success: boolean; 
    message: string; 
    transactionsCount?: number;
    totalAmount?: number;
  }> {
    try {
      // Get partner details
      const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
      
      if (!partner) {
        return { success: false, message: 'Partner not found' };
      }
      
      if (!partner.posIntegrated || !partner.posProvider || !partner.posApiKey || !partner.posStoreId) {
        return { success: false, message: 'Partner does not have POS integration configured' };
      }
      
      // Get the appropriate POS provider
      const posProvider = getPosProvider(partner.posProvider);
      
      // Define date range (last sync to now, or last 7 days if never synced)
      const startDate = partner.lastSyncedAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();
      
      // Get transactions from the POS provider
      const transactions = await posProvider.getTransactions(
        partner.posApiKey,
        partner.posStoreId,
        startDate,
        endDate
      );
      
      if (transactions.length === 0) {
        // Update last synced time even if no transactions
        await db.update(partners)
          .set({ lastSyncedAt: endDate })
          .where(eq(partners.id, partnerId));
          
        return { 
          success: true, 
          message: 'No new transactions found', 
          transactionsCount: 0,
          totalAmount: 0
        };
      }
      
      // Calculate commission based on partner's rate
      const commissionRate = partner.commissionRate || 0.15; // Default to 15%
      
      // Prepare transactions to insert
      const transactionsToInsert = transactions.map(transaction => ({
        ...transaction,
        partnerId,
        commissionRate,
        commissionAmount: Math.round(transaction.amount * commissionRate),
        synchronized: true,
        createdAt: new Date()
      }));
      
      // Insert transactions to database
      await db.insert(posTransactions).values(transactionsToInsert);
      
      // Update partner's last synced time
      await db.update(partners)
        .set({ lastSyncedAt: endDate })
        .where(eq(partners.id, partnerId));
      
      // Calculate totals for response
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      return { 
        success: true, 
        message: `Successfully synced ${transactions.length} transactions`, 
        transactionsCount: transactions.length,
        totalAmount
      };
      
    } catch (error) {
      console.error('Error syncing partner sales:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
  
  // Get all available POS providers
  async getAvailableProviders() {
    return await db.select().from(posProviders).where(eq(posProviders.isActive, true));
  }
  
  // Get transactions for a partner in a date range
  async getPartnerTransactions(partnerId: number, startDate?: Date, endDate?: Date) {
    let query = db.select().from(posTransactions).where(eq(posTransactions.partnerId, partnerId));
    
    if (startDate) {
      query = query.where(gte(posTransactions.transactionDate, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(posTransactions.transactionDate, endDate));
    }
    
    return await query.orderBy(posTransactions.transactionDate);
  }
  
  // Configure POS integration for a partner
  async configurePosIntegration(partnerId: number, posProviderName: string, posApiKey: string, posStoreId: string) {
    // Check if the provider exists and is active
    const [provider] = await db.select().from(posProviders).where(
      and(
        eq(posProviders.name, posProviderName),
        eq(posProviders.isActive, true)
      )
    );
    
    if (!provider) {
      return { success: false, message: 'Invalid or inactive POS provider' };
    }
    
    // Update partner with POS integration details
    await db.update(partners)
      .set({
        posIntegrated: true,
        posProvider: posProviderName,
        posApiKey,
        posStoreId
      })
      .where(eq(partners.id, partnerId));
      
    return { success: true, message: 'POS integration configured successfully' };
  }
  
  // Get POS sales summary for a partner
  async getPartnerSalesSummary(partnerId: number, startDate?: Date, endDate?: Date) {
    // Get transactions
    const transactions = await this.getPartnerTransactions(partnerId, startDate, endDate);
    
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        totalCommission: 0,
        firstTransactionDate: null,
        lastTransactionDate: null
      };
    }
    
    // Calculate summary
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
    
    // Sort by date for first/last transaction
    transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    
    return {
      totalTransactions: transactions.length,
      totalAmount,
      totalCommission,
      firstTransactionDate: transactions[0].transactionDate,
      lastTransactionDate: transactions[transactions.length - 1].transactionDate
    };
  }
}

// Export a singleton instance
export const posService = new PosService();