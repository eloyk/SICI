const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://keycloak.pcw.com.do";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "sici";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "sici-app";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

export interface KeycloakUserRepresentation {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
}

export interface KeycloakRoleRepresentation {
  id: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 10000) {
    return cachedToken.token;
  }

  if (!KEYCLOAK_CLIENT_SECRET) {
    throw new Error("KEYCLOAK_CLIENT_SECRET no esta configurado");
  }

  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener token de admin: ${error}`);
  }

  const data = await response.json();
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return data.access_token;
}

export async function getKeycloakUsers(): Promise<KeycloakUserRepresentation[]> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?max=1000`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener usuarios: ${error}`);
  }

  return response.json();
}

export async function getKeycloakUser(userId: string): Promise<KeycloakUserRepresentation> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener usuario: ${error}`);
  }

  return response.json();
}

export async function getKeycloakRoles(): Promise<KeycloakRoleRepresentation[]> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener roles: ${error}`);
  }

  return response.json();
}

export async function getUserRoles(userId: string): Promise<KeycloakRoleRepresentation[]> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm/composite`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener roles del usuario: ${error}`);
  }

  return response.json();
}

export async function assignRoleToUser(userId: string, roleId: string, roleName: string): Promise<void> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ id: roleId, name: roleName }]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al asignar rol: ${error}`);
  }
}

export async function removeRoleFromUser(userId: string, roleId: string, roleName: string): Promise<void> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ id: roleId, name: roleName }]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al remover rol: ${error}`);
  }
}

export async function getUsersWithRoles(): Promise<Array<KeycloakUserRepresentation & { roles: string[] }>> {
  const users = await getKeycloakUsers();
  
  const usersWithRoles = await Promise.all(
    users.map(async (user) => {
      try {
        const roles = await getUserRoles(user.id);
        return {
          ...user,
          roles: roles.map((r) => r.name),
        };
      } catch (e) {
        return {
          ...user,
          roles: [],
        };
      }
    })
  );

  return usersWithRoles;
}
