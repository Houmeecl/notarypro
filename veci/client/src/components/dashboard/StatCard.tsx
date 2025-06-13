import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  iconBgColor?: string;
  textColor?: string;
  valueUnit?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  bgColor = "bg-white",
  iconBgColor = "bg-primary/10",
  textColor = "text-gray-900",
  valueUnit,
  className = ""
}: StatCardProps) {
  return (
    <Card className={`overflow-hidden ${bgColor} ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline mt-2 gap-1">
              <h3 className={`text-2xl font-bold ${textColor}`}>
                {value}
              </h3>
              {valueUnit && (
                <span className="text-sm font-medium text-muted-foreground">
                  {valueUnit}
                </span>
              )}
            </div>
            {trend && (
              <p className={`text-xs font-medium flex items-center mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`inline-block mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}>
                  ▲
                </span>
                {trend.value}%
                <span className="text-muted-foreground ml-1">vs. mes anterior</span>
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className={`${iconBgColor} p-3 rounded-lg`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}