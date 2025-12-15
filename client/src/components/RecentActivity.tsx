import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

interface ActivityItem {
  id: string;
  type: MovementType;
  description: string;
  user: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig: Record<MovementType, { icon: typeof ArrowDownLeft; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  entrada: { icon: ArrowDownLeft, label: "Entrada", variant: "default" },
  salida: { icon: ArrowUpRight, label: "Salida", variant: "destructive" },
  transferencia: { icon: ArrowLeftRight, label: "Transferencia", variant: "secondary" },
  ajuste: { icon: Settings2, label: "Ajuste", variant: "outline" },
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="relative pl-6 pr-6">
            <div className="absolute left-9 top-0 bottom-0 w-px bg-border" />
            {activities.map((activity, index) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              return (
                <div
                  key={activity.id}
                  className={cn("relative flex gap-4 pb-4", index === activities.length - 1 && "pb-6")}
                  data-testid={`activity-item-${activity.id}`}
                >
                  <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-background border">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm mt-1 truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.user}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
