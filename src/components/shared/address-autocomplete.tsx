import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { cn } from '../../lib/cn'

interface AddressResult {
  rue: string
  complement?: string
  code_postal: string
  ville: string
  latitude?: number
  longitude?: number
  formatted: string
}

interface AddressAutocompleteProps {
  value?: string
  onChange: (address: AddressResult | null) => void
  placeholder?: string
  className?: string
}

// Uses Mapbox Geocoding API (free tier, no additional API key needed — uses the same Mapbox token)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

interface MapboxFeature {
  place_name: string
  center: [number, number] // [lng, lat]
  context?: Array<{ id: string; text: string; short_code?: string }>
  text: string
  properties?: { address?: string }
  address?: string
}

export function AddressAutocomplete({ value, onChange, placeholder = 'Rechercher une adresse...', className }: AddressAutocompleteProps) {
  const [input, setInput] = useState(value || '')
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&country=fr&types=address&language=fr&limit=5`
      )
      const data = await res.json()
      setSuggestions(data.features || [])
      setIsOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(val: string) {
    setInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  function handleSelect(feature: MapboxFeature) {
    const context = feature.context || []
    const postcode = context.find(c => c.id.startsWith('postcode'))?.text || ''
    const place = context.find(c => c.id.startsWith('place'))?.text || ''
    const [lng, lat] = feature.center

    // Build street address
    const streetNumber = feature.address || ''
    const streetName = feature.text || ''
    const rue = streetNumber ? `${streetNumber} ${streetName}` : streetName

    const result: AddressResult = {
      rue,
      code_postal: postcode,
      ville: place,
      latitude: lat,
      longitude: lng,
      formatted: feature.place_name,
    }

    setInput(feature.place_name)
    setSuggestions([])
    setIsOpen(false)
    onChange(result)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-8"
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((feat, i) => (
            <button
              key={i}
              type="button"
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              onClick={() => handleSelect(feat)}
            >
              <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{feat.text}{feat.address ? ` ${feat.address}` : ''}</p>
                <p className="text-xs text-gray-500 truncate">{feat.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!MAPBOX_TOKEN && (
        <p className="text-[10px] text-gray-400 mt-1">Saisie manuelle — autocomplete non disponible</p>
      )}
    </div>
  )
}
