"use client"

import { useCallback, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  MarkerType,
  Panel,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { Funnel } from "@/lib/types"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { StepNode } from "./StepNode"
import { Button } from "@/components/ui/button"
import { LayoutGrid, ZoomIn, ZoomOut } from "lucide-react"

const nodeTypes = { step: StepNode }

interface Props {
  funnel: Funnel
}

function buildFlowData(funnel: Funnel) {
  const nodes: Node[] = funnel.steps.map((step) => ({
    id: step.id,
    type: "step",
    position: step.position,
    data: {
      step,
      funnelId: funnel.id,
      pageId: step.pageId,
    },
  }))

  const edges: Edge[] = []
  funnel.steps.forEach((step) => {
    if (step.nextStepId) {
      edges.push({
        id: `${step.id}-next-${step.nextStepId}`,
        source: step.id,
        target: step.nextStepId,
        label: "Next",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: "#6366f1", strokeWidth: 2 },
        labelStyle: { fontSize: 10, fill: "#6366f1" },
        labelBgStyle: { fill: "#eef2ff" },
        animated: true,
      })
    }
    if (step.upsellStepId) {
      edges.push({
        id: `${step.id}-upsell-${step.upsellStepId}`,
        source: step.id,
        target: step.upsellStepId,
        label: "Upsell",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5 5" },
        labelStyle: { fontSize: 10, fill: "#10b981" },
        labelBgStyle: { fill: "#ecfdf5" },
      })
    }
    if (step.downsellStepId) {
      edges.push({
        id: `${step.id}-downsell-${step.downsellStepId}`,
        source: step.id,
        target: step.downsellStepId,
        label: "Downsell",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5 5" },
        labelStyle: { fontSize: 10, fill: "#f59e0b" },
        labelBgStyle: { fill: "#fffbeb" },
      })
    }
  })

  return { nodes, edges }
}

export function FunnelFlow({ funnel }: Props) {
  const { connectSteps, updateStep } = useFunnelStore()
  const { nodes: initNodes, edges: initEdges } = useMemo(() => buildFlowData(funnel), [funnel])

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        connectSteps(funnel.id, connection.source, connection.target)
        setEdges((eds) => addEdge({
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { stroke: "#6366f1", strokeWidth: 2 },
        }, eds))
      }
    },
    [funnel.id, connectSteps, setEdges]
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateStep(funnel.id, node.id, { position: node.position })
    },
    [funnel.id, updateStep]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      deleteKeyCode="Delete"
      minZoom={0.3}
      maxZoom={2}
      className="bg-muted/30"
    >
      <Background color="#e2e8f0" gap={20} />
      <Controls showInteractive={false} className="bg-card border-border shadow-sm" />
      <MiniMap
        nodeColor="#6366f1"
        maskColor="rgb(0 0 0 / 0.05)"
        className="bg-card border border-border rounded-xl shadow-sm"
      />

      <Panel position="top-left" className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground">
          {funnel.steps.length} step{funnel.steps.length !== 1 ? "s" : ""}
        </span>
        <span className="text-border">|</span>
        <span className="text-xs text-muted-foreground">Drag to connect steps</span>
      </Panel>
    </ReactFlow>
  )
}
