import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApiKeyList } from '@/components/settings/api-key-list'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default async function ApiKeysPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola API keys dari berbagai penyedia AI untuk digunakan dalam proyek Anda.
          </p>
        </div>
        
        <ApiKeyList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
} 