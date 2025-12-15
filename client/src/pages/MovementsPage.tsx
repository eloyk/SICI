import { useState } from "react";
import { useLocation } from "wouter";
import MovementForm from "@/components/MovementForm";
import DataTable, { Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2, Plus } from "lucide-react";

type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

interface Movement {
  id: string;
  folio: string;
  type: MovementType;
  date: string;
  warehouse: string;
  warehouseDestination?: string;
  productsCount: number;
  total: number;
  user: string;
  status: "completed" | "pending" | "cancelled";
}

// todo: remove mock functionality
const initialMovements: Movement[] = [
  { id: "1", folio: "ENT-001", type: "entrada", date: "2025-12-15 09:30", warehouse: "Almacén Central", productsCount: 5, total: 12500.00, user: "Juan Pérez", status: "completed" },
  { id: "2", folio: "SAL-001", type: "salida", date: "2025-12-15 10:15", warehouse: "Sucursal Norte", productsCount: 3, total: 8750.00, user: "María García", status: "completed" },
  { id: "3", folio: "TRF-001", type: "transferencia", date: "2025-12-15 11:00", warehouse: "Almacén Central", warehouseDestination: "Sucursal Sur", productsCount: 10, total: 0, user: "Carlos López", status: "completed" },
  { id: "4", folio: "AJU-001", type: "ajuste", date: "2025-12-14 16:45", warehouse: "Almacén Central", productsCount: 2, total: -1500.00, user: "Ana Martínez", status: "completed" },
  { id: "5", folio: "ENT-002", type: "entrada", date: "2025-12-14 14:20", warehouse: "Sucursal Norte", productsCount: 8, total: 25000.00, user: "Juan Pérez", status: "completed" },
];

const typeConfig: Record<MovementType, { icon: typeof ArrowDownLeft; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  entrada: { icon: ArrowDownLeft, label: "Entrada", variant: "default" },
  salida: { icon: ArrowUpRight, label: "Salida", variant: "destructive" },
  transferencia: { icon: ArrowLeftRight, label: "Transferencia", variant: "secondary" },
  ajuste: { icon: Settings2, label: "Ajuste", variant: "outline" },
};

const columns: Column<Movement>[] = [
  { key: "folio", header: "Folio", className: "font-mono" },
  {
    key: "type",
    header: "Tipo",
    render: (item) => {
      const config = typeConfig[item.type];
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  { key: "date", header: "Fecha" },
  { key: "warehouse", header: "Almacén" },
  { key: "productsCount", header: "Productos", className: "text-center font-mono" },
  {
    key: "total",
    header: "Total",
    className: "text-right font-mono",
    render: (item) => item.total !== 0 ? `$${Math.abs(item.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "-",
  },
  { key: "user", header: "Usuario" },
  {
    key: "status",
    header: "Estado",
    render: (item) => (
      <Badge
        variant={
          item.status === "completed" ? "default" :
          item.status === "pending" ? "secondary" : "destructive"
        }
      >
        {item.status === "completed" ? "Completado" :
         item.status === "pending" ? "Pendiente" : "Cancelado"}
      </Badge>
    ),
  },
];

export default function MovementsPage() {
  const [location] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const { toast } = useToast();

  const pathParts = location.split("/");
  const typeFromUrl = pathParts[pathParts.length - 1];
  
  const urlToType: Record<string, MovementType> = {
    entradas: "entrada",
    salidas: "salida",
    transferencias: "transferencia",
    ajustes: "ajuste",
  };
  
  const currentType: MovementType = urlToType[typeFromUrl] || "entrada";

  const filteredMovements = movements.filter((m) => 
    urlToType[typeFromUrl] ? m.type === urlToType[typeFromUrl] : true
  );

  const handleSubmit = (data: unknown) => {
    const newMovement: Movement = {
      id: String(Date.now()),
      folio: `${currentType.toUpperCase().slice(0, 3)}-${String(movements.length + 1).padStart(3, "0")}`,
      type: currentType,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      warehouse: "Almacén Central",
      productsCount: 1,
      total: 0,
      user: "Admin Usuario",
      status: "completed",
    };
    setMovements([newMovement, ...movements]);
    setShowForm(false);
    toast({
      title: "Movimiento registrado",
      description: `El movimiento ${newMovement.folio} ha sido guardado.`,
    });
    console.log("Movimiento guardado:", data);
  };

  const typeLabels: Record<string, string> = {
    entradas: "Entradas de Inventario",
    salidas: "Salidas de Inventario",
    transferencias: "Transferencias entre Almacenes",
    ajustes: "Ajustes de Inventario",
  };

  const title = typeLabels[typeFromUrl] || "Movimientos de Inventario";

  if (showForm) {
    return (
      <div className="p-6">
        <MovementForm
          type={currentType}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">{title}</h1>
          <p className="text-muted-foreground mt-1">Registro y consulta de movimientos de inventario</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-new-movement">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
      </div>

      <DataTable
        data={filteredMovements}
        columns={columns}
        searchPlaceholder="Buscar movimientos..."
        getRowId={(item) => item.id}
        onView={(item) => console.log("Ver:", item)}
      />
    </div>
  );
}
