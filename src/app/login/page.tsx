'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    let res;
    if (isLogin) {
      res = await login(formData)
    } else {
      res = await signup(formData)
    }

    if (res?.error) {
      setErrorMsg(res.error)
      setLoading(false)
    }
  }

  const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-on-surface font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
  const labelClasses = "block text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-2 px-1";

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Aesthetic Background Accents */}
      <div className="absolute top-[-10rem] right-[-10rem] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10rem] left-[-10rem] w-[40rem] h-[40rem] bg-secondary-container/5 rounded-full blur-3xl opacity-30" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-container text-on-primary shadow-xl shadow-primary/20 mb-6">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-display font-bold text-primary tracking-tight leading-tight">
                Crockery Tracker
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 mt-3">
                The Digital Curator &bull; Secure Access
            </p>
        </div>

        <div className="surface-paper overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-primary/5 px-8 py-5 border-b border-outline-variant/5 flex items-center justify-between">
                <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                    {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isLogin ? 'Authorization' : 'System Enrollment'}
                </h2>
                <span className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-widest italic group-hover:text-primary transition-colors">
                    Institutional Node
                </span>
            </div>

            <div className="p-8 md:p-10">
                {errorMsg && (
                    <div className="bg-error-container/20 border border-error/10 text-error text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-error" />
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Operational Identity (Email)</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="admin@crockery.co"
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Secure Identifier (Password)</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className={inputClasses}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full shadow-lg shadow-primary/20 mt-4 group flex items-center justify-center gap-3"
                    >
                        {loading ? 'Validating...' : (isLogin ? 'Authenticate' : 'Enroll Now')}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-outline-variant/5 text-center flex flex-col gap-4">
                    <p className="text-[11px] font-medium text-on-surface-variant/40 leading-relaxed max-w-[240px] mx-auto italic">
                        {isLogin 
                            ? 'New operators must be systematically enrolled by an administrative entity or through authorized registration.' 
                            : 'Ensure you have institutional clearance before proceeding with enclave registration.'}
                    </p>
                    <button 
                        type="button" 
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors py-2"
                    >
                        {isLogin ? 'Switch to Enrollment' : 'Return to Authorization'}
                    </button>
                </div>
            </div>
        </div>

        {/* System Footer */}
        <div className="mt-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/20 italic">
                Secure Terminal &bull; Crockery Assets v2.4
            </p>
        </div>
      </div>
    </div>
  )
}
