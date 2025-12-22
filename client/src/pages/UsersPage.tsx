import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DataTable, { Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Shield, Loader2, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KeycloakUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
}

interface KeycloakRole {
  id: string;
  name: string;
  description?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operador: "Operador",
  consulta: "Consulta",
};

const columns: Column<KeycloakUser>[] = [
  {
    key: "name",
    header: "Usuario",
    render: (item) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {(item.name || item.username).split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{item.name || item.username}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "username",
    header: "Usuario",
  },
  {
    key: "role",
    header: "Rol Principal",
    render: (item) => (
      <Badge variant={item.role === "admin" ? "default" : "secondary"}>
        {roleLabels[item.role] || item.role}
      </Badge>
    ),
  },
  {
    key: "roles",
    header: "Todos los Roles",
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {item.roles.filter(r => Object.keys(roleLabels).includes(r)).map((role) => (
          <Badge key={role} variant="outline" className="text-xs">
            {roleLabels[role] || role}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.status === "activo" ? "default" : "secondary"}>
        {item.status === "activo" ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export default function UsersPage() {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<KeycloakUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<KeycloakUser[]>({
    queryKey: ["/api/users"],
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<KeycloakRole[]>({
    queryKey: ["/api/roles"],
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, roleName }: { userId: string; roleId: string; roleName: string }) => {
      return apiRequest("POST", `/api/users/${userId}/roles`, { roleId, roleName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, roleName }: { userId: string; roleId: string; roleName: string }) => {
      return apiRequest("DELETE", `/api/users/${userId}/roles`, { roleId, roleName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const handleEditRoles = (user: KeycloakUser) => {
    setSelectedUser(user);
    setSelectedRoles(new Set(user.roles));
    setRoleDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    const currentRoles = new Set(selectedUser.roles);
    const appRoles = roles.filter(r => Object.keys(roleLabels).includes(r.name));
    
    try {
      for (const role of appRoles) {
        const wasSelected = currentRoles.has(role.name);
        const isSelected = selectedRoles.has(role.name);
        
        if (isSelected && !wasSelected) {
          await assignRoleMutation.mutateAsync({
            userId: selectedUser.id,
            roleId: role.id,
            roleName: role.name,
          });
        } else if (!isSelected && wasSelected) {
          await removeRoleMutation.mutateAsync({
            userId: selectedUser.id,
            roleId: role.id,
            roleName: role.name,
          });
        }
      }

      toast({
        title: "Roles actualizados",
        description: `Los roles de ${selectedUser.name || selectedUser.username} han sido actualizados.`,
      });
      setRoleDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar roles",
      });
    }
  };

  const toggleRole = (roleName: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(roleName)) {
      newRoles.delete(roleName);
    } else {
      newRoles.add(roleName);
    }
    setSelectedRoles(newRoles);
  };

  const appRoles = roles.filter(r => Object.keys(roleLabels).includes(r.name));

  if (usersError) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error de Conexion</CardTitle>
            <CardDescription>
              No se pudo conectar con Keycloak para obtener los usuarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Asegurate de que el cliente sici-app en Keycloak tenga habilitado:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Client authentication: ON</li>
              <li>Service account roles: ON</li>
              <li>Rol realm-management &gt; view-users asignado al Service Account</li>
              <li>Rol realm-management &gt; manage-users asignado al Service Account</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Gestion de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Los usuarios se administran en Keycloak. Aqui puedes ver y asignar roles.</p>
        </div>
        <Button variant="outline" asChild>
          <a 
            href="https://keycloak.pcw.com.do/admin/master/console/#/sici/users" 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid="link-keycloak-admin"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Administrar en Keycloak
          </a>
        </Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              searchPlaceholder="Buscar usuarios..."
              getRowId={(item) => item.id}
              onEdit={handleEditRoles}
            />
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appRoles.map((role) => (
                <Card key={role.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{roleLabels[role.name] || role.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {role.description || `Rol de ${roleLabels[role.name] || role.name} del sistema`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ID: {role.name}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {appRoles.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No se encontraron roles de aplicacion. Crea los roles admin, supervisor, operador y consulta en Keycloak.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Roles</DialogTitle>
            <DialogDescription>
              Usuario: {selectedUser?.name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {appRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-3">
                <Checkbox
                  id={role.id}
                  checked={selectedRoles.has(role.name)}
                  onCheckedChange={() => toggleRole(role.name)}
                  data-testid={`checkbox-role-${role.name}`}
                />
                <Label htmlFor={role.id} className="flex-1 cursor-pointer">
                  <span className="font-medium">{roleLabels[role.name] || role.name}</span>
                  {role.description && (
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  )}
                </Label>
              </div>
            ))}
            {appRoles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay roles de aplicacion disponibles.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} data-testid="button-cancel-roles">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRoles} 
              disabled={assignRoleMutation.isPending || removeRoleMutation.isPending}
              data-testid="button-save-roles"
            >
              {(assignRoleMutation.isPending || removeRoleMutation.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
