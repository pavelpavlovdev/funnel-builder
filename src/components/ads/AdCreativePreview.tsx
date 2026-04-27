"use client"

import type { AdChannel, AdCreative } from "@/lib/types"
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Music2 } from "lucide-react"

interface Props {
  channel: AdChannel
  creative: AdCreative
  size?: "sm" | "md"
}

export function AdCreativePreview({ channel, creative, size = "md" }: Props) {
  const compact = size === "sm"

  if (channel === "google") {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${compact ? "max-w-xs" : "max-w-md"}`}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
            <span className="px-1 py-px border border-emerald-600 rounded text-[9px]">Ad</span>
            <span>·</span>
            <span className="text-gray-600 font-normal truncate">funnelpro.com</span>
          </div>
          <h4 className="text-base font-medium text-blue-700 hover:underline mt-1 leading-snug">
            {creative.headline}
          </h4>
          <p className="text-xs text-gray-700 mt-1 leading-snug">{creative.body}</p>
          <button className="mt-2.5 text-xs px-3 py-1 border border-gray-300 rounded-full text-blue-700 font-medium hover:bg-gray-50">
            {creative.cta}
          </button>
        </div>
      </div>
    )
  }

  if (channel === "tiktok") {
    return (
      <div className={`bg-black text-white rounded-2xl overflow-hidden relative ${compact ? "w-44 h-72" : "w-56 h-96"}`}>
        {creative.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creative.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 text-xs">
          <span className="px-1.5 py-0.5 bg-white/15 backdrop-blur rounded text-[10px] font-bold">
            Sponsored
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm font-bold leading-tight">{creative.headline}</p>
          <p className="text-xs opacity-90 mt-0.5 line-clamp-2">{creative.body}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px]">
            <Music2 className="w-3 h-3" />
            <span className="opacity-80">original sound · funnelpro</span>
          </div>
          <button className="mt-2 w-full py-2 bg-white text-black rounded-md text-sm font-bold">
            {creative.cta}
          </button>
        </div>
      </div>
    )
  }

  // meta default
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${compact ? "max-w-xs" : "max-w-md"}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          F
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold truncate">FunnelPro</p>
            <span className="text-[10px] text-gray-500">· Sponsored</span>
          </div>
          <p className="text-[10px] text-gray-500">Paid partnership</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </div>

      {/* Body text */}
      <p className="text-[13px] text-gray-800 px-3 pb-2 leading-relaxed">{creative.body}</p>

      {/* Image */}
      <div className={`relative ${compact ? "h-32" : "h-48"} bg-gray-100`}>
        {creative.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creative.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100" />
        )}
      </div>

      {/* CTA bar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50">
        <div className="min-w-0 flex-1 mr-2">
          <p className="text-[10px] uppercase text-gray-500 tracking-wider">FUNNELPRO.COM</p>
          <p className="text-sm font-bold leading-tight truncate text-gray-900">
            {creative.headline}
          </p>
        </div>
        <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-xs font-bold rounded-md whitespace-nowrap">
          {creative.cta}
        </button>
      </div>

      {/* Reactions row */}
      <div className="flex items-center justify-around px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-500">
        <button className="flex items-center gap-1 hover:text-gray-700">
          <ThumbsUp className="w-3.5 h-3.5" /> Like
        </button>
        <button className="flex items-center gap-1 hover:text-gray-700">
          <MessageCircle className="w-3.5 h-3.5" /> Comment
        </button>
        <button className="flex items-center gap-1 hover:text-gray-700">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  )
}
