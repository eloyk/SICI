import AlertPanel from "../AlertPanel";

// todo: remove mock functionality
const mockAlerts = [
  { id: "1", productCode: "PRD-001", productName: "Tornillo Hexagonal 1/4", currentStock: 50, minStock: 100, warehouse: "Almacén Central" },
  { id: "2", productCode: "PRD-015", productName: "Tuerca M8", currentStock: 25, minStock: 50, warehouse: "Sucursal Norte" },
  { id: "3", productCode: "PRD-023", productName: "Arandela Plana 3/8", currentStock: 30, minStock: 75, warehouse: "Almacén Central" },
  { id: "4", productCode: "PRD-042", productName: "Perno Allen M6x20", currentStock: 15, minStock: 40, warehouse: "Sucursal Sur" },
  { id: "5", productCode: "PRD-051", productName: "Clavo 2 pulgadas", currentStock: 100, minStock: 200, warehouse: "Almacén Central" },
];

export default function AlertPanelExample() {
  return (
    <AlertPanel
      alerts={mockAlerts}
      onViewDetails={(id) => console.log("Ver detalles:", id)}
    />
  );
}
