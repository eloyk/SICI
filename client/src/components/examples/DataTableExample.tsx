import DataTable, { Column } from "../DataTable";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  status: "active" | "inactive";
}

// todo: remove mock functionality
const mockProducts: Product[] = [
  { id: "1", code: "PRD-001", name: "Tornillo Hexagonal 1/4", category: "Ferretería", unit: "Pieza", minStock: 100, status: "active" },
  { id: "2", code: "PRD-002", name: "Tuerca M8", category: "Ferretería", unit: "Pieza", minStock: 50, status: "active" },
  { id: "3", code: "PRD-003", name: "Arandela Plana 3/8", category: "Ferretería", unit: "Pieza", minStock: 75, status: "active" },
  { id: "4", code: "PRD-004", name: "Cable Eléctrico 12AWG", category: "Eléctricos", unit: "Metro", minStock: 500, status: "active" },
  { id: "5", code: "PRD-005", name: "Interruptor Simple", category: "Eléctricos", unit: "Pieza", minStock: 25, status: "inactive" },
];

const columns: Column<Product>[] = [
  { key: "code", header: "Código", className: "font-mono" },
  { key: "name", header: "Producto" },
  { key: "category", header: "Categoría" },
  { key: "unit", header: "Unidad" },
  { key: "minStock", header: "Stock Mín.", className: "text-right font-mono" },
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

export default function DataTableExample() {
  return (
    <DataTable
      data={mockProducts}
      columns={columns}
      searchPlaceholder="Buscar productos..."
      addLabel="Nuevo Producto"
      getRowId={(item) => item.id}
      onAdd={() => console.log("Agregar producto")}
      onEdit={(item) => console.log("Editar:", item)}
      onDelete={(item) => console.log("Eliminar:", item)}
      onView={(item) => console.log("Ver:", item)}
    />
  );
}
