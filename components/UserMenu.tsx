'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserMenu({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        setIsOpen(false)
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-700 text-center flex items-center justify-center"
            >
                Log In
            </Link>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-700"
            >
                <span>{user.email}</span>
                <svg
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-slate-700">
                    <div className="py-1">
                        <Link
                            href="/my-jams"
                            className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                            onClick={() => setIsOpen(false)}
                        >
                            My Jams
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
