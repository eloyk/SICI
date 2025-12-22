import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Package, Warehouse, MapPin, User, Calendar, Hash, DollarSign, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Product, Warehouse as WarehouseType, Movement, MovementDetail, Stock, Category } from "@shared/schema";

interface DetailRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailDialog({ open, onOpenChange, product }: ProductDetailDialogProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: open,
  });

  const { data: stockData = [] } = useQuery<(Stock & { warehouse: WarehouseType })[]>({
    queryKey: ["/api/stock"],
    enabled: open && !!product,
  });

  if (!product) return null;

  const category = categories.find(c => c.id === product.categoryId);
  const productStock = stockData.filter(s => s.productId === product.id);
  const totalStock = productStock.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-1">
            <DetailRow icon={<Hash className="h-4 w-4" />} label="Código" value={<span className="font-mono">{product.code}</span>} />
            <DetailRow icon={<Package className="h-4 w-4" />} label="Nombre" value={product.name} />
            <DetailRow label="Descripción" value={product.description} />
            <DetailRow label="Categoría" value={category?.name || "Sin categoría"} />
            <DetailRow label="Unidad de Medida" value={product.unit} />
            <DetailRow label="Stock Mínimo" value={product.minStock} />
            <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Costo Estándar" value={`$${parseFloat(product.standardCost).toFixed(2)}`} />
            <DetailRow label="Estado" value={
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Activo" : "Inactivo"}
              </Badge>
            } />
          </div>
          
          {productStock.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-3">Stock por Almacén</h4>
                <div className="space-y-2">
                  {productStock.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                      <span className="text-sm">{s.warehouse.name}</span>
                      <span className="font-mono font-medium">{s.quantity} {product.unit}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 rounded-md bg-primary/10 font-medium">
                    <span>Total</span>
                    <span className="font-mono">{totalStock} {product.unit}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface WarehouseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: WarehouseType | null;
}

export function WarehouseDetailDialog({ open, onOpenChange, warehouse }: WarehouseDetailDialogProps) {
  const { data: stockData = [], isLoading } = useQuery<(Stock & { product: Product; warehouse: WarehouseType })[]>({
    queryKey: ["/api/stock"],
    enabled: open && !!warehouse,
  });

  if (!warehouse) return null;

  const warehouseStock = stockData.filter(s => s.warehouseId === warehouse.id);
  const totalProducts = warehouseStock.length;
  const totalValue = warehouseStock.reduce((sum, s) => sum + (s.quantity * parseFloat(s.product.standardCost)), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Detalles del Almacén
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-1">
            <DetailRow icon={<Hash className="h-4 w-4" />} label="Código" value={<span className="font-mono">{warehouse.code}</span>} />
            <DetailRow icon={<Warehouse className="h-4 w-4" />} label="Nombre" value={warehouse.name} />
            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Ubicación" value={warehouse.location} />
            <DetailRow icon={<User className="h-4 w-4" />} label="Responsable" value={warehouse.manager} />
            <DetailRow label="Estado" value={
              <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                {warehouse.isActive ? "Activo" : "Inactivo"}
              </Badge>
            } />
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="font-medium mb-3">Resumen de Inventario</h4>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-muted-foreground">Productos</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold">${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
              </div>
            )}
          </div>
          
          {warehouseStock.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-3">Productos en Almacén ({warehouseStock.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {warehouseStock.slice(0, 10).map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">{s.product.code}</span>
                        <p className="text-sm">{s.product.name}</p>
                      </div>
                      <span className="font-mono font-medium">{s.quantity}</span>
                    </div>
                  ))}
                  {warehouseStock.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Y {warehouseStock.length - 10} productos más...
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

const typeConfig = {
  entrada: { icon: ArrowDownLeft, label: "Entrada", variant: "default" as const },
  salida: { icon: ArrowUpRight, label: "Salida", variant: "destructive" as const },
  transferencia: { icon: ArrowLeftRight, label: "Transferencia", variant: "secondary" as const },
  ajuste: { icon: Settings2, label: "Ajuste", variant: "outline" as const },
};

interface MovementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: Movement | null;
}

export function MovementDetailDialog({ open, onOpenChange, movement }: MovementDetailDialogProps) {
  const { data: details = [], isLoading: detailsLoading } = useQuery<MovementDetail[]>({
    queryKey: ["/api/movements", movement?.id, "details"],
    queryFn: async () => {
      const res = await fetch(`/api/movements/${movement?.id}/details`);
      return res.json();
    },
    enabled: open && !!movement?.id,
  });

  const { data: warehouses = [] } = useQuery<WarehouseType[]>({
    queryKey: ["/api/warehouses"],
    enabled: open,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: open,
  });

  if (!movement) return null;

  const config = typeConfig[movement.type as keyof typeof typeConfig];
  const Icon = config.icon;
  const warehouse = warehouses.find(w => w.id === movement.warehouseId);
  const destinationWarehouse = movement.warehouseDestinationId 
    ? warehouses.find(w => w.id === movement.warehouseDestinationId)
    : null;

  const detailsWithProducts = details.map(d => ({
    ...d,
    product: products.find(p => p.id === d.productId),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Detalles del Movimiento
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={<Hash className="h-4 w-4" />} label="Folio" value={<span className="font-mono text-lg">{movement.folio}</span>} />
            <DetailRow label="Tipo" value={
              <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
            } />
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Fecha" value={format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })} />
            <DetailRow label="Estado" value={
              <Badge variant={movement.status === "completed" ? "default" : movement.status === "pending" ? "secondary" : "destructive"}>
                {movement.status === "completed" ? "Completado" : movement.status === "pending" ? "Pendiente" : "Cancelado"}
              </Badge>
            } />
            <DetailRow icon={<Warehouse className="h-4 w-4" />} label={movement.type === "transferencia" ? "Origen" : "Almacén"} value={warehouse?.name} />
            {destinationWarehouse && (
              <DetailRow icon={<Warehouse className="h-4 w-4" />} label="Destino" value={destinationWarehouse.name} />
            )}
            {movement.reason && (
              <DetailRow label="Motivo" value={movement.reason} />
            )}
            {movement.notes && (
              <div className="col-span-2">
                <DetailRow label="Notas" value={movement.notes} />
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="font-medium mb-3">Detalle de Productos</h4>
            {detailsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Código</th>
                      <th className="text-left p-2 font-medium">Producto</th>
                      <th className="text-right p-2 font-medium">Cantidad</th>
                      <th className="text-right p-2 font-medium">Costo Unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsWithProducts.map((d, idx) => (
                      <tr key={d.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="p-2 font-mono text-muted-foreground">{d.product?.code || "-"}</td>
                        <td className="p-2">{d.product?.name || "Producto no encontrado"}</td>
                        <td className="p-2 text-right font-mono font-medium">{d.quantity}</td>
                        <td className="p-2 text-right font-mono">${parseFloat(d.unitCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
