'use client'

import { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomPromptNodeData {
  label?: string
  promptTemplate?: string
  onDelete?: (id: string) => void
}

export function CustomPromptNode({ id, data, isConnectable }: NodeProps<CustomPromptNodeData>) {
  const [promptTemplate, setPromptTemplate] = useState(data.promptTemplate || '')

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    data.promptTemplate = value
    setPromptTemplate(value)
  }

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id)
    }
  }

  return (
    <div className="p-4 rounded-md bg-white border border-emerald-500 shadow-md dark:bg-slate-900 dark:border-emerald-800 w-72">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Label className="font-medium">{data.label || 'Custom Prompt'}</Label>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500" 
            onClick={handleDelete}
            title="Hapus node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="promptTemplate" className="text-xs">Template Prompt</Label>
          <Textarea
            id="promptTemplate"
            value={promptTemplate}
            onChange={handlePromptChange}
            placeholder="Tulis template prompt di sini. Gunakan {{input}} untuk memasukkan teks dari node sebelumnya."
            className="min-h-[100px] text-xs"
          />
          <p className="text-[10px] text-gray-500">
            Gunakan {"{"}{"{"}"input"{"}"}{"}"} sebagai placeholder untuk input dari node sebelumnya
          </p>
        </div>
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400"
      />
    </div>
  )
} 