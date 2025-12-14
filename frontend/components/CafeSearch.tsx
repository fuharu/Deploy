'use client'

import { useState } from 'react'
import { searchCafes } from '@/app/companies/actions'

type Place = {
  name: string
  address: string
  rating: number | null
  user_ratings_total: number | null
  open_now: boolean | null
}

export default function CafeSearch({ defaultLocation }: { defaultLocation?: string }) {
  const [location, setLocation] = useState(defaultLocation || '')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!location.trim()) return
    setLoading(true)
    setSearched(false)
    const results = await searchCafes(location)
    setPlaces(results)
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        ☕ 周辺カフェ検索 (作業・時間調整)
      </h2>
      
      <div className="flex gap-2 mb-4">
        <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="場所を入力 (例: 渋谷駅, 東京都千代田区...)"
            className="border rounded px-3 py-2 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
            onClick={handleSearch}
            disabled={loading || !location}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 font-medium"
        >
            {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {searched && places.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
              カフェが見つかりませんでした。場所を変えて試してください。
          </p>
      )}

      {places.length > 0 && (
        <div className="flex flex-col gap-3">
            {places.map((place, idx) => (
                <div key={idx} className="border p-3 rounded hover:bg-orange-50 transition">
                    <div className="flex justify-between items-start">
                        <div className="font-bold text-gray-800">{place.name}</div>
                        {place.rating && (
                            <div className="text-orange-500 text-sm font-bold">
                                ★ {place.rating} <span className="text-gray-400 font-normal">({place.user_ratings_total})</span>
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{place.address}</div>
                    <div className="flex gap-2 text-xs">
                        {place.open_now !== null && (
                            <span className={`px-2 py-0.5 rounded ${place.open_now ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {place.open_now ? '営業中' : '営業時間外'}
                            </span>
                        )}
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            Google Mapで見る
                        </a>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  )
}

