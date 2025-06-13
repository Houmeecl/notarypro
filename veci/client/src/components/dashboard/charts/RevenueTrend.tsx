import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueTrendProps {
  title?: string;
  description?: string;
  data: Array<{
    name: string;
    ingresos: number;
    gastos?: number;
    target?: number;
  }>;
  showTarget?: boolean;
  className?: string;
}

export function RevenueTrend({
  title = "Tendencia de Ingresos",
  description = "Evolución de ingresos en el tiempo",
  data = [],
  showTarget = true,
  className = ""
}: RevenueTrendProps) {
  // Calcular el promedio para la línea de referencia
  const average = data.reduce((sum, entry) => sum + entry.ingresos, 0) / Math.max(1, data.length);

  // Formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={formatCurrency}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), '']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                name="Ingresos" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }}
              />
              {data[0]?.gastos !== undefined && (
                <Line 
                  type="monotone" 
                  dataKey="gastos" 
                  name="Gastos" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              )}
              {showTarget && data[0]?.target !== undefined && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Objetivo" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false} 
                />
              )}
              <ReferenceLine 
                y={average} 
                stroke="#6b7280" 
                strokeDasharray="3 3" 
                label={{
                  value: 'Promedio',
                  position: 'right',
                  fill: '#6b7280',
                  fontSize: 12
                }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}