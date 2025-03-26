'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface TextOutputNodeData {
  label?: string
  outputValue?: string
  onDelete?: (id: string) => void
}

export function TextOutputNode({ id, data, isConnectable }: NodeProps<TextOutputNodeData>) {
  return (
    <div className="p-4 rounded-md bg-white border border-green-500 shadow-md dark:bg-slate-900 dark:border-green-800 w-72">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Label className="font-medium">{data.label || 'Output Teks'}</Label>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500" 
            onClick={() => data.onDelete && data.onDelete(id)}
            title="Hapus node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Textarea
          value={data.outputValue || ''}
          readOnly
          placeholder="Output akan muncul di sini..."
          className="min-h-[100px] text-xs bg-gray-50 dark:bg-gray-800"
        />
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500 dark:bg-green-400"
      />
    </div>
  )
} 