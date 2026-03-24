export type SportType = 'cycling' | 'hiking'

export interface Activity {
  id: string
  title: string
  sportType: SportType
  meetingTime: string
  meetingLocation: string
  estimatedDuration: string
  maxParticipants: number
  currentParticipants: number
  itemsToPrep?: string
  routeFile?: string
  organizerPhone: string
  difficulty: number // 1-5 stars
  organizerId: string
  organizerName: string
  organizerAvatar?: string
  createdAt: string
  participants: string[]
  photos: ActivityPhoto[]
  isCompleted: boolean
}

export interface ActivityPhoto {
  id: string
  url: string
  uploadedBy: string
  uploadedAt: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  preferredSports: SportType[]
  joinedActivities: string[]
}

export interface Translations {
  login: {
    login: string
    register: string
    username: string
    password: string
    confirmPassword: string
    loginButton: string
    registerButton: string
    fillAllFields: string
    passwordMismatch: string
    tagline: string
  }
  home: {
    title: string
    subtitle: string
    welcome: string
    description: string
    cycling: string
    hiking: string
    activities: string
    featuredActivities: string
    viewAll: string
    join: string
    organizer: string
    duration: string
    spots: string
  }
  activities: {
    title: string
    filter: string
    all: string
    cycling: string
    hiking: string
    difficulty: string
    meetingTime: string
    meetingLocation: string
    duration: string
    participants: string
    join: string
    joined: string
    full: string
  }
  create: {
    title: string
    activityTitle: string
    sportType: string
    cycling: string
    hiking: string
    meetingTime: string
    meetingLocation: string
    estimatedDuration: string
    maxParticipants: string
    itemsToPrep: string
    itemsToPrepPlaceholder: string
    routeFile: string
    organizerPhone: string
    difficulty: string
    create: string
    optional: string
  }
  myevents: {
    title: string
    upcoming: string
    past: string
    uploadPhotos: string
    viewPhotos: string
    noPhotos: string
    noEvents: string
  }
  profile: {
    title: string
    editProfile: string
    avatar: string
    name: string
    age: string
    gender: string
    male: string
    female: string
    other: string
    preferredSports: string
    save: string
    language: string
  }
}

export const translations: { en: Translations; zh: Translations } = {
  en: {
    login: {
      login: "Login",
      register: "Register",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      loginButton: "Sign In",
      registerButton: "Create Account",
      fillAllFields: "Please fill in all fields",
      passwordMismatch: "Passwords do not match",
      tagline: "Join the adventure, share the journey",
    },
    home: {
      title: "Akina",
      subtitle: "Community Sports Platform",
      welcome: "Move Together",
      description: "Discover outdoor activities, join cycling and hiking events, and connect with fellow adventurers in your community.",
      cycling: "Cycling",
      hiking: "Hiking",
      activities: "Activities",
      featuredActivities: "Featured Activities",
      viewAll: "View All",
      join: "Join",
      organizer: "Organizer",
      duration: "Duration",
      spots: "spots left",
    },
    activities: {
      title: "Activities",
      filter: "Filter",
      all: "All",
      cycling: "Cycling",
      hiking: "Hiking",
      difficulty: "Difficulty",
      meetingTime: "Meeting Time",
      meetingLocation: "Meeting Location",
      duration: "Duration",
      participants: "Participants",
      join: "Join",
      joined: "Joined",
      full: "Full",
    },
    create: {
      title: "Create Activity",
      activityTitle: "Activity Title",
      sportType: "Sport Type",
      cycling: "Cycling",
      hiking: "Hiking",
      meetingTime: "Meeting Time",
      meetingLocation: "Meeting Location",
      estimatedDuration: "Estimated Duration",
      maxParticipants: "Max Participants",
      itemsToPrep: "Items to Prepare",
      itemsToPrepPlaceholder: "e.g., Water, snacks, helmet...",
      routeFile: "Route File (GPX)",
      organizerPhone: "Organizer Phone",
      difficulty: "Route Difficulty",
      create: "Create Activity",
      optional: "Optional",
    },
    myevents: {
      title: "My Activities",
      upcoming: "Upcoming",
      past: "Past",
      uploadPhotos: "Upload Photos",
      viewPhotos: "View Photos",
      noPhotos: "No photos yet",
      noEvents: "No activities yet",
    },
    profile: {
      title: "Profile",
      editProfile: "Edit Profile",
      avatar: "Avatar",
      name: "Name",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      preferredSports: "Preferred Sports",
      save: "Save Changes",
      language: "Language",
    },
  },
  zh: {
    login: {
      login: "登录",
      register: "注册",
      username: "用户名",
      password: "密码",
      confirmPassword: "确认密码",
      loginButton: "登录",
      registerButton: "创建账户",
      fillAllFields: "请填写所有字段",
      passwordMismatch: "两次密码不一致",
      tagline: "加入冒险，分享旅程",
    },
    home: {
      title: "Akina",
      subtitle: "社区运动平台",
      welcome: "一起运动",
      description: "发现户外活动，参加骑行和徒步活动，与社区中的冒险者们建立联系。",
      cycling: "骑行",
      hiking: "徒步",
      activities: "活动",
      featuredActivities: "精选活动",
      viewAll: "查看全部",
      join: "加入",
      organizer: "组织者",
      duration: "时长",
      spots: "名额剩余",
    },
    activities: {
      title: "活动",
      filter: "筛选",
      all: "全部",
      cycling: "骑行",
      hiking: "徒步",
      difficulty: "难度",
      meetingTime: "集合时间",
      meetingLocation: "集合地点",
      duration: "预计时长",
      participants: "参与者",
      join: "加入",
      joined: "已加入",
      full: "已满",
    },
    create: {
      title: "发起活动",
      activityTitle: "活动标题",
      sportType: "运动类型",
      cycling: "骑行",
      hiking: "徒步",
      meetingTime: "集合时间",
      meetingLocation: "集合地点",
      estimatedDuration: "预计时长",
      maxParticipants: "人数限制",
      itemsToPrep: "需准备物品",
      itemsToPrepPlaceholder: "例如：水、零食、头盔...",
      routeFile: "路书文件 (GPX)",
      organizerPhone: "组织者电话",
      difficulty: "路线强度",
      create: "发起活动",
      optional: "可选",
    },
    myevents: {
      title: "我的活动",
      upcoming: "即将进行",
      past: "已结束",
      uploadPhotos: "上传照片",
      viewPhotos: "查看照片",
      noPhotos: "暂无照片",
      noEvents: "暂无活动",
    },
    profile: {
      title: "个人资料",
      editProfile: "编辑资料",
      avatar: "头像",
      name: "姓名",
      age: "年龄",
      gender: "性别",
      male: "男",
      female: "女",
      other: "其他",
      preferredSports: "偏好运动",
      save: "保存更改",
      language: "语言",
    },
  },
}
