import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StepProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface StepsProps {
  currentStep: number;
  className?: string;
  children: React.ReactNode;
}

const Steps = ({ currentStep, className, children }: StepsProps) => {
  // Count total steps
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  return (
    <div className={cn("flex w-full", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: index === currentStep,
            isCompleted: index < currentStep,
            isLastStep: index === totalSteps - 1,
            stepNumber: index + 1,
          });
        }
        return child;
      })}
    </div>
  );
};

const Step = ({ 
  title, 
  description, 
  icon: Icon, 
  isActive = false,
  isCompleted = false,
  isLastStep = false,
  stepNumber
}: StepProps & { 
  isLastStep?: boolean;
  stepNumber?: number;
}) => {
  return (
    <div className="flex items-center flex-1">
      {/* Step connector */}
      <div className="flex flex-col items-center relative">
        {/* Circle */}
        <div
          className={cn(
            "rounded-full h-8 w-8 flex items-center justify-center z-10",
            isActive ? "bg-[#2d219b] text-white" : 
            isCompleted ? "bg-[#2d219b] text-white" : 
            "bg-gray-200 text-gray-500"
          )}
        >
          {Icon ? <Icon className="h-4 w-4" /> : <span>{stepNumber}</span>}
        </div>
        
        {/* Title */}
        <div className="text-xs font-medium mt-1 text-center">
          <div className={cn(
            isActive ? "text-gray-900" : 
            isCompleted ? "text-gray-900" : 
            "text-gray-500"
          )}>
            {title}
          </div>
          {description && (
            <div className="text-xs text-gray-500 mt-0.5">
              {description}
            </div>
          )}
        </div>
        
        {/* Connecting line */}
        {!isLastStep && (
          <div 
            className={cn(
              "absolute top-4 h-0.5 w-[calc(100%+1rem)] -right-[0.5rem] -translate-y-1/2",
              isCompleted ? "bg-[#2d219b]" : "bg-gray-200"
            )}
          />
        )}
      </div>
    </div>
  );
};

export { Steps, Step };