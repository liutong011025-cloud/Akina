"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import GooeyNav from '@/components/gooey-nav'
import HomeView from '@/components/views/home-view'
import ActivitiesView from '@/components/views/activities-view'
import CreateView from '@/components/views/create-view'
import MyEventsView from '@/components/views/my-events-view'
import ProfileView from '@/components/views/profile-view'
import LoginView from '@/components/views/login-view'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  age: number | null
  gender: string | null
  preferred_sports: string[]
  phone: string | null
}

interface Activity {
  id: string
  organizerId: string
  title: string
  sportType: string
  meetingTime: string
  meetingLocation: string
  estimatedDuration: number
  maxParticipants: number
  currentParticipants: number
  itemsToPrep: string | null
  routeFile: string | null
  organizerPhone: string
  difficulty: number
  organizerName: string
  organizerAvatar?: string | null
  isCompleted: boolean
  participants: string[]
  photos: {
    id: string
    url: string
    userId: string
    createdAt: string
  }[]
  createdAt: string
}

export default function AkinaApp() {
  const [activeView, setActiveView] = useState('home')
  const [lang, setLang] = useState<'en' | 'zh'>('en')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [joinedActivityIds, setJoinedActivityIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()
  const ACTIVITY_PHOTOS_BUCKET = 'activity-photos'
  const AVATARS_BUCKET = 'avatars'

  const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext || 'jpg'
  }

  const uploadFileToStorage = async (
    bucket: string,
    folder: string,
    file: File
  ): Promise<string | null> => {
    if (!user) return null

    const ext = getFileExtension(file.name)
    const path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error(`Upload failed in bucket "${bucket}":`, uploadError)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl || null
  }

  // Fetch user session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }

        // Fetch joined activities
        const { data: participations } = await supabase
          .from('activity_participants')
          .select('activity_id')
          .eq('user_id', user.id)
        
        if (participations) {
          setJoinedActivityIds(participations.map(p => p.activity_id))
        }
      }
      
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        setProfile(null)
        setJoinedActivityIds([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch activities
  const fetchActivities = useCallback(async (sportType?: string) => {
    let query = supabase
      .from('activities')
      .select(`
        *,
        organizer:profiles!organizer_id(username, avatar_url),
        activity_participants(user_id, user:profiles(username)),
        activity_photos(id, photo_url, user_id, created_at)
      `)
      .order('meeting_time', { ascending: true })

    if (sportType && sportType !== 'all') {
      query = query.eq('sport_type', sportType)
    }

    const { data } = await query
    if (data) {
      // Transform snake_case to camelCase for component compatibility
      const transformedData = data.map((activity: Record<string, unknown>) => ({
        id: activity.id,
        title: activity.title,
        sportType: activity.sport_type,
        meetingTime: activity.meeting_time,
        meetingLocation: activity.meeting_location,
        estimatedDuration: activity.estimated_duration,
        maxParticipants: activity.max_participants,
        currentParticipants: activity.current_participants || 1,
        itemsToPrep: activity.items_to_prepare,
        routeFile: activity.route_file_url,
        organizerPhone: activity.organizer_phone,
        difficulty: activity.difficulty,
        organizerId: activity.organizer_id,
        organizerName: (activity.organizer as { username?: string })?.username || 'Unknown',
        organizerAvatar: (activity.organizer as { avatar_url?: string })?.avatar_url,
        isCompleted: activity.status === 'completed',
        participants: ((activity.activity_participants as Array<{
          user?: { username?: string | null }
        }>) || [])
          .map((p) => p.user?.username || '')
          .filter(Boolean),
        photos: ((activity.activity_photos as Array<{
          id: string
          photo_url: string
          user_id: string
          created_at: string
        }>) || []).map((photo) => ({
          id: photo.id,
          url: photo.photo_url,
          userId: photo.user_id,
          createdAt: photo.created_at,
        })),
        createdAt: activity.created_at,
      }))
      setActivities(transformedData)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleLogin = async (username: string, password: string): Promise<{ error?: string }> => {
    // Check if user exists in profiles table
    const { data: existingUser, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (findError || !existingUser) {
      return { error: lang === 'en' ? 'User not found' : '用户不存在' }
    }

    // Simple password check
    if (existingUser.password_hash !== password) {
      return { error: lang === 'en' ? 'Incorrect password' : '密码错误' }
    }

    // Set user as logged in
    setProfile(existingUser)
    setUser({ id: existingUser.id } as SupabaseUser)

    // Fetch joined activities
    const { data: participations } = await supabase
      .from('activity_participants')
      .select('activity_id')
      .eq('user_id', existingUser.id)
    
    if (participations) {
      setJoinedActivityIds(participations.map(p => p.activity_id))
    }

    setActiveView('home')
    return {}
  }

  const handleRegister = async (username: string, password: string): Promise<{ error?: string }> => {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { error: lang === 'en' ? 'Username already exists' : '用户名已存在' }
    }

    // Create new profile with password
    const { error } = await supabase
      .from('profiles')
      .insert({
        username,
        password_hash: password,
      })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setJoinedActivityIds([])
    setActiveView('home')
  }

  const handleCreateActivity = async (activityData: {
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
  }) => {
    if (!profile) {
      return
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...activityData,
        organizer_id: profile.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return
    }

    // Auto-join as participant
    if (data) {
      await supabase
        .from('activity_participants')
        .insert({
          activity_id: data.id,
          user_id: profile.id,
        })

      // Transform to camelCase and add organizer info
      const transformedActivity = {
        id: data.id,
        title: data.title,
        sportType: data.sport_type,
        meetingTime: data.meeting_time,
        meetingLocation: data.meeting_location,
        estimatedDuration: data.estimated_duration,
        maxParticipants: data.max_participants,
        currentParticipants: data.current_participants || 1,
        itemsToPrep: data.items_to_prepare,
        routeFile: data.route_file_url,
        organizerPhone: data.organizer_phone,
        difficulty: data.difficulty,
        organizerId: data.organizer_id,
        organizerName: profile.username || 'Unknown',
        isCompleted: data.status === 'completed',
        participants: profile.username ? [profile.username] : [],
        photos: [],
        createdAt: data.created_at,
      }

      setActivities(prev => [transformedActivity, ...prev])
      setJoinedActivityIds(prev => [...prev, data.id])
    }
  }

  const handleJoinActivity = async (activityId: string) => {
    if (!user || joinedActivityIds.includes(activityId)) return

    const { error } = await supabase
      .from('activity_participants')
      .insert({
        activity_id: activityId,
        user_id: user.id,
      })

    if (error) {
      console.error('Error joining activity:', error)
      return
    }

    // Update local state
    setJoinedActivityIds(prev => [...prev, activityId])
    setActivities(prev => prev.map(a =>
      a.id === activityId
        ? {
            ...a,
            currentParticipants: a.currentParticipants + 1,
            participants: profile?.username && !a.participants.includes(profile.username)
              ? [...a.participants, profile.username]
              : a.participants,
          }
        : a
    ))

    // Update in database
    const activity = activities.find(a => a.id === activityId)
    if (activity) {
      await supabase
        .from('activities')
        .update({ current_participants: activity.currentParticipants + 1 })
        .eq('id', activityId)
    }
  }

  const handleUploadPhoto = async (activityId: string, photoFile: File) => {
    if (!profile) return

    const photoUrl = await uploadFileToStorage(ACTIVITY_PHOTOS_BUCKET, 'activities', photoFile)
    if (!photoUrl) {
      alert(lang === 'en' ? 'Photo upload failed. Check storage bucket/policy settings.' : '照片上传失败，请检查 Supabase Storage 的 bucket 和策略配置。')
      return
    }

    const { data, error } = await supabase
      .from('activity_photos')
      .insert({
        activity_id: activityId,
        user_id: profile.id,
        photo_url: photoUrl,
      })
      .select()
      .single()

    if (!error && data) {
      // Update local activities state with the new photo
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            photos: [...(activity.photos || []), {
              id: data.id,
              url: photoUrl,
              userId: profile.id,
              createdAt: data.created_at,
            }]
          }
        }
        return activity
      }))
    }
  }

  const handleUpdateUser = async (updates: Record<string, unknown>) => {
    if (!user) return

    const { avatarFile, ...profileUpdates } = updates as Record<string, unknown> & { avatarFile?: File }
    let nextAvatarUrl: string | undefined

    if (avatarFile) {
      const uploadedAvatarUrl = await uploadFileToStorage(AVATARS_BUCKET, 'profiles', avatarFile)
      if (!uploadedAvatarUrl) {
        alert(lang === 'en' ? 'Avatar upload failed. Check storage bucket/policy settings.' : '头像上传失败，请检查 Supabase Storage 的 bucket 和策略配置。')
        return
      }
      nextAvatarUrl = uploadedAvatarUrl
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileUpdates,
        ...(nextAvatarUrl ? { avatar_url: nextAvatarUrl } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return
    }

    if (data) {
      setProfile(data)
    }
  }

  const handleShareActivity = async (activity: {
    id: string
    title: string
    sportType: string
    meetingTime: string
    meetingLocation: string
  }) => {
    const sportLabel = activity.sportType === 'cycling'
      ? (lang === 'en' ? 'Cycling' : '骑行')
      : (lang === 'en' ? 'Hiking' : '徒步')

    const shareText = lang === 'en'
      ? `Join my activity!\n${activity.title}\nType: ${sportLabel}\nTime: ${new Date(activity.meetingTime).toLocaleString()}\nLocation: ${activity.meetingLocation}`
      : `来参加我的活动！\n${activity.title}\n类型：${sportLabel}\n时间：${new Date(activity.meetingTime).toLocaleString('zh-CN')}\n地点：${activity.meetingLocation}`

    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?activity=${activity.id}`
      : ''

    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: shareText,
          url: shareUrl,
        })
        return
      }
    } catch {
      // User cancelled native share or sharing failed; fallback below.
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert(lang === 'en' ? 'Activity info copied. Paste it in WeChat.' : '活动信息已复制，可直接粘贴到微信。')
    } catch {
      alert(lang === 'en' ? 'Share is not supported in this browser.' : '当前浏览器不支持分享，请手动复制链接。')
    }
  }

  const handleViewChange = (view: string) => {
    if (view === 'profile' && !user) {
      setActiveView('login')
      return
    }
    if ((view === 'create' || view === 'myevents') && !user) {
      setActiveView('login')
      return
    }
    setActiveView(view)
  }

  // Convert profile to User type for components
  const userForComponents = profile ? {
    id: profile.id,
    name: profile.username || '',
    avatar: profile.avatar_url || '',
    age: profile.age || undefined,
    gender: profile.gender as 'male' | 'female' | 'other' | undefined,
    preferredSports: (profile.preferred_sports || []) as ('cycling' | 'hiking')[],
    joinedActivities: joinedActivityIds,
  } : null

  const renderView = () => {
    if (activeView === 'login') {
      return (
        <LoginView
          lang={lang}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )
    }

    switch (activeView) {
      case 'home':
        return (
          <HomeView
            lang={lang}
            onViewChange={handleViewChange}
            activities={activities.map(a => ({
              id: a.id,
              title: a.title,
              sportType: a.sportType as 'cycling' | 'hiking',
              meetingTime: a.meetingTime,
              meetingLocation: a.meetingLocation,
              estimatedDuration: String(a.estimatedDuration),
              maxParticipants: a.maxParticipants,
              currentParticipants: a.currentParticipants,
              itemsToPrep: a.itemsToPrep || undefined,
              routeFile: a.routeFile || undefined,
              organizerPhone: a.organizerPhone,
              difficulty: a.difficulty as 1 | 2 | 3 | 4 | 5,
              organizerId: a.organizerId,
              organizerName: a.organizerName,
              organizerAvatar: a.organizerAvatar || undefined,
              createdAt: a.createdAt,
              participants: a.participants || [],
              photos: a.photos || [],
              isCompleted: a.isCompleted,
            }))}
            currentUserId={user?.id}
            joinedActivityIds={joinedActivityIds}
            onJoinActivity={handleJoinActivity}
            isLoggedIn={!!user}
            onLoginRequired={() => setActiveView('login')}
          />
        )
      case 'activities':
        return (
          <ActivitiesView
            lang={lang}
            activities={activities.map(a => ({
              id: a.id,
              title: a.title,
              sportType: a.sportType as 'cycling' | 'hiking',
              meetingTime: a.meetingTime,
              meetingLocation: a.meetingLocation,
              estimatedDuration: a.estimatedDuration,
              maxParticipants: a.maxParticipants,
              currentParticipants: a.currentParticipants,
              itemsToPrep: a.itemsToPrep || undefined,
              routeFile: a.routeFile || undefined,
              organizerPhone: a.organizerPhone,
              difficulty: a.difficulty as 1 | 2 | 3 | 4 | 5,
              organizerId: a.organizerId,
              organizerName: a.organizerName,
              organizerAvatar: a.organizerAvatar || undefined,
              createdAt: a.createdAt,
              participants: a.participants || [],
              photos: a.photos || [],
              isCompleted: a.isCompleted,
            }))}
            joinedActivities={joinedActivityIds}
            onJoinActivity={handleJoinActivity}
            onShareActivity={handleShareActivity}
            currentUserId={user?.id}
            isLoggedIn={!!user}
            onLoginRequired={() => setActiveView('login')}
          />
        )
      case 'create':
        if (!user) {
          return (
            <LoginView
              lang={lang}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          )
        }
        return (
          <CreateView
            lang={lang}
            onCreateActivity={handleCreateActivity}
          />
        )
      case 'myevents':
        if (!user) {
          return (
            <LoginView
              lang={lang}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          )
        }
        return (
          <MyEventsView
            lang={lang}
            activities={activities.map(a => ({
              id: a.id,
              title: a.title,
              sportType: a.sportType as 'cycling' | 'hiking',
              meetingTime: a.meetingTime,
              meetingLocation: a.meetingLocation,
              estimatedDuration: a.estimatedDuration,
              maxParticipants: a.maxParticipants,
              currentParticipants: a.currentParticipants,
              itemsToPrep: a.itemsToPrep || undefined,
              routeFile: a.routeFile || undefined,
              organizerPhone: a.organizerPhone,
              difficulty: a.difficulty as 1 | 2 | 3 | 4 | 5,
              organizerId: a.organizerId,
              organizerName: a.organizerName,
              organizerAvatar: a.organizerAvatar || undefined,
              createdAt: a.createdAt,
              participants: a.participants || [],
              photos: a.photos || [],
              isCompleted: a.isCompleted,
            }))}
            joinedActivityIds={joinedActivityIds}
            currentUserId={user?.id}
            onUploadPhoto={handleUploadPhoto}
            onShareActivity={handleShareActivity}
          />
        )
      case 'profile':
        if (!user || !userForComponents) {
          return (
            <LoginView
              lang={lang}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          )
        }
        return (
          <ProfileView
            lang={lang}
            user={userForComponents}
            onUpdateUser={handleUpdateUser}
            onLanguageChange={setLang}
            onLogout={handleLogout}
          />
        )
      default:
        return (
          <HomeView
            lang={lang}
            onViewChange={handleViewChange}
            activities={activities.map(a => ({
              id: a.id,
              title: a.title,
              sportType: a.sportType as 'cycling' | 'hiking',
              meetingTime: a.meetingTime,
              meetingLocation: a.meetingLocation,
              estimatedDuration: String(a.estimatedDuration),
              maxParticipants: a.maxParticipants,
              currentParticipants: a.currentParticipants,
              itemsToPrep: a.itemsToPrep || undefined,
              routeFile: a.routeFile || undefined,
              organizerPhone: a.organizerPhone,
              difficulty: a.difficulty as 1 | 2 | 3 | 4 | 5,
              organizerId: a.organizerId,
              organizerName: a.organizerName,
              organizerAvatar: a.organizerAvatar || undefined,
              createdAt: a.createdAt,
              participants: a.participants || [],
              photos: a.photos || [],
              isCompleted: a.isCompleted,
            }))}
            currentUserId={user?.id}
            joinedActivityIds={joinedActivityIds}
            onJoinActivity={handleJoinActivity}
            isLoggedIn={!!user}
            onLoginRequired={() => setActiveView('login')}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen max-w-md mx-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full max-w-md mx-auto relative overflow-x-hidden">
      {/* Colorful background orbs for frosted glass effect visibility */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-highlight-pink/50 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-highlight-blue/45 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[45%] left-1/4 w-56 h-56 bg-highlight-yellow/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-32 right-0 w-56 h-56 bg-highlight-green/45 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4.5s' }} />
        <div className="absolute -bottom-20 left-0 w-64 h-64 bg-primary/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5.5s' }} />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      <div className="overflow-y-auto overflow-x-hidden">
        {renderView()}
      </div>
      {activeView !== 'login' && (
        <GooeyNav
          activeView={activeView}
          onViewChange={handleViewChange}
          lang={lang}
        />
      )}
    </main>
  )
}
