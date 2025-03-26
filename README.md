This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# AI Builder

Platform no-code untuk membuat, mengelola, dan menyematkan AI dengan antarmuka visual yang intuitif.

## Fitur Utama

- **Drag-and-drop AI Builder**: Desain alur AI dengan antarmuka visual yang mudah
- **Multiple Provider**: Dukungan untuk OpenAI, Anthropic, dan Google AI
- **Export dan Embed**: Sematkan AI di website atau aplikasi Anda
- **Autentikasi**: Sistem login dan pendaftaran pengguna
- **Pengelolaan API Key**: Simpan dan kelola API key Anda dengan aman

## Persyaratan

- Node.js 18.0 atau lebih baru
- NPM 8.0 atau lebih baru
- Akun Supabase

## Setup

### 1. Clone repository

```bash
git clone https://github.com/username/ai-builder.git
cd ai-builder
```

### 2. Install dependensi

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env.local` di root project dan isi dengan:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Database Supabase

Untuk menjalankan migrasi database, ikuti langkah-langkah berikut:

1. Buka Supabase Dashboard untuk project Anda
2. Buka tab SQL Editor
3. Buka file `src/migration.sql` dari repository
4. Salin isi file dan tempelkan di SQL Editor Supabase
5. Klik "Run" untuk menjalankan migrasi dan membuat tabel yang diperlukan

### 5. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## Struktur Proyek

- `src/components`: Komponen UI dan fungsional
- `src/lib`: Utilitas, helper, dan konfigurasi
- `src/app`: Route dan halaman Next.js
- `public`: Asset statis

## Deployment

Aplikasi ini dapat di-deploy ke platform hosting seperti Vercel, Netlify, atau platform lain yang mendukung Next.js.
