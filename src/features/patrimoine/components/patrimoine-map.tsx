import { useEffect, useRef, useState } from 'react'
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
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const navigate = useNavigate()
  const [clusterList, setClusterList] = useState<Batiment[] | null>(null)
  const [clusterPos, setClusterPos] = useState<{ x: number; y: number } | null>(null)

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

    map.on('load', () => {
      // Add GeoJSON source with clustering
      map.addSource('batiments', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'batiments',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#64748b', 5,     // slate for < 5
            '#2563eb', 15,    // blue for < 15
            '#7c3aed',        // violet for >= 15
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            20, 5,
            25, 15,
            32,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'batiments',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Individual point circles
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'batiments',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Individual point lot count labels
      map.addLayer({
        id: 'unclustered-label',
        type: 'symbol',
        source: 'batiments',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'nb_lots'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Click on cluster → show list of buildings
      map.on('click', 'clusters', (e) => {
        if (!e.features?.[0]) return
        const clusterId = e.features[0].properties?.cluster_id
        const source = map.getSource('batiments') as mapboxgl.GeoJSONSource

        source.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
          if (err || !leaves) return
          const ids = leaves.map((f: any) => f.properties.id)
          const clusterBats = batiments.filter(b => ids.includes(b.id))
          setClusterList(clusterBats)
          setClusterPos({ x: e.point.x, y: e.point.y })
        })
      })

      // Click on individual point → navigate to building
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features?.[0]) return
        const id = e.features[0].properties?.id
        if (id) navigate(`/app/patrimoine/batiments/${id}`)
      })

      // Hover popup for individual points
      map.on('mouseenter', 'unclustered-point', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (!e.features?.[0]) return
        const props = e.features[0].properties
        if (!props) return
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number]

        popupRef.current = new mapboxgl.Popup({ offset: 12, closeButton: false, className: 'immo-popup' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 180px;">
              <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px;">${props.designation}</div>
              <div style="font-size: 12px; color: #6b7280;">${props.adresse}</div>
              <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 12px;">
                <span style="color: #374151; font-weight: 500;">${props.nb_lots} lot${Number(props.nb_lots) > 1 ? 's' : ''}</span>
                ${Number(props.missions_a_venir) > 0 ? `<span style="color: #2563eb; font-weight: 500;">${props.missions_a_venir} mission(s)</span>` : ''}
              </div>
            </div>
          `)
          .addTo(map)
      })

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = ''
        popupRef.current?.remove()
      })

      // Cursor pointer on clusters
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [navigate])

  // Update data when batiments change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function updateSource() {
      const source = map!.getSource('batiments') as mapboxgl.GeoJSONSource | undefined
      if (!source) return

      const features: GeoJSON.Feature[] = batiments
        .filter(bat => bat.adresse_principale?.latitude && bat.adresse_principale?.longitude)
        .map(bat => ({
          type: 'Feature' as const,
          properties: {
            id: bat.id,
            designation: bat.designation,
            adresse: bat.adresse_principale ? `${bat.adresse_principale.rue}, ${bat.adresse_principale.ville}` : '',
            nb_lots: String(bat.nb_lots),
            missions_a_venir: String(bat.missions_a_venir),
            color: getMarkerColor(bat),
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [bat.adresse_principale!.longitude!, bat.adresse_principale!.latitude!],
          },
        }))

      source.setData({ type: 'FeatureCollection', features })

      // Fit bounds
      if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        features.forEach(f => {
          const coords = (f.geometry as GeoJSON.Point).coordinates
          bounds.extend(coords as [number, number])
        })
        map!.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 })
      }
    }

    if (map.loaded()) {
      updateSource()
    } else {
      map.on('load', updateSource)
    }
  }, [batiments])

  // Close cluster list on map click
  useEffect(() => {
    function handleClick() { setClusterList(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!mapboxgl.accessToken) {
    return (
      <div className="border border-gray-200 rounded-xl h-[500px] flex items-center justify-center text-gray-400 bg-gray-50">
        <p className="text-sm">Token Mapbox non configuré</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      <div ref={mapContainer} className="h-[500px] w-full" />

      {/* Cluster list popup */}
      {clusterList && clusterPos && (
        <div
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-h-64 overflow-y-auto w-64 z-10 animate-scale-in"
          style={{ left: Math.min(clusterPos.x, window.innerWidth - 300), top: clusterPos.y + 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">{clusterList.length} bâtiments</p>
          {clusterList.map(bat => (
            <button
              key={bat.id}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-muted transition-colors flex items-center gap-2"
              onClick={() => navigate(`/app/patrimoine/batiments/${bat.id}`)}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getMarkerColor(bat) }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{bat.designation}</p>
                <p className="text-[10px] text-gray-400 truncate">{bat.adresse_principale?.rue}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 px-4 py-2.5 bg-white text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Mission à venir</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Mission récente (&lt;6 mois)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Aucune mission</span>
        </div>
      </div>
    </div>
  )
}
