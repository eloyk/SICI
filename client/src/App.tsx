import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import Dashboard from "@/pages/Dashboard";
import ProductsPage from "@/pages/ProductsPage";
import WarehousesPage from "@/pages/WarehousesPage";
import MovementsPage from "@/pages/MovementsPage";
import StockPage from "@/pages/StockPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  component: Component, 
  roles 
}: { 
  component: React.ComponentType; 
  roles?: string[] 
}) {
  return (
    <RequireAuth roles={roles}>
      <Component />
    </RequireAuth>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/productos">
        <ProtectedRoute component={ProductsPage} roles={["Administrador", "Supervisor"]} />
      </Route>
      <Route path="/almacenes">
        <ProtectedRoute component={WarehousesPage} roles={["Administrador", "Supervisor"]} />
      </Route>
      <Route path="/movimientos/entradas">
        <ProtectedRoute component={MovementsPage} roles={["Administrador", "Supervisor", "Operador"]} />
      </Route>
      <Route path="/movimientos/salidas">
        <ProtectedRoute component={MovementsPage} roles={["Administrador", "Supervisor", "Operador"]} />
      </Route>
      <Route path="/movimientos/transferencias">
        <ProtectedRoute component={MovementsPage} roles={["Administrador", "Supervisor", "Operador"]} />
      </Route>
      <Route path="/movimientos/ajustes">
        <ProtectedRoute component={MovementsPage} roles={["Administrador", "Supervisor", "Operador"]} />
      </Route>
      <Route path="/existencias" component={StockPage} />
      <Route path="/reportes">
        <ProtectedRoute component={ReportsPage} roles={["Administrador", "Supervisor"]} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} roles={["Administrador"]} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <RequireAuth fallback={<LoginPage />}>
              <AuthenticatedLayout>
                <Router />
              </AuthenticatedLayout>
            </RequireAuth>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
