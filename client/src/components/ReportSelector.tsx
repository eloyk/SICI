import { useState } from "react";
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
import { FileBarChart, FileText, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: typeof FileBarChart;
}

const reportTypes: ReportType[] = [
  { id: "inventory", name: "Inventario General", description: "Existencias actuales por almacén", icon: FileBarChart },
  { id: "valued", name: "Inventario Valorizado", description: "Stock con valorización económica", icon: FileText },
  { id: "movements", name: "Movimientos", description: "Historial de movimientos por período", icon: FileBarChart },
  { id: "lowstock", name: "Bajo Stock", description: "Productos bajo stock mínimo", icon: FileText },
  { id: "kardex", name: "Kardex", description: "Trazabilidad por producto", icon: FileBarChart },
];

interface ReportSelectorProps {
  onGenerate?: (params: unknown) => void;
}

export default function ReportSelector({ onGenerate }: ReportSelectorProps) {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [warehouse, setWarehouse] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [product, setProduct] = useState("");

  // todo: remove mock functionality
  const warehouses = [
    { id: "1", name: "Almacén Central" },
    { id: "2", name: "Sucursal Norte" },
    { id: "3", name: "Sucursal Sur" },
  ];

  const handleGenerate = (format: "pdf" | "excel") => {
    onGenerate?.({ reportType: selectedReport, warehouse, dateFrom, dateTo, product, format });
  };

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
          <CardTitle className="text-lg">Parámetros del Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedReport ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Selecciona un tipo de reporte para configurar los parámetros
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Almacén</Label>
                  <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger id="warehouse" data-testid="select-report-warehouse">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los almacenes</SelectItem>
                      {warehouses.map((wh) => (
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
                    <Input
                      id="product"
                      placeholder="Código o nombre del producto"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      data-testid="input-product-kardex"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => handleGenerate("excel")} data-testid="button-generate-excel">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button onClick={() => handleGenerate("pdf")} data-testid="button-generate-pdf">
                  <Printer className="h-4 w-4 mr-2" />
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
