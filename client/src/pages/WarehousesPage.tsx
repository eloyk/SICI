import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DataTable, { Column } from "@/components/DataTable";
import { WarehouseDetailDialog } from "@/components/DetailDialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Warehouse } from "@shared/schema";
import { Save, X, Loader2 } from "lucide-react";

interface WarehouseDisplay {
  id: string;
  code: string;
  name: string;
  location: string | null;
  manager: string | null;
  isActive: boolean;
}

const columns: Column<WarehouseDisplay>[] = [
  { key: "code", header: "Código", className: "font-mono" },
  { key: "name", header: "Nombre" },
  { key: "location", header: "Ubicación", render: (item) => item.location || "-" },
  { key: "manager", header: "Responsable", render: (item) => item.manager || "-" },
  {
    key: "isActive",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.isActive ? "default" : "secondary"}>
        {item.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export default function WarehousesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>();
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", location: "", manager: "" });
  const { toast } = useToast();

  const { data: warehouses = [], isLoading } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  useEffect(() => {
    if (dialogOpen && editingWarehouse) {
      setFormData({
        code: editingWarehouse.code,
        name: editingWarehouse.name,
        location: editingWarehouse.location || "",
        manager: editingWarehouse.manager || "",
      });
    } else if (dialogOpen) {
      setFormData({ code: "", name: "", location: "", manager: "" });
    }
  }, [dialogOpen, editingWarehouse]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      const res = await apiRequest("POST", "/api/warehouses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Almacén creado", description: "El almacén ha sido creado exitosamente." });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el almacén.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Warehouse> }) => {
      const res = await apiRequest("PATCH", `/api/warehouses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Almacén actualizado", description: "El almacén ha sido actualizado exitosamente." });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el almacén.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Almacén eliminado", description: "El almacén ha sido eliminado." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el almacén.", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setEditingWarehouse(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (warehouse: WarehouseDisplay) => {
    setEditingWarehouse(warehouse as unknown as Warehouse);
    setDialogOpen(true);
  };

  const handleDelete = (warehouse: WarehouseDisplay) => {
    deleteMutation.mutate(warehouse.id);
  };

  const handleView = (warehouse: WarehouseDisplay) => {
    setViewingWarehouse(warehouse as unknown as Warehouse);
    setDetailDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      code: formData.code,
      name: formData.name,
      location: formData.location || null,
      manager: formData.manager || null,
    };
    
    if (editingWarehouse?.id) {
      updateMutation.mutate({ id: editingWarehouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestión de Almacenes</h1>
        <p className="text-muted-foreground mt-1">Administra los almacenes y sucursales del sistema</p>
      </div>

      <DataTable
        data={warehouses as WarehouseDisplay[]}
        columns={columns}
        searchPlaceholder="Buscar almacenes..."
        addLabel="Nuevo Almacén"
        getRowId={(item) => item.id}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <WarehouseDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        warehouse={viewingWarehouse}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Editar Almacén" : "Nuevo Almacén"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ALM-001"
                data-testid="input-warehouse-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del almacén"
                data-testid="input-warehouse-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Textarea
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección completa"
                data-testid="textarea-warehouse-location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Responsable</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nombre del responsable"
                data-testid="input-warehouse-manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-warehouse">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-warehouse">
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingWarehouse ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
