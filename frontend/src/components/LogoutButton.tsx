'use client'

import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('sentinel_user_id')
    window.location.href = '/'
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full mt-4"
    >
      <LogOut size={20} /> Logout
    </button>
  )
}
