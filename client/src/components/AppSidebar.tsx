import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Settings2,
  ClipboardList,
  FileBarChart,
  Users,
  Shield,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuGroups = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/" },
    ],
  },
  {
    label: "Catálogos",
    items: [
      { title: "Productos", icon: Package, url: "/productos" },
      { title: "Almacenes", icon: Warehouse, url: "/almacenes" },
    ],
  },
  {
    label: "Movimientos",
    items: [
      { title: "Entradas", icon: ArrowDownLeft, url: "/movimientos/entradas" },
      { title: "Salidas", icon: ArrowUpRight, url: "/movimientos/salidas" },
      { title: "Transferencias", icon: ArrowLeftRight, url: "/movimientos/transferencias" },
      { title: "Ajustes", icon: Settings2, url: "/movimientos/ajustes" },
    ],
  },
  {
    label: "Consultas",
    items: [
      { title: "Existencias", icon: ClipboardList, url: "/existencias" },
    ],
  },
  {
    label: "Reportes",
    items: [
      { title: "Reportes", icon: FileBarChart, url: "/reportes" },
    ],
  },
  {
    label: "Administración",
    items: [
      { title: "Usuarios", icon: Users, url: "/usuarios" },
      { title: "Roles", icon: Shield, url: "/roles" },
    ],
  },
];

interface AppSidebarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AppSidebar({ currentUser }: AppSidebarProps) {
  const [location] = useLocation();

  // todo: remove mock functionality
  const user = currentUser || {
    name: "Admin Usuario",
    email: "admin@sici.com",
    role: "Administrador",
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            SI
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">SICI</span>
            <span className="text-xs text-muted-foreground">Control de Inventario</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url || 
                    (item.url !== "/" && location.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2" data-testid="button-user-menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate max-w-[140px]">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
