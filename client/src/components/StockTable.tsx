import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockItem {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  unit: string;
  valuedStock: number;
}

interface StockTableProps {
  data: StockItem[];
  warehouses: { id: string; name: string }[];
  onViewHistory?: (item: StockItem) => void;
}

export default function StockTable({ data, warehouses, onViewHistory }: StockTableProps) {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.productCode.toLowerCase().includes(search.toLowerCase()) ||
      item.productName.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse =
      warehouseFilter === "all" || item.warehouse === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  const totalValue = filteredData.reduce((sum, item) => sum + item.valuedStock, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Consulta de Existencias</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-stock"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48" data-testid="select-warehouse-filter">
                <SelectValue placeholder="Todos los almacenes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los almacenes</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.name}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-export-stock">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Código</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Producto</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Categoría</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Almacén</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Stock</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Stock Mín.</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Valor</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Estado</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const isLow = item.currentStock < item.minStock;
                const isCritical = item.currentStock < item.minStock * 0.5;
                return (
                  <TableRow key={item.id} className="hover-elevate" data-testid={`stock-row-${item.id}`}>
                    <TableCell className="font-mono text-sm">{item.productCode}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell className={cn("text-right font-mono", isLow && "text-chart-5 font-semibold")}>
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {item.minStock}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${item.valuedStock.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {isCritical ? (
                        <Badge variant="destructive">Crítico</Badge>
                      ) : isLow ? (
                        <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">Bajo</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewHistory?.(item)}
                        data-testid={`button-history-${item.id}`}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">
            {filteredData.length} productos
          </span>
          <div className="bg-muted px-4 py-2 rounded-md">
            <span className="text-sm text-muted-foreground mr-4">Valor Total:</span>
            <span className="text-lg font-bold font-mono">
              ${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
