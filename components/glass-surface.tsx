"use client"

import './glass-surface.css'

interface GlassSurfaceProps {
  children: React.ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number
  className?: string
  style?: React.CSSProperties
}

export default function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  className = '',
  style = {}
}: GlassSurfaceProps) {
  const containerStyle: React.CSSProperties = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
  }

  return (
    <div
      className={`glass-surface ${className}`}
      style={containerStyle}
    >
      <div className="glass-surface__content">{children}</div>
    </div>
  )
}
