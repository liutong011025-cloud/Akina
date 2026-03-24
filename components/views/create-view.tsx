"use client"

import { useState } from 'react'
import { Bike, Footprints, Star, Upload, Check, Link, Image } from 'lucide-react'
import { translations, SportType, Activity } from '@/lib/types'
import GlassSurface from '@/components/glass-surface'

interface CreateViewProps {
  lang: 'en' | 'zh'
  onCreateActivity: (activity: {
    title: string
    sport_type: string
    meeting_time: string
    meeting_location: string
    estimated_duration: number
    max_participants: number
    items_to_prepare?: string
    route_file_url?: string
    organizer_phone: string
    difficulty: number
  }) => void
}

export default function CreateView({ lang, onCreateActivity }: CreateViewProps) {
  const t = translations[lang].create

  const [formData, setFormData] = useState({
    title: '',
    sportType: 'cycling' as SportType,
    meetingTime: '',
    meetingLocation: '',
    estimatedDuration: '',
    maxParticipants: 10,
    itemsToPrep: '',
    routeFile: '',
    organizerPhone: '',
    difficulty: 3,
  })

  const [routeFileName, setRouteFileName] = useState('')
  const [routeImageName, setRouteImageName] = useState('')
  const [routeType, setRouteType] = useState<'file' | 'link' | 'image'>('file')
  const [routeLink, setRouteLink] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert to snake_case for database
    onCreateActivity({
      title: formData.title,
      sport_type: formData.sportType,
      meeting_time: new Date(formData.meetingTime).toISOString(),
      meeting_location: formData.meetingLocation,
      estimated_duration: parseInt(formData.estimatedDuration) || 60,
      max_participants: formData.maxParticipants,
      items_to_prepare: formData.itemsToPrep || undefined,
      route_file_url: formData.routeFile || undefined,
      organizer_phone: formData.organizerPhone,
      difficulty: formData.difficulty,
    })

    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        title: '',
        sportType: 'cycling',
        meetingTime: '',
        meetingLocation: '',
        estimatedDuration: '',
        maxParticipants: 10,
        itemsToPrep: '',
        routeFile: '',
        organizerPhone: '',
        difficulty: 3,
      })
      setRouteFileName('')
      setRouteImageName('')
      setRouteLink('')
    }, 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setRouteFileName(file.name)
      setFormData(prev => ({ ...prev, routeFile: file.name }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="pb-28 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-highlight-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {lang === 'en' ? 'Activity Created!' : '活动创建成功！'}
          </h2>
        </div>
      </div>
    )
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

      <form onSubmit={handleSubmit} className="px-5 space-y-5 pt-20">
        {/* Activity Title */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.activityTitle}
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            placeholder={lang === 'en' ? 'Enter activity title...' : '输入活动标题...'}
          />
        </div>

        {/* Sport Type */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.sportType}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, sportType: 'cycling' }))}
              className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
                formData.sportType === 'cycling'
                  ? 'bg-highlight-yellow text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Bike className="w-5 h-5" />
              {t.cycling}
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, sportType: 'hiking' }))}
              className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
                formData.sportType === 'hiking'
                  ? 'bg-highlight-green text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Footprints className="w-5 h-5" />
              {t.hiking}
            </button>
          </div>
        </div>

        {/* Meeting Time */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.meetingTime}
          </label>
          <input
            type="datetime-local"
            required
            value={formData.meetingTime}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Meeting Location */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.meetingLocation}
          </label>
          <input
            type="text"
            required
            value={formData.meetingLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingLocation: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            placeholder={lang === 'en' ? 'Enter meeting location...' : '输入集合地点...'}
          />
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.estimatedDuration}
          </label>
          <input
            type="text"
            required
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            placeholder={lang === 'en' ? 'e.g., 3 hours' : '例如：3小时'}
          />
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.maxParticipants}
          </label>
          <input
            type="number"
            required
            min={2}
            max={100}
            value={formData.maxParticipants}
            onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Organizer Phone */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.organizerPhone}
          </label>
          <input
            type="tel"
            required
            value={formData.organizerPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, organizerPhone: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            placeholder={lang === 'en' ? '+1 234 567 8900' : '+86 123 4567 8900'}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.difficulty}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, difficulty: star }))}
                className="p-2"
              >
                <Star 
                  className={`w-8 h-8 transition-colors ${
                    star <= formData.difficulty 
                      ? 'fill-primary text-primary' 
                      : 'text-muted hover:text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Items to Prepare (Optional) */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.itemsToPrep} <span className="text-muted-foreground font-normal">({t.optional})</span>
          </label>
          <textarea
            value={formData.itemsToPrep}
            onChange={(e) => setFormData(prev => ({ ...prev, itemsToPrep: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary resize-none"
            placeholder={t.itemsToPrepPlaceholder}
          />
        </div>

        {/* Route Info (Optional) */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            {t.routeFile} <span className="text-muted-foreground font-normal">({t.optional})</span>
          </label>
          
          {/* Route Type Selector */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setRouteType('file')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all ${
                routeType === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Upload className="w-4 h-4" />
              {lang === 'en' ? 'File' : '文件'}
            </button>
            <button
              type="button"
              onClick={() => setRouteType('link')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all ${
                routeType === 'link'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Link className="w-4 h-4" />
              {lang === 'en' ? 'Link' : '链接'}
            </button>
            <button
              type="button"
              onClick={() => setRouteType('image')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all ${
                routeType === 'image'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Image className="w-4 h-4" />
              {lang === 'en' ? 'Image' : '图片'}
            </button>
          </div>

          {/* File Upload */}
          {routeType === 'file' && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">
                {routeFileName || (lang === 'en' ? 'Upload GPX/KML file...' : '上传GPX/KML文件...')}
              </span>
              <input
                type="file"
                accept=".gpx,.kml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Link Input */}
          {routeType === 'link' && (
            <input
              type="url"
              value={routeLink}
              onChange={(e) => {
                setRouteLink(e.target.value)
                setFormData(prev => ({ ...prev, routeFile: e.target.value }))
              }}
              className="w-full px-4 py-3 rounded-2xl bg-muted border-0 font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              placeholder={lang === 'en' ? 'Paste route link (Strava, Komoot, etc.)...' : '粘贴路线链接（Strava、Komoot等）...'}
            />
          )}

          {/* Image Upload */}
          {routeType === 'image' && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
              <Image className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">
                {routeImageName || (lang === 'en' ? 'Upload route image...' : '上传路线图片...')}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setRouteImageName(file.name)
                    setFormData(prev => ({ ...prev, routeFile: file.name }))
                  }
                }}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-foreground text-background text-base font-bold active:scale-98 transition-transform"
        >
          {t.create}
        </button>
      </form>
    </div>
  )
}
