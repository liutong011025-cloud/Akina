"use client"

import React, { useState } from 'react'
import { Bike, Footprints, Star, Clock, MapPin, Users, Phone, Package, FileText } from 'lucide-react'
import { translations, Activity, SportType } from '@/lib/types'
import GlassSurface from '@/components/glass-surface'

interface ActivitiesViewProps {
  lang: 'en' | 'zh'
  activities: Activity[]
  joinedActivities: string[]
  onJoinActivity: (activityId: string) => void
  isLoggedIn?: boolean
  onLoginRequired?: () => void
}

export default function ActivitiesView({ 
  lang, 
  activities, 
  joinedActivities,
  onJoinActivity,
  isLoggedIn = false,
  onLoginRequired
}: ActivitiesViewProps) {
  const t = translations[lang].activities
  const [filter, setFilter] = useState<'all' | SportType>('all')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const filteredActivities = activities
    .filter(a => !a.isCompleted)
    .filter(a => filter === 'all' || a.sportType === filter)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
      weekday: 'short',
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
          </div>
        </GlassSurface>
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-16">
        {/* Filter Tabs */}
        <div className="px-5 py-4">
          <div className="flex gap-2">
            {(['all', 'cycling', 'hiking'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {type === 'all' ? t.all : type === 'cycling' ? t.cycling : t.hiking}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="px-5 flex flex-col gap-4">
          {filteredActivities.map((activity) => {
            const isJoined = joinedActivities.includes(activity.id)
            const isFull = activity.currentParticipants >= activity.maxParticipants
            const spotsLeft = activity.maxParticipants - activity.currentParticipants

            return (
              <GlassSurface
                key={activity.id}
                width="100%"
                height="auto"
                borderRadius={20}
                className="!h-auto cursor-pointer"
              >
                <div 
                  className="w-full p-4"
                  onClick={() => setSelectedActivity(activity)}
                >
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
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{formatDate(activity.meetingTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold truncate">{activity.meetingLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">
                        {activity.currentParticipants}/{activity.maxParticipants} ({spotsLeft} {translations[lang].home.spots})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {(activity.organizerName || 'U').charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {activity.organizerName || 'Unknown'}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLoggedIn && onLoginRequired) {
                          onLoginRequired()
                          return
                        }
                        if (!isJoined && !isFull) {
                          onJoinActivity(activity.id)
                        }
                      }}
                      disabled={isFull && !isJoined}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                        isJoined 
                          ? 'bg-highlight-green text-white' 
                          : isFull 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                            : 'bg-foreground text-background'
                      }`}
                    >
                      {isJoined ? t.joined : isFull ? t.full : t.join}
                    </button>
                  </div>
                </div>
              </GlassSurface>
            )
          })}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal 
          activity={selectedActivity}
          lang={lang}
          isJoined={joinedActivities.includes(selectedActivity.id)}
          onClose={() => setSelectedActivity(null)}
          onJoin={() => {
            onJoinActivity(selectedActivity.id)
            setSelectedActivity(null)
          }}
        />
      )}
    </div>
  )
}

function ActivityDetailModal({
  activity,
  lang,
  isJoined,
  onClose,
  onJoin,
}: {
  activity: Activity
  lang: 'en' | 'zh'
  isJoined: boolean
  onClose: () => void
  onJoin: () => void
}) {
  const t = translations[lang].activities
  const isFull = activity.currentParticipants >= activity.maxParticipants

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div 
      className="fixed inset-0 z-[60] bg-foreground/50 flex items-end" 
      onClick={onClose}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-background w-full rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            activity.sportType === 'cycling' ? 'bg-highlight-yellow' : 'bg-highlight-green'
          }`}>
            {activity.sportType === 'cycling' ? (
              <Bike className="w-6 h-6 text-foreground" />
            ) : (
              <Footprints className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {activity.sportType === 'cycling' ? t.cycling : t.hiking}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-4 h-4 ${star <= activity.difficulty ? 'fill-primary text-primary' : 'text-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black text-foreground mb-6">{activity.title}</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.meetingTime}</p>
              <p className="font-semibold text-foreground">{formatDate(activity.meetingTime)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.meetingLocation}</p>
              <p className="font-semibold text-foreground">{activity.meetingLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.duration}</p>
              <p className="font-semibold text-foreground">{activity.estimatedDuration}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-highlight-green mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.participants}</p>
              <p className="font-semibold text-foreground">
                {activity.currentParticipants} / {activity.maxParticipants}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-highlight-pink mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">
                {lang === 'en' ? 'Organizer' : '组织者'}
              </p>
              <p className="font-semibold text-foreground">{activity.organizerName || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{activity.organizerPhone || '-'}</p>
            </div>
          </div>

          {activity.itemsToPrep && (
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-highlight-yellow mt-0.5" />
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  {lang === 'en' ? 'Items to Prepare' : '需准备物品'}
                </p>
                <p className="font-semibold text-foreground">{activity.itemsToPrep}</p>
              </div>
            </div>
          )}

          {activity.routeFile && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  {lang === 'en' ? 'Route File' : '路书文件'}
                </p>
                <p className="font-semibold text-primary">{activity.routeFile}</p>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onJoin}
          disabled={isFull && !isJoined}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-98 ${
            isJoined 
              ? 'bg-highlight-green text-white' 
              : isFull 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-foreground text-background'
          }`}
        >
          {isJoined ? t.joined : isFull ? t.full : t.join}
        </button>
      </div>
    </div>
  )
}
