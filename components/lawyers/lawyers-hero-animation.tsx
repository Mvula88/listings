'use client'

import { LottiePlayer } from '@/components/ui/lottie-player'
import buyingSellingAnimation from '@/public/buying-selling.json'

export function LawyersHeroAnimation() {
  return (
    <LottiePlayer
      animationData={buyingSellingAnimation}
      className="w-full max-w-[300px] h-auto"
    />
  )
}
