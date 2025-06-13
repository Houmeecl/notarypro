import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

type TourOption = {
  id: string;
  label: string;
  description: string;
  requiredRoute?: string;
};

const HelpButton = () => {
  const { startTour, resetTours, completedTours } = useOnboarding();
  const { toast } = useToast();
  const [location] = useLocation();

  // Definir los tours disponibles por ruta
  const availableTours: TourOption[] = [
    {
      id: 'welcome',
      label: 'Tutorial de bienvenida',
      description: 'Aprende las funciones básicas de la plataforma'
    },
    {
      id: 'document-creation',
      label: 'Crear documentos',
      description: 'Aprende a crear y gestionar documentos',
      requiredRoute: '/document-categories'
    },
    {
      id: 'certification-process',
      label: 'Proceso de certificación',
      description: 'Aprende sobre el proceso de certificación',
      requiredRoute: '/document-sign'
    }
  ];

  // Filtrar tours según la ruta actual
  const availableToursForRoute = availableTours.filter(tour => 
    !tour.requiredRoute || location.includes(tour.requiredRoute)
  );

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
  };

  const handleResetTours = () => {
    resetTours();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full w-10 h-10 fixed bottom-4 right-4 shadow-md bg-white z-40">
          <HelpCircle className="h-6 w-6 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tutoriales interactivos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableToursForRoute.length === 0 ? (
          <DropdownMenuItem disabled>
            No hay tutoriales disponibles para esta página
          </DropdownMenuItem>
        ) : (
          availableToursForRoute.map((tour) => (
            <DropdownMenuItem
              key={tour.id}
              onClick={() => handleStartTour(tour.id)}
              className="flex flex-col items-start"
            >
              <span className="font-medium">{tour.label}</span>
              <span className="text-xs text-gray-500">{tour.description}</span>
              {completedTours.includes(tour.id) && (
                <span className="text-xs text-green-600 mt-1">✓ Completado</span>
              )}
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleResetTours}>
          Reiniciar todos los tutoriales
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HelpButton;