import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface StepperProps {
  activeStep: number;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

interface StepProps {
  id?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Stepper({ 
  activeStep, 
  children, 
  className,
  orientation = 'horizontal'
}: StepperProps) {
  const childArray = React.Children.toArray(children);
  
  return (
    <div
      className={cn(
        "flex items-center w-full",
        orientation === 'vertical' && "flex-col items-start",
        className
      )}
    >
      {childArray.map((child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isLast = index === childArray.length - 1;
        
        return (
          <div 
            key={child.props.id || index}
            className={cn(
              "flex items-center",
              orientation === 'horizontal' ? "flex-1" : "w-full mb-4",
              !isLast && orientation === 'horizontal' && "mr-2"
            )}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full z-10",
                isCompleted 
                  ? "bg-green-600 text-white" 
                  : isActive 
                    ? "bg-[#2d219b] text-white"
                    : "border-2 border-gray-300 bg-white text-gray-500"
              )}>
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              
              {!isLast && (
                <div className={cn(
                  orientation === 'horizontal' ? "h-1 flex-1 mx-2" : "w-1 h-10 mx-auto my-1",
                  isCompleted ? "bg-green-600" : "bg-gray-300"
                )} />
              )}
            </div>
            
            <div className="flex flex-col ml-2">
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Step({ id, label, className, children }: StepProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        className
      )}
    >
      {label && (
        <span className="text-xs font-medium mt-1">{label}</span>
      )}
      {children}
    </div>
  );
}

export function StepLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function StepDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-xs text-gray-500", className)}>
      {children}
    </span>
  );
}