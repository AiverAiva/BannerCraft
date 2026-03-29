'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Set mounted flag
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b bg-background/80 border-border transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/" className="font-semibold tracking-tight transition-colors hover:text-primary whitespace-nowrap">
            BannerCraft
          </Link>
          <nav className="flex items-center space-x-3 sm:space-x-4 text-sm font-medium text-muted-foreground">
            <Link 
              href="/" 
              className={`transition-colors hover:text-foreground ${pathname === '/' ? 'text-foreground' : ''}`}
            >
              Editor
            </Link>
            <Link 
              href="/docs" 
              className={`transition-colors hover:text-foreground ${pathname === '/docs' ? 'text-foreground' : ''}`}
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="group relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: mounted && isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            }}
            aria-label="Toggle theme"
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center transform group-hover:scale-110"
              style={{
                left: mounted && isDark ? 'calc(100% - 22px)' : '2px',
                backgroundColor: 'var(--foreground)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}
            >
              {mounted ? (
                isDark ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#0a0a0a">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fafafa">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                )
              ) : null}
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
