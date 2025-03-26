import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProjectForm } from '@/components/projects/project-form'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch project data
  const { data: project, error } = await supabase
    .from('ai_projects')
    .select('*')
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
          <h1 className="text-3xl font-bold">Edit Proyek</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Perbarui detail proyek atau lanjutkan untuk membangun alur AI.
          </p>
        </div>
        
        <ProjectForm
          userId={session.user.id}
          initialData={{
            id: project.id,
            name: project.name,
            description: project.description || '',
          }}
        />
      </div>
    </DashboardLayout>
  )
} 