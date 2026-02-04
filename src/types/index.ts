export interface Identity {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  emailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  lockReason: string | null;
  failedLoginAttempts: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  memberships?: Membership[];
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  memberships?: Membership[];
}

export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Membership {
  id: string;
  identityId: string;
  tenantId: string;
  role: MembershipRole;
  createdAt: string;
  identity?: Identity;
  tenant?: Tenant;
}

export type MembershipRole = 'owner' | 'admin' | 'member';

export interface DashboardStats {
  totalIdentities: number;
  activeIdentities: number;
  lockedIdentities: number;
  verifiedIdentities: number;
  totalTenants: number;
  activeTenants: number;
  planDistribution: {
    free: number;
    starter: number;
    professional: number;
    enterprise: number;
  };
  recentLogins24h: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
