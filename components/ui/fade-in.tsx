'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directions = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: ''
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        !isVisible && 'opacity-0',
        !isVisible && directions[direction],
        isVisible && 'opacity-100 translate-x-0 translate-y-0',
        className
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  )
}

// Stagger children animations
interface StaggerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function Stagger({ children, staggerDelay = 0.1, className }: StaggerProps) {
  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}
