import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  homeHref?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />,
  homeHref = "/",
  showHomeIcon = true,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      {showHomeIcon && (
        <>
          <Link href={homeHref} className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {separator}
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <Link 
              href={item.href}
              className={cn(
                "flex items-center gap-1 hover:text-foreground transition-colors",
                isLast && "font-medium text-foreground pointer-events-none"
              )}
              onClick={(e) => isLast && e.preventDefault()}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
            
            {!isLast && separator}
          </React.Fragment>
        );
      })}
    </nav>
  );
}