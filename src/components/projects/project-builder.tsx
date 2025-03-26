'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FlowBuilder } from '@/components/flow-builder/flow-builder'
import { Node, Edge } from 'reactflow'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ProjectBuilderProps {
  projectId: string
  userId: string
}

export function ProjectBuilder({ projectId, userId }: ProjectBuilderProps) {
  const [config, setConfig] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch existing config
  useEffect(() => {
    async function fetchConfig() {
      setIsLoading(true)
      setError(null)
      try {
        // First, check if project exists and belongs to user
        const { data: project, error: projectError } = await supabase
          .from('ai_projects')
          .select('id')
          .eq('id', projectId)
          .eq('user_id', userId)
          .single()

        if (projectError || !project) {
          throw new Error('Proyek tidak ditemukan atau Anda tidak memiliki akses')
        }

        // Then get the config
        const { data, error } = await supabase
          .from('ai_configs')
          .select('config')
          .eq('project_id', projectId)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setConfig(data.config)
        } else {
          // No config yet, create an empty one
          setConfig({ nodes: [], edges: [] })
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat konfigurasi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [projectId, userId, supabase])

  async function handleSave(nodes: Node[], edges: Edge[]) {
    setError(null)
    setSuccess(null)
    
    try {
      // Process nodes to prepare for saving
      // Extract API keys from nodes to save separately if needed
      const processedNodes = nodes.map(node => {
        const newNode = { ...node }
        
        // Store API key information securely if needed
        if (node.type === 'aiProcessing' && node.data?.apiKey) {
          // Keep API key in node data for now, but you can implement 
          // secure storage later if needed
        }
        
        return newNode
      })

      // Check if config already exists
      const { data, error: selectError } = await supabase
        .from('ai_configs')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle()

      if (selectError) throw selectError

      let saveError
      if (data) {
        // Update existing config
        const { error } = await supabase
          .from('ai_configs')
          .update({
            config: { nodes: processedNodes, edges },
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)
        
        saveError = error
      } else {
        // Create new config
        const { error } = await supabase
          .from('ai_configs')
          .insert({
            project_id: projectId,
            config: { nodes: processedNodes, edges },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        saveError = error
      }

      if (saveError) throw saveError

      setSuccess('Alur AI berhasil disimpan')
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan konfigurasi')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Memuat konfigurasi...</p>
        </div>
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/projects')}
            >
              Kembali ke Daftar Proyek
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border-b">
        <h1 className="text-xl font-bold">AI Builder</h1>
        <div className="space-x-2">
          {success && (
            <Alert className="mb-0 w-auto inline-flex bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{success}</AlertTitle>
            </Alert>
          )}
          {error && (
            <Alert className="mb-0 w-auto inline-flex" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            Kembali
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/preview`)}
          >
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/export`)}
          >
            Export
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-[500px]">
        <FlowBuilder
          onSave={handleSave}
          savedNodes={config?.nodes || []}
          savedEdges={config?.edges || []}
        />
      </div>
    </div>
  )
} 