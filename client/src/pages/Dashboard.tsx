import StatCard from "@/components/StatCard";
import AlertPanel from "@/components/AlertPanel";
import RecentActivity from "@/components/RecentActivity";
import { Package, Warehouse, ArrowDownUp, AlertTriangle } from "lucide-react";

// todo: remove mock functionality
const mockAlerts = [
  { id: "1", productCode: "PRD-001", productName: "Tornillo Hexagonal 1/4", currentStock: 50, minStock: 100, warehouse: "Almacén Central" },
  { id: "2", productCode: "PRD-015", productName: "Tuerca M8", currentStock: 25, minStock: 50, warehouse: "Sucursal Norte" },
  { id: "3", productCode: "PRD-023", productName: "Arandela Plana 3/8", currentStock: 30, minStock: 75, warehouse: "Almacén Central" },
  { id: "4", productCode: "PRD-042", productName: "Perno Allen M6x20", currentStock: 15, minStock: 40, warehouse: "Sucursal Sur" },
  { id: "5", productCode: "PRD-051", productName: "Clavo 2 pulgadas", currentStock: 100, minStock: 200, warehouse: "Almacén Central" },
];

const mockActivities = [
  { id: "1", type: "entrada" as const, description: "Compra de 500 unidades - Tornillo Hexagonal", user: "Juan Pérez", timestamp: "Hace 15 min" },
  { id: "2", type: "salida" as const, description: "Venta 200 unidades - Tuerca M8", user: "María García", timestamp: "Hace 32 min" },
  { id: "3", type: "transferencia" as const, description: "Transferencia Almacén Central → Sucursal Norte", user: "Carlos López", timestamp: "Hace 1 hora" },
  { id: "4", type: "ajuste" as const, description: "Ajuste negativo -25 unidades - Arandela Plana", user: "Ana Martínez", timestamp: "Hace 2 horas" },
  { id: "5", type: "entrada" as const, description: "Devolución cliente 50 unidades - Perno Allen", user: "Juan Pérez", timestamp: "Hace 3 horas" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen del estado del inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value="1,234"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Almacenes"
          value="8"
          icon={Warehouse}
          accentColor="green"
        />
        <StatCard
          title="Movimientos Hoy"
          value="47"
          icon={ArrowDownUp}
          trend={{ value: 5, isPositive: true }}
          accentColor="orange"
        />
        <StatCard
          title="Alertas Stock"
          value="12"
          icon={AlertTriangle}
          trend={{ value: 3, isPositive: false }}
          accentColor="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertPanel
          alerts={mockAlerts}
          onViewDetails={(id) => console.log("Ver detalles:", id)}
        />
        <RecentActivity activities={mockActivities} />
      </div>
    </div>
  );
}
