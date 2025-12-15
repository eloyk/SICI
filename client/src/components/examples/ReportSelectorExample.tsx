import ReportSelector from "../ReportSelector";

export default function ReportSelectorExample() {
  return (
    <ReportSelector onGenerate={(params) => console.log("Generar reporte:", params)} />
  );
}
