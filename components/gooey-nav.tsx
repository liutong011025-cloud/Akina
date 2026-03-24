"use client"

import { useState, useEffect } from 'react'
import { Home, Map, PlusCircle, User, Images } from 'lucide-react'
import GlassSurface from '@/components/glass-surface'

interface NavItem {
  label: string
  icon: React.ReactNode
  view: string
}

interface GooeyNavProps {
  activeView: string
  onViewChange: (view: string) => void
  lang: 'en' | 'zh'
}

const items: { en: NavItem[]; zh: NavItem[] } = {
  en: [
    { label: "Home", icon: <Home className="w-5 h-5" />, view: "home" },
    { label: "Activities", icon: <Map className="w-5 h-5" />, view: "activities" },
    { label: "Create", icon: <PlusCircle className="w-5 h-5" />, view: "create" },
    { label: "My Events", icon: <Images className="w-5 h-5" />, view: "myevents" },
    { label: "Profile", icon: <User className="w-5 h-5" />, view: "profile" },
  ],
  zh: [
    { label: "首页", icon: <Home className="w-5 h-5" />, view: "home" },
    { label: "活动", icon: <Map className="w-5 h-5" />, view: "activities" },
    { label: "发起", icon: <PlusCircle className="w-5 h-5" />, view: "create" },
    { label: "我的", icon: <Images className="w-5 h-5" />, view: "myevents" },
    { label: "个人", icon: <User className="w-5 h-5" />, view: "profile" },
  ],
}

const GooeyNav = ({ activeView, onViewChange, lang }: GooeyNavProps) => {
  const [activeIndex, setActiveIndex] = useState(
    items[lang].findIndex(item => item.view === activeView)
  )

  const navItems = items[lang]

  const handleClick = (index: number, view: string) => {
    if (activeIndex === index) return
    setActiveIndex(index)
    onViewChange(view)
  }

  useEffect(() => {
    const newIndex = items[lang].findIndex(item => item.view === activeView)
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }, [activeView, lang])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        className="!h-auto mb-1"
      >
        <nav className="w-full px-1 py-2">
          <ul className="flex justify-between items-center">
            {navItems.map((item, index) => {
              const isActive = activeIndex === index
              return (
                <li key={index} className="flex-1">
                  <button
                    onClick={() => handleClick(index, item.view)}
                    className={`w-full flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/60 shadow-sm border border-white/40 scale-105' 
                        : 'hover:bg-white/20'
                    }`}
                  >
                    <span className={`transition-colors duration-300 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[2.5px] ${
                      isActive ? 'text-primary' : 'text-foreground/90'
                    }`}>
                      {item.icon}
                    </span>
                    <span className={`text-[9px] font-black transition-colors duration-300 whitespace-nowrap ${
                      isActive ? 'text-foreground' : 'text-foreground/90'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </GlassSurface>
    </div>
  )
}

export default GooeyNav
