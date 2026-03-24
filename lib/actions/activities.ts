"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getActivities(sportType?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from("activities")
    .select(`
      *,
      organizer:profiles!organizer_id(id, username, avatar_url),
      participants:activity_participants(count)
    `)
    .order("meeting_time", { ascending: true })

  if (sportType && sportType !== "all") {
    query = query.eq("sport_type", sportType)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching activities:", error)
    return []
  }

  return data || []
}

export async function getActivity(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      organizer:profiles!organizer_id(id, username, avatar_url, phone),
      participants:activity_participants(
        user:profiles(id, username, avatar_url)
      ),
      photos:activity_photos(id, photo_url, caption, created_at, user:profiles(username))
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching activity:", error)
    return null
  }

  return data
}

export async function createActivity(activityData: {
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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      ...activityData,
      organizer_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating activity:", error)
    return { error: error.message }
  }

  // Auto-join the organizer as a participant
  await supabase
    .from("activity_participants")
    .insert({
      activity_id: data.id,
      user_id: user.id,
    })

  revalidatePath("/", "layout")
  return { data }
}

export async function joinActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from("activity_participants")
    .select()
    .eq("activity_id", activityId)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    return { error: "Already joined" }
  }

  // Check if activity is full
  const { data: activity } = await supabase
    .from("activities")
    .select("max_participants, current_participants")
    .eq("id", activityId)
    .single()

  if (activity && activity.current_participants >= activity.max_participants) {
    return { error: "Activity is full" }
  }

  const { error } = await supabase
    .from("activity_participants")
    .insert({
      activity_id: activityId,
      user_id: user.id,
    })

  if (error) {
    return { error: error.message }
  }

  // Update participant count
  await supabase
    .from("activities")
    .update({ current_participants: (activity?.current_participants || 0) + 1 })
    .eq("id", activityId)

  revalidatePath("/", "layout")
  return { success: true }
}

export async function leaveActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Update participant count
  const { data: activity } = await supabase
    .from("activities")
    .select("current_participants")
    .eq("id", activityId)
    .single()

  if (activity) {
    await supabase
      .from("activities")
      .update({ current_participants: Math.max(0, (activity.current_participants || 1) - 1) })
      .eq("id", activityId)
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function getMyActivities() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { organized: [], joined: [] }
  }

  // Get activities I organized
  const { data: organized } = await supabase
    .from("activities")
    .select(`
      *,
      participants:activity_participants(count),
      photos:activity_photos(id, photo_url)
    `)
    .eq("organizer_id", user.id)
    .order("meeting_time", { ascending: false })

  // Get activities I joined
  const { data: participations } = await supabase
    .from("activity_participants")
    .select(`
      activity:activities(
        *,
        organizer:profiles!organizer_id(username, avatar_url),
        participants:activity_participants(count),
        photos:activity_photos(id, photo_url)
      )
    `)
    .eq("user_id", user.id)

  const joined = participations?.map(p => p.activity).filter(Boolean) || []

  return { 
    organized: organized || [], 
    joined: joined.filter(a => a && a.organizer_id !== user.id) 
  }
}

export async function uploadActivityPhoto(activityId: string, photoUrl: string, caption?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("activity_photos")
    .insert({
      activity_id: activityId,
      user_id: user.id,
      photo_url: photoUrl,
      caption,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { data }
}

export async function getActivityPhotos(activityId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("activity_photos")
    .select(`
      *,
      user:profiles(username, avatar_url)
    `)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data || []
}
