import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Package } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">SICI</CardTitle>
            <CardDescription className="text-base">
              Sistema Integral de Control de Inventario
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Gestiona tu inventario de manera eficiente. Controla productos, almacenes y movimientos en tiempo real.
          </p>
          <Button
            onClick={login}
            className="w-full"
            size="lg"
            data-testid="button-login"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
