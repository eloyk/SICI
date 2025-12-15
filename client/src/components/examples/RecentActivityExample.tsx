import RecentActivity from "../RecentActivity";

// todo: remove mock functionality
const mockActivities = [
  { id: "1", type: "entrada" as const, description: "Compra de 500 unidades - Tornillo Hexagonal", user: "Juan Pérez", timestamp: "Hace 15 min" },
  { id: "2", type: "salida" as const, description: "Venta 200 unidades - Tuerca M8", user: "María García", timestamp: "Hace 32 min" },
  { id: "3", type: "transferencia" as const, description: "Transferencia Almacén Central → Sucursal Norte", user: "Carlos López", timestamp: "Hace 1 hora" },
  { id: "4", type: "ajuste" as const, description: "Ajuste negativo -25 unidades - Arandela Plana", user: "Ana Martínez", timestamp: "Hace 2 horas" },
  { id: "5", type: "entrada" as const, description: "Devolución cliente 50 unidades - Perno Allen", user: "Juan Pérez", timestamp: "Hace 3 horas" },
];

export default function RecentActivityExample() {
  return <RecentActivity activities={mockActivities} />;
}
