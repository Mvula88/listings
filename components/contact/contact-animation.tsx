'use client'

import { LottiePlayer } from '@/components/ui/lottie-player'
import questioningAnimation from '@/public/questioning.json'

export function ContactAnimation() {
  return (
    <LottiePlayer
      animationData={questioningAnimation}
      className="w-full max-w-[280px] h-auto"
    />
  )
}
