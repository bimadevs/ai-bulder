'use client'

import { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface TextInputNodeData {
  label?: string
  placeholder?: string
  inputValue?: string
  onDelete?: (id: string) => void
}

export function TextInputNode({ id, data, isConnectable }: NodeProps<TextInputNodeData>) {
  const [inputValue, setInputValue] = useState(data.inputValue || '')

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    data.inputValue = value
    setInputValue(value)
  }

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id)
    }
  }

  return (
    <div className="p-4 rounded-md bg-white border border-blue-500 shadow-md dark:bg-slate-900 dark:border-blue-800 w-72">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Label className="font-medium">{data.label || 'Input Teks'}</Label>
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
        
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder={data.placeholder || "Masukkan teks..."}
          className="min-h-[100px] text-xs"
        />
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500 dark:bg-blue-400"
      />
    </div>
  )
} 