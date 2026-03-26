import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Batiment } from '../types'

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function getMarkerColor(bat: Batiment): string {
  if (bat.missions_a_venir > 0) return '#3b82f6' // blue - upcoming
  if (bat.derniere_mission) {
    const monthsAgo = (Date.now() - new Date(bat.derniere_mission).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo < 6) return '#22c55e' // green - recent
  }
  return '#71717a' // gray - inactive
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

interface Props {
  batiments: Batiment[]
}

export function PatrimoineMap({ batiments }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([48.8566, 2.3522], 12) // Paris default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    const bounds: L.LatLngBoundsExpression = []

    for (const bat of batiments) {
      const adr = bat.adresse_principale
      if (!adr?.latitude || !adr?.longitude) continue

      const color = getMarkerColor(bat)
      const icon = createColoredIcon(color)
      const latlng: L.LatLngExpression = [adr.latitude, adr.longitude]

      const marker = L.marker(latlng, { icon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:180px;">
          <strong>${bat.designation}</strong><br/>
          <span style="color:#888;font-size:12px;">${adr.rue}, ${adr.ville}</span><br/>
          <span style="font-size:12px;">${bat.nb_lots} lot${bat.nb_lots > 1 ? 's' : ''}</span>
          ${bat.missions_a_venir > 0 ? `<br/><span style="color:#3b82f6;font-size:12px;">${bat.missions_a_venir} mission(s) à venir</span>` : ''}
        </div>
      `)

      marker.on('click', () => {
        navigate(`/app/patrimoine/batiments/${bat.id}`)
      })

      ;(bounds as [number, number][]).push([adr.latitude, adr.longitude])
    }

    if ((bounds as [number, number][]).length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 15 })
    }
  }, [batiments, navigate])

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-[500px] w-full" />
      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2 bg-muted/50 text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          Mission à venir
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Mission récente (&lt;6 mois)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-500" />
          Aucune mission
        </div>
      </div>
    </div>
  )
}
