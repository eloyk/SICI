import StockTable from "../StockTable";

// todo: remove mock functionality
const mockStock = [
  { id: "1", productCode: "PRD-001", productName: "Tornillo Hexagonal 1/4", category: "Ferretería", warehouse: "Almacén Central", currentStock: 50, minStock: 100, unit: "pzas", valuedStock: 125.00 },
  { id: "2", productCode: "PRD-002", productName: "Tuerca M8", category: "Ferretería", warehouse: "Almacén Central", currentStock: 250, minStock: 50, unit: "pzas", valuedStock: 187.50 },
  { id: "3", productCode: "PRD-003", productName: "Arandela Plana 3/8", category: "Ferretería", warehouse: "Sucursal Norte", currentStock: 30, minStock: 75, unit: "pzas", valuedStock: 45.00 },
  { id: "4", productCode: "PRD-004", productName: "Cable Eléctrico 12AWG", category: "Eléctricos", warehouse: "Almacén Central", currentStock: 850, minStock: 500, unit: "mts", valuedStock: 4250.00 },
  { id: "5", productCode: "PRD-005", productName: "Interruptor Simple", category: "Eléctricos", warehouse: "Sucursal Sur", currentStock: 10, minStock: 25, unit: "pzas", valuedStock: 350.00 },
];

const mockWarehouses = [
  { id: "1", name: "Almacén Central" },
  { id: "2", name: "Sucursal Norte" },
  { id: "3", name: "Sucursal Sur" },
];

export default function StockTableExample() {
  return (
    <StockTable
      data={mockStock}
      warehouses={mockWarehouses}
      onViewHistory={(item) => console.log("Ver historial:", item)}
    />
  );
}
