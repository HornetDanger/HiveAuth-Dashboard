"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Identity } from "@/types";
import { formatDate, getRoleLabel } from "@/lib/utils";

export default function IdentityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchIdentity();
  }, [id]);

  const fetchIdentity = async () => {
    try {
      const response = await fetch(`/api/identities/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIdentity(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setIsActive(data.isActive);
      } else {
        router.push("/identities");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      router.push("/identities");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/identities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdentity(data);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await fetch(`/api/identities/${id}/unlock`, {
        method: "POST",
      });

      if (response.ok) {
        fetchIdentity();
      }
    } catch (error) {
      console.error("Unlock error:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu kullaniciyi silmek istediginizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/identities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/identities");
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

  if (!identity) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/identities"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{identity.email}</h1>
            <div className="flex items-center gap-2 mt-1">
              {identity.isLocked ? (
                <Badge variant="danger">Kilitli</Badge>
              ) : identity.isActive ? (
                <Badge variant="success">Aktif</Badge>
              ) : (
                <Badge variant="warning">Pasif</Badge>
              )}
              {identity.emailVerified && <Badge variant="info">Email Onaylandi</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {identity.isLocked && (
            <button
              onClick={handleUnlock}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              Kilidi Ac
            </button>
          )}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Sifre Degistir
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kullanici Bilgileri</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={identity.email}
                disabled
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Isim</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                Aktif Hesap
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
                <dt className="text-sm text-gray-500">Olusturulma</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{formatDate(identity.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Son Guncelleme</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{formatDate(identity.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Son Giris</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{formatDate(identity.lastLoginAt)}</dd>
              </div>
              {identity.isLocked && (
                <>
                  <div>
                    <dt className="text-sm text-gray-500">Kilit Nedeni</dt>
                    <dd className="text-sm text-red-600 mt-0.5">{identity.lockReason || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Basarisiz Giris</dt>
                    <dd className="text-sm text-gray-900 mt-0.5">{identity.failedLoginAttempts}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Memberships */}
          {identity.memberships && identity.memberships.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Uyelikler</h2>
              <ul className="space-y-3">
                {identity.memberships.map((membership) => (
                  <li key={membership.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/tenants/${membership.tenantId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {membership.tenant?.name || membership.tenantId}
                      </Link>
                      <p className="text-xs text-gray-500">{membership.tenant?.slug}</p>
                    </div>
                    <Badge variant="default">{getRoleLabel(membership.role)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <SetPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        identityId={id}
      />
    </div>
  );
}

function SetPasswordModal({
  isOpen,
  onClose,
  identityId,
}: {
  isOpen: boolean;
  onClose: () => void;
  identityId: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Sifreler eslesmiyor");
      return;
    }

    if (password.length < 8) {
      setError("Sifre en az 8 karakter olmali");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/identities/${identityId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onClose();
        setPassword("");
        setConfirmPassword("");
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
    <Modal isOpen={isOpen} onClose={onClose} title="Sifre Degistir">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Sifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sifre Tekrar</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
