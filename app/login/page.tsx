
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (view === 'sign-up') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) {
                setMessage({ text: error.message, type: 'error' })
            } else {
                setMessage({ text: 'Check your email for the confirmation link.', type: 'success' })
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setMessage({ text: error.message, type: 'error' })
            } else {
                router.push('/')
                router.refresh()
            }
        }
        setLoading(false)
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            setMessage({ text: error.message, type: 'error' })
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900/80 p-8 shadow-xl backdrop-blur-sm border border-slate-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        {view === 'sign-in' ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {view === 'sign-in'
                            ? 'Sign in to manage your jams'
                            : 'Sign up to claim and edit events'}
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleEmailLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`rounded-md p-3 text-sm ${message.type === 'error'
                                        ? 'bg-red-900/50 text-red-200'
                                        : 'bg-green-900/50 text-green-200'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : view === 'sign-in' ? 'Sign in' : 'Sign up'}
                        </button>
                    </form>

                    <div className="text-center text-sm">
                        <button
                            onClick={() => {
                                setView(view === 'sign-in' ? 'sign-up' : 'sign-in')
                                setMessage(null)
                            }}
                            className="font-medium text-blue-400 hover:text-blue-300"
                        >
                            {view === 'sign-in'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
