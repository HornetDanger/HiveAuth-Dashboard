import Link from "next/link";
import { StatsCard } from "@/components/ui/stats-card";
import type { DashboardStats } from "@/types";

export const dynamic = "force-dynamic";

async function getStats(): Promise<DashboardStats> {
  try {
    const apiUrl = process.env.HIVEAUTH_API_URL;
    const appSecret = process.env.HIVEAUTH_APP_SECRET;

    const response = await fetch(`${apiUrl}/api/v1/admin/stats`, {
      headers: {
        "Content-Type": "application/json",
        "x-app-secret": appSecret || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    return response.json();
  } catch (error) {
    console.error("Stats fetch error:", error);
    // Return default stats on error
    return {
      totalIdentities: 0,
      activeIdentities: 0,
      lockedIdentities: 0,
      verifiedIdentities: 0,
      totalTenants: 0,
      activeTenants: 0,
      planDistribution: {
        free: 0,
        starter: 0,
        professional: 0,
        enterprise: 0,
      },
      recentLogins24h: 0,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const quickLinks = [
    {
      name: "Yeni Kullanici",
      href: "/identities?action=create",
      icon: "👤",
      color: "bg-blue-100",
    },
    {
      name: "Yeni Isletme",
      href: "/tenants?action=create",
      icon: "🏢",
      color: "bg-green-100",
    },
    {
      name: "Kilitli Hesaplar",
      href: "/identities?filter=locked",
      icon: "🔒",
      color: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">HiveAuth yonetim paneline hos geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Toplam Kullanici"
          value={stats.totalIdentities}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Aktif Kullanici"
          value={stats.activeIdentities}
          color="green"
          description={`${stats.verifiedIdentities} dogrulanmis`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Toplam Isletme"
          value={stats.totalTenants}
          color="purple"
          description={`${stats.activeTenants} aktif`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
        <StatsCard
          title="Kilitli Hesap"
          value={stats.lockedIdentities}
          color={stats.lockedIdentities > 0 ? "red" : "green"}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Dagilimi</h2>
          <div className="space-y-3">
            {Object.entries(stats.planDistribution).map(([plan, count]) => {
              const total = Object.values(stats.planDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const labels: Record<string, string> = {
                free: "Ucretsiz",
                starter: "Baslangic",
                professional: "Profesyonel",
                enterprise: "Kurumsal",
              };
              const colors: Record<string, string> = {
                free: "bg-gray-500",
                starter: "bg-blue-500",
                professional: "bg-purple-500",
                enterprise: "bg-green-500",
              };

              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{labels[plan]}</span>
                    <span className="text-gray-900 font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[plan]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links + Recent Activity */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hizli Erisim</h2>
            <div className="grid grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-2xl mb-2`}>
                    {link.icon}
                  </div>
                  <span className="text-sm text-gray-600 text-center">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Son 24 Saat</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-3xl font-bold text-gray-900">{stats.recentLogins24h}</p>
                <p className="text-sm text-gray-500">basarili giris</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Accounts Warning */}
      {stats.lockedIdentities > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              {stats.lockedIdentities} hesap kilitli durumda
            </p>
            <p className="text-sm text-yellow-600">
              Kilitli hesaplari incelemek ve kilidi acmak icin tiklayin
            </p>
          </div>
          <Link
            href="/identities?filter=locked"
            className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Incele
          </Link>
        </div>
      )}
    </div>
  );
}
