import { useMemo } from "react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentStatsProps {
  title?: string;
  description?: string;
  documents: any[] | undefined;
  className?: string;
}

export function DocumentStats({ 
  title = "Estado de Documentos", 
  description = "Distribución por estado de documentos",
  documents,
  className = "" 
}: DocumentStatsProps) {
  
  const statusColors = {
    "pending": "#f59e0b",    // amber-500
    "validated": "#3b82f6",  // blue-500
    "signed": "#10b981",     // emerald-500
    "rejected": "#ef4444",   // red-500
    "other": "#6b7280"       // gray-500
  };

  const statusLabels = {
    "pending": "Pendientes",
    "validated": "Validados",
    "signed": "Firmados",
    "rejected": "Rechazados",
    "other": "Otros"
  };

  // Procesar los datos para el gráfico
  const chartData = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [
        { name: "Sin datos", value: 1, status: "other" }
      ];
    }

    const statusCounts = documents.reduce((acc, doc) => {
      const status = doc.status || "other";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      status: status
    }));
  }, [documents]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, status }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.status] || statusColors.other} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} documentos`, '']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal"
                iconType="circle"
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}