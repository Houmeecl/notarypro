import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, ArrowLeft, FileCheck, AlertTriangle, Download, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Contract {
  id: string;
  name: string;
  filename: string;
}

interface ContractField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

const ContratosPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractFields, setContractFields] = useState<ContractField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContract, setGeneratedContract] = useState<{url: string, code: string} | null>(null);
  const [activeStep, setActiveStep] = useState<'select' | 'form' | 'preview'>('select');
  
  // Cargar contratos disponibles
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/contracts');
        
        if (!response.ok) {
          throw new Error('Error al cargar contratos');
        }
        
        const data = await response.json();
        setContracts(data.contratos);
      } catch (error) {
        console.error('Error al cargar contratos:', error);
        setError('No se pudieron cargar los contratos disponibles');
        toast({
          title: "Error",
          description: "No se pudieron cargar los contratos disponibles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, [toast]);
  
  // Cargar campos del contrato cuando se selecciona uno
  useEffect(() => {
    if (!selectedContract) return;
    
    const fetchContractFields = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/contracts/${selectedContract.id}/fields`);
        
        if (!response.ok) {
          throw new Error('Error al cargar campos del contrato');
        }
        
        const data = await response.json();
        setContractFields(data.fields);
        
        // Inicializar los valores del formulario
        const initialValues: Record<string, string> = {};
        data.fields.forEach((field: ContractField) => {
          initialValues[field.name] = field.type === 'date' ? new Date().toISOString().split('T')[0] : '';
        });
        setFormValues(initialValues);
      } catch (error) {
        console.error('Error al cargar campos del contrato:', error);
        setError('No se pudieron cargar los campos del contrato');
        toast({
          title: "Error",
          description: "No se pudieron cargar los campos del contrato",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractFields();
  }, [selectedContract, toast]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  // Seleccionar un contrato
  const handleContractSelect = (contract: Contract) => {
    setSelectedContract(contract);
    setActiveStep('form');
    setGeneratedContract(null);
  };
  
  // Generar contrato
  const handleGenerateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar campos requeridos
    const missingFields = contractFields
      .filter(field => field.required && !formValues[field.name])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      setError(`Por favor complete los siguientes campos: ${missingFields.join(', ')}`);
      toast({
        title: "Campos incompletos",
        description: `Por favor complete los campos requeridos`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contracts/${selectedContract?.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      if (!response.ok) {
        throw new Error('Error al generar contrato');
      }
      
      const data = await response.json();
      
      setGeneratedContract({
        url: data.contractUrl,
        code: data.verificationCode
      });
      
      setActiveStep('preview');
      
      toast({
        title: "Contrato generado",
        description: "El contrato se ha generado correctamente",
      });
    } catch (error) {
      console.error('Error al generar contrato:', error);
      setError('No se pudo generar el contrato');
      toast({
        title: "Error",
        description: "No se pudo generar el contrato",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Volver a la página anterior
  const handleBack = () => {
    if (activeStep === 'form') {
      setActiveStep('select');
      setSelectedContract(null);
    } else if (activeStep === 'preview') {
      setActiveStep('form');
    }
  };
  
  // Renderizar la lista de contratos disponibles
  const renderContractList = () => {
    if (loading && contracts.length === 0) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2d219b]" />
        </div>
      );
    }
    
    if (contracts.length === 0) {
      return (
        <div className="text-center p-8">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No hay contratos disponibles</h3>
          <p className="text-gray-500 mt-2">No se encontraron plantillas de contratos en el sistema.</p>
        </div>
      );
    }
    
    return (
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {contracts.map(contract => (
          <Card 
            key={contract.id} 
            className="hover:border-[#2d219b] cursor-pointer transition-all"
            onClick={() => handleContractSelect(contract)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#2d219b]" />
                {contract.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Plantilla de contrato oficial validada según la Ley 19.799
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Seleccionar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Renderizar el formulario de contrato
  const renderContractForm = () => {
    if (!selectedContract) return null;
    
    if (loading && contractFields.length === 0) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2d219b]" />
        </div>
      );
    }
    
    return (
      <form onSubmit={handleGenerateContract} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contractFields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'date' ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={formValues[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                />
              ) : field.type === 'number' ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={formValues[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={formValues[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="mr-2 h-4 w-4" />
            )}
            Generar Contrato
          </Button>
        </div>
      </form>
    );
  };
  
  // Renderizar la vista previa del contrato generado
  const renderContractPreview = () => {
    if (!generatedContract) return null;
    
    return (
      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-800 font-medium flex items-center mb-2">
            <FileCheck className="h-5 w-5 mr-2 text-green-600" />
            Contrato generado correctamente
          </h3>
          <p className="text-green-700 text-sm">
            El contrato ha sido generado con el código de verificación: <span className="font-bold">{generatedContract.code}</span>
          </p>
        </div>
        
        <div className="aspect-video bg-gray-100 rounded-lg mb-6 overflow-hidden">
          <iframe
            src={generatedContract.url}
            className="w-full h-full border-0"
            title="Vista previa del contrato"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href={generatedContract.url}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver Contrato
          </a>
          
          <a
            href={generatedContract.url}
            download={`Contrato_${generatedContract.code}.html`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar Contrato
          </a>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al formulario
          </Button>
          
          <Button onClick={() => {
            setSelectedContract(null);
            setGeneratedContract(null);
            setActiveStep('select');
          }}>
            Crear nuevo contrato
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-[#2d219b]">Sistema de Contratos Digitales</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow">
          <CardHeader className="bg-gradient-to-r from-[#2d219b]/10 to-[#2d219b]/5">
            <CardTitle>
              {activeStep === 'select' ? 'Seleccione un Contrato' : 
               activeStep === 'form' ? `Formulario: ${selectedContract?.name}` : 
               'Vista Previa del Contrato'}
            </CardTitle>
            <CardDescription>
              {activeStep === 'select' ? 'Elija el tipo de contrato que desea generar' : 
               activeStep === 'form' ? 'Complete los datos para generar el contrato' : 
               'Revise y descargue su contrato generado'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            {activeStep === 'select' && renderContractList()}
            {activeStep === 'form' && renderContractForm()}
            {activeStep === 'preview' && renderContractPreview()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContratosPage;