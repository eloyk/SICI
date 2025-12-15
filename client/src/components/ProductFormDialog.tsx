import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: {
    id?: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    minStock: number;
    standardCost: number;
  };
  onSave?: (data: unknown) => void;
}

// todo: remove mock functionality
const categories = ["Ferretería", "Eléctricos", "Plomería", "Pinturas", "Herramientas"];
const units = ["Pieza", "Metro", "Kilogramo", "Litro", "Caja"];

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    code: product?.code || "",
    name: product?.name || "",
    category: product?.category || "",
    unit: product?.unit || "",
    minStock: product?.minStock || 0,
    standardCost: product?.standardCost || 0,
  });

  const handleSave = () => {
    onSave?.({ ...formData, id: product?.id });
    onOpenChange(false);
  };

  const isEditing = !!product?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="PRD-001"
              data-testid="input-product-code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del producto"
              data-testid="input-product-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidad de Medida *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger id="unit" data-testid="select-unit">
                <SelectValue placeholder="Seleccionar unidad" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Stock Mínimo</Label>
            <Input
              id="minStock"
              type="number"
              min={0}
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              data-testid="input-min-stock"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="standardCost">Costo Estándar</Label>
            <Input
              id="standardCost"
              type="number"
              min={0}
              step={0.01}
              value={formData.standardCost}
              onChange={(e) => setFormData({ ...formData, standardCost: Number(e.target.value) })}
              data-testid="input-standard-cost"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-product">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} data-testid="button-save-product">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Actualizar" : "Crear"} Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
