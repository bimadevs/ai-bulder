import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectList } from '@/components/projects/project-list'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Selamat datang di AI Builder. Mulai dengan membuat proyek baru atau mengelola proyek yang sudah ada.
          </p>
        </div>
        
        <ProjectList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
} 