import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import AlertPanel from "@/components/AlertPanel";
import RecentActivity from "@/components/RecentActivity";
import { Package, Warehouse, ArrowDownUp, AlertTriangle, Loader2 } from "lucide-react";
import type { Product, Warehouse as WarehouseType, Stock, Movement } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface StockWithDetails extends Stock {
  product: Product;
  warehouse: WarehouseType;
}

interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  movementsToday: number;
  lowStockCount: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: lowStockAlerts = [], isLoading: alertsLoading } = useQuery<StockWithDetails[]>({
    queryKey: ["/api/alerts/low-stock"],
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery<Movement[]>({
    queryKey: ["/api/movements"],
  });

  const isLoading = statsLoading || alertsLoading || movementsLoading;

  const alerts = lowStockAlerts.map((item) => ({
    id: item.id,
    productCode: item.product.code,
    productName: item.product.name,
    currentStock: item.quantity,
    minStock: item.product.minStock,
    warehouse: item.warehouse.name,
  }));

  const typeLabels: Record<string, string> = {
    entrada: "Entrada",
    salida: "Salida",
    transferencia: "Transferencia",
    ajuste: "Ajuste",
  };

  const activities = movements.slice(0, 5).map((m) => ({
    id: m.id,
    type: m.type as "entrada" | "salida" | "transferencia" | "ajuste",
    description: `${typeLabels[m.type]} - ${m.folio}`,
    user: "Sistema",
    timestamp: formatDistanceToNow(new Date(m.createdAt), { addSuffix: true, locale: es }),
  }));

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
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen del estado del inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats?.totalProducts?.toString() || "0"}
          icon={Package}
          accentColor="blue"
        />
        <StatCard
          title="Almacenes"
          value={stats?.totalWarehouses?.toString() || "0"}
          icon={Warehouse}
          accentColor="green"
        />
        <StatCard
          title="Movimientos Hoy"
          value={stats?.movementsToday?.toString() || "0"}
          icon={ArrowDownUp}
          accentColor="orange"
        />
        <StatCard
          title="Alertas Stock"
          value={stats?.lowStockCount?.toString() || "0"}
          icon={AlertTriangle}
          accentColor="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertPanel
          alerts={alerts}
        />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
