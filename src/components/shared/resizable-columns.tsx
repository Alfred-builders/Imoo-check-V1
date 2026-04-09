import { useState, useRef, useCallback } from 'react'

/**
 * Hook for resizable table columns.
 * Returns column widths, resize handlers, and a ResizeHandle component.
 */
export function useResizableColumns(defaultWidths: Record<string, number>) {
  const [colWidths, setColWidths] = useState<Record<string, number>>({ ...defaultWidths })
  const startWidths = useRef<Record<string, number>>({})

  const onResizeStart = useCallback(() => {
    startWidths.current = { ...colWidths }
  }, [colWidths])

  const onResize = useCallback((colId: string, delta: number) => {
    setColWidths(prev => ({
      ...prev,
      [colId]: Math.max(40, (startWidths.current[colId] || prev[colId]) + delta),
    }))
  }, [])

  return { colWidths, onResizeStart, onResize }
}

/**
 * Drag handle rendered at the right edge of a column header.
 */
export function ResizeHandle({ colId, onResizeStart, onResize }: {
  colId: string
  onResizeStart: () => void
  onResize: (id: string, delta: number) => void
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    onResizeStart()
    const onMouseMove = (ev: MouseEvent) => {
      onResize(colId, ev.clientX - startX)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/40 transition-colors z-10"
    />
  )
}
