import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Batiment } from '../types'

// Token set via env or fallback to public demo token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW1tb2NoZWNrZXIiLCJhIjoiY200OHh4MXdsMDB5OTJqcTFwNHRqZjdzYSJ9.placeholder'

function getMarkerColor(bat: Batiment): string {
  if (bat.missions_a_venir > 0) return '#3b82f6' // blue - upcoming
  if (bat.derniere_mission) {
    const monthsAgo = (Date.now() - new Date(bat.derniere_mission).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo < 6) return '#22c55e' // green - recent
  }
  return '#94a3b8' // gray - inactive
}

interface Props {
  batiments: Batiment[]
}

export function PatrimoineMap({ batiments }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const navigate = useNavigate()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566], // Paris default
      zoom: 11,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when batiments change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const bounds = new mapboxgl.LngLatBounds()
    let hasPoints = false

    for (const bat of batiments) {
      const adr = bat.adresse_principale
      if (!adr?.latitude || !adr?.longitude) continue

      hasPoints = true
      const color = getMarkerColor(bat)

      // Create marker element
      const el = document.createElement('div')
      el.style.cssText = `
        width: 28px; height: 28px; border-radius: 50%;
        background: ${color}; border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        cursor: pointer; transition: transform 0.15s;
      `
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

      // Popup
      const popup = new mapboxgl.Popup({ offset: 18, closeButton: false })
        .setHTML(`
          <div style="font-family: 'Satoshi', sans-serif; padding: 4px 0;">
            <strong style="font-size: 14px;">${bat.designation}</strong><br/>
            <span style="color: #64748b; font-size: 12px;">${adr.rue}, ${adr.ville}</span><br/>
            <span style="font-size: 12px;">${bat.nb_lots} lot${bat.nb_lots > 1 ? 's' : ''}</span>
            ${bat.missions_a_venir > 0 ? `<br/><span style="color: #3b82f6; font-size: 12px; font-weight: 500;">${bat.missions_a_venir} mission(s) à venir</span>` : ''}
          </div>
        `)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([adr.longitude, adr.latitude])
        .setPopup(popup)
        .addTo(map)

      el.addEventListener('click', () => {
        navigate(`/app/patrimoine/batiments/${bat.id}`)
      })

      bounds.extend([adr.longitude, adr.latitude])
      markersRef.current.push(marker)
    }

    if (hasPoints) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 })
    }
  }, [batiments, navigate])

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-[500px] w-full" />
      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2.5 bg-muted text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          Mission à venir
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Mission récente (&lt;6 mois)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          Aucune mission
        </div>
      </div>
    </div>
  )
}
