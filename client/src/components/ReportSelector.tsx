import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileBarChart, FileText, Download, Printer, Loader2, Package, AlertTriangle, ArrowLeftRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Warehouse, Product } from "@shared/schema";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: typeof FileBarChart;
}

const reportTypes: ReportType[] = [
  { id: "inventory", name: "Inventario General", description: "Existencias actuales por almacen", icon: ClipboardList },
  { id: "valued", name: "Inventario Valorizado", description: "Stock con valorizacion economica", icon: FileText },
  { id: "movements", name: "Movimientos", description: "Historial de movimientos por periodo", icon: ArrowLeftRight },
  { id: "lowstock", name: "Bajo Stock", description: "Productos bajo stock minimo", icon: AlertTriangle },
  { id: "kardex", name: "Kardex", description: "Trazabilidad por producto", icon: Package },
];

interface ReportSelectorProps {
  onGenerate?: (params: ReportParams) => void | Promise<void>;
}

interface ReportParams {
  reportType: string;
  warehouse: string;
  dateFrom: string;
  dateTo: string;
  productId: string;
  format: "pdf" | "excel";
}

export default function ReportSelector({ onGenerate }: ReportSelectorProps) {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [warehouse, setWarehouse] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productId, setProductId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleGenerate = async (format: "pdf" | "excel") => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    try {
      const params: ReportParams = { 
        reportType: selectedReport, 
        warehouse, 
        dateFrom, 
        dateTo, 
        productId, 
        format 
      };
      
      if (onGenerate) {
        await onGenerate(params);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const activeWarehouses = warehouses.filter(w => w.isActive);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Tipo de Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors hover-elevate",
                  selectedReport === report.id && "bg-primary/10"
                )}
                data-testid={`button-report-${report.id}`}
              >
                <Icon className={cn("h-5 w-5 mt-0.5", selectedReport === report.id && "text-primary")} />
                <div>
                  <p className={cn("font-medium text-sm", selectedReport === report.id && "text-primary")}>
                    {report.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Parametros del Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedReport ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Selecciona un tipo de reporte para configurar los parametros
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Almacen</Label>
                  <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger id="warehouse" data-testid="select-report-warehouse">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los almacenes</SelectItem>
                      {activeWarehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedReport === "movements" || selectedReport === "kardex") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Fecha Desde</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        data-testid="input-date-from"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Fecha Hasta</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        data-testid="input-date-to"
                      />
                    </div>
                  </>
                )}

                {selectedReport === "kardex" && (
                  <div className="space-y-2">
                    <Label htmlFor="product">Producto</Label>
                    <Select value={productId} onValueChange={setProductId}>
                      <SelectTrigger id="product" data-testid="select-product-kardex">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.isActive).map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.code} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerate("excel")} 
                  disabled={isGenerating}
                  data-testid="button-generate-excel"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar Excel
                </Button>
                <Button 
                  onClick={() => handleGenerate("pdf")} 
                  disabled={isGenerating}
                  data-testid="button-generate-pdf"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  Generar PDF
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
