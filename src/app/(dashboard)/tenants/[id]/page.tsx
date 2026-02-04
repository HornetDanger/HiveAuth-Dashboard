"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tenant, TenantPlan } from "@/types";
import { formatDate, getPlanLabel, getRoleLabel } from "@/lib/utils";

const planColors: Record<TenantPlan, "default" | "info" | "success" | "warning"> = {
  free: "default",
  starter: "info",
  professional: "success",
  enterprise: "warning",
};

export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<TenantPlan>("free");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      const response = await fetch(`/api/tenants/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTenant(data);
        setName(data.name);
        setPlan(data.plan);
        setIsActive(data.isActive);
      } else {
        router.push("/tenants");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      router.push("/tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, plan, isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setTenant(data);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu isletmeyi silmek istediginizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/tenants");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tenants"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 font-mono">{tenant.slug}</span>
              <Badge variant={planColors[tenant.plan]}>{getPlanLabel(tenant.plan)}</Badge>
              {tenant.isActive ? (
                <Badge variant="success">Aktif</Badge>
              ) : (
                <Badge variant="warning">Pasif</Badge>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          Sil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Isletme Bilgileri</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={tenant.slug}
                disabled
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Isletme Adi</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as TenantPlan)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Ucretsiz</option>
                <option value="starter">Baslangic</option>
                <option value="professional">Profesyonel</option>
                <option value="enterprise">Kurumsal</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Aktif Isletme
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detaylar</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Uye Sayisi</dt>
                <dd className="text-sm text-gray-900 mt-0.5 font-medium">
                  {tenant.memberCount ?? 0} uye
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Olusturulma</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{formatDate(tenant.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Son Guncelleme</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{formatDate(tenant.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Memberships */}
          {tenant.memberships && tenant.memberships.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Uyeler</h2>
              <ul className="space-y-3">
                {tenant.memberships.map((membership) => (
                  <li key={membership.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/identities/${membership.identityId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {membership.identity?.email || membership.identityId}
                      </Link>
                      <p className="text-xs text-gray-500">{membership.identity?.name}</p>
                    </div>
                    <Badge variant="default">{getRoleLabel(membership.role)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
