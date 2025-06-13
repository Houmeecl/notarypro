import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityTimelineProps {
  title?: string;
  description?: string;
  data: any[] | undefined;
  className?: string;
  period?: "daily" | "weekly" | "monthly";
}

export function ActivityTimeline({
  title = "Actividad Reciente",
  description = "Documentos procesados en el tiempo",
  data = [],
  className = "",
  period = "daily"
}: ActivityTimelineProps) {
  
  // Procesar los datos para el gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Devolver datos de muestra si no hay datos
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
          documentos: 0,
          firmados: 0,
          certificados: 0
        };
      });
      return last7Days;
    }

    // Con datos reales, procesar según el período
    if (period === "daily") {
      // Agrupar por día (formato: "lun 15")
      const last7Days = {};
      
      // Inicializar últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        last7Days[dateKey] = { documentos: 0, firmados: 0, certificados: 0 };
      }
      
      // Contabilizar documentos
      data.forEach(doc => {
        const date = new Date(doc.createdAt);
        if (date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          const dateKey = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
          if (last7Days[dateKey]) {
            last7Days[dateKey].documentos += 1;
            
            if (doc.status === "signed") {
              last7Days[dateKey].firmados += 1;
            }
            
            if (doc.status === "validated") {
              last7Days[dateKey].certificados += 1;
            }
          }
        }
      });
      
      return Object.entries(last7Days).map(([date, counts]) => ({
        date,
        ...counts
      }));
    } else if (period === "monthly") {
      // Agrupar por mes (formato: "ene", "feb", etc.)
      const lastMonths = {};
      
      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const dateKey = date.toLocaleDateString('es-ES', { month: 'short' });
        lastMonths[dateKey] = { documentos: 0, firmados: 0, certificados: 0 };
      }
      
      // Contabilizar documentos
      data.forEach(doc => {
        const date = new Date(doc.createdAt);
        if (date >= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)) {
          const dateKey = date.toLocaleDateString('es-ES', { month: 'short' });
          if (lastMonths[dateKey]) {
            lastMonths[dateKey].documentos += 1;
            
            if (doc.status === "signed") {
              lastMonths[dateKey].firmados += 1;
            }
            
            if (doc.status === "validated") {
              lastMonths[dateKey].certificados += 1;
            }
          }
        }
      });
      
      return Object.entries(lastMonths).map(([date, counts]) => ({
        date,
        ...counts
      }));
    }

    return [];
  }, [data, period]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="documentos" name="Documentos" fill="#60a5fa" />
              <Bar dataKey="firmados" name="Firmados" fill="#34d399" />
              <Bar dataKey="certificados" name="Certificados" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}