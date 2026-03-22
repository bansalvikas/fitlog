import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, ChevronRight, LogOut } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import type { ThemeMode } from '../types'

function getTheme(): ThemeMode {
  return (localStorage.getItem('fitlog-theme') as ThemeMode) || 'system'
}

function setTheme(mode: ThemeMode) {
  localStorage.setItem('fitlog-theme', mode)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [theme, setThemeState] = useState<ThemeMode>(getTheme)

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeState(mode)
    setTheme(mode)
  }

  return (
    <>
      <Header title="Settings" />
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Account */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Account</h3>
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.displayName?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.displayName}</p>
              <p className="text-sm text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-slate-800 active:scale-[0.97] transition-all w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </Card>

        {/* Theme */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Theme</h3>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                  theme === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Routines link */}
        <Card
          className="cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/routines/new')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Manage Routines</h3>
              <p className="text-xs text-slate-500">Create and edit workout templates</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-2">About</h3>
          <p className="text-sm text-slate-300">FitLog v0.1.0</p>
          <p className="text-xs text-slate-500 mt-1">Personal workout tracker</p>
        </Card>
      </div>
    </>
  )
}
