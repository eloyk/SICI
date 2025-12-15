import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouse: string;
  lastLogin: string;
  status: "active" | "inactive";
}

// todo: remove mock functionality
const initialUsers: User[] = [
  { id: "1", name: "Admin Usuario", email: "admin@sici.com", role: "Administrador", warehouse: "Todos", lastLogin: "2025-12-15 09:00", status: "active" },
  { id: "2", name: "Juan Pérez", email: "juan.perez@sici.com", role: "Supervisor", warehouse: "Almacén Central", lastLogin: "2025-12-15 08:30", status: "active" },
  { id: "3", name: "María García", email: "maria.garcia@sici.com", role: "Operador", warehouse: "Sucursal Norte", lastLogin: "2025-12-14 17:45", status: "active" },
  { id: "4", name: "Carlos López", email: "carlos.lopez@sici.com", role: "Operador", warehouse: "Sucursal Sur", lastLogin: "2025-12-14 16:20", status: "active" },
  { id: "5", name: "Ana Martínez", email: "ana.martinez@sici.com", role: "Consulta", warehouse: "Almacén Central", lastLogin: "2025-12-13 10:00", status: "inactive" },
];

const roles = ["Administrador", "Supervisor", "Operador", "Consulta"];
const warehouses = ["Todos", "Almacén Central", "Sucursal Norte", "Sucursal Sur"];

const columns: Column<User>[] = [
  {
    key: "name",
    header: "Usuario",
    render: (item) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {item.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Rol",
    render: (item) => (
      <Badge variant={item.role === "Administrador" ? "default" : "secondary"}>
        {item.role}
      </Badge>
    ),
  },
  { key: "warehouse", header: "Almacén Asignado" },
  { key: "lastLogin", header: "Último Acceso" },
  {
    key: "status",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.status === "active" ? "default" : "secondary"}>
        {item.status === "active" ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [formData, setFormData] = useState({ name: "", email: "", role: "", warehouse: "", password: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingUser(undefined);
    setFormData({ name: "", email: "", role: "", warehouse: "", password: "" });
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      warehouse: user.warehouse,
      password: "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast({
      title: "Usuario eliminado",
      description: `${user.name} ha sido eliminado.`,
    });
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, ...formData } : u
        )
      );
      toast({
        title: "Usuario actualizado",
        description: `${formData.name} ha sido actualizado.`,
      });
    } else {
      const newUser: User = {
        ...formData,
        id: String(Date.now()),
        lastLogin: "-",
        status: "active",
      };
      setUsers([...users, newUser]);
      toast({
        title: "Usuario creado",
        description: `${formData.name} ha sido creado.`,
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">Administra los usuarios y sus permisos en el sistema</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Buscar usuarios..."
        addLabel="Nuevo Usuario"
        getRowId={(item) => item.id}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del usuario"
                data-testid="input-user-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                data-testid="input-user-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{editingUser ? "Nueva Contraseña" : "Contraseña *"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "Dejar vacío para mantener" : "Contraseña"}
                data-testid="input-user-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger id="role" data-testid="select-user-role">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Almacén Asignado</Label>
                <Select value={formData.warehouse} onValueChange={(v) => setFormData({ ...formData, warehouse: v })}>
                  <SelectTrigger id="warehouse" data-testid="select-user-warehouse">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-user">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} data-testid="button-save-user">
              <Save className="h-4 w-4 mr-2" />
              {editingUser ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
