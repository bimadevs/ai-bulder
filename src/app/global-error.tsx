'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Maaf, terjadi kesalahan yang tidak terduga saat memproses permintaan Anda.
            </p>
            <div className="pt-6">
              <Button onClick={() => reset()}>
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 