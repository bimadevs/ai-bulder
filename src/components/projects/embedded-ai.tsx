'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Node, Edge } from 'reactflow'

interface EmbeddedAIProps {
  projectId: string
  projectName: string
  config: {
    nodes: Node[]
    edges: Edge[]
  }
}

export function EmbeddedAI({ projectId, projectName, config }: EmbeddedAIProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract nodes based on type
  const inputNode = config.nodes.find(node => node.type === 'textInput')
  const processingNode = config.nodes.find(node => node.type === 'aiProcessing')

  // Let the server know this is an embedded view
  const processAI = async () => {
    if (!input) return

    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/embedded/${projectId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          model: processingNode?.data?.model || 'gpt-3.5-turbo',
          temperature: processingNode?.data?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal memproses permintaan')
      }

      const result = await response.json()
      setOutput(result.output)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold">{projectName}</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      
      <div className="flex-1 p-6 flex flex-col">
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          <div>
            <h2 className="text-base font-medium mb-2">
              {inputNode?.data?.label || 'Input'}
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder={inputNode?.data?.placeholder || "Masukkan teks input..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={processAI} 
                disabled={isProcessing || !input}
              >
                {isProcessing ? 'Memproses...' : 'Proses'}
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-base font-medium mb-2">Output</h2>
            <div className="min-h-[200px] p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
              {output || 'Output akan muncul di sini...'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t text-center text-xs text-slate-500">
        Dibuat dengan AI Builder
      </div>
    </div>
  )
} 