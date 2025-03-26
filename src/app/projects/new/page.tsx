import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/projects/project-form'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default async function NewProjectPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Buat Proyek Baru</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Lengkapi informasi berikut untuk membuat proyek AI baru.
          </p>
        </div>
        
        <ProjectForm userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
} 