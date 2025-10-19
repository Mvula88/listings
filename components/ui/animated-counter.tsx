'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 1000, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const startTime = Date.now()
          const startValue = 0
          const endValue = value

          const animate = () => {
            const now = Date.now()
            const progress = Math.min((now - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentCount = Math.floor(easeOutQuart * (endValue - startValue) + startValue)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(endValue)
            }
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
    </span>
  )
}
