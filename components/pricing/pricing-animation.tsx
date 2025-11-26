'use client'

import { LottiePlayer } from '@/components/ui/lottie-player'
import piggyBankAnimation from '@/public/piggy-bank.json'

export function PricingAnimation() {
  return (
    <LottiePlayer
      animationData={piggyBankAnimation}
      className="w-full max-w-[250px] h-auto"
    />
  )
}
