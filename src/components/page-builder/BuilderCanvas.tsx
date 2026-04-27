"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useFunnelStore } from "@/lib/store/funnel-store"
import type { FunnelPage, PageElement } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { ElementRenderer } from "./ElementRenderer"
import { useState, useRef } from "react"

interface CanvasProps {
  page: FunnelPage
  funnelId: string
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  previewMode: boolean
}

const INLINE_EDITABLE_TYPES = new Set(["headline", "paragraph"])

function getElementLabel(type: string): string {
  return type
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

function SortableElement({
  element,
  funnelId,
  pageId,
  selected,
  onSelect,
  previewMode,
  index,
  total,
}: {
  element: PageElement
  funnelId: string
  pageId: string
  selected: boolean
  onSelect: () => void
  previewMode: boolean
  index: number
  total: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  })
  const { deleteElement, addElement, reorderElements, updateElement } = useFunnelStore()

  const [isInlineEditing, setIsInlineEditing] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    const copy: PageElement = {
      ...element,
      id: Math.random().toString(36).slice(2),
      props: { ...element.props },
      style: { ...element.style },
    }
    addElement(funnelId, pageId, copy)
    toast.success("Element duplicated")
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(funnelId, pageId, element.id)
    toast.success("Element deleted")
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const { funnels } = useFunnelStore.getState()
    const page = funnels.find((f) => f.id === funnelId)?.pages.find((p) => p.id === pageId)
    if (!page || index <= 0) return
    const newElements = arrayMove(page.elements, index, index - 1)
    reorderElements(funnelId, pageId, newElements)
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    const { funnels } = useFunnelStore.getState()
    const page = funnels.find((f) => f.id === funnelId)?.pages.find((p) => p.id === pageId)
    if (!page || index >= total - 1) return
    const newElements = arrayMove(page.elements, index, index + 1)
    reorderElements(funnelId, pageId, newElements)
  }

  const handleStartInlineEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!INLINE_EDITABLE_TYPES.has(element.type)) return
    setIsInlineEditing(true)
    setTimeout(() => {
      editRef.current?.focus()
      const range = document.createRange()
      const sel = window.getSelection()
      if (editRef.current && sel) {
        range.selectNodeContents(editRef.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }, 10)
  }

  const handleInlineEditBlur = () => {
    if (!editRef.current) return
    const newText = editRef.current.innerText
    updateElement(funnelId, pageId, element.id, {
      props: { ...element.props, text: newText },
    })
    setIsInlineEditing(false)
  }

  if (previewMode) {
    return (
      <div ref={setNodeRef} style={dndStyle}>
        <ElementRenderer element={element} />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={cn(
        "relative group cursor-pointer transition-all",
        selected
          ? "outline outline-2 outline-indigo-500 outline-offset-0 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
          : "hover:outline hover:outline-1 hover:outline-indigo-300 hover:outline-offset-0"
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (!isInlineEditing) onSelect()
      }}
      onDoubleClick={handleStartInlineEdit}
    >
      {/* Selection label + action toolbar */}
      {selected && !isInlineEditing && (
        <>
          {/* Top label bar */}
          <div className="absolute -top-8 left-0 flex items-center h-7 z-20 pointer-events-auto">
            <div className="flex items-center gap-0.5 bg-indigo-600 text-white rounded-t-md overflow-hidden shadow-lg">
              {/* Drag handle */}
              <button
                {...attributes}
                {...listeners}
                className="px-2 h-full flex items-center cursor-grab active:cursor-grabbing hover:bg-indigo-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {/* Element type label */}
              <span className="text-[11px] font-semibold pr-2 pl-1">
                {getElementLabel(element.type)}
              </span>

              {/* Divider */}
              <div className="w-px h-4 bg-indigo-400 mx-0.5" />

              {/* Actions */}
              {INLINE_EDITABLE_TYPES.has(element.type) && (
                <button
                  onClick={handleStartInlineEdit}
                  className="w-7 h-7 flex items-center justify-center hover:bg-indigo-700 transition-colors"
                  title="Edit text (dbl-click)"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleMoveUp}
                disabled={index === 0}
                className={cn(
                  "w-7 h-7 flex items-center justify-center transition-colors",
                  index === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-indigo-700"
                )}
                title="Move up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleMoveDown}
                disabled={index === total - 1}
                className={cn(
                  "w-7 h-7 flex items-center justify-center transition-colors",
                  index === total - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-indigo-700"
                )}
                title="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDuplicate}
                className="w-7 h-7 flex items-center justify-center hover:bg-indigo-700 transition-colors"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="w-7 h-7 flex items-center justify-center hover:bg-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Inline edit overlay for text elements */}
      {isInlineEditing && INLINE_EDITABLE_TYPES.has(element.type) ? (
        <div className="relative">
          <div className="absolute inset-0 bg-blue-50/40 pointer-events-none z-10 border-2 border-blue-400" />
          <div
            className="absolute top-1 right-1 z-20 flex items-center gap-1"
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                handleInlineEditBlur()
              }}
              className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-indigo-700"
            >
              <Check className="w-3 h-3" /> Done
            </button>
          </div>
          {/* Editable overlay */}
          <div
            style={{
              padding: element.style.padding || "16px 24px",
              fontFamily: "inherit",
            }}
          >
            <div
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleInlineEditBlur}
              className="outline-none w-full"
              style={{
                fontSize: element.style.fontSize,
                fontWeight: element.style.fontWeight,
                color: element.style.color || "#111827",
                textAlign: element.style.textAlign as "center" | "left" | "right" | undefined,
                lineHeight: element.style.lineHeight,
                minHeight: "1em",
              }}
            >
              {element.props.text as string}
            </div>
          </div>
        </div>
      ) : (
        <ElementRenderer element={element} />
      )}

      {/* Add element below hint (on hover, bottom) */}
      {selected && (
        <div className="absolute -bottom-px left-0 right-0 h-px bg-indigo-500 z-10" />
      )}
    </div>
  )
}

export function BuilderCanvas({
  page,
  funnelId,
  selectedElementId,
  onSelectElement,
  previewMode,
}: CanvasProps) {
  const { reorderElements } = useFunnelStore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = page.elements.findIndex((el) => el.id === active.id)
      const newIndex = page.elements.findIndex((el) => el.id === over.id)
      const newElements = arrayMove(page.elements, oldIndex, newIndex)
      reorderElements(funnelId, page.id, newElements)
    }
  }

  return (
    <div
      className={cn(
        "min-h-[600px] rounded-xl overflow-hidden",
        !previewMode && "shadow-2xl ring-1 ring-black/5"
      )}
      style={{
        backgroundColor: page.settings.backgroundColor,
        fontFamily: page.settings.fontFamily,
      }}
      onClick={() => onSelectElement(null)}
    >
      {/* Browser chrome mock */}
      {!previewMode && (
        <div className="h-9 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-2 bg-white rounded-md text-[11px] text-gray-400 px-3 py-1 text-center truncate border border-gray-200 max-w-[300px] mx-auto">
            {page.name.toLowerCase().replace(/ /g, "-")}
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{ maxWidth: page.settings.maxWidth, margin: "0 auto" }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={page.elements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {page.elements.map((element, index) => (
              <SortableElement
                key={element.id}
                element={element}
                funnelId={funnelId}
                pageId={page.id}
                selected={selectedElementId === element.id}
                onSelect={() => onSelectElement(element.id)}
                previewMode={previewMode}
                index={index}
                total={page.elements.length}
              />
            ))}
          </SortableContext>
        </DndContext>

        {page.elements.length === 0 && !previewMode && (
          <div className="py-32 flex flex-col items-center gap-4 text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-500">Start building your page</p>
              <p className="text-sm text-gray-400 mt-1">
                Click any element on the left panel to add it here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
