import { createClient } from '@/lib/supabase/server'
import { EmbeddedAI } from '@/components/projects/embedded-ai'
import { notFound } from 'next/navigation'

interface EmbedPageProps {
  params: {
    id: string
  }
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const supabase = createClient()

  // Fetch project data
  const { data: project, error: projectError } = await supabase
    .from('ai_projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (projectError || !project) {
    return notFound()
  }

  // Fetch project config
  const { data: configData, error: configError } = await supabase
    .from('ai_configs')
    .select('config')
    .eq('project_id', params.id)
    .maybeSingle()

  if (configError || !configData || !configData.config) {
    return notFound()
  }

  return (
    <div className="h-screen w-full">
      <EmbeddedAI
        projectId={params.id}
        projectName={project.name}
        config={configData.config}
      />
    </div>
  )
} 