"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Tenant, PaginatedResponse, TenantPlan } from "@/types";
import { getPlanLabel, formatDateShort } from "@/lib/utils";

const planColors: Record<TenantPlan, "default" | "info" | "success" | "warning"> = {
  free: "default",
  starter: "info",
  professional: "success",
  enterprise: "warning",
};

export default function TenantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Tenant> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check for action param
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "10");
      if (search) params.set("search", search);

      const response = await fetch(`/api/tenants?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu isletmeyi silmek istediginizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.slug}</span>,
    },
    {
      key: "name",
      label: "Isletme Adi",
      sortable: true,
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "plan",
      label: "Plan",
      render: (item) => (
        <Badge variant={planColors[item.plan]}>{getPlanLabel(item.plan)}</Badge>
      ),
    },
    {
      key: "memberCount",
      label: "Uye",
      mobileHidden: true,
      render: (item) => item.memberCount ?? 0,
    },
    {
      key: "isActive",
      label: "Durum",
      render: (item) =>
        item.isActive ? (
          <Badge variant="success">Aktif</Badge>
        ) : (
          <Badge variant="warning">Pasif</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Olusturulma",
      sortable: true,
      mobileHidden: true,
      render: (item) => formatDateShort(item.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Isletmeler</h1>
          <p className="text-gray-500 mt-1">Tum isletmeleri yonetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Yeni Isletme
        </button>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={loading}
        searchPlaceholder="Isletme adi veya slug ara..."
        searchValue={search}
        onSearch={setSearch}
        onRowClick={(item) => router.push(`/tenants/${item.id}`)}
        serverPagination={
          data
            ? {
                page,
                pageSize: 10,
                total: data.total,
                onPageChange: setPage,
              }
            : undefined
        }
        actions={(item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/tenants/${item.id}`)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Duzenle
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Sil
            </button>
          </div>
        )}
        emptyMessage="Isletme bulunamadi"
      />

      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          router.replace("/tenants");
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          router.replace("/tenants");
          fetchData();
        }}
      />
    </div>
  );
}

function CreateTenantModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<TenantPlan>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, plan }),
      });

      if (response.ok) {
        onSuccess();
        setSlug("");
        setName("");
        setPlan("free");
      } else {
        const data = await response.json();
        setError(data.message || "Bir hata olustu");
      }
    } catch {
      setError("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Isletme Olustur">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            required
            pattern="[a-z0-9-]+"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="ornek-isletme"
          />
          <p className="mt-1 text-xs text-gray-500">
            Sadece kucuk harf, rakam ve tire kullanilabilir
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Isletme Adi *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ornek Isletme"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
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

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Iptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Olusturuluyor..." : "Olustur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
