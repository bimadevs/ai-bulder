'use client'

import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Terjadi Kesalahan</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Maaf, terjadi kesalahan saat memuat dashboard Anda.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border">
          <div className="space-y-4 text-center">
            <p className="text-red-500">
              {error.message || 'Terjadi kesalahan yang tidak terduga.'}
            </p>
            <Button onClick={() => reset()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 