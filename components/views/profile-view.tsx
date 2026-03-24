"use client"

import { useEffect, useState, useRef } from 'react'
import { Camera, Bike, Footprints, Check, Globe, LogOut } from 'lucide-react'
import { translations, User, SportType } from '@/lib/types'
import GlassSurface from '@/components/glass-surface'

interface ProfileUser {
  id: string
  name: string
  avatar?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  preferredSports: ('cycling' | 'hiking')[]
  joinedActivities: string[]
}

interface ProfileViewProps {
  lang: 'en' | 'zh'
  user: ProfileUser
  onUpdateUser: (updates: Record<string, unknown>) => Promise<void>
  onLanguageChange: (lang: 'en' | 'zh') => void
  onLogout: () => void
}

export default function ProfileView({
  lang,
  user,
  onUpdateUser,
  onLanguageChange,
  onLogout
}: ProfileViewProps) {
  const t = translations[lang].profile

  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age || '',
    gender: user.gender || 'male',
    preferredSports: user.preferredSports || [],
  })

  const [isSaved, setIsSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar || null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAvatarUrl(user.avatar || null)
  }, [user.avatar])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpdateUser({ avatarFile: file })
    }
  }

  const handleSave = async () => {
    await onUpdateUser({
      username: formData.name,
      age: typeof formData.age === 'number' ? formData.age : parseInt(formData.age as string) || null,
      gender: formData.gender,
      preferred_sports: formData.preferredSports,
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const toggleSport = (sport: SportType) => {
    setFormData(prev => ({
      ...prev,
      preferredSports: prev.preferredSports.includes(sport)
        ? prev.preferredSports.filter(s => s !== sport)
        : [...prev.preferredSports, sport]
    }))
  }

  return (
    <div className="pb-28 min-h-screen">
      {/* Sticky Glass Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={0}
          className="!rounded-none"
        >
          <div className="w-full px-5 py-4 pt-[env(safe-area-inset-top)]">
            <h1 className="text-2xl font-black text-foreground">{t.title}</h1>
          </div>
        </GlassSurface>
      </div>

      <div className="px-5 space-y-6 pt-20">
        {/* Hidden file input for avatar */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {(formData.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-foreground rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4 text-background" />
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">{t.avatar}</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.name}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.age}
          </label>
          <input
            type="number"
            min={10}
            max={100}
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.gender}
          </label>
          <div className="flex gap-2">
            {(['male', 'female', 'other'] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender }))}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${formData.gender === gender
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {t[gender]}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Sports */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.preferredSports}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toggleSport('cycling')}
              className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all ${formData.preferredSports.includes('cycling')
                  ? 'bg-highlight-yellow text-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              <Bike className="w-6 h-6" />
              {translations[lang].home.cycling}
              {formData.preferredSports.includes('cycling') && (
                <Check className="w-4 h-4 absolute top-2 right-2" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleSport('hiking')}
              className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all ${formData.preferredSports.includes('hiking')
                  ? 'bg-highlight-green text-white'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              <Footprints className="w-6 h-6" />
              {translations[lang].home.hiking}
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.language}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${lang === 'en'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              <Globe className="w-4 h-4" />
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('zh')}
              className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${lang === 'zh'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              <Globe className="w-4 h-4" />
              中文
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-98 flex items-center justify-center gap-2 ${isSaved
              ? 'bg-highlight-green text-white'
              : 'bg-foreground text-background'
            }`}
        >
          {isSaved && <Check className="w-5 h-5" />}
          {isSaved ? (lang === 'en' ? 'Saved!' : '已保存！') : t.save}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-98 flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20"
        >
          <LogOut className="w-5 h-5" />
          {lang === 'en' ? 'Logout' : '退出登录'}
        </button>
      </div>
    </div>
  )
}
