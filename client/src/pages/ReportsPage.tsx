import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReportSelector from "@/components/ReportSelector";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2 } from "lucide-react";
import type { Stock, Movement, Product, Warehouse } from "@shared/schema";

interface ReportParams {
  reportType: string;
  warehouse: string;
  dateFrom: string;
  dateTo: string;
  productId: string;
  format: "pdf" | "excel";
}

interface StockWithDetails extends Stock {
  product?: Product;
  warehouse?: Warehouse;
}

interface ReportData {
  title: string;
  columns: string[];
  rows: string[][];
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState<ReportParams | null>(null);

  const { data: stockData = [] } = useQuery<StockWithDetails[]>({
    queryKey: ["/api/stock"],
    enabled: false,
  });

  const { data: movementsData = [] } = useQuery<Movement[]>({
    queryKey: ["/api/movements"],
    enabled: false,
  });

  const { data: lowStockData = [] } = useQuery<StockWithDetails[]>({
    queryKey: ["/api/alerts/low-stock"],
    enabled: false,
  });

  const fetchReportData = async (params: ReportParams): Promise<ReportData> => {
    const warehouseFilter = params.warehouse !== "all" ? `?warehouseId=${params.warehouse}` : "";
    
    switch (params.reportType) {
      case "inventory": {
        const response = await fetch(`/api/stock${warehouseFilter}`);
        const stock: StockWithDetails[] = await response.json();
        return {
          title: "Reporte de Inventario General",
          columns: ["Codigo", "Producto", "Almacen", "Cantidad", "Unidad", "Ultima Actualizacion"],
          rows: stock.map(s => [
            s.product?.code || "",
            s.product?.name || "",
            s.warehouse?.name || "",
            s.quantity.toString(),
            s.product?.unit || "",
            s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString("es-DO") : "",
          ]),
        };
      }
      
      case "valued": {
        const response = await fetch(`/api/stock${warehouseFilter}`);
        const stock: StockWithDetails[] = await response.json();
        return {
          title: "Reporte de Inventario Valorizado",
          columns: ["Codigo", "Producto", "Almacen", "Cantidad", "Costo Unitario", "Valor Total"],
          rows: stock.map(s => {
            const unitCost = parseFloat(s.product?.standardCost || "0");
            const totalValue = unitCost * s.quantity;
            return [
              s.product?.code || "",
              s.product?.name || "",
              s.warehouse?.name || "",
              s.quantity.toString(),
              `$${unitCost.toFixed(2)}`,
              `$${totalValue.toFixed(2)}`,
            ];
          }),
        };
      }
      
      case "movements": {
        const response = await fetch("/api/movements");
        let movements: Movement[] = await response.json();
        
        if (params.dateFrom) {
          const fromDate = new Date(params.dateFrom);
          movements = movements.filter(m => new Date(m.createdAt!) >= fromDate);
        }
        if (params.dateTo) {
          const toDate = new Date(params.dateTo);
          toDate.setHours(23, 59, 59, 999);
          movements = movements.filter(m => new Date(m.createdAt!) <= toDate);
        }
        
        if (params.warehouse !== "all") {
          movements = movements.filter(m => 
            m.warehouseId === params.warehouse || 
            m.warehouseDestinationId === params.warehouse
          );
        }
        
        return {
          title: "Reporte de Movimientos",
          columns: ["Folio", "Tipo", "Fecha", "Notas", "Estado"],
          rows: movements.map(m => [
            m.folio,
            m.type.charAt(0).toUpperCase() + m.type.slice(1),
            m.createdAt ? new Date(m.createdAt).toLocaleDateString("es-DO") : "",
            m.notes || "",
            m.status,
          ]),
        };
      }
      
      case "lowstock": {
        const response = await fetch("/api/alerts/low-stock");
        const alerts: StockWithDetails[] = await response.json();
        return {
          title: "Reporte de Productos Bajo Stock",
          columns: ["Codigo", "Producto", "Almacen", "Stock Actual", "Stock Minimo", "Diferencia"],
          rows: alerts.map(s => {
            const minStock = s.product?.minStock || 0;
            const diff = s.quantity - minStock;
            return [
              s.product?.code || "",
              s.product?.name || "",
              s.warehouse?.name || "",
              s.quantity.toString(),
              minStock.toString(),
              diff.toString(),
            ];
          }),
        };
      }
      
      case "kardex": {
        if (!params.productId) {
          throw new Error("Debe seleccionar un producto para el reporte Kardex");
        }
        const response = await fetch("/api/movements");
        const allMovements: any[] = await response.json();
        
        const detailPromises = allMovements.map(async (m) => {
          const detailsRes = await fetch(`/api/movements/${m.id}/details`);
          const details = await detailsRes.json();
          return { ...m, details };
        });
        
        const movementsWithDetails = await Promise.all(detailPromises);
        
        let filteredMovements = movementsWithDetails.filter(m => 
          m.details?.some((d: any) => d.productId === params.productId)
        );
        
        if (params.dateFrom) {
          const fromDate = new Date(params.dateFrom);
          filteredMovements = filteredMovements.filter(m => new Date(m.createdAt) >= fromDate);
        }
        if (params.dateTo) {
          const toDate = new Date(params.dateTo);
          toDate.setHours(23, 59, 59, 999);
          filteredMovements = filteredMovements.filter(m => new Date(m.createdAt) <= toDate);
        }
        
        return {
          title: "Kardex de Producto",
          columns: ["Fecha", "Folio", "Tipo", "Entrada", "Salida", "Notas"],
          rows: filteredMovements.map(m => {
            const detail = m.details?.find((d: any) => d.productId === params.productId);
            const isEntry = m.type === "entrada" || m.type === "ajuste";
            return [
              m.createdAt ? new Date(m.createdAt).toLocaleDateString("es-DO") : "",
              m.folio,
              m.type.charAt(0).toUpperCase() + m.type.slice(1),
              isEntry ? (detail?.quantity || 0).toString() : "",
              !isEntry ? (detail?.quantity || 0).toString() : "",
              m.notes || "",
            ];
          }),
        };
      }
      
      default:
        throw new Error("Tipo de reporte no soportado");
    }
  };

  const handleGenerate = async (params: ReportParams) => {
    setIsLoading(true);
    setCurrentParams(params);
    
    try {
      const data = await fetchReportData(params);
      setReportData(data);
      
      if (params.format === "excel") {
        downloadAsCSV(data);
        toast({
          title: "Reporte exportado",
          description: "El archivo CSV se ha descargado correctamente.",
        });
      } else {
        toast({
          title: "Reporte generado",
          description: "Los datos del reporte se muestran a continuacion.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al generar el reporte",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsCSV = (data: ReportData) => {
    const csvContent = [
      data.columns.join(","),
      ...data.rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${data.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleDownloadCurrent = () => {
    if (reportData) {
      downloadAsCSV(reportData);
      toast({
        title: "Reporte exportado",
        description: "El archivo CSV se ha descargado correctamente.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Reportes</h1>
        <p className="text-muted-foreground mt-1">Genera reportes de inventario en diferentes formatos</p>
      </div>

      <ReportSelector onGenerate={handleGenerate} />

      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generando reporte...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportData && !isLoading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>{reportData.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {reportData.rows.length} registros encontrados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadCurrent} data-testid="button-download-csv">
                <Download className="h-4 w-4 mr-2" />
                Descargar CSV
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setReportData(null)} data-testid="button-close-report">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.rows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No se encontraron datos para este reporte
              </div>
            ) : (
              <div className="rounded-md border overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {reportData.columns.map((col, i) => (
                        <TableHead key={i} className="whitespace-nowrap">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.rows.slice(0, 100).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="whitespace-nowrap">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {reportData.rows.length > 100 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Mostrando primeros 100 de {reportData.rows.length} registros. Descarga el CSV para ver todos.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
