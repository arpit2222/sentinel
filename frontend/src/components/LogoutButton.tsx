'use client'

import { LogOut } from "lucide-react"
import { useEffect, useState } from "react"

export default function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('sentinel_user_id')) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sentinel_user_id')
    window.location.href = '/'
  }

  if (!isLoggedIn) return null

  return (
    <div>
      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center mb-4">
        <p className="text-xs text-gray-400">Secured by</p>
        <p className="text-sm font-bold text-blue-400">1Shot Passkeys</p>
      </div>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full mt-4 justify-center"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  )
}
