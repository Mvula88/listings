'use client'

import { LottiePlayer } from '@/components/ui/lottie-player'
import ideaAnimation from '@/public/idea.json'

export function AboutAnimation() {
  return (
    <LottiePlayer
      animationData={ideaAnimation}
      className="w-full max-w-[250px] h-auto"
    />
  )
}
