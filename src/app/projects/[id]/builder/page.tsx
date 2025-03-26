import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProjectBuilder } from '@/components/projects/project-builder'

interface BuilderPageProps {
  params: {
    id: string
  }
}

export default async function BuilderPage({ params }: BuilderPageProps) {
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
    <div className="h-screen flex flex-col">
      <ProjectBuilder projectId={params.id} userId={session.user.id} />
    </div>
  )
} 