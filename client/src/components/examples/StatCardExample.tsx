import StatCard from "../StatCard";
import { Package, Warehouse, ArrowDownUp, AlertTriangle } from "lucide-react";

export default function StatCardExample() {
  return (
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
  );
}
