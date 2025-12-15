import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: "blue" | "green" | "orange" | "red" | "purple";
}

const accentColors = {
  blue: "border-l-chart-1",
  green: "border-l-chart-2",
  orange: "border-l-chart-4",
  red: "border-l-chart-5",
  purple: "border-l-chart-3",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = "blue",
}: StatCardProps) {
  return (
    <Card className={cn("border-l-4", accentColors[accentColor])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-3xl font-bold mt-1 font-mono" data-testid={`stat-value-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {value}
            </p>
            {trend && (
              <p
                className={cn(
                  "text-xs mt-2 flex items-center gap-1",
                  trend.isPositive ? "text-chart-2" : "text-chart-5"
                )}
              >
                <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </p>
            )}
          </div>
          <div className="p-2 rounded-md bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
