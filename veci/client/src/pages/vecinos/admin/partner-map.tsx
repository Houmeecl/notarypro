
import React from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import VecinosPartnerMap from "@/components/vecinos/VecinosPartnerMap";

const VecinosPartnerMapPage = () => {
  return (
    <VecinosAdminLayout title="Mapa de Socios">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Distribución Geográfica de Socios</h1>
        <p className="text-gray-600 mb-6">
          Visualiza la ubicación de todos los socios Vecinos Xpress, filtra por tipo de establecimiento
          y accede a información detallada de cada socio.
        </p>
        
        <VecinosPartnerMap />
      </div>
    </VecinosAdminLayout>
  );
};

export default VecinosPartnerMapPage;
