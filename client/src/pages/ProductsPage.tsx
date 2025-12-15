import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import ProductFormDialog from "@/components/ProductFormDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  standardCost: number;
  status: "active" | "inactive";
}

// todo: remove mock functionality
const initialProducts: Product[] = [
  { id: "1", code: "PRD-001", name: "Tornillo Hexagonal 1/4", category: "Ferretería", unit: "Pieza", minStock: 100, standardCost: 2.50, status: "active" },
  { id: "2", code: "PRD-002", name: "Tuerca M8", category: "Ferretería", unit: "Pieza", minStock: 50, standardCost: 0.75, status: "active" },
  { id: "3", code: "PRD-003", name: "Arandela Plana 3/8", category: "Ferretería", unit: "Pieza", minStock: 75, standardCost: 0.30, status: "active" },
  { id: "4", code: "PRD-004", name: "Cable Eléctrico 12AWG", category: "Eléctricos", unit: "Metro", minStock: 500, standardCost: 5.00, status: "active" },
  { id: "5", code: "PRD-005", name: "Interruptor Simple", category: "Eléctricos", unit: "Pieza", minStock: 25, standardCost: 35.00, status: "inactive" },
  { id: "6", code: "PRD-006", name: "Tubo PVC 1/2", category: "Plomería", unit: "Metro", minStock: 200, standardCost: 8.00, status: "active" },
  { id: "7", code: "PRD-007", name: "Codo PVC 90°", category: "Plomería", unit: "Pieza", minStock: 100, standardCost: 4.50, status: "active" },
  { id: "8", code: "PRD-008", name: "Pintura Vinílica Blanca", category: "Pinturas", unit: "Litro", minStock: 50, standardCost: 120.00, status: "active" },
];

const columns: Column<Product>[] = [
  { key: "code", header: "Código", className: "font-mono" },
  { key: "name", header: "Producto" },
  { key: "category", header: "Categoría" },
  { key: "unit", header: "Unidad" },
  { key: "minStock", header: "Stock Mín.", className: "text-right font-mono" },
  {
    key: "standardCost",
    header: "Costo Std.",
    className: "text-right font-mono",
    render: (item) => `$${item.standardCost.toFixed(2)}`,
  },
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProducts(products.filter((p) => p.id !== product.id));
    toast({
      title: "Producto eliminado",
      description: `${product.name} ha sido eliminado.`,
    });
  };

  const handleSave = (data: unknown) => {
    const productData = data as Product;
    if (productData.id) {
      setProducts(products.map((p) => (p.id === productData.id ? { ...p, ...productData } : p)));
      toast({
        title: "Producto actualizado",
        description: `${productData.name} ha sido actualizado.`,
      });
    } else {
      const newProduct: Product = {
        ...productData,
        id: String(Date.now()),
        status: "active",
      };
      setProducts([...products, newProduct]);
      toast({
        title: "Producto creado",
        description: `${productData.name} ha sido creado.`,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestión de Productos</h1>
        <p className="text-muted-foreground mt-1">Administra el catálogo de productos del sistema</p>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Buscar productos..."
        addLabel="Nuevo Producto"
        getRowId={(item) => item.id}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(item) => console.log("Ver:", item)}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}
