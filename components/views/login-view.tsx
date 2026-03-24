"use client"

import { useState } from 'react'
import { Eye, EyeOff, User, Lock, Bike, Footprints } from 'lucide-react'
import GlassSurface from '@/components/glass-surface'
import { translations } from '@/lib/types'

interface LoginViewProps {
  lang: 'en' | 'zh'
  onLogin: (username: string, password: string) => Promise<{ error?: string }>
  onRegister: (username: string, password: string) => Promise<{ error?: string }>
}

export default function LoginView({ lang, onLogin, onRegister }: LoginViewProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const t = translations[lang].login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!username.trim() || !password.trim()) {
      setError(t.fillAllFields)
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        const result = await onLogin(username, password)
        if (result.error) {
          setError(result.error)
        }
      } else {
        const result = await onRegister(username, password)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccessMessage(lang === 'en' ? 'Registration successful! Please login.' : '注册成功！请登录。')
          setIsLogin(true)
          setPassword('')
        }
      }
    } catch {
      setError(lang === 'en' ? 'An error occurred' : '发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-10 w-40 h-40 bg-highlight-pink/30 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-10 w-32 h-32 bg-highlight-blue/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-36 h-36 bg-highlight-yellow/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-5 w-28 h-28 bg-highlight-green/30 rounded-full blur-3xl" />
      </div>

      {/* Logo and Title */}
      <div className="relative z-10 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-black text-2xl">A</span>
          </div>
        </div>
        <h1 className="text-4xl font-black text-foreground mb-2">Akina</h1>
        <p className="text-sm font-bold text-muted-foreground">Community Sports Platform</p>
      </div>

      {/* Sport Icons */}
      <div className="relative z-10 flex gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-highlight-yellow flex items-center justify-center">
          <Bike className="w-6 h-6 text-foreground" />
        </div>
        <div className="w-12 h-12 rounded-full bg-highlight-green flex items-center justify-center">
          <Footprints className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Glass Login Card */}
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        brightness={60}
        opacity={0.95}
        blur={14}
        className="relative z-10 max-w-sm w-full"
      >
        <form onSubmit={handleSubmit} className="w-full p-6 flex flex-col gap-5">
          {/* Toggle Buttons */}
          <div className="flex gap-2 p-1 bg-foreground/5 rounded-full">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                isLogin 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground'
              }`}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                !isLogin 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground'
              }`}
            >
              {t.register}
            </button>
          </div>

          {/* Username Input */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username}
              className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              className="w-full pl-12 pr-12 py-3.5 bg-foreground/5 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPassword}
                className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm font-semibold text-destructive text-center">{error}</p>
          )}

          {/* Success Message */}
          {successMessage && (
            <p className="text-sm font-semibold text-highlight-green text-center">{successMessage}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-foreground text-background rounded-2xl font-bold text-base active:scale-[0.98] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (lang === 'en' ? 'Loading...' : '加载中...') 
              : (isLogin ? t.loginButton : t.registerButton)
            }
          </button>
        </form>
      </GlassSurface>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-xs font-semibold text-muted-foreground text-center">
        {t.tagline}
      </p>
    </div>
  )
}
