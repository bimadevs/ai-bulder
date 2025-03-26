'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Node, Edge } from 'reactflow'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'

interface ProjectPreviewProps {
  projectId: string
  userId: string
}

interface AIConfig {
  nodes: Node[]
  edges: Edge[]
}

export function ProjectPreview({ projectId, userId }: ProjectPreviewProps) {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch config and API keys
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Check if the user has access to this project
        const { data: project, error: projectError } = await supabase
          .from('ai_projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', userId)
          .single()

        if (projectError) throw projectError
        if (!project) throw new Error('Proyek tidak ditemukan atau Anda tidak memiliki akses')

        // Fetch project config
        const { data: configData, error: configError } = await supabase
          .from('ai_configs')
          .select('config')
          .eq('project_id', projectId)
          .maybeSingle()

        if (configError) throw configError
        if (!configData || !configData.config) {
          throw new Error('Konfigurasi proyek belum dibuat')
        }

        setConfig(configData.config as AIConfig)

        // Fetch user's API keys (as backup)
        const { data: keysData, error: keysError } = await supabase
          .from('api_keys')
          .select('provider, api_key')
          .eq('user_id', userId)

        if (keysError) throw keysError

        const keys: Record<string, string> = {}
        if (keysData) {
          keysData.forEach(key => {
            keys[key.provider] = key.api_key
          })
        }
        setApiKeys(keys)
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId, userId, supabase])

  // Process the flow
  async function processFlow() {
    if (!config || !input) return

    setIsProcessing(true)
    setError(null)
    setOutput('')

    try {
      // Find input and output nodes
      const inputNode = config.nodes.find(node => node.type === 'textInput')
      const processingNode = config.nodes.find(node => node.type === 'aiProcessing')
      const outputNode = config.nodes.find(node => node.type === 'textOutput')

      if (!inputNode || !processingNode || !outputNode) {
        throw new Error('Alur tidak lengkap. Pastikan Anda memiliki node input, pemrosesan, dan output.')
      }

      // Get the provider and model from the processing node
      const model = processingNode.data?.model || 'gpt-3.5-turbo'
      const temperature = processingNode.data?.temperature || 0.7
      const provider = processingNode.data?.provider || getProviderFromModel(model)

      // Default model berdasarkan provider jika tidak dispesifikasi
      let finalModel = model
      if (provider === 'openai' && !model.includes('gpt')) {
        finalModel = 'gpt-3.5-turbo'
      } else if (provider === 'anthropic' && !model.includes('claude')) {
        finalModel = 'claude-2'
      } else if (provider === 'google' && !model.includes('gemini')) {
        finalModel = 'gemini-1.5-flash'
      }

      // Use API key from node if available, otherwise use from stored keys
      let apiKey = processingNode.data.apiKey
      
      // If node doesn't have API key, try stored keys as backup
      if (!apiKey && !apiKeys[provider]) {
        throw new Error(`API key tidak ditemukan untuk provider ini. Silakan tambahkan API key di node AI atau di halaman pengaturan.`)
      }
      
      if (!apiKey) {
        apiKey = apiKeys[provider]
      }

      // Find the prompt node connected to processing node if any
      const findConnectedPromptNode = () => {
        if (!processingNode) return null
        
        // Find edges that target to the processing node
        const incomingEdges = config.edges.filter(edge => edge.target === processingNode.id)
        
        // Check if any of these edges come from a custom prompt node
        for (const edge of incomingEdges) {
          const sourceNode = config.nodes.find(node => node.id === edge.source)
          if (sourceNode && sourceNode.type === 'customPrompt') {
            return sourceNode
          }
        }
        
        return null
      }

      const customPromptNode = findConnectedPromptNode()

      // Persiapkan data untuk permintaan API
      const requestData: any = {
        input,
        model: finalModel,
        temperature,
        provider,
        apiKey,
      }
      
      // Tambahkan prompt template jika ada
      if (customPromptNode?.data?.promptTemplate) {
        requestData.promptTemplate = customPromptNode.data.promptTemplate
      }

      // Make a request to the server for AI processing
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal memproses permintaan')
      }

      const data = await response.json()
      setOutput(data.result || 'Tidak ada output yang dihasilkan')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Helper function to determine provider from model name
  function getProviderFromModel(model: string): string {
    if (!model) return 'openai'
    
    if (model.includes('gpt')) {
      return 'openai'
    } else if (model.includes('claude')) {
      return 'anthropic'
    } else if (model.includes('gemini')) {
      return 'google'
    }
    return 'openai' // Default
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Memuat preview...</p>
      </div>
    )
  }
  
  if (!config) {
    return (
      <div className="py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Konfigurasi tidak tersedia</AlertTitle>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/builder`)}>
            Buat Konfigurasi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg border">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-bold">Preview AI</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/builder`)}
          >
            Builder
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/export`)}
          >
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input">Input</Label>
          <div className="flex gap-2">
            <Input
              id="input"
              placeholder="Masukkan teks input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={processFlow} 
              disabled={isProcessing || !input}
            >
              {isProcessing ? 'Memproses...' : 'Proses'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="output">Output</Label>
          <div 
            id="output"
            className="min-h-[150px] p-3 border rounded-md bg-slate-50 dark:bg-slate-900"
          >
            {output || 'Output akan muncul di sini setelah pemrosesan...'}
          </div>
        </div>
      </div>
    </div>
  )
} 