import { useEffect, useRef, useCallback } from 'react'
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

function buildGeoJSON(batiments: Batiment[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (const bat of batiments) {
    const adr = bat.adresse_principale
    if (!adr?.latitude || !adr?.longitude) continue
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [adr.longitude, adr.latitude] },
      properties: {
        id: bat.id,
        designation: bat.designation,
        rue: adr.rue,
        ville: adr.ville,
        nb_lots: bat.nb_lots,
        missions_a_venir: bat.missions_a_venir,
        color: getMarkerColor(bat),
      },
    })
  }
  return { type: 'FeatureCollection', features }
}

interface Props {
  batiments: Batiment[]
}

const SOURCE_ID = 'batiments'
const CLUSTER_LAYER = 'clusters'
const CLUSTER_COUNT_LAYER = 'cluster-count'
const UNCLUSTERED_LAYER = 'unclustered-point'

export function PatrimoineMap({ batiments }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const navigate = useNavigate()

  // Keep navigate stable in a ref so we can use it in map event handlers
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const setupLayers = useCallback((map: mapboxgl.Map, geojson: GeoJSON.FeatureCollection) => {
    // Remove existing source/layers if present (for hot-reload safety)
    if (map.getLayer(CLUSTER_COUNT_LAYER)) map.removeLayer(CLUSTER_COUNT_LAYER)
    if (map.getLayer(CLUSTER_LAYER)) map.removeLayer(CLUSTER_LAYER)
    if (map.getLayer(UNCLUSTERED_LAYER)) map.removeLayer(UNCLUSTERED_LAYER)
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)

    // Add GeoJSON source with clustering
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Layer 1: Cluster circles
    map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#60a5fa', // blue-400 for small clusters
          10,
          '#3b82f6', // blue-500 for medium
          30,
          '#2563eb', // blue-600 for large
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18, // small
          10,
          24, // medium
          30,
          30, // large
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Layer 2: Cluster count labels
    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Layer 3: Unclustered individual points (colored by status)
    map.addLayer({
      id: UNCLUSTERED_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })
  }, [])

  // Initialize map once
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

    // Cluster click: zoom in to expand
    map.on('click', CLUSTER_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })
      if (!features.length) return
      const clusterId = features[0].properties?.cluster_id
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        const geometry = features[0].geometry as GeoJSON.Point
        map.easeTo({
          center: geometry.coordinates as [number, number],
          zoom: zoom ?? 14,
        })
      })
    })

    // Individual point click: navigate to building detail
    map.on('click', UNCLUSTERED_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const props = features[0].properties
      if (props?.id) {
        navigateRef.current(`/app/patrimoine/batiments/${props.id}`, { state: { from: 'carte' } })
      }
    })

    // Show popup on hover for individual points
    map.on('mouseenter', UNCLUSTERED_LAYER, (e) => {
      map.getCanvas().style.cursor = 'pointer'
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const props = features[0].properties
      const geometry = features[0].geometry as GeoJSON.Point

      if (popupRef.current) popupRef.current.remove()
      const missionsHtml = props?.missions_a_venir > 0
        ? `<span style="color: #2563eb; font-weight: 500;">${props.missions_a_venir} mission(s)</span>`
        : ''
      popupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: false, className: 'immo-popup' })
        .setLngLat(geometry.coordinates as [number, number])
        .setHTML(`
          <div style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 180px;">
            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px;">${props?.designation ?? ''}</div>
            <div style="font-size: 12px; color: #6b7280;">${props?.rue ?? ''}, ${props?.ville ?? ''}</div>
            <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 12px;">
              <span style="color: #374151; font-weight: 500;">${props?.nb_lots ?? 0} lot${(props?.nb_lots ?? 0) > 1 ? 's' : ''}</span>
              ${missionsHtml}
            </div>
          </div>
        `)
        .addTo(map)
    })

    map.on('mouseleave', UNCLUSTERED_LAYER, () => {
      map.getCanvas().style.cursor = ''
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
    })

    // Change cursor on cluster hover
    map.on('mouseenter', CLUSTER_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', CLUSTER_LAYER, () => {
      map.getCanvas().style.cursor = ''
    })

    mapRef.current = map

    return () => {
      if (popupRef.current) popupRef.current.remove()
      map.remove()
      mapRef.current = null
    }
  }, [setupLayers])

  // Update data when batiments change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const geojson = buildGeoJSON(batiments)

    const applyData = () => {
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
      if (source) {
        // Source already exists, just update data
        source.setData(geojson)
      } else {
        // First load: set up layers
        setupLayers(map, geojson)
      }

      // Fit bounds to data
      if (geojson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        for (const f of geojson.features) {
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
          bounds.extend(coords)
        }
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 })
      }
    }

    if (map.isStyleLoaded()) {
      applyData()
    } else {
      map.once('load', applyData)
    }
  }, [batiments, setupLayers])

  if (!mapboxgl.accessToken) {
    return (
      <div className="border border-gray-200 rounded-xl h-[500px] flex items-center justify-center text-gray-400 bg-gray-50">
        <p className="text-sm">Token Mapbox non configure</p>
      </div>
    )
  }

  return (
    <div className="elevation-raised rounded-xl overflow-hidden">
      <div ref={mapContainer} className="h-[500px] w-full" />
      <div className="flex items-center gap-6 px-4 py-2.5 bg-surface-sunken text-xs text-muted-foreground border-t border-border">
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
