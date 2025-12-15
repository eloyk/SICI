import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Save, X, Loader2 } from "lucide-react";
import type { Product, Category } from "@shared/schema";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave?: (data: Partial<Product>) => void;
  isPending?: boolean;
}

const units = ["Pieza", "Metro", "Kilogramo", "Litro", "Caja", "Par", "Rollo"];

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
  isPending,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    categoryId: "",
    unit: "",
    minStock: 0,
    standardCost: "0",
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (open) {
      setFormData({
        code: product?.code || "",
        name: product?.name || "",
        description: product?.description || "",
        categoryId: product?.categoryId || "",
        unit: product?.unit || "",
        minStock: product?.minStock || 0,
        standardCost: product?.standardCost?.toString() || "0",
      });
    }
  }, [open, product]);

  const handleSave = () => {
    onSave?.({
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
      categoryId: formData.categoryId || null,
      unit: formData.unit,
      minStock: formData.minStock,
      standardCost: formData.standardCost,
    });
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del producto"
              data-testid="input-product-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
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
              onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
              data-testid="input-standard-cost"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-product">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending} data-testid="button-save-product">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Actualizar" : "Crear"} Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
