import ReportSelector from "@/components/ReportSelector";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();

  const handleGenerate = (params: unknown) => {
    console.log("Generar reporte:", params);
    toast({
      title: "Reporte generado",
      description: "El reporte se ha generado correctamente.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Reportes</h1>
        <p className="text-muted-foreground mt-1">Genera reportes de inventario en diferentes formatos</p>
      </div>

      <ReportSelector onGenerate={handleGenerate} />
    </div>
  );
}
