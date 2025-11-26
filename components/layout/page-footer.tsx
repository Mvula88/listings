import Link from "next/link"
import Image from "next/image"

export function PageFooter() {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-block mb-2">
              <Image
                src="/logo.png"
                alt="PropLinka"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Save thousands on property transactions
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 PropLinka. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms & Privacy
            </Link>
            <Link href="/lawyers" className="hover:text-primary transition-colors">
              For Lawyers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
