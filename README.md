# HiveAuth Dashboard

HiveAuth API'yi yoneten bagimsiz bir Next.js 14 admin paneli.

## Ozellikler

- Dashboard istatistikleri
- Kullanici (Identity) yonetimi
  - Liste, arama, filtreleme
  - Kullanici olusturma/duzenleme/silme
  - Sifre degistirme
  - Hesap kilidini acma
- Isletme (Tenant) yonetimi
  - Liste, arama, filtreleme
  - Isletme olusturma/duzenleme/silme
  - Plan degistirme
- Guvenli admin kimlik dogrulama

## Kurulum

1. Bagimliliklari yukleyin:

```bash
npm install
```

2. `.env.example` dosyasini `.env` olarak kopyalayin ve degerleri guncelleyin:

```bash
cp .env.example .env
```

3. Development server'i baslatin:

```bash
npm run dev
```

## Environment Variables

| Degisken | Aciklama |
|----------|----------|
| `HIVEAUTH_API_URL` | HiveAuth API URL'i |
| `HIVEAUTH_APP_SECRET` | HiveAuth API secret (x-app-secret header icin) |
| `NEXTAUTH_URL` | Dashboard URL'i |
| `NEXTAUTH_SECRET` | NextAuth secret key |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login sifre |

## Vercel Deployment

1. GitHub'a push edin
2. Vercel'de yeni proje olusturun
3. Environment variables'lari ekleyin
4. Deploy edin

## Proje Yapisi

```
src/
├── app/
│   ├── (auth)/login/          # Admin login sayfasi
│   ├── (dashboard)/           # Dashboard layout ve sayfalari
│   │   ├── identities/        # Kullanici yonetimi
│   │   └── tenants/           # Isletme yonetimi
│   └── api/                   # HiveAuth API proxy route'lari
├── components/
│   ├── ui/                    # UI componentleri
│   └── layout/                # Layout componentleri
├── lib/                       # Utility fonksiyonlari
└── types/                     # TypeScript type tanimlari
```

## Guvenlik

- `x-app-secret` sadece server-side API route'lardan kullanilir
- Client tarafina secret gonderilmez (proxy pattern)
- NextAuth ile JWT-based session yonetimi
- Middleware ile route korumasi

## Gereksinimler

HiveAuth backend'inde su endpoint'lerin olmasi gerekir:

### Admin Endpoints

- `GET /admin/identities` - Kullanici listesi
- `GET /admin/identities/:id` - Kullanici detay
- `POST /admin/identities` - Kullanici olustur
- `PUT /admin/identities/:id` - Kullanici guncelle
- `DELETE /admin/identities/:id` - Kullanici sil
- `POST /admin/identities/:id/unlock` - Hesap kilidini ac
- `POST /admin/identities/:id/password` - Sifre degistir
- `GET /admin/tenants` - Isletme listesi
- `GET /admin/tenants/:id` - Isletme detay
- `POST /admin/tenants` - Isletme olustur
- `PUT /admin/tenants/:id` - Isletme guncelle
- `DELETE /admin/tenants/:id` - Isletme sil
- `GET /admin/stats` - Dashboard istatistikleri
- `POST /admin/verify` - Admin login dogrulama
