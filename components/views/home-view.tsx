"use client"

import { Bike, Footprints, ChevronRight, Star, Clock, MapPin, Users } from 'lucide-react'
import { translations, Activity } from '@/lib/types'
import GlassSurface from '@/components/glass-surface'

interface HomeViewProps {
  lang: 'en' | 'zh'
  onViewChange: (view: string) => void
  activities: Activity[]
  currentUserId?: string
  joinedActivityIds?: string[]
}

export default function HomeView({
  lang,
  onViewChange,
  activities,
  currentUserId,
  joinedActivityIds = [],
}: HomeViewProps) {
  const t = translations[lang].home

  const upcomingActivities = activities
    .filter((a) => !a.isCompleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const myActivityIds = new Set(
    upcomingActivities
      .filter(
        (a) =>
          (currentUserId ? a.organizerId === currentUserId : false) ||
          joinedActivityIds.includes(a.id),
      )
      .map((a) => a.id),
  )

  const featuredActivities = [
    ...upcomingActivities.filter((a) => myActivityIds.has(a.id)),
    ...upcomingActivities.filter((a) => !myActivityIds.has(a.id)),
  ].slice(0, 3)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
            <p className="text-xs font-bold text-muted-foreground">{t.subtitle}</p>
          </div>
        </GlassSurface>
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-20">
        {/* Hero Section */}
        <div className="px-5 pt-4 pb-6">
          <div className="mt-2">
            <h2 className="text-3xl font-black text-foreground leading-tight text-balance">
              {t.welcome.split(' ').map((word, i) => (
                <span key={i}>
                  {i === 0 ? (
                    <span className="bg-highlight-pink px-2 py-1 rounded-lg text-foreground">{word}</span>
                  ) : (
                    <span className="bg-highlight-blue px-2 py-1 rounded-lg text-white ml-1">{word}</span>
                  )}
                </span>
              ))}
            </h2>
            <p className="mt-4 text-sm font-semibold text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>
        </div>

        {/* Sport Type Cards */}
        <div className="px-5 mb-6">
          <div className="flex gap-3">
            <button 
              onClick={() => onViewChange('activities')}
              className="flex-1 active:scale-95 transition-transform"
            >
              <GlassSurface
                width="100%"
                height="auto"
                borderRadius={20}
                className="!h-auto"
              >
                <div className="w-full p-4 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-highlight-yellow rounded-full flex items-center justify-center">
                    <Bike className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="font-bold text-foreground">{t.cycling}</span>
                </div>
              </GlassSurface>
            </button>
            <button 
              onClick={() => onViewChange('activities')}
              className="flex-1 active:scale-95 transition-transform"
            >
              <GlassSurface
                width="100%"
                height="auto"
                borderRadius={20}
                className="!h-auto"
              >
                <div className="w-full p-4 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-highlight-green rounded-full flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-foreground">{t.hiking}</span>
                </div>
              </GlassSurface>
            </button>
          </div>
        </div>

        {/* Featured Activities */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground">{t.featuredActivities}</h3>
            <button 
              onClick={() => onViewChange('activities')}
              className="flex items-center gap-1 text-sm font-bold text-primary"
            >
              {t.viewAll}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {featuredActivities.map((activity) => (
              <ActivityCard 
                key={activity.id} 
                activity={activity} 
                lang={lang}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityCard({ 
  activity, 
  lang, 
  formatDate 
}: { 
  activity: Activity
  lang: 'en' | 'zh'
  formatDate: (date: string) => string
}) {
  const t = translations[lang].home
  const spotsLeft = activity.maxParticipants - activity.currentParticipants

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={20}
      className="!h-auto"
    >
      <div className="w-full p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activity.sportType === 'cycling' ? 'bg-highlight-yellow' : 'bg-highlight-green'
            }`}>
              {activity.sportType === 'cycling' ? (
                <Bike className="w-4 h-4 text-foreground" />
              ) : (
                <Footprints className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {activity.sportType === 'cycling' ? t.cycling : t.hiking}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`w-3 h-3 ${star <= activity.difficulty ? 'fill-primary text-primary' : 'text-muted'}`}
              />
            ))}
          </div>
        </div>

        <h4 className="text-base font-black text-foreground mb-3">{activity.title}</h4>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{formatDate(activity.meetingTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold truncate">{activity.meetingLocation}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {spotsLeft} {t.spots}
            </span>
          </div>
          <button className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform">
            {t.join}
          </button>
        </div>
      </div>
    </GlassSurface>
  )
}
