import type { Identity, Tenant, DashboardStats, PaginatedResponse } from "@/types";

const HIVEAUTH_API_URL = process.env.HIVEAUTH_API_URL || "https://hiveauth-api.onrender.com";
const HIVEAUTH_APP_SECRET = process.env.HIVEAUTH_APP_SECRET || "";

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, searchParams } = options;

  let url = `${HIVEAUTH_API_URL}${endpoint}`;
  if (searchParams) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-app-secret": HIVEAUTH_APP_SECRET,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API error" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Identity APIs
export async function getIdentities(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}): Promise<PaginatedResponse<Identity>> {
  return fetchApi("/admin/identities", {
    searchParams: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      search: params.search,
      isActive: params.isActive,
      emailVerified: params.emailVerified,
    },
  });
}

export async function getIdentity(id: string): Promise<Identity> {
  return fetchApi(`/admin/identities/${id}`);
}

export async function createIdentity(data: {
  email: string;
  name?: string;
  phone?: string;
  password: string;
}): Promise<Identity> {
  return fetchApi("/admin/identities", {
    method: "POST",
    body: data,
  });
}

export async function updateIdentity(
  id: string,
  data: {
    name?: string;
    phone?: string;
    isActive?: boolean;
  }
): Promise<Identity> {
  return fetchApi(`/admin/identities/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteIdentity(id: string): Promise<void> {
  return fetchApi(`/admin/identities/${id}`, {
    method: "DELETE",
  });
}

export async function unlockIdentity(id: string): Promise<Identity> {
  return fetchApi(`/admin/identities/${id}/unlock`, {
    method: "POST",
  });
}

export async function setIdentityPassword(
  id: string,
  password: string
): Promise<void> {
  return fetchApi(`/admin/identities/${id}/password`, {
    method: "POST",
    body: { password },
  });
}

// Tenant APIs
export async function getTenants(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  plan?: string;
  isActive?: boolean;
}): Promise<PaginatedResponse<Tenant>> {
  return fetchApi("/admin/tenants", {
    searchParams: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      search: params.search,
      plan: params.plan,
      isActive: params.isActive,
    },
  });
}

export async function getTenant(id: string): Promise<Tenant> {
  return fetchApi(`/admin/tenants/${id}`);
}

export async function createTenant(data: {
  slug: string;
  name: string;
  plan?: string;
}): Promise<Tenant> {
  return fetchApi("/admin/tenants", {
    method: "POST",
    body: data,
  });
}

export async function updateTenant(
  id: string,
  data: {
    name?: string;
    plan?: string;
    isActive?: boolean;
  }
): Promise<Tenant> {
  return fetchApi(`/admin/tenants/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteTenant(id: string): Promise<void> {
  return fetchApi(`/admin/tenants/${id}`, {
    method: "DELETE",
  });
}

// Stats API
export async function getStats(): Promise<DashboardStats> {
  return fetchApi("/admin/stats");
}

// Admin Auth
export async function verifyAdmin(
  email: string,
  password: string
): Promise<{ valid: boolean; user?: { email: string; name: string } }> {
  return fetchApi("/admin/verify", {
    method: "POST",
    body: { email, password },
  });
}
