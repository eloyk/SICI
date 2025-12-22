import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import MovementForm from "@/components/MovementForm";
import DataTable, { Column } from "@/components/DataTable";
import { MovementDetailDialog } from "@/components/DetailDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Movement } from "@shared/schema";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

interface MovementDisplay {
  id: string;
  folio: string;
  type: MovementType;
  createdAt: Date;
  warehouseId: string;
  warehouseDestinationId: string | null;
  totalValue: string;
  userId: string;
  status: "completed" | "pending" | "cancelled";
}

const typeConfig: Record<MovementType, { icon: typeof ArrowDownLeft; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  entrada: { icon: ArrowDownLeft, label: "Entrada", variant: "default" },
  salida: { icon: ArrowUpRight, label: "Salida", variant: "destructive" },
  transferencia: { icon: ArrowLeftRight, label: "Transferencia", variant: "secondary" },
  ajuste: { icon: Settings2, label: "Ajuste", variant: "outline" },
};

const columns: Column<MovementDisplay>[] = [
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
  { 
    key: "createdAt", 
    header: "Fecha",
    render: (item) => format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: es }),
  },
  {
    key: "totalValue",
    header: "Total",
    className: "text-right font-mono",
    render: (item) => {
      const value = parseFloat(item.totalValue);
      return value !== 0 ? `$${Math.abs(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "-";
    },
  },
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingMovement, setViewingMovement] = useState<Movement | null>(null);
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

  const { data: movements = [], isLoading } = useQuery<Movement[]>({
    queryKey: ["/api/movements"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/movements", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/low-stock"] });
      setShowForm(false);
      toast({
        title: "Movimiento registrado",
        description: `El movimiento ${data.folio} ha sido guardado.`,
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo registrar el movimiento.", 
        variant: "destructive" 
      });
    },
  });

  const filteredMovements = movements.filter((m) => 
    urlToType[typeFromUrl] ? m.type === urlToType[typeFromUrl] : true
  );

  const handleSubmit = (data: unknown) => {
    createMutation.mutate(data);
  };

  const handleView = (movement: MovementDisplay) => {
    setViewingMovement(movement as unknown as Movement);
    setDetailDialogOpen(true);
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
          isPending={createMutation.isPending}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        data={filteredMovements as MovementDisplay[]}
        columns={columns}
        searchPlaceholder="Buscar movimientos..."
        getRowId={(item) => item.id}
        onView={handleView}
      />

      <MovementDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        movement={viewingMovement}
      />
    </div>
  );
}
