import MovementForm from "../MovementForm";

export default function MovementFormExample() {
  return (
    <MovementForm
      type="entrada"
      onSubmit={(data) => console.log("Guardar movimiento:", data)}
      onCancel={() => console.log("Cancelar")}
    />
  );
}
