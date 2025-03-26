import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProjectPreview } from '@/components/projects/project-preview'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
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
          <h1 className="text-3xl font-bold">Preview AI</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Uji coba alur AI Anda secara langsung sebelum di-publish.
          </p>
        </div>
        
        <ProjectPreview projectId={params.id} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
} 