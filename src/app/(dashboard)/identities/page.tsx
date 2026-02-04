"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Identity, PaginatedResponse } from "@/types";
import { formatDate, truncateEmail } from "@/lib/utils";

export default function IdentitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Identity> | null>(null);
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

      const filter = searchParams.get("filter");
      if (filter === "locked") {
        params.set("isLocked", "true");
      }

      const response = await fetch(`/api/identities?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullaniciyi silmek istediginizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/identities/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const columns: Column<Identity>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (item) => (
        <span className="font-medium" title={item.email}>
          {truncateEmail(item.email)}
        </span>
      ),
    },
    {
      key: "name",
      label: "Isim",
      sortable: true,
      render: (item) => item.name || "-",
    },
    {
      key: "status",
      label: "Durum",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.isLocked ? (
            <Badge variant="danger">Kilitli</Badge>
          ) : item.isActive ? (
            <Badge variant="success">Aktif</Badge>
          ) : (
            <Badge variant="warning">Pasif</Badge>
          )}
        </div>
      ),
    },
    {
      key: "emailVerified",
      label: "Email Onay",
      mobileHidden: true,
      render: (item) =>
        item.emailVerified ? (
          <Badge variant="success">Onaylandi</Badge>
        ) : (
          <Badge variant="default">Bekliyor</Badge>
        ),
    },
    {
      key: "lastLoginAt",
      label: "Son Giris",
      sortable: true,
      mobileHidden: true,
      render: (item) => formatDate(item.lastLoginAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanicilar</h1>
          <p className="text-gray-500 mt-1">
            Tum kullanicilari yonetin
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Yeni Kullanici
        </button>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={loading}
        searchPlaceholder="Email veya isim ara..."
        searchValue={search}
        onSearch={setSearch}
        onRowClick={(item) => router.push(`/identities/${item.id}`)}
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
              onClick={() => router.push(`/identities/${item.id}`)}
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
        emptyMessage="Kullanici bulunamadi"
      />

      <CreateIdentityModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          router.replace("/identities");
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          router.replace("/identities");
          fetchData();
        }}
      />
    </div>
  );
}

function CreateIdentityModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/identities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, password }),
      });

      if (response.ok) {
        onSuccess();
        setEmail("");
        setName("");
        setPhone("");
        setPassword("");
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
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Kullanici Olustur">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Isim
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sifre *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
