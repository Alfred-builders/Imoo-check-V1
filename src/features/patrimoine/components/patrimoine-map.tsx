import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Batiment } from '../types'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

function getMarkerColor(bat: Batiment): string {
  if (bat.missions_a_venir > 0) return '#2563eb' // blue
  if (bat.derniere_mission) {
    const monthsAgo = (Date.now() - new Date(bat.derniere_mission).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo < 6) return '#16a34a' // green
  }
  return '#9ca3af' // gray
}

interface Props {
  batiments: Batiment[]
}

export function PatrimoineMap({ batiments }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    if (!mapboxgl.accessToken) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566],
      zoom: 11,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const bounds = new mapboxgl.LngLatBounds()
    let hasPoints = false

    for (const bat of batiments) {
      const adr = bat.adresse_principale
      if (!adr?.latitude || !adr?.longitude) continue

      hasPoints = true
      const color = getMarkerColor(bat)

      const el = document.createElement('div')
      el.className = 'immo-marker'
      el.innerHTML = `
        <div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.15s ease;
          transform-origin: center center;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
        ">${bat.nb_lots}</div>
      `
      const inner = el.firstElementChild as HTMLElement
      el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.25)' })
      el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)' })

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false, className: 'immo-popup' })
        .setHTML(`
          <div style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 180px;">
            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px;">${bat.designation}</div>
            <div style="font-size: 12px; color: #6b7280;">${adr.rue}, ${adr.ville}</div>
            <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 12px;">
              <span style="color: #374151; font-weight: 500;">${bat.nb_lots} lot${bat.nb_lots > 1 ? 's' : ''}</span>
              ${bat.missions_a_venir > 0 ? `<span style="color: #2563eb; font-weight: 500;">${bat.missions_a_venir} mission(s)</span>` : ''}
            </div>
          </div>
        `)

      // anchor: center so the marker doesn't shift on hover
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
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

  if (!mapboxgl.accessToken) {
    return (
      <div className="border border-gray-200 rounded-xl h-[500px] flex items-center justify-center text-gray-400 bg-gray-50">
        <p className="text-sm">Token Mapbox non configure</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div ref={mapContainer} className="h-[500px] w-full" />
      <div className="flex items-center gap-6 px-4 py-2.5 bg-white text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Mission a venir</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Mission recente (&lt;6 mois)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Aucune mission</span>
        </div>
      </div>
    </div>
  )
}
