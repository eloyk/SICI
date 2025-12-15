import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
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
import { Save, X } from "lucide-react";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  productsCount: number;
  status: "active" | "inactive";
}

// todo: remove mock functionality
const initialWarehouses: Warehouse[] = [
  { id: "1", code: "ALM-001", name: "Almacén Central", location: "Av. Industrial 123, Col. Centro", manager: "Roberto Sánchez", productsCount: 450, status: "active" },
  { id: "2", code: "ALM-002", name: "Sucursal Norte", location: "Blvd. Norte 456, Col. Residencial", manager: "Laura Mendoza", productsCount: 320, status: "active" },
  { id: "3", code: "ALM-003", name: "Sucursal Sur", location: "Calle Sur 789, Col. Industrial", manager: "Miguel Torres", productsCount: 280, status: "active" },
  { id: "4", code: "ALM-004", name: "Bodega Temporal", location: "Av. Periférico 1010", manager: "Sin asignar", productsCount: 0, status: "inactive" },
];

const columns: Column<Warehouse>[] = [
  { key: "code", header: "Código", className: "font-mono" },
  { key: "name", header: "Nombre" },
  { key: "location", header: "Ubicación" },
  { key: "manager", header: "Responsable" },
  { key: "productsCount", header: "Productos", className: "text-right font-mono" },
  {
    key: "status",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.status === "active" ? "default" : "secondary"}>
        {item.status === "active" ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>();
  const [formData, setFormData] = useState({ code: "", name: "", location: "", manager: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingWarehouse(undefined);
    setFormData({ code: "", name: "", location: "", manager: "" });
    setDialogOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      manager: warehouse.manager,
    });
    setDialogOpen(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setWarehouses(warehouses.filter((w) => w.id !== warehouse.id));
    toast({
      title: "Almacén eliminado",
      description: `${warehouse.name} ha sido eliminado.`,
    });
  };

  const handleSave = () => {
    if (editingWarehouse) {
      setWarehouses(
        warehouses.map((w) =>
          w.id === editingWarehouse.id ? { ...w, ...formData } : w
        )
      );
      toast({
        title: "Almacén actualizado",
        description: `${formData.name} ha sido actualizado.`,
      });
    } else {
      const newWarehouse: Warehouse = {
        ...formData,
        id: String(Date.now()),
        productsCount: 0,
        status: "active",
      };
      setWarehouses([...warehouses, newWarehouse]);
      toast({
        title: "Almacén creado",
        description: `${formData.name} ha sido creado.`,
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestión de Almacenes</h1>
        <p className="text-muted-foreground mt-1">Administra los almacenes y sucursales del sistema</p>
      </div>

      <DataTable
        data={warehouses}
        columns={columns}
        searchPlaceholder="Buscar almacenes..."
        addLabel="Nuevo Almacén"
        getRowId={(item) => item.id}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(item) => console.log("Ver:", item)}
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
            <Button onClick={handleSave} data-testid="button-save-warehouse">
              <Save className="h-4 w-4 mr-2" />
              {editingWarehouse ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
