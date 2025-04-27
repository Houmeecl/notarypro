import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart2,
  Brain,
  Calendar,
  ChevronRight,
  Compass,
  Copy,
  Cpu,
  Download,
  FileText,
  LineChart,
  Map,
  MessageSquare,
  Settings,
  Sparkles,
  Target,
  RefreshCw,
  TrendingUp,
  Zap,
  Globe,
  Eye,
  Star,
  Plus,
  Filter,
  Mail
} from "lucide-react";

// Colores para gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];

const AdminAIStrategy = () => {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("business");
  const [activeTab, setActiveTab] = useState("insights");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiModel, setAiModel] = useState("gpt-4o");
  const [analysisDepth, setAnalysisDepth] = useState(75);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const { toast } = useToast();

  // Consulta para obtener datos de análisis de IA
  const { data: aiAnalysis, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/ai-analysis", selectedAnalysisType],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/ai-analysis?type=${selectedAnalysisType}`);
      if (!response.ok) {
        throw new Error("Error al obtener el análisis de IA");
      }
      return await response.json();
    },
  });

  // Función para generar un nuevo análisis
  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/admin/ai-analysis/generate", {
        analysisType: selectedAnalysisType,
        model: aiModel,
        depth: analysisDepth,
        includeRecommendations,
      });

      if (!response.ok) {
        throw new Error("Error al generar el análisis");
      }

      toast({
        title: "Análisis generado",
        description: "El análisis de IA se ha generado correctamente",
      });

      // Actualizar los datos
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al generar el análisis",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para copiar texto al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado al portapapeles",
      description: "El texto ha sido copiado correctamente",
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP"
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando análisis de IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar el análisis</h2>
          <p className="text-gray-600 mb-4">
            No se pudo cargar el análisis de IA. Por favor, intente nuevamente.
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agente IA Estratégico</h1>
          <p className="text-gray-500 mt-1">
            Análisis inteligente de datos y recomendaciones estratégicas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "settings" ? "insights" : "settings")}>
            {activeTab === "settings" ? (
              <>
                <Cpu className="h-4 w-4 mr-2" />
                Ver Análisis
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </>
            )}
          </Button>
          <Button 
            size="sm" 
            onClick={generateAnalysis}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Nuevo Análisis
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="md:col-span-3">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Panel de Control IA Estratégica
                </CardTitle>
                <CardDescription>
                  Seleccione el tipo de análisis para generar insights estratégicos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedAnalysisType === "business" ? "default" : "outline"}
                    onClick={() => setSelectedAnalysisType("business")}
                    className="flex items-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Negocio
                  </Button>
                  <Button
                    variant={selectedAnalysisType === "market" ? "default" : "outline"}
                    onClick={() => setSelectedAnalysisType("market")}
                    className="flex items-center"
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Mercado
                  </Button>
                  <Button
                    variant={selectedAnalysisType === "expansion" ? "default" : "outline"}
                    onClick={() => setSelectedAnalysisType("expansion")}
                    className="flex items-center"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Expansión
                  </Button>
                  <Button
                    variant={selectedAnalysisType === "pricing" ? "default" : "outline"}
                    onClick={() => setSelectedAnalysisType("pricing")}
                    className="flex items-center"
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Precios
                  </Button>
                  <Button
                    variant={selectedAnalysisType === "marketing" ? "default" : "outline"}
                    onClick={() => setSelectedAnalysisType("marketing")}
                    className="flex items-center"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Marketing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {aiAnalysis?.keyMetrics?.map((metric: any, index: number) => (
              <Card key={index} className={`overflow-hidden ${metric.trend === "up" ? "border-green-200" : metric.trend === "down" ? "border-red-200" : "border-gray-200"}`}>
                <CardHeader className={`pb-2 ${metric.trend === "up" ? "bg-green-50" : metric.trend === "down" ? "bg-red-50" : "bg-gray-50"}`}>
                  <CardTitle className="text-base flex items-center">
                    {metric.icon === "trending_up" ? (
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    ) : metric.icon === "trending_down" ? (
                      <ArrowDown className="h-4 w-4 mr-2 text-red-600" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2 text-gray-600" />
                    )}
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {metric.isMonetary ? formatCurrency(metric.value) : metric.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {metric.comparison}
                      </p>
                    </div>
                    <div className={`text-sm font-medium flex items-center ${
                      metric.trend === "up" 
                        ? "text-green-600" 
                        : metric.trend === "down" 
                          ? "text-red-600" 
                          : "text-gray-600"
                    }`}>
                      {metric.trend === "up" ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : metric.trend === "down" ? (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      ) : null}
                      {metric.trendValue}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Análisis Principal */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Análisis Estratégico {aiAnalysis?.analysisTitle}
                </CardTitle>
                <CardDescription>
                  Generado el {aiAnalysis?.generatedAt} • Modelo: {aiAnalysis?.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Resumen Ejecutivo</h3>
                  <p className="text-sm text-gray-600">
                    {aiAnalysis?.executiveSummary}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyToClipboard(aiAnalysis?.executiveSummary)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hallazgos Clave</h3>
                  <div className="space-y-3">
                    {aiAnalysis?.keyFindings?.map((finding: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className={`p-1 rounded-full mr-2 mt-0.5 ${
                          finding.type === "positive" 
                            ? "bg-green-100" 
                            : finding.type === "negative" 
                              ? "bg-red-100" 
                              : finding.type === "neutral" 
                                ? "bg-blue-100" 
                                : "bg-gray-100"
                        }`}>
                          {finding.type === "positive" ? (
                            <ArrowUp className={`h-3 w-3 text-green-600`} />
                          ) : finding.type === "negative" ? (
                            <ArrowDown className={`h-3 w-3 text-red-600`} />
                          ) : (
                            <ArrowRight className={`h-3 w-3 text-blue-600`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{finding.title}</p>
                          <p className="text-xs text-gray-600">{finding.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Recomendaciones Estratégicas</h3>
                  <div className="space-y-3">
                    {aiAnalysis?.recommendations?.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-md p-3">
                        <h4 className={`text-sm font-medium flex items-center ${
                          rec.priority === "high" 
                            ? "text-red-700" 
                            : rec.priority === "medium" 
                              ? "text-amber-700" 
                              : "text-blue-700"
                        }`}>
                          {rec.priority === "high" ? (
                            <Zap className="h-4 w-4 mr-1" />
                          ) : rec.priority === "medium" ? (
                            <Target className="h-4 w-4 mr-1" />
                          ) : (
                            <Compass className="h-4 w-4 mr-1" />
                          )}
                          {rec.title}
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              rec.priority === "high" 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : rec.priority === "medium" 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"} prioridad
                          </Badge>
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Plazo estimado: {rec.timeframe}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7">
                            <Plus className="h-3 w-3 mr-1" />
                            Añadir a plan
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar análisis
                </Button>
                <Button size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por correo
                </Button>
              </CardFooter>
            </Card>

            {/* Oportunidades de Expansión */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Map className="h-4 w-4 mr-2 text-primary" />
                  Oportunidades de Expansión
                </CardTitle>
                <CardDescription>
                  Sugerencias de crecimiento geográfico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAnalysisType === "expansion" ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Top regiones para expansión</h3>
                      {aiAnalysis?.expansionOpportunities?.regions?.map((region: any, index: number) => (
                        <div key={index} className="flex items-center mb-2">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{region.name}</span>
                              <span className="text-xs font-medium">{region.score}%</span>
                            </div>
                            <Progress value={region.score} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Indicadores de demanda</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={aiAnalysis?.expansionOpportunities?.demandByRegion || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" name="Demanda" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Map className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-2">Seleccione el análisis de "Expansión" para ver oportunidades de crecimiento geográfico</p>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setSelectedAnalysisType("expansion")}
                    >
                      Cambiar a Expansión
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="link" size="sm" className="ml-auto">
                  Ver informe completo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Gráficos de Predicción */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Predicción de Demanda
                </CardTitle>
                <CardDescription>
                  Proyección para los próximos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {aiAnalysis?.demandForecast ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiAnalysis.demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} documentos`, "Demanda"]} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Documentos Estimados"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upperBound" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3}
                        name="Límite Superior"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lowerBound" 
                        stroke="#ffc658" 
                        fill="#ffc658" 
                        fillOpacity={0.3}
                        name="Límite Inferior"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No hay datos de predicción disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Análisis de Precios
                </CardTitle>
                <CardDescription>
                  Sensibilidad de precios y punto óptimo
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {selectedAnalysisType === "pricing" && aiAnalysis?.pricingAnalysis ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiAnalysis.pricingAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="price" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [
                        name === "revenue" ? formatCurrency(Number(value)) : `${value}%`,
                        name === "revenue" ? "Ingresos Est." : "Conversión Est."
                      ]} />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="revenue" 
                        fill="#8884d8" 
                        name="Ingresos Est." 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="conversion" 
                        fill="#82ca9d" 
                        name="Conversión Est." 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <BarChart2 className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm mb-2">
                      {selectedAnalysisType !== "pricing" 
                        ? "Seleccione el análisis de 'Precios' para ver este gráfico" 
                        : "No hay datos de análisis de precios disponibles"}
                    </p>
                    {selectedAnalysisType !== "pricing" && (
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => setSelectedAnalysisType("pricing")}
                      >
                        Cambiar a Precios
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Análisis de Marketing */}
          {selectedAnalysisType === "marketing" && aiAnalysis?.marketingAnalysis && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Estrategias de Marketing
                </CardTitle>
                <CardDescription>
                  Recomendaciones para campañas y contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Audiencias Objetivo</h3>
                    {aiAnalysis.marketingAnalysis.targetAudiences.map((audience: any, index: number) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded-full mr-2">
                            <Eye className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{audience.name}</h4>
                            <p className="text-xs text-gray-500">{audience.description}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Potencial</span>
                            <span className="text-xs font-medium">{audience.potential}%</span>
                          </div>
                          <Progress value={audience.potential} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Canales Recomendados</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={aiAnalysis.marketingAnalysis.channels}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {aiAnalysis.marketingAnalysis.channels.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Efectividad"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2">
                      {aiAnalysis.marketingAnalysis.channels.slice(0, 4).map((channel: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-1" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Contenido Sugerido</h3>
                    {aiAnalysis.marketingAnalysis.contentIdeas.map((idea: any, index: number) => (
                      <div key={index} className="border rounded-md p-3">
                        <h4 className="font-medium text-sm flex items-center">
                          <Star className="h-3 w-3 mr-1 text-amber-500" />
                          {idea.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{idea.description}</p>
                        <div className="mt-2 flex gap-1">
                          {idea.tags.map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar por canal
                </Button>
                <Button size="sm">
                  Crear campaña
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Mensajes Generados por IA */}
          {aiAnalysis?.generatedMessages && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Mensajes Generados por IA
                </CardTitle>
                <CardDescription>
                  Contenido automatizado para comunicaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="email">
                  <TabsList className="mb-4">
                    <TabsTrigger value="email">Emails de Recuperación</TabsTrigger>
                    <TabsTrigger value="notification">Notificaciones</TabsTrigger>
                    <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email" className="space-y-4">
                    {aiAnalysis.generatedMessages.emails.map((email: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{email.subject}</h3>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(email.subject + "\n\n" + email.body)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          <p className="whitespace-pre-line">{email.body}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline">{email.type}</Badge>
                          <p className="text-xs text-gray-500">Tasa de apertura estimada: {email.openRate}%</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="notification">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Seleccione "Emails de Recuperación" para ver mensajes generados</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="social">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Seleccione "Emails de Recuperación" para ver mensajes generados</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Crear plantillas
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Configuración del Agente IA
              </CardTitle>
              <CardDescription>
                Personalice los parámetros del análisis inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Modelo de IA</h3>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  GPT-4o ofrece el análisis más avanzado y preciso, con mejor comprensión contextual y razonamiento.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Profundidad del análisis</h3>
                  <span className="text-sm text-primary font-medium">{analysisDepth}%</span>
                </div>
                <Slider
                  value={[analysisDepth]}
                  min={25}
                  max={100}
                  step={25}
                  onValueChange={(value) => setAnalysisDepth(value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Básico</span>
                  <span>Estándar</span>
                  <span>Detallado</span>
                  <span>Extenso</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Mayor profundidad incrementa el detalle del análisis, pero también el tiempo de generación.
                </p>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Incluir recomendaciones</h3>
                    <p className="text-xs text-gray-500">
                      Genera sugerencias prácticas basadas en el análisis
                    </p>
                  </div>
                  <Switch 
                    checked={includeRecommendations}
                    onCheckedChange={setIncludeRecommendations}
                  />
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-medium">Fuentes de datos a incluir</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="data-transactions" defaultChecked />
                    <label htmlFor="data-transactions" className="text-sm cursor-pointer">
                      Datos de transacciones
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-users" defaultChecked />
                    <label htmlFor="data-users" className="text-sm cursor-pointer">
                      Datos de usuarios
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-documents" defaultChecked />
                    <label htmlFor="data-documents" className="text-sm cursor-pointer">
                      Estadísticas de documentos
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-market" defaultChecked />
                    <label htmlFor="data-market" className="text-sm cursor-pointer">
                      Datos de mercado
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-certifiers" defaultChecked />
                    <label htmlFor="data-certifiers" className="text-sm cursor-pointer">
                      Datos de certificadores
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-partners" defaultChecked />
                    <label htmlFor="data-partners" className="text-sm cursor-pointer">
                      Datos de socios comerciales
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-medium">Contexto adicional</h3>
                <Textarea 
                  placeholder="Añada contexto adicional o instrucciones específicas para el análisis..." 
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  Añada información específica, objetivos de negocio, o preguntas concretas para personalizar el análisis.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                setAiModel("gpt-4o");
                setAnalysisDepth(75);
                setIncludeRecommendations(true);
              }}>
                Restaurar valores predeterminados
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setActiveTab("insights");
                  toast({
                    title: "Configuración guardada",
                    description: "Los cambios han sido aplicados correctamente",
                  });
                }}
              >
                Guardar configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAIStrategy;