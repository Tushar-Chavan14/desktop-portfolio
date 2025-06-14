"use client"
import { ContextMenu } from "@src/components/contextMenu/ContxtMenu"
import { useState } from "react"

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    targetElement?: HTMLElement
  } | null>(null)

  const showContextMenu = (event: React.MouseEvent, element?: HTMLElement) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      targetElement: element || (event.target as HTMLElement)
    })
  }

  const hideContextMenu = () => {
    setContextMenu(null)
  }

  const ContextMenuComponent = contextMenu ? (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={hideContextMenu}
      targetElement={contextMenu.targetElement}
    />
  ) : null

  return {
    showContextMenu,
    hideContextMenu,
    ContextMenuComponent
  }
}