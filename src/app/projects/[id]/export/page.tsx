import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProjectExport } from '@/components/projects/project-export'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface ExportPageProps {
  params: {
    id: string
  }
}

export default async function ExportPage({ params }: ExportPageProps) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verify project exists and belongs to user
  const { data: project, error } = await supabase
    .from('ai_projects')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !project) {
    return notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Export AI</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Dapatkan URL atau kode embed untuk menyematkan AI Anda di situs web.
          </p>
        </div>
        
        <ProjectExport projectId={params.id} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
} 