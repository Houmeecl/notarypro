import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UploadCloud, 
  File, 
  X, 
  Check, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DocumentUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/documents", formData);
      return await res.json();
    },
    onSuccess: () => {
      setFile(null);
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Documento subido con éxito",
        description: "Tu documento ha sido cargado y está listo para ser firmado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al subir el documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileChange(droppedFile);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    // Check if file is PDF or Word
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Formato no soportado",
        description: "Por favor, sube un documento en formato PDF o Word (.doc, .docx).",
        variant: "destructive",
      });
      return;
    }
    
    // Check if file size is less than 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Try to set title from filename (remove extension)
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
    setTitle(fileName);
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No hay documento",
        description: "Por favor, selecciona un documento para subir.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Título requerido",
        description: "Por favor, ingresa un título para el documento.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", title);
    
    uploadMutation.mutate(formData);
  };

  const handleBrowseFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileChange(target.files[0]);
      }
    };
    input.click();
  };

  const removeFile = () => {
    setFile(null);
    setTitle("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subir Documento</CardTitle>
        <CardDescription>
          Sube el documento que necesitas firmar o certificar. Formatos soportados: PDF, Word (.doc, .docx)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <UploadCloud className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Arrastra y suelta tu documento aquí
                </h3>
                <p className="text-sm text-gray-500">
                  o{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline focus:outline-none"
                    onClick={handleBrowseFiles}
                  >
                    haz clic para explorar
                  </button>
                </p>
              </div>
              <p className="text-xs text-gray-500">
                PDF o Word, hasta 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded">
                  <File className="h-6 w-6 text-gray-500" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título del documento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa un título descriptivo"
              />
            </div>
          </div>
        )}

        {uploadMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ocurrió un error al subir el documento. Por favor, inténtalo de nuevo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending || !title.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Subir Documento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
