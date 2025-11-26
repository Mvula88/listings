'use client'

import { LottiePlayer } from '@/components/ui/lottie-player'
import faqAnimation from '@/public/faq.json'

export function FAQHeroAnimation() {
  return (
    <LottiePlayer
      animationData={faqAnimation}
      className="w-full max-w-[280px] h-auto"
    />
  )
}
