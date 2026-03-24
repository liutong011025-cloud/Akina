"use client"

// Force rebuild - v3 - fixed duplicate state
import { useState, useRef } from 'react'
import { Bike, Footprints, Star, Clock, MapPin, Camera, X, Share2, Image as ImageIcon } from 'lucide-react'
import { translations, Activity } from '@/lib/types'
import GlassSurface from '@/components/glass-surface'

interface MyEventsViewProps {
  lang: 'en' | 'zh'
  activities: Activity[]
  joinedActivityIds: string[]
  onUploadPhoto: (activityId: string, photoFile: File) => Promise<void>
  onShareActivity: (activity: Activity) => Promise<void>
}

export default function MyEventsView({ 
  lang, 
  activities, 
  joinedActivityIds,
  onUploadPhoto,
  onShareActivity
}: MyEventsViewProps) {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [uploadingActivityId, setUploadingActivityId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const t = translations[lang].myevents

  const myActivities = activities.filter(a => joinedActivityIds.includes(a.id))
  const now = new Date()
  
  const upcomingActivities = myActivities.filter(a => {
    const meetingTime = new Date(a.meetingTime)
    return meetingTime > now && !a.isCompleted
  })
  
  const pastActivities = myActivities.filter(a => {
    const meetingTime = new Date(a.meetingTime)
    return meetingTime <= now || a.isCompleted
  })

  const displayedActivities = tab === 'upcoming' ? upcomingActivities : pastActivities

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePhotoUpload = (activityId: string) => {
    setUploadingActivityId(activityId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && uploadingActivityId) {
      setIsUploading(true)
      try {
        await onUploadPhoto(uploadingActivityId, file)
      } finally {
        setIsUploading(false)
      }
      setUploadingActivityId(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="pb-28 min-h-screen">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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

      <div className="pt-16">
        <div className="px-5 py-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('upcoming')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                tab === 'upcoming' 
                  ? 'bg-foreground text-background' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t.upcoming} ({upcomingActivities.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                tab === 'past' 
                  ? 'bg-foreground text-background' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t.past} ({pastActivities.length})
            </button>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-4">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-semibold">{t.noEvents}</p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <GlassSurface
                key={activity.id}
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
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-3 h-3 ${star <= activity.difficulty ? 'fill-primary text-primary' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tab === 'past' && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {lang === 'en' ? 'Completed' : '已完成'}
                        </span>
                      )}
                      <button
                        onClick={() => void onShareActivity(activity)}
                        className="p-2 rounded-full bg-muted text-muted-foreground"
                        aria-label={lang === 'en' ? 'Share activity' : '分享活动'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
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

                  {tab === 'past' && (
                    <div className="border-t border-border pt-4">
                      {activity.photos && activity.photos.length > 0 ? (
                        <div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {activity.photos.slice(0, 3).map((photo, idx) => (
                              <div 
                                key={photo.id || idx}
                                className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 overflow-hidden"
                              >
                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {activity.photos.length > 3 && (
                              <button 
                                onClick={() => {
                                  setSelectedActivity(activity)
                                  setIsModalOpen(true)
                                }}
                                className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center"
                              >
                                <span className="text-sm font-bold text-muted-foreground">
                                  +{activity.photos.length - 3}
                                </span>
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                setSelectedActivity(activity)
                                setIsModalOpen(true)
                              }}
                              className="flex-1 py-2 rounded-xl bg-muted text-sm font-bold text-muted-foreground"
                            >
                              {t.viewPhotos}
                            </button>
                            <button
                              onClick={() => handlePhotoUpload(activity.id)}
                              disabled={isUploading}
                              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              {t.uploadPhotos}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">{t.noPhotos}</p>
                          <button
                            onClick={() => handlePhotoUpload(activity.id)}
                            disabled={isUploading}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 mx-auto"
                          >
                            <Camera className="w-4 h-4" />
                            {t.uploadPhotos}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </GlassSurface>
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-md rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-foreground">{selectedActivity.title}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {selectedActivity.photos && selectedActivity.photos.map((photo, idx) => (
                <div 
                  key={photo.id || idx}
                  className="aspect-square rounded-2xl overflow-hidden"
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <button
              onClick={() => handlePhotoUpload(selectedActivity.id)}
              disabled={isUploading}
              className="w-full mt-4 py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {t.uploadPhotos}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
