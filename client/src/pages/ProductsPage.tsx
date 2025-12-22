import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DataTable, { Column } from "@/components/DataTable";
import ProductFormDialog from "@/components/ProductFormDialog";
import { ProductDetailDialog } from "@/components/DetailDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ProductDisplay {
  id: string;
  code: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  unit: string;
  minStock: number;
  standardCost: string;
  isActive: boolean;
}

const columns: Column<ProductDisplay>[] = [
  { key: "code", header: "Código", className: "font-mono" },
  { key: "name", header: "Producto" },
  { key: "unit", header: "Unidad" },
  { key: "minStock", header: "Stock Mín.", className: "text-right font-mono" },
  {
    key: "standardCost",
    header: "Costo Std.",
    className: "text-right font-mono",
    render: (item) => `$${parseFloat(item.standardCost).toFixed(2)}`,
  },
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

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Producto creado", description: "El producto ha sido creado exitosamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el producto.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Producto actualizado", description: "El producto ha sido actualizado exitosamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el producto.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Producto eliminado", description: "El producto ha sido eliminado." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductDisplay) => {
    setEditingProduct(product as unknown as Product);
    setDialogOpen(true);
  };

  const handleView = (product: ProductDisplay) => {
    setViewingProduct(product as unknown as Product);
    setDetailDialogOpen(true);
  };

  const handleDelete = (product: ProductDisplay) => {
    deleteMutation.mutate(product.id);
  };

  const handleSave = (data: Partial<Product>) => {
    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
    setDialogOpen(false);
  };

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
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestión de Productos</h1>
        <p className="text-muted-foreground mt-1">Administra el catálogo de productos del sistema</p>
      </div>

      <DataTable
        data={products as ProductDisplay[]}
        columns={columns}
        searchPlaceholder="Buscar productos..."
        addLabel="Nuevo Producto"
        getRowId={(item) => item.id}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <ProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        product={viewingProduct}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
