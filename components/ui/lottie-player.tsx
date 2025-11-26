'use client'

import Lottie from 'lottie-react'

interface LottiePlayerProps {
  animationData: object
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottiePlayer({
  animationData,
  className = '',
  loop = true,
  autoplay = true
}: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  )
}
