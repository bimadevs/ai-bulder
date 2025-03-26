'use client'

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  useReactFlow,
  EdgeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { TextInputNode } from './nodes/text-input-node'
import { TextOutputNode } from './nodes/text-output-node'
import { AIProcessingNode } from './nodes/ai-processing-node'
import { CustomPromptNode } from './nodes/custom-prompt-node'
import { Trash2 } from 'lucide-react'

// Register custom node types
const nodeTypes = {
  textInput: TextInputNode,
  textOutput: TextOutputNode,
  aiProcessing: AIProcessingNode,
  customPrompt: CustomPromptNode,
}

interface FlowBuilderProps {
  onSave: (nodes: Node[], edges: Edge[]) => void
  savedNodes?: Node[]
  savedEdges?: Edge[]
}

function Flow({ onSave, savedNodes = [], savedEdges = [] }: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  // Connect nodes when user makes a connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edges) => addEdge(connection, edges))
    },
    [setEdges]
  )

  // Delete a node and its connections
  const deleteNode = useCallback(
    (id: string) => {
      // Menghapus node
      setNodes((nodes) => nodes.filter((node) => node.id !== id))
      
      // Menghapus koneksi yang terkait dengan node yang dihapus
      setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id))
    },
    [setNodes, setEdges]
  )

  // Delete an edge
  const deleteEdge = useCallback(
    (id: string) => {
      setEdges((edges) => edges.filter((edge) => edge.id !== id))
      setSelectedEdge(null)
    },
    [setEdges]
  )

  // Handle edge click
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      setSelectedEdge(edge.id)
    },
    []
  )

  // Add node to the flow
  const addNode = useCallback(
    (type: string) => {
      const position = project({
        x: reactFlowWrapper.current?.clientWidth
          ? reactFlowWrapper.current.clientWidth / 2
          : 250,
        y: reactFlowWrapper.current?.clientHeight
          ? reactFlowWrapper.current.clientHeight / 2
          : 200,
      })

      // Create different node based on type
      let newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} Node` },
        deletable: true, // Memastikan node dapat dihapus
      }

      // Customize the node based on type
      switch (type) {
        case 'textInput':
          newNode.data = {
            label: 'Input Teks',
            placeholder: 'Masukkan teks...',
            onDelete: deleteNode,
          }
          break
        case 'textOutput':
          newNode.data = {
            label: 'Output Teks',
            onDelete: deleteNode,
          }
          break
        case 'aiProcessing':
          newNode.data = {
            label: 'Pemrosesan AI',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            onDelete: deleteNode,
          }
          break
        case 'customPrompt':
          newNode.data = {
            label: 'Custom Prompt',
            promptTemplate: '',
            onDelete: deleteNode,
          }
          break
      }

      setNodes((nodes) => [...nodes, newNode])
    },
    [project, setNodes, deleteNode]
  )

  // Save the current flow
  const saveFlow = useCallback(() => {
    setIsSaving(true)
    onSave(nodes, edges)
    setTimeout(() => setIsSaving(false), 1000)
  }, [nodes, edges, onSave])

  // Custom edge styles
  const edgeOptions = {
    style: { strokeWidth: 2, stroke: '#10b981' },
    animated: true,
  }

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        onNodesDelete={(nodesToDelete) => {
          // Menghapus edge yang terkait dengan node yang dihapus
          const nodeIds = nodesToDelete.map(node => node.id)
          setEdges(edges => edges.filter(
            edge => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
          ))
        }}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        nodesDraggable={true}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
          <div className="flex flex-col gap-2">
            <Button 
              size="sm"
              onClick={() => addNode('textInput')}
            >
              + Input Teks
            </Button>
            <Button 
              size="sm"
              onClick={() => addNode('customPrompt')}
            >
              + Custom Prompt
            </Button>
            <Button 
              size="sm"
              onClick={() => addNode('aiProcessing')}
            >
              + Pemrosesan AI
            </Button>
            <Button 
              size="sm"
              onClick={() => addNode('textOutput')}
            >
              + Output Teks
            </Button>
            <Button 
              size="sm"
              variant="default"
              className="mt-4"
              onClick={saveFlow}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Alur'}
            </Button>
          </div>
        </Panel>
        
        {selectedEdge && (
          <Panel 
            position="bottom-center" 
            className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">Edge yang dipilih</span>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex items-center gap-1"
                onClick={() => deleteEdge(selectedEdge)}
              >
                <Trash2 className="h-3 w-3" />
                Hapus
              </Button>
            </div>
          </Panel>
        )}
      </ReactFlow>
      
      <div className="mt-2 p-2 bg-muted/20 rounded text-xs dark:text-gray-300 text-gray-700">
        <p>⌨️ Tip: Tekan <strong>Delete</strong> atau <strong>Backspace</strong> untuk menghapus node yang dipilih</p>
        <p>🖱️ Tip: Klik pada garis penghubung untuk menampilkan tombol hapus</p>
      </div>
    </div>
  )
}

// Wrapper component to provide ReactFlow context
export function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  )
} 