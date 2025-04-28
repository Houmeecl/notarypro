import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

// Tipos para el contexto del Stepper
type StepperContextValue = {
  activeStep: number;
  orientation: "horizontal" | "vertical";
};

// Crear contexto para compartir el paso activo
const StepperContext = createContext<StepperContextValue | undefined>(undefined);

// Hook para acceder al contexto del Stepper
const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepperContext must be used within a Stepper component");
  }
  return context;
};

// Componente de Step
interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  completed?: boolean;
  disabled?: boolean;
}

// Componente Step para representar cada paso individual
export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ id, className, children, completed, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start",
          className
        )}
        data-id={id}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Step.displayName = "Step";

// Componente StepLabel para renderizar el título del paso
interface StepLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const StepLabel = React.forwardRef<HTMLDivElement, StepLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "font-medium text-sm md:text-base",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StepLabel.displayName = "StepLabel";

// Componente StepDescription para renderizar la descripción del paso
interface StepDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const StepDescription = React.forwardRef<HTMLDivElement, StepDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-xs md:text-sm text-gray-500",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StepDescription.displayName = "StepDescription";

// Componente principal Stepper
interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  orientation?: "horizontal" | "vertical";
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, orientation = "horizontal", className, children, ...props }, ref) => {
    // Filtrar solo los componentes de tipo Step
    const steps = React.Children.toArray(children).filter(
      (step) => React.isValidElement(step) && step.type === Step
    ) as React.ReactElement[];
    
    // Renderizar los pasos con su indicador y línea de conexión
    return (
      <StepperContext.Provider value={{ activeStep, orientation }}>
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row items-center" : "flex-col items-start",
            className
          )}
          {...props}
        >
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isLast = index === steps.length - 1;
            
            const baseStyle = cn(
              "relative",
              orientation === "horizontal" ? "flex-1" : "w-full mb-8"
            );
            
            return (
              <div key={index} className={baseStyle}>
                <div className={cn(
                  "flex",
                  orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start gap-4"
                )}>
                  {/* Indicador del paso (círculo) */}
                  <div className={cn(
                    "flex items-center justify-center rounded-full w-8 h-8 border-2",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isActive ? "border-primary text-primary" : "border-gray-300 text-gray-400"
                  )}>
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Contenido del paso */}
                  <div className={cn(
                    "mt-2",
                    orientation === "horizontal" ? "text-center" : ""
                  )}>
                    {React.cloneElement(step, {
                      completed: isCompleted,
                      active: isActive,
                      disabled: index > activeStep,
                    })}
                  </div>
                  
                  {/* Línea de conexión entre pasos */}
                  {!isLast && (
                    <div className={cn(
                      orientation === "horizontal" 
                        ? "absolute top-4 left-[calc(50%+16px)] right-[calc(50%-16px)] h-[2px]"
                        : "absolute top-8 left-4 h-[calc(100%-32px)] w-[2px]",
                      isCompleted ? "bg-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </StepperContext.Provider>
    );
  }
);
Stepper.displayName = "Stepper";