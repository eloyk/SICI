import { useState } from "react";
import ProductFormDialog from "../ProductFormDialog";
import { Button } from "@/components/ui/button";

export default function ProductFormDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Abrir Formulario de Producto</Button>
      <ProductFormDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(data) => console.log("Guardar producto:", data)}
      />
    </div>
  );
}
