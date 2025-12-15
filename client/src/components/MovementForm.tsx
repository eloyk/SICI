import { useState } from "react";
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
import { Plus, Trash2, Save, X } from "lucide-react";

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
}

// todo: remove mock functionality
const mockProducts = [
  { id: "1", name: "Tornillo Hexagonal 1/4" },
  { id: "2", name: "Tuerca M8" },
  { id: "3", name: "Arandela Plana 3/8" },
  { id: "4", name: "Cable Eléctrico 12AWG" },
  { id: "5", name: "Interruptor Simple" },
];

const mockWarehouses = [
  { id: "1", name: "Almacén Central" },
  { id: "2", name: "Sucursal Norte" },
  { id: "3", name: "Sucursal Sur" },
];

const typeLabels: Record<MovementType, string> = {
  entrada: "Entrada de Inventario",
  salida: "Salida de Inventario",
  transferencia: "Transferencia entre Almacenes",
  ajuste: "Ajuste de Inventario",
};

export default function MovementForm({ type, onSubmit, onCancel }: MovementFormProps) {
  const [lines, setLines] = useState<ProductLine[]>([
    { id: "1", productId: "", productName: "", quantity: 0, unitCost: 0 },
  ]);
  const [warehouse, setWarehouse] = useState("");
  const [warehouseDestination, setWarehouseDestination] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

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
            const product = mockProducts.find((p) => p.id === value);
            return { ...line, productId: String(value), productName: product?.name || "" };
          }
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);

  const handleSubmit = () => {
    onSubmit?.({ type, warehouse, warehouseDestination, reason, notes, lines, total });
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
                {mockWarehouses.map((wh) => (
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
                  {mockWarehouses.filter((wh) => wh.id !== warehouse).map((wh) => (
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
          <div className="flex items-center justify-between">
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
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-28">Cantidad</TableHead>
                  {(type === "entrada" || type === "ajuste") && (
                    <TableHead className="w-32">Costo Unit.</TableHead>
                  )}
                  {(type === "entrada" || type === "ajuste") && (
                    <TableHead className="w-32 text-right">Subtotal</TableHead>
                  )}
                  <TableHead className="w-12" />
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
                          {mockProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={type === "ajuste" ? undefined : 1}
                        value={line.quantity || ""}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value))}
                        data-testid={`input-quantity-${line.id}`}
                      />
                    </TableCell>
                    {(type === "entrada" || type === "ajuste") && (
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.unitCost || ""}
                          onChange={(e) => updateLine(line.id, "unitCost", Number(e.target.value))}
                          data-testid={`input-cost-${line.id}`}
                        />
                      </TableCell>
                    )}
                    {(type === "entrada" || type === "ajuste") && (
                      <TableCell className="text-right font-mono">
                        ${(line.quantity * line.unitCost).toFixed(2)}
                      </TableCell>
                    )}
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

          {(type === "entrada" || type === "ajuste") && (
            <div className="flex justify-end">
              <div className="bg-muted px-4 py-2 rounded-md">
                <span className="text-sm text-muted-foreground mr-4">Total:</span>
                <span className="text-lg font-bold font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
            data-testid="textarea-notes"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} data-testid="button-submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Movimiento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
