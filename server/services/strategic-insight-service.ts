import { getUserActivityStats, getDocumentStats, getRevenueStats } from "../db";

export interface Insight {
  title: string;
  description: string;
}

export interface StrategicInsights {
  generatedAt: string;
  metrics: {
    users: Awaited<ReturnType<typeof getUserActivityStats>>;
    documents: Awaited<ReturnType<typeof getDocumentStats>>;
    revenue: Awaited<ReturnType<typeof getRevenueStats>>;
  };
  insights: Insight[];
}

export async function generateStrategicInsights(): Promise<StrategicInsights> {
  const [users, documents, revenue] = await Promise.all([
    getUserActivityStats(),
    getDocumentStats(),
    getRevenueStats()
  ]);

  const insights: Insight[] = [];

  if (users.newUsersThisWeek < 5) {
    insights.push({
      title: "Baja captación de usuarios",
      description:
        "Se registraron menos de 5 usuarios nuevos esta semana. Considera campañas de marketing o programas de referidos para aumentar el registro."
    });
  } else {
    insights.push({
      title: "Crecimiento de usuarios",
      description:
        `Se registraron ${users.newUsersThisWeek} usuarios nuevos esta semana. Continúa con las acciones de adquisición.`
    });
  }

  const pending = documents.documentsByStatus?.pending || 0;
  if (pending > 50) {
    insights.push({
      title: "Documentos pendientes",
      description:
        `Existen ${pending} documentos pendientes. Revisa la disponibilidad de certificadores y ajusta la carga de trabajo.`
    });
  }

  if (revenue.revenueThisMonth < revenue.revenueThisWeek * 4) {
    insights.push({
      title: "Ingresos por debajo de lo proyectado",
      description:
        "Los ingresos de este mes podrían estar por debajo de las expectativas. Evalúa nuevas estrategias comerciales o revisa la estructura de precios."
    });
  } else {
    insights.push({
      title: "Ingresos en línea",
      description: "Los ingresos de este mes se mantienen acorde a lo planificado." 
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    metrics: { users, documents, revenue },
    insights
  };
}
