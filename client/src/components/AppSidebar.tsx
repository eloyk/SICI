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
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type MenuItem = {
  title: string;
  icon: typeof LayoutDashboard;
  url: string;
  roles?: string[];
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
  roles?: string[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/" },
    ],
  },
  {
    label: "Catálogos",
    roles: ["Administrador", "Supervisor"],
    items: [
      { title: "Productos", icon: Package, url: "/productos" },
      { title: "Almacenes", icon: Warehouse, url: "/almacenes" },
    ],
  },
  {
    label: "Movimientos",
    roles: ["Administrador", "Supervisor", "Operador"],
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
    roles: ["Administrador", "Supervisor"],
    items: [
      { title: "Reportes", icon: FileBarChart, url: "/reportes" },
    ],
  },
  {
    label: "Administración",
    roles: ["Administrador"],
    items: [
      { title: "Usuarios", icon: Users, url: "/users" },
    ],
  },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { hasAnyRole } = useAuth();

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
        {menuGroups
          .filter((group) => !group.roles || hasAnyRole(...group.roles))
          .map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter((item) => !item.roles || hasAnyRole(...item.roles))
                  .map((item) => {
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
    </Sidebar>
  );
}
