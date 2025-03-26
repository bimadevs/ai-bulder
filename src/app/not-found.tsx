import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <div className="pt-6">
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 