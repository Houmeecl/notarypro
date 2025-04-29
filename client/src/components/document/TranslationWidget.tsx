import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages, Check } from "lucide-react";

interface TranslationWidgetProps {
  content: string;
  onTranslationComplete: (translatedContent: string) => void;
  showOriginalButton?: boolean;
}

export default function TranslationWidget({
  content,
  onTranslationComplete,
  showOriginalButton = true,
}: TranslationWidgetProps) {
  const { toast } = useToast();
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [isOriginalVisible, setIsOriginalVisible] = useState<boolean>(true);
  const [originalContent] = useState<string>(content);
  const [translatedContent, setTranslatedContent] = useState<string>("");

  // Obtener idiomas soportados
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([
    { code: "es", name: "Español" },
    { code: "en", name: "Inglés" },
    { code: "fr", name: "Francés" },
    { code: "pt", name: "Portugués" },
    { code: "de", name: "Alemán" },
    { code: "it", name: "Italiano" },
    { code: "zh", name: "Chino" },
    { code: "ja", name: "Japonés" },
    { code: "ru", name: "Ruso" },
  ]);

  // Mutación para traducir el texto
  const translateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/translation/translate-document", {
        content: originalContent,
        targetLanguage,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.translatedContent) {
        setTranslatedContent(data.translatedContent);
        setIsOriginalVisible(false);
        onTranslationComplete(data.translatedContent);
        
        toast({
          title: "Documento traducido",
          description: `Documento traducido exitosamente al ${getLanguageName(targetLanguage)}`,
          variant: "default",
        });
      } else if (data.error) {
        toast({
          title: "Error al traducir",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al traducir",
        description: error.message || "Ocurrió un error al traducir el documento",
        variant: "destructive",
      });
    },
  });

  // Buscar el nombre del idioma por su código
  const getLanguageName = (code: string): string => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  // Manejar el cambio de idioma
  const handleLanguageChange = (value: string) => {
    setTargetLanguage(value);
  };

  // Manejar la traducción
  const handleTranslate = () => {
    if (!originalContent.trim()) {
      toast({
        title: "Error",
        description: "No hay contenido para traducir",
        variant: "destructive",
      });
      return;
    }
    
    translateMutation.mutate();
  };

  // Manejar el cambio entre contenido original y traducido
  const toggleContent = () => {
    setIsOriginalVisible(!isOriginalVisible);
    if (!isOriginalVisible && translatedContent) {
      onTranslationComplete(translatedContent);
    } else {
      onTranslationComplete(originalContent);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-background shadow-sm">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Languages className="mr-2 h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Traducir documento</h3>
          </div>
          
          {showOriginalButton && translatedContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleContent}
              className="text-xs"
            >
              {isOriginalVisible ? "Ver traducción" : "Ver original"}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={targetLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar idioma" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleTranslate} 
            disabled={translateMutation.isPending}
            size="sm"
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduciendo...
              </>
            ) : translatedContent && !isOriginalVisible ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Traducido
              </>
            ) : (
              "Traducir"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}