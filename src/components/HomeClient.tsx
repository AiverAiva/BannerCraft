'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import { BANNER_COLORS, BANNER_PATTERNS } from '@/lib/banner-data'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Layer {
  id: string
  shape: string
  color: string
}

const imageCache = new Map<string, HTMLImageElement>()

function getTexture(assetName: string): Promise<HTMLImageElement> {
  if (imageCache.has(assetName)) {
    return Promise.resolve(imageCache.get(assetName)!)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = `/textures/banner/${assetName}.png`
    img.onload = () => {
      imageCache.set(assetName, img)
      resolve(img)
    }
    img.onerror = reject
  })
}

// Pattern thumbnail component using canvas
function PatternThumbnail({ pattern, color, size = 40, isSelected, onClick, isDark, mounted }: {
  pattern: string
  color: string
  size?: number
  isSelected: boolean
  onClick: () => void
  isDark: boolean
  mounted: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, 20, 40)

      // Draw transparent background pattern
      ctx.fillStyle = isDark ? '#2a2a2a' : '#e5e5e5'
      ctx.fillRect(0, 0, 20, 40)

      // Draw checkerboard for transparency indication
      const checkSize = 5
      ctx.fillStyle = isDark ? '#3a3a3a' : '#d5d5d5'
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 8; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize)
          }
        }
      }

      // Render the pattern texture
      const patternConfig = BANNER_PATTERNS[pattern]
      if (patternConfig) {
        try {
          const texture = await getTexture(patternConfig.assetName)
          
          // Create offscreen canvas for tinting
          const offscreen = document.createElement('canvas')
          offscreen.width = 20
          offscreen.height = 40
          const octx = offscreen.getContext('2d')
          if (octx) {
            octx.imageSmoothingEnabled = false
            // Draw texture with crop (x:1, y:1, w:20, h:40)
            octx.drawImage(texture, 1, 1, 20, 40, 0, 0, 20, 40)
            // Tint with color
            octx.globalCompositeOperation = 'source-in'
            octx.fillStyle = BANNER_COLORS[color]?.hex || '#000000'
            octx.fillRect(0, 0, 20, 40)
            
            // Draw tinted pattern to main canvas
            ctx.drawImage(offscreen, 0, 0)
          }
        } catch (err) {
          console.error(`Failed to load texture for ${pattern} (${patternConfig.assetName}):`, err)
          // No fallback - we want to ensure assets are used
        }
      }
    }

    render()
  }, [pattern, color, size, isDark])

  return (
    <button
      onClick={onClick}
      className="relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 focus:outline-none"
      style={{
        width: size,
        height: size * 2,
        boxShadow: isSelected
          ? `0 0 0 2px var(--foreground), 0 4px 12px rgba(0,0,0,0.15)`
          : `0 2px 8px rgba(0,0,0,0.1)`,
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      }}
      aria-label={`Select ${pattern} pattern`}
    >
      <canvas ref={canvasRef} width={20} height={40} style={{ width: size, height: size * 2, imageRendering: 'pixelated' }} className="block" />
    </button>
  )
}

// Color swatch component
function ColorSwatch({ color, isSelected, onClick, isDark, mounted }: {
  color: string
  isSelected: boolean
  onClick: () => void
  isDark: boolean
  mounted: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none"
      style={{
        width: 28,
        height: 28,
        backgroundColor: BANNER_COLORS[color]?.hex,
        boxShadow: isSelected
          ? `0 0 0 2px var(--foreground), 0 2px 8px rgba(0,0,0,0.15)`
          : '0 1px 4px rgba(0,0,0,0.1)',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
      }}
      aria-label={`Select ${color} color`}
    />
  )
}

// Pattern selector modal/grid
function PatternSelector({ selectedPattern, selectedColor, onSelect, isOpen, onClose, isDark, mounted }: {
  selectedPattern: string
  selectedColor: string
  onSelect: (pattern: string) => void
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  mounted: boolean
}) {
  const patternNames = Object.keys(BANNER_PATTERNS)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
      />
      <div
        className="relative rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto transition-all duration-300 bg-background border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-sm font-medium text-foreground"
          >
            Select Pattern
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-muted/20 hover:bg-muted/40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
          {patternNames.map((pattern) => (
             <PatternThumbnail
               key={pattern}
               pattern={pattern}
               color={selectedColor}
               size={48}
               isSelected={selectedPattern === pattern}
               onClick={() => {
                 onSelect(pattern)
                 onClose()
               }}
               isDark={isDark}
               mounted={mounted}
             />
          ))}
        </div>
      </div>
    </div>
  )
}

function SortableLayerItem({
  layer,
  index,
  total,
  isDark,
  mounted,
  colorNames,
  setOpenPatternSelector,
  updateLayer,
  removeLayer,
  moveLayer,
}: {
  layer: Layer
  index: number
  total: number
  isDark: boolean
  mounted: boolean
  colorNames: string[]
  setOpenPatternSelector: (idx: number) => void
  updateLayer: (idx: number, key: 'shape' | 'color', value: string) => void
  removeLayer: (idx: number) => void
  moveLayer: (idx: number, dir: 'up' | 'down') => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: layer.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-4 p-4 rounded-xl transition-colors duration-300 border border-border ${
        isDragging ? 'bg-muted/30 shadow-2xl scale-[1.02]' : 'bg-muted/10 hover:bg-muted/20'
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="w-6 h-10 flex shrink-0 items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="12" r="1"></circle>
          <circle cx="9" cy="5" r="1"></circle>
          <circle cx="9" cy="19" r="1"></circle>
          <circle cx="15" cy="12" r="1"></circle>
          <circle cx="15" cy="5" r="1"></circle>
          <circle cx="15" cy="19" r="1"></circle>
        </svg>
      </button>

      {/* Layer number and Up/Down arrows */}
      <div className="flex flex-col items-center justify-center shrink-0 w-8 gap-0.5">
        <button
          onClick={() => moveLayer(index, 'up')}
          disabled={index === 0}
          className="w-6 h-4 flex items-center justify-center rounded transition-colors hover:bg-muted/50 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold bg-muted/50 text-muted-foreground"
        >
          {index + 1}
        </div>
        <button
          onClick={() => moveLayer(index, 'down')}
          disabled={index === total - 1}
          className="w-6 h-4 flex items-center justify-center rounded transition-colors hover:bg-muted/50 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

      {/* Pattern preview - clickable to open selector */}
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 shrink-0"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => setOpenPatternSelector(index)}
      >
        <PatternThumbnail
          pattern={layer.shape}
          color={layer.color}
          size={56}
          isSelected={false}
          onClick={() => setOpenPatternSelector(index)}
          isDark={isDark}
          mounted={mounted}
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Color selection */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {colorNames.map((color) => (
          <button
            key={color}
            onClick={() => updateLayer(index, 'color', color)}
            className="rounded-md transition-all duration-150 focus:outline-none"
            style={{
              width: 22,
              height: 22,
              backgroundColor: BANNER_COLORS[color].hex,
              boxShadow: layer.color === color
                ? `0 0 0 1.5px var(--foreground)`
                : 'none',
              transform: layer.color === color ? 'scale(1.15)' : 'scale(1)',
              opacity: layer.color === color ? 1 : 0.7,
            }}
            aria-label={`Set layer color to ${color}`}
          />
        ))}
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeLayer(index)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ml-auto shrink-0"
        style={{
          backgroundColor: mounted && isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
          color: '#ef4444',
        }}
        aria-label="Remove layer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function HomeClient() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [mounted, setMounted] = useState(false)
  const [baseColor, setBaseColor] = useState('red')
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'initial-layer', shape: 'curly_border', color: 'black' }
  ])
  const [dimension, setDimension] = useState<{ type: 'width' | 'height' | null; value: number }>({ type: null, value: 0 })
  const [copied, setCopied] = useState(false)
  const [openPatternSelector, setOpenPatternSelector] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Set mounted flag and parse URL
  useEffect(() => {
    setMounted(true)
    
    // Parse URL params on load
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      
      const base = params.get('base')
      if (base && BANNER_COLORS[base]) {
        setBaseColor(base)
      }
      
      const layersStr = params.get('layers')
      if (layersStr) {
        try {
          const parsed = JSON.parse(layersStr)
          if (Array.isArray(parsed)) {
            setLayers(parsed.map((l: any) => ({
              ...l,
              id: Math.random().toString(36).slice(2)
            })))
          }
        } catch (e) {
          console.error("Invalid layers JSON in URL", e)
        }
      }
    }
  }, [])

  // Generate banner URL
  const bannerUrl = useMemo(() => {
    const params = new URLSearchParams()
    params.set('base', baseColor)
    if (layers.length > 0) {
      params.set('layers', JSON.stringify(layers.map(({ shape, color }) => ({ shape, color }))))
    }
    if (dimension.type && dimension.value > 0) {
      params.set(dimension.type, dimension.value.toString())
    }
    params.set('v', '2') // Cache buster to clear old procedural SVGs
    return `/api/bannerCreate?${params.toString()}`
  }, [baseColor, layers, dimension])

  // Generate shareable URL
  const shareableUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams()
    params.set('base', baseColor)
    if (layers.length > 0) {
      params.set('layers', JSON.stringify(layers.map(({ shape, color }) => ({ shape, color }))))
    }
    if (dimension.type && dimension.value > 0) {
      params.set(dimension.type, dimension.value.toString())
    }
    params.set('v', '2') // Cache buster
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://banner.weikuwu.me'
    return `${baseUrl}/?${params.toString()}`
  }, [baseColor, layers, dimension])

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = shareableUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareableUrl])

  // Add new layer
  const addLayer = useCallback(() => {
    if (layers.length < 10) {
      setLayers([...layers, { id: Math.random().toString(36).slice(2), shape: 'stripe_bottom', color: 'white' }])
    }
  }, [layers])

  // Remove layer
  const removeLayer = useCallback((index: number) => {
    setLayers(layers.filter((_, i) => i !== index))
  }, [layers])

  // Update layer
  const updateLayer = useCallback((index: number, key: 'shape' | 'color', value: string) => {
    const newLayers = [...layers]
    newLayers[index] = { ...newLayers[index], [key]: value }
    setLayers(newLayers)
  }, [layers])

  // Move layer up/down
  const moveLayer = useCallback((index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setLayers(arrayMove(layers, index, index - 1))
    } else if (direction === 'down' && index < layers.length - 1) {
      setLayers(arrayMove(layers, index, index + 1))
    }
  }, [layers])

  // Handle drag and drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id)
      const newIndex = layers.findIndex((l) => l.id === over.id)
      setLayers(arrayMove(layers, oldIndex, newIndex))
    }
  }

  const colorNames = Object.keys(BANNER_COLORS)

  return (
    <div
      className="flex-1 flex flex-col transition-colors duration-500"
    >
      {/* Main Content */}
      <main className="flex-1 pt-8 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start w-full">
            {/* Banner Preview */}
            <div className="shrink-0 flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onClick={copyToClipboard}
              >
                <div
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
                  style={{
                    backgroundColor: BANNER_COLORS[baseColor]?.hex,
                    transform: 'scale(1.3)',
                  }}
                />
                <div
                  className="relative rounded-2xl p-1 transition-all duration-300 border border-border bg-muted/30"
                  style={{
                    boxShadow: mounted && isDark
                      ? '0 20px 40px -10px rgba(0,0,0,0.5)'
                      : '0 20px 40px -10px rgba(0,0,0,0.15)',
                  }}
                >
                  <img
                    src={bannerUrl}
                    alt="Minecraft Banner"
                    className="w-32 h-auto transition-transform duration-300 group-hover:scale-105"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              <div
                className={`mt-3 text-xs font-medium transition-all duration-300 ${
                  copied
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                {mounted ? (copied ? '✓ Copied!' : 'Click to copy') : ''}
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 w-full space-y-8">
              {/* Base Color */}
              <div>
                <h2
                  className="text-xs font-medium mb-4 tracking-wider uppercase transition-colors duration-300"
                  style={{ color: mounted && isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                >
                  Base Color
                </h2>
                <div className="flex flex-wrap gap-2">
                  {colorNames.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      isSelected={baseColor === color}
                      onClick={() => setBaseColor(color)}
                      isDark={isDark}
                      mounted={mounted}
                    />
                  ))}
                </div>
              </div>

              {/* Pattern Layers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xs font-medium tracking-wider uppercase text-muted-foreground transition-colors duration-300"
                  >
                    Layers ({layers.length}/10)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLayers([])}
                      disabled={layers.length === 0}
                      className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 bg-destructive/10 text-destructive hover:scale-105 hover:bg-destructive/20 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-destructive/10 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Remove All
                    </button>
                    <button
                      onClick={addLayer}
                      disabled={layers.length >= 10}
                      className="text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 bg-muted/50 text-muted-foreground hover:scale-105 hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-muted/50 disabled:hover:text-muted-foreground disabled:cursor-not-allowed"
                    >
                      + Add Layer
                    </button>
                  </div>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={layers.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {layers.map((layer, index) => (
                        <SortableLayerItem
                          key={layer.id}
                          layer={layer}
                          index={index}
                          total={layers.length}
                          isDark={isDark}
                          mounted={mounted}
                          colorNames={colorNames}
                          setOpenPatternSelector={setOpenPatternSelector}
                          updateLayer={updateLayer}
                          removeLayer={removeLayer}
                          moveLayer={moveLayer}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Pattern Selector Modal */}
                {openPatternSelector !== null && (
                  <PatternSelector
                    selectedPattern={layers[openPatternSelector]?.shape || 'stripe_bottom'}
                    selectedColor={layers[openPatternSelector]?.color || 'white'}
                    onSelect={(pattern) => updateLayer(openPatternSelector, 'shape', pattern)}
                    isOpen={true}
                    onClose={() => setOpenPatternSelector(null)}
                    isDark={isDark}
                    mounted={mounted}
                  />
                )}
              </div>

              {/* Dimensions */}
              <div>
                <h2
                  className="text-xs font-medium mb-4 tracking-wider uppercase text-muted-foreground transition-colors duration-300"
                >
                  Custom Size
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={dimension.type === 'width' ? dimension.value : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val) && val > 0) {
                            setDimension({ type: 'width', value: val })
                          } else {
                            setDimension({ type: null, value: 0 })
                          }
                        }}
                        placeholder="Width"
                        className="w-full h-10 px-3 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-muted/20 text-foreground"
                        disabled={dimension.type === 'height'}
                      />
                      {dimension.type === 'width' && (
                        <button
                          onClick={() => setDimension({ type: null, value: 0 })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: mounted && isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="3200"
                        value={dimension.type === 'height' ? dimension.value : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val) && val > 0) {
                            setDimension({ type: 'height', value: val })
                          } else {
                            setDimension({ type: null, value: 0 })
                          }
                        }}
                        placeholder="Height"
                        className="w-full h-10 px-3 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-muted/20 text-foreground"
                        disabled={dimension.type === 'width'}
                      />
                      {dimension.type === 'height' && (
                        <button
                          onClick={() => setDimension({ type: null, value: 0 })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: mounted && isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Sharing */}
              <div>
                <h2
                  className="text-xs font-medium mb-4 tracking-wider uppercase text-muted-foreground transition-colors duration-300"
                >
                  Shareable Link
                </h2>
                <div className="flex gap-2">
                  <div
                    className="flex-1 p-3 rounded-xl font-mono text-xs break-all transition-colors duration-300 min-h-[40px] flex items-center bg-muted/10 border border-border text-muted-foreground line-clamp-2"
                  >
                    {mounted && shareableUrl ? shareableUrl : (
                      <span className="opacity-0">Loading...</span>
                    )}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="shrink-0 w-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy Link"
                  >
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-500">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: ${mounted && isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: ${mounted && isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: ${mounted && isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
        }

        .dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  )
}
