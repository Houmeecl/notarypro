import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceMetricsProps {
  title?: string;
  description?: string;
  data: Array<{
    nombre: string;
    documentos?: number;
    valoracion?: number;
    tiempo?: number;
    certificaciones?: number;
    completitud?: number;
  }>;
  className?: string;
}

export function PerformanceMetrics({
  title = "Métricas de Rendimiento",
  description = "Evaluación comparativa de métricas clave",
  data = [],
  className = ""
}: PerformanceMetricsProps) {
  // Transformar datos para el gráfico de radar
  const chartData = [
    { subject: 'Documentos', A: data[0]?.documentos || 0, B: data[1]?.documentos || 0, fullMark: 100 },
    { subject: 'Valoración', A: data[0]?.valoracion || 0, B: data[1]?.valoracion || 0, fullMark: 5 },
    { subject: 'Tiempo', A: data[0]?.tiempo || 0, B: data[1]?.tiempo || 0, fullMark: 100 },
    { subject: 'Certificaciones', A: data[0]?.certificaciones || 0, B: data[1]?.certificaciones || 0, fullMark: 100 },
    { subject: 'Completitud', A: data[0]?.completitud || 0, B: data[1]?.completitud || 0, fullMark: 100 },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <Radar
                name={data[0]?.nombre || "Actual"}
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              {data.length > 1 && (
                <Radar
                  name={data[1]?.nombre || "Promedio"}
                  dataKey="B"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.5}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}