import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlertItem {
  id: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
}

interface AlertPanelProps {
  alerts: AlertItem[];
  onViewDetails?: (id: string) => void;
}

export default function AlertPanel({ alerts, onViewDetails }: AlertPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-chart-5" />
          Productos Bajo Stock Mínimo
          <Badge variant="destructive" className="ml-auto">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="divide-y">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-4 px-6 py-3 hover-elevate"
                data-testid={`alert-item-${alert.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {alert.productCode}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {alert.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Almacén: {alert.warehouse}</span>
                    <span className="text-chart-5">
                      Stock: {alert.currentStock} / Mín: {alert.minStock}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails?.(alert.id)}
                  data-testid={`button-view-alert-${alert.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
