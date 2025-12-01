"use client"

import { useState, useCallback } from "react"
import { X, Copy, Check, Link2, Loader2, RefreshCw } from "lucide-react"
import type { MaterialShare, ShareMaterialType } from "@/lib/schemas/sharing"
import { useThemeStore } from "@/lib/stores"

interface Props {
  isOpen: boolean
  onClose: () => void
  materialId: string
  materialType: ShareMaterialType
  materialTitle: string
}

export default function ShareModal({ isOpen, onClose, materialId, materialType, materialTitle }: Props) {
  const [share, setShare] = useState<MaterialShare | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [customCode, setCustomCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const theme = useThemeStore((state) => state.theme)
  const isSpooky = theme === "spooky"

  const fetchShare = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/share?materialType=${materialType}&materialId=${materialId}`)
      const data = await res.json()
      setShare(data.share || null)
    } catch {
      // No existing share
    } finally {
      setLoading(false)
    }
  }, [materialId, materialType])

  // Fetch on open
  useState(() => {
    if (isOpen) fetchShare()
  })

  const createShare = async () => {
    setLoading(true)
    setCodeError("")
    
    try {
      const body: Record<string, string> = { materialType, materialId }
      if (customCode.trim()) {
        body.customCode = customCode.trim().toLowerCase()
      }
      
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const data = await res.json()
      
      if (res.status === 409) {
        setCodeError("This code is already taken")
        return
      }
      
      if (data.error) {
        setCodeError(typeof data.error === 'string' ? data.error : 'Invalid code format')
        return
      }
      
      setShare(data.share)
      setCustomCode("")
    } catch {
      setCodeError("Failed to create share link")
    } finally {
      setLoading(false)
    }
  }

  const toggleShare = async () => {
    if (!share) return
    setLoading(true)
    
    try {
      const res = await fetch('/api/share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: share.id, isActive: !share.is_active }),
      })
      const data = await res.json()
      setShare(data.share)
    } catch {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  const updateCode = async () => {
    if (!share || !customCode.trim()) return
    setLoading(true)
    setCodeError("")
    
    try {
      const res = await fetch('/api/share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: share.id, newCode: customCode.trim().toLowerCase() }),
      })
      
      const data = await res.json()
      
      if (res.status === 409) {
        setCodeError("This code is already taken")
        return
      }
      
      if (data.error) {
        setCodeError(typeof data.error === 'string' ? data.error : 'Invalid code format')
        return
      }
      
      setShare(data.share)
      setCustomCode("")
      setIsEditing(false)
    } catch {
      setCodeError("Failed to update code")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!share) return
    const url = `${window.location.origin}/share/${share.share_code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const shareUrl = share ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${share.share_code}` : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden ${isSpooky ? "bg-[#1a1b26] border border-purple-500/30" : "bg-white"}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"}`}>
          <h2 className={`font-sora font-bold text-lg ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{isSpooky ? "Share Dark Knowledge" : "Share Material"}</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isSpooky ? "hover:bg-purple-900/30 text-purple-300" : "hover:bg-gray-100"}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm mb-4 ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
            Share &quot;{materialTitle}&quot; with others
          </p>

          {loading && !share ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className={`animate-spin ${isSpooky ? "text-purple-400" : "text-[#171d2b]/40"}`} />
            </div>
          ) : share ? (
            <div className="space-y-4">
              {/* Share Link */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                  {isSpooky ? "Summoning Link" : "Share Link"}
                </label>
                <div className="flex gap-2">
                  <div className={`flex-1 px-3 py-2 rounded-lg text-sm truncate ${isSpooky ? "bg-[#0d0e14] text-purple-100" : "bg-[#f0f0ea] text-[#171d2b]"}`}>
                    {shareUrl}
                  </div>
                  <button
                    onClick={copyLink}
                    className={`px-3 py-2 text-white rounded-lg transition-colors ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Edit Code */}
              {isEditing ? (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                    {isSpooky ? "Custom Spell Code" : "Custom Code"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => {
                        setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                        setCodeError("")
                      }}
                      placeholder="my-custom-code"
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none ${isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100 focus:border-purple-400" : "border-[#171d2b]/10 focus:border-[#171d2b]"}`}
                    />
                    <button
                      onClick={updateCode}
                      disabled={loading || !customCode.trim()}
                      className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 text-sm ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setCustomCode(""); setCodeError("") }}
                      className={`px-3 py-2 border rounded-lg transition-colors ${isSpooky ? "border-purple-500/30 hover:bg-purple-900/30 text-purple-300" : "border-[#171d2b]/10 hover:bg-gray-50"}`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {codeError && <p className="text-red-500 text-xs mt-1">{codeError}</p>}
                  <p className={`text-xs mt-1 ${isSpooky ? "text-purple-400/50" : "text-[#171d2b]/50"}`}>
                    3-30 characters, lowercase letters, numbers, and hyphens only
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`text-sm flex items-center gap-1 ${isSpooky ? "text-purple-300/60 hover:text-purple-300" : "text-[#171d2b]/60 hover:text-[#171d2b]"}`}
                >
                  <RefreshCw size={14} />
                  {isSpooky ? "Customize spell code" : "Customize link code"}
                </button>
              )}

              {/* Toggle Active */}
              <div className={`flex items-center justify-between pt-4 border-t ${isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"}`}>
                <div>
                  <p className={`text-sm font-medium ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{isSpooky ? "Portal Active" : "Link Active"}</p>
                  <p className={`text-xs ${isSpooky ? "text-purple-400/50" : "text-[#171d2b]/50"}`}>
                    {share.is_active ? (isSpooky ? 'The portal is open to all' : 'Anyone with the link can view') : (isSpooky ? 'Portal sealed' : 'Link is disabled')}
                  </p>
                </div>
                <button
                  onClick={toggleShare}
                  disabled={loading}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    share.is_active ? (isSpooky ? 'bg-purple-600' : 'bg-green-500') : (isSpooky ? 'bg-purple-900/50' : 'bg-gray-300')
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      share.is_active ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Create Share */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                  {isSpooky ? "Custom Spell Code (optional)" : "Custom Code (optional)"}
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => {
                    setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    setCodeError("")
                  }}
                  placeholder={isSpooky ? "Leave empty for auto-generated spell" : "Leave empty for auto-generated code"}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100 placeholder:text-purple-400/40 focus:border-purple-400" : "border-[#171d2b]/10 focus:border-[#171d2b]"}`}
                />
                {codeError && <p className="text-red-500 text-xs mt-1">{codeError}</p>}
                <p className={`text-xs mt-1 ${isSpooky ? "text-purple-400/50" : "text-[#171d2b]/50"}`}>
                  3-30 characters, lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <button
                onClick={createShare}
                disabled={loading}
                className={`w-full py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Link2 size={18} />
                )}
                {isSpooky ? "Open Portal" : "Create Share Link"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
