'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from './button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MobileNavProps {
  links: {
    href: string
    label: string
  }[]
  actions?: React.ReactNode
}

export function MobileNav({ links, actions }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[280px] bg-background border-l z-50 transform transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-bold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Actions */}
          {actions && (
            <div className="p-4 border-t space-y-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
