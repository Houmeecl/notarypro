import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Pen, 
  Type, 
  RotateCcw, 
  Save, 
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Document } from "@shared/schema";

interface SignatureCanvasProps {
  document: Document;
  onSignatureComplete: () => void;
}

export default function SignatureCanvas({ document, onSignatureComplete }: SignatureCanvasProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const signatureMutation = useMutation({
    mutationFn: async (data: { signatureData: string, type: string }) => {
      const res = await apiRequest("POST", `/api/documents/${document.id}/sign`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Documento firmado con éxito",
        description: "Tu firma ha sido aplicada al documento.",
      });
      onSignatureComplete();
    },
    onError: (error) => {
      toast({
        title: "Error al firmar el documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.lineWidth = 2;
        context.lineCap = "round";
        context.strokeStyle = "#000000";
        setCtx(context);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (!ctx) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on touch devices
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (isDrawing && ctx) {
      ctx.closePath();
      setIsDrawing(false);
      
      // Save the signature as data URL
      const canvas = canvasRef.current;
      if (canvas) {
        setSignatureData(canvas.toDataURL("image/png"));
      }
    }
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData(null);
    }
  };

  const renderTypedSignature = () => {
    if (!ctx || !canvasRef.current) return;
    
    // Clear existing content
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw the typed signature
    if (typedSignature) {
      const canvas = canvasRef.current;
      ctx.font = "italic 36px cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      
      // Save as data URL
      setSignatureData(canvas.toDataURL("image/png"));
    } else {
      setSignatureData(null);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedSignature(e.target.value);
  };

  const handleTypeSubmit = () => {
    renderTypedSignature();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    clearCanvas();
    setTypedSignature("");
    setSignatureData(null);
  };

  const handleSignDocument = () => {
    if (!signatureData) {
      toast({
        title: "Firma requerida",
        description: "Por favor, dibuja o escribe tu firma antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    // Determine if this is a regular or certified signature
    const signatureType = document.status === "validated" ? "advanced" : "simple";
    
    signatureMutation.mutate({
      signatureData,
      type: signatureType
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Firma tu documento</CardTitle>
        <CardDescription>
          {document.status === "validated" 
            ? "Tu identidad ha sido validada. Procede con la firma avanzada." 
            : "Dibuja o escribe tu firma para firmar el documento."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="draw" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">
              <Pen className="h-4 w-4 mr-2" />
              Dibujar firma
            </TabsTrigger>
            <TabsTrigger value="type">
              <Type className="h-4 w-4 mr-2" />
              Escribir firma
            </TabsTrigger>
          </TabsList>
          <TabsContent value="draw" className="pt-4">
            <div className="w-full h-48 bg-gray-50 border rounded-lg">
              <canvas
                ref={canvasRef}
                className="w-full h-full border rounded-lg cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={clearCanvas} 
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Borrar
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="type" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature">Tu firma</Label>
                <Input
                  id="signature"
                  value={typedSignature}
                  onChange={handleTypeChange}
                  placeholder="Escribe tu nombre completo"
                  className="text-center"
                />
              </div>
              <div className="w-full h-32 bg-gray-50 border rounded-lg flex items-center justify-center">
                <span className="text-2xl font-cursive italic">
                  {typedSignature || "Tu firma aparecerá aquí"}
                </span>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleTypeSubmit} 
                  size="sm"
                  disabled={!typedSignature}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar firma
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSignDocument}
          disabled={!signatureData || signatureMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {signatureMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Pen className="mr-2 h-4 w-4" />
              Firmar Documento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
