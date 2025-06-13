import React from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  to?: string;
  label?: string;
  variant?: 'default' | 'link' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  useHistoryBack?: boolean;
}

export function BackButton({
  to = '..',
  label = 'Volver',
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  useHistoryBack = false,
  className,
  ...props
}: BackButtonProps) {
  const [location] = useLocation();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (useHistoryBack) {
      e.preventDefault();
      window.history.back();
    }
  };

  return (
    <div className={cn("mb-4", className)} {...props}>
      {useHistoryBack ? (
        <Button
          variant={variant as any}
          size={size as any}
          onClick={handleClick}
          className="flex items-center gap-1"
        >
          {showIcon && <ChevronLeft className="h-4 w-4" />}
          <span>{label}</span>
        </Button>
      ) : (
        <Link href={to}>
          <Button
            variant={variant as any}
            size={size as any}
            className="flex items-center gap-1"
          >
            {showIcon && <ChevronLeft className="h-4 w-4" />}
            <span>{label}</span>
          </Button>
        </Link>
      )}
    </div>
  );
}