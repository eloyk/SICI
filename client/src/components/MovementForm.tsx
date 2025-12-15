import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, X, Loader2 } from "lucide-react";
import type { Product, Warehouse } from "@shared/schema";

type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

interface ProductLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

interface MovementFormProps {
  type: MovementType;
  onSubmit?: (data: unknown) => void;
  onCancel?: () => void;
  isPending?: boolean;
}

const typeLabels: Record<MovementType, string> = {
  entrada: "Entrada de Inventario",
  salida: "Salida de Inventario",
  transferencia: "Transferencia entre Almacenes",
  ajuste: "Ajuste de Inventario",
};

export default function MovementForm({ type, onSubmit, onCancel, isPending }: MovementFormProps) {
  const [lines, setLines] = useState<ProductLine[]>([
    { id: "1", productId: "", productName: "", quantity: 0, unitCost: 0 },
  ]);
  const [warehouse, setWarehouse] = useState("");
  const [warehouseDestination, setWarehouseDestination] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const addLine = () => {
    setLines([
      ...lines,
      { id: String(Date.now()), productId: "", productName: "", quantity: 0, unitCost: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof ProductLine, value: string | number) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            return { 
              ...line, 
              productId: String(value), 
              productName: product?.name || "",
              unitCost: product?.standardCost ? parseFloat(product.standardCost) : 0,
            };
          }
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);

  const handleSubmit = () => {
    const details = lines
      .filter((line) => line.productId && line.quantity !== 0)
      .map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitCost: String(Math.abs(line.unitCost)),
      }));

    onSubmit?.({
      type,
      warehouseId: warehouse,
      warehouseDestinationId: type === "transferencia" ? warehouseDestination : null,
      reason: reason || null,
      notes: notes || null,
      totalValue: String(Math.abs(total)),
      status: "completed",
      details,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{typeLabels[type]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="warehouse">
              {type === "transferencia" ? "Almacén Origen" : "Almacén"}
            </Label>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger id="warehouse" data-testid="select-warehouse">
                <SelectValue placeholder="Seleccionar almacén" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "transferencia" && (
            <div className="space-y-2">
              <Label htmlFor="warehouseDestination">Almacén Destino</Label>
              <Select value={warehouseDestination} onValueChange={setWarehouseDestination}>
                <SelectTrigger id="warehouseDestination" data-testid="select-warehouse-destination">
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.filter((wh) => wh.id !== warehouse).map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "ajuste" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del Ajuste *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason" data-testid="select-reason">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conteo">Diferencia en conteo físico</SelectItem>
                  <SelectItem value="merma">Merma</SelectItem>
                  <SelectItem value="dano">Daño de producto</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label>Productos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLine} data-testid="button-add-line">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Producto</TableHead>
                  <TableHead className="w-[15%]">Cantidad</TableHead>
                  <TableHead className="w-[20%]">Costo Unit.</TableHead>
                  <TableHead className="w-[15%] text-right">Subtotal</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select
                        value={line.productId}
                        onValueChange={(value) => updateLine(line.id, "productId", value)}
                      >
                        <SelectTrigger data-testid={`select-product-${line.id}`}>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.code} - {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value))}
                        data-testid={`input-quantity-${line.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={line.unitCost}
                        onChange={(e) => updateLine(line.id, "unitCost", Number(e.target.value))}
                        data-testid={`input-cost-${line.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${(line.quantity * line.unitCost).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length === 1}
                        data-testid={`button-remove-line-${line.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total del Movimiento</div>
              <div className="text-2xl font-bold font-mono" data-testid="text-total">
                ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas / Observaciones</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales sobre el movimiento..."
            rows={3}
            data-testid="textarea-notes"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-movement">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-movement">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Movimiento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
