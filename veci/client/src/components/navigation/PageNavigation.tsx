import React from 'react';
import { BackButton } from './BackButton';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface PageNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: BreadcrumbItem[];
  backTo?: string;
  backLabel?: string;
  useHistoryBack?: boolean;
  showBackButton?: boolean;
  showBreadcrumbs?: boolean;
}

export function PageNavigation({
  items = [],
  backTo = '..',
  backLabel = 'Volver',
  useHistoryBack = false,
  showBackButton = true,
  showBreadcrumbs = true,
  className,
  ...props
}: PageNavigationProps) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {showBackButton && (
        <BackButton 
          to={backTo}
          label={backLabel}
          useHistoryBack={useHistoryBack}
        />
      )}
      
      {showBreadcrumbs && items.length > 0 && (
        <Breadcrumb items={items} className="mt-2" />
      )}
    </div>
  );
}