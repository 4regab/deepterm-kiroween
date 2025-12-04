"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Copy, Check, ChevronDown, ChevronUp, Loader2, 
  BookOpen, User, Calendar, ExternalLink, Download
} from "lucide-react"
import Link from "next/link"
import type { SharedMaterialData } from "@/lib/schemas/sharing"
import { createClient } from "@/config/supabase/client"
import { exportToPDF, exportToDOCX } from "@/utils/exportReviewer"
import { useThemeStore } from "@/lib/stores"

interface Props {
  data: SharedMaterialData
  shareCode: string
}

function FlashcardPreview({ data, isSpooky }: { data: Extract<SharedMaterialData, { type: 'flashcard_set' }>, isSpooky: boolean }) {
  return (
    <div className="space-y-3">
      {data.items.map((card, index) => (
        <div 
          key={card.id} 
          className={`p-4 rounded-xl border transition-colors ${
            isSpooky 
              ? "bg-[#1a1b26] border-purple-500/20 hover:border-purple-500/40" 
              : "bg-white border-[#171d2b]/10 hover:border-[#171d2b]/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/5 text-[#171d2b]/50"
            }`}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-medium mb-1 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>{card.front}</p>
              <p className={`text-sm ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>{card.back}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewerPreview({ data, isSpooky }: { data: Extract<SharedMaterialData, { type: 'reviewer' }>, isSpooky: boolean }) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    data.categories.map(c => c.id)
  )

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const totalTerms = data.categories.reduce((acc, cat) => acc + cat.terms.length, 0)

  return (
    <div className="space-y-4">
      <p className={`text-sm ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
        {totalTerms} {isSpooky ? "forbidden terms" : "terms"} across {data.categories.length} {isSpooky ? "dark categories" : "categories"}
      </p>
      
      {data.categories.map(category => (
        <div 
          key={category.id} 
          className={`rounded-xl border overflow-hidden ${
            isSpooky ? "bg-[#1a1b26] border-purple-500/20" : "bg-white border-[#171d2b]/10"
          }`}
        >
          <button
            onClick={() => toggleCategory(category.id)}
            className={`w-full p-4 flex items-center justify-between transition-colors text-left ${
              isSpooky ? "hover:bg-purple-500/10" : "hover:bg-gray-50"
            }`}
            style={{ borderLeft: `4px solid ${isSpooky ? '#a855f7' : category.color}` }}
          >
            <div className="flex items-center gap-3">
              <h3 className={`font-semibold ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>{category.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/5 text-[#171d2b]/60"
              }`}>
                {category.terms.length} terms
              </span>
            </div>
            {expandedCategories.includes(category.id) 
              ? <ChevronUp size={18} className={isSpooky ? "text-purple-400" : "text-[#171d2b]/40"} />
              : <ChevronDown size={18} className={isSpooky ? "text-purple-400" : "text-[#171d2b]/40"} />
            }
          </button>
          
          <AnimatePresence>
            {expandedCategories.includes(category.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-t ${isSpooky ? "border-purple-500/20" : "border-[#171d2b]/5"}`}
              >
                <div className="p-4 grid gap-3 grid-cols-1 lg:grid-cols-2">
                  {category.terms.map(term => (
                    <div 
                      key={term.id} 
                      className={`p-4 rounded-xl border ${
                        isSpooky ? "bg-[#0d0e14] border-purple-500/20" : "bg-[#f8f9fa] border-[#171d2b]/5"
                      }`}
                    >
                      <h4 className={`font-bold mb-1 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>{term.term}</h4>
                      <p className={`text-sm ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/70"}`}>{term.definition}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export default function SharePreviewClient({ data, shareCode }: Props) {
  const router = useRouter()
  const theme = useThemeStore((state) => state.theme)
  const isSpooky = theme === "spooky"
  const [, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareCode}`
    : `/share/${shareCode}`

  const handleCopyLink = async () => {
    setCopying(true)
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setCopying(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => {
    if (data.type !== 'reviewer') return
    const exportCategories = data.categories.map(c => ({
      name: c.name,
      terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
    }))
    exportToPDF({ title: data.material.title, terms: [], categories: exportCategories })
    setShowDownloadMenu(false)
  }

  const handleExportDOCX = () => {
    if (data.type !== 'reviewer') return
    const exportCategories = data.categories.map(c => ({
      name: c.name,
      terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
    }))
    exportToDOCX({ title: data.material.title, terms: [], categories: exportCategories })
    setShowDownloadMenu(false)
  }

  const handleAddToCollection = async () => {
    setAdding(true)
    
    try {
      const res = await fetch('/api/share/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareCode }),
      })

      if (res.status === 401) {
        // Not logged in - trigger Google OAuth with return to this page
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(`/share/${shareCode}`)}`,
          },
        })
        return
      }

      const result = await res.json()
      
      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      } else {
        alert(result.error || 'Failed to add to collection')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  const title = data.material.title
  const itemCount = data.type === 'flashcard_set' 
    ? data.items.length 
    : data.categories.reduce((acc, cat) => acc + cat.terms.length, 0)
  const itemLabel = data.type === 'flashcard_set' ? 'cards' : 'terms'
  const typeLabel = data.type === 'flashcard_set' ? 'Flashcard Set' : 'Reviewer'

  return (
    <div className={`min-h-screen ${isSpooky ? "bg-[#0a0b0f]" : "bg-[#f0f0ea]"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b ${
        isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <div className="rotate-[292deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="DeepTerm Logo" className="w-[22px] h-[22px]" src="/assets/logo2.svg" />
              </div>
            </div>
            <span className={`font-sora text-xl ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
              deepterm
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {data.type === 'reviewer' && (
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                    isSpooky 
                      ? "border-purple-500/30 text-purple-300 hover:bg-purple-500/10" 
                      : "border-[#171d2b]/10 hover:bg-[#171d2b]/5"
                  }`}
                  title="Download"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                {showDownloadMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50">
                      <div className={`rounded-lg border shadow-lg py-1 min-w-[140px] ${
                        isSpooky ? "bg-[#1a1b26] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                      }`}>
                        <button
                          onClick={handleExportPDF}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            isSpooky ? "text-purple-100 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                          }`}
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={handleExportDOCX}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            isSpooky ? "text-purple-100 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                          }`}
                        >
                          Download DOCX
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                isSpooky 
                  ? "border-purple-500/30 text-purple-300 hover:bg-purple-500/10" 
                  : "border-[#171d2b]/10 hover:bg-[#171d2b]/5"
              }`}
            >
              {copied ? <Check size={16} className={isSpooky ? "text-purple-400" : "text-green-600"} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Material Info Card */}
        <div className={`rounded-2xl border p-6 mb-6 ${
          isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-3 ${
                isSpooky ? "bg-purple-600" : "bg-[#171d2b]"
              }`}>
                {isSpooky ? (data.type === 'flashcard_set' ? 'Dark Cards' : 'Grimoire') : typeLabel}
              </span>
              <h1 className={`text-2xl sm:text-3xl font-sora font-bold mb-2 ${
                isSpooky ? "text-white" : "text-[#171d2b]"
              }`}>
                {title}
              </h1>
              <div className={`flex flex-wrap items-center gap-4 text-sm ${
                isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"
              }`}>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  {itemCount} {itemLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {data.owner.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(data.share.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleAddToCollection}
              disabled={adding}
              className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${
                isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
              }`}
            >
              {adding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ExternalLink size={18} />
              )}
              {adding ? (isSpooky ? 'Summoning...' : 'Adding...') : (isSpooky ? 'Claim Dark Knowledge' : 'Add to My Collection')}
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-6">
          <h2 className={`font-sora font-semibold mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            {isSpooky ? "Dark Preview" : "Preview"}
          </h2>
          
          {data.type === 'flashcard_set' ? (
            <FlashcardPreview data={data} isSpooky={isSpooky} />
          ) : (
            <ReviewerPreview data={data} isSpooky={isSpooky} />
          )}
        </div>

        {/* Bottom CTA */}
        <div className={`rounded-2xl border p-6 text-center ${
          isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
        }`}>
          <h3 className={`font-sora font-semibold mb-2 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            {isSpooky ? "Desire this forbidden knowledge?" : "Want to study this material?"}
          </h3>
          <p className={`text-sm mb-4 ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
            {isSpooky 
              ? "Claim it for your grimoire to begin your dark studies." 
              : "Add it to your collection to start learning with flashcards, practice mode, and more."
            }
          </p>
          <button
            onClick={handleAddToCollection}
            disabled={adding}
            className={`px-8 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${
              isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
            }`}
          >
            {adding ? (isSpooky ? 'Summoning...' : 'Adding...') : (isSpooky ? 'Claim Dark Knowledge' : 'Add to My Collection')}
          </button>
        </div>
      </main>
    </div>
  )
}
