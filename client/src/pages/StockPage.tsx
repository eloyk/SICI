import { useQuery } from "@tanstack/react-query";
import StockTable from "@/components/StockTable";
import type { Warehouse, Product, Stock } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface StockWithDetails extends Stock {
  product: Product;
  warehouse: Warehouse;
}

export default function StockPage() {
  const { data: stock = [], isLoading: stockLoading } = useQuery<StockWithDetails[]>({
    queryKey: ["/api/stock"],
  });

  const { data: warehouses = [], isLoading: warehousesLoading } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const isLoading = stockLoading || warehousesLoading;

  const tableData = stock.map((item) => ({
    id: item.id,
    productCode: item.product.code,
    productName: item.product.name,
    category: "",
    warehouse: item.warehouse.name,
    warehouseId: item.warehouse.id,
    currentStock: item.quantity,
    minStock: item.product.minStock,
    unit: item.product.unit,
    valuedStock: item.quantity * parseFloat(item.product.standardCost),
  }));

  const warehouseOptions = warehouses.map((wh) => ({ id: wh.id, name: wh.name }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Existencias</h1>
        <p className="text-muted-foreground mt-1">Consulta de stock actual por producto y almacén</p>
      </div>

      <StockTable
        data={tableData}
        warehouses={warehouseOptions}
        onViewHistory={(item) => console.log("Ver historial:", item)}
      />
    </div>
  );
}
