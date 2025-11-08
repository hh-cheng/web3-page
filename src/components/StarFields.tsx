import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  z: number
  size: number
}

type StarfieldProps = {
  density?: number
  speed?: number
  color?: string
  className?: string
}

export default function Starfield({
  density = 0.0012,
  speed = 0.035,
  color = '#ffffff',
  className,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const maxDepth = 1000
    const minDepth = 10
    const numStars = Math.max(80, Math.floor(width * height * density))
    const stars: Star[] = []

    const randomStar = (): Star => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * (maxDepth - minDepth) + minDepth,
      size: Math.random() * 1.5 + 0.2,
    })

    for (let i = 0; i < numStars; i++) stars.push(randomStar())

    let lastTime = performance.now()

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    const animate = () => {
      const now = performance.now()
      const dt = Math.min(50, now - lastTime)
      lastTime = now

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        star.z -= speed * dt
        if (star.z <= 1) {
          stars[i] = randomStar()
          continue
        }

        const perspective = 200 / star.z
        const sx = star.x * perspective + width / 2
        const sy = star.y * perspective + height / 2
        const r = star.size * perspective

        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue

        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)
    onResize()
    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      ro.disconnect()
    }
  }, [density, speed, color])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      aria-hidden
    />
  )
}
