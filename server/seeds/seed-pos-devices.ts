import { db } from '../db';
import { posDevices } from '@shared/pos-schema';
import { eq } from 'drizzle-orm';

/**
 * Semilla para crear dispositivos POS de ejemplo
 */
export async function seedPosDevices() {
  console.log("Iniciando semilla de dispositivos POS...");
  
  try {
    // Dispositivo POS 1 - Terminal Principal NotaryPro
    const [existingDevice1] = await db.select().from(posDevices).where(
      eq(posDevices.deviceCode, "NP-POS-001")
    );

    if (!existingDevice1) {
      await db.insert(posDevices).values({
        deviceName: "Terminal NotaryPro Principal",
        deviceCode: "NP-POS-001",
        deviceType: "pos",
        deviceModel: "Sunmi T5810",
        location: "Oficina Principal Santiago",
        storeCode: "STORE-001",
        isActive: true,
        isDemo: false,
        notes: "Terminal principal para operaciones NotaryPro"
      });
      console.log("Dispositivo POS NP-POS-001 creado");
    }

    // Dispositivo POS 2 - Terminal Demo
    const [existingDevice2] = await db.select().from(posDevices).where(
      eq(posDevices.deviceCode, "NP-DEMO-001")
    );

    if (!existingDevice2) {
      await db.insert(posDevices).values({
        deviceName: "Terminal Demo NotaryPro",
        deviceCode: "NP-DEMO-001",
        deviceType: "pos",
        deviceModel: "Tablet Android",
        location: "Oficina Demo",
        storeCode: "DEMO-001",
        isActive: true,
        isDemo: true,
        notes: "Terminal de demostración para pruebas"
      });
      console.log("Dispositivo POS NP-DEMO-001 creado");
    }

    // Dispositivo POS 3 - VecinoXpress
    const [existingDevice3] = await db.select().from(posDevices).where(
      eq(posDevices.deviceCode, "VX-POS-001")
    );

    if (!existingDevice3) {
      await db.insert(posDevices).values({
        deviceName: "Terminal VecinoXpress",
        deviceCode: "VX-POS-001",
        deviceType: "pos",
        deviceModel: "Sunmi V2 Pro",
        location: "Punto Vecino Las Condes",
        storeCode: "VX-LC-001",
        isActive: true,
        isDemo: false,
        notes: "Terminal para servicios vecinales Las Condes"
      });
      console.log("Dispositivo POS VX-POS-001 creado");
    }

    // Dispositivo POS 4 - Terminal Móvil
    const [existingDevice4] = await db.select().from(posDevices).where(
      eq(posDevices.deviceCode, "NP-MOBILE-001")
    );

    if (!existingDevice4) {
      await db.insert(posDevices).values({
        deviceName: "Terminal Móvil NotaryPro",
        deviceCode: "NP-MOBILE-001",
        deviceType: "mobile",
        deviceModel: "Samsung Galaxy Tab A8",
        location: "Móvil - Santiago",
        storeCode: "MOBILE-001",
        isActive: true,
        isDemo: false,
        notes: "Terminal móvil para servicios a domicilio"
      });
      console.log("Dispositivo móvil NP-MOBILE-001 creado");
    }

    console.log("✅ Semilla de dispositivos POS completada exitosamente");

  } catch (error) {
    console.error("❌ Error en semilla de dispositivos POS:", error);
    throw error;
  }
}