"use client";
import React, { useMemo } from "react";
import { api } from "@/trpc/react";
import DeckGL from "@deck.gl/react";
import { ColumnLayer } from "@deck.gl/layers";
import Map from "react-map-gl/maplibre";
import { NavigationControl } from "react-map-gl";
// Add this if you get a type error for d3-scale-chromatic
// @ts-ignore
import { interpolateYlGnBu } from "d3-scale-chromatic";

const INITIAL_VIEW_STATE = {
  longitude: 39.3,
  latitude: -6.2,
  zoom: 8,
  minZoom: 6,
  maxZoom: 14,
  pitch: 45,
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Helper to convert hex color to [r,g,b,a]
function hexToRgba(hex: string, alpha = 180) {
  // Remove '#' if present
  hex = hex.replace('#', '');
  // Convert short hex to full
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
    alpha
  ];
}

function getContinuousColor(value: number, min: number, max: number) {
  if (isNaN(value)) return [200, 200, 200, 80];
  if (max === min) return hexToRgba(interpolateYlGnBu(1));
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const hex = interpolateYlGnBu(t);
  return hexToRgba(hex);
}

function getTooltip({ object }: any) {
  if (!object) return null;
  const { position, value, avg_speed, avg_range, avg_time_hours } = object;
  return {
    text: `Lat: ${position[1].toFixed(3)}, Lng: ${position[0].toFixed(3)}\nVisits: ${value}\nAvg Speed: ${avg_speed?.toFixed(2) ?? '-'}\nAvg Range: ${avg_range?.toFixed(2) ?? '-'}\nAvg Time (h): ${avg_time_hours?.toFixed(2) ?? '-'}`,
    style: {
      color: "#fff",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: "0.5rem",
      borderRadius: "4px",
      fontSize: "13px"
    }
  };
}

export default function GridMap() {
  const { data = [], isLoading } = api.gridSummary.all.useQuery();

  // Prepare data for deck.gl
  const points = useMemo(() =>
    data.map((d: any) => ({
      position: [d.lng_grid_1km, d.lat_grid_1km],
      value: d.total_visits || 0,
      avg_speed: d.avg_speed,
      avg_range: d.avg_range,
      avg_time_hours: d.avg_time_hours,
    })),
    [data]
  );

  // Find min/max for color scaling and elevation
  const minValue = Math.min(...points.map(p => p.value));
  const maxValue = Math.max(...points.map(p => p.value));
  const minRange = Math.min(...points.map(p => p.avg_range ?? 0));
  const maxRange = Math.max(...points.map(p => p.avg_range ?? 0));
  const minTime = Math.min(...points.map(p => p.avg_time_hours ?? 0));
  const maxTime = Math.max(...points.map(p => p.avg_time_hours ?? 0));

  function getElevation(val: number | undefined) {
    if (val == null || isNaN(val)) return 0;
    if (maxTime === minTime) return 1000;
    // Scale elevation to 0-3000m for visual effect
    return 1000 + 2000 * (val - minTime) / (maxTime - minTime);
  }

  const layers = [
    new ColumnLayer({
      id: "grid-cells",
      data: points,
      diskResolution: 4, // rectangle
      radius: 500, // meters (1km cell)
      elevationScale: 1,
      getPosition: (d: any) => d.position,
      getFillColor: (d: any) => getContinuousColor(d.avg_time_hours, minTime, maxTime) as [number, number, number, number],
      getElevation: (d: any) => getElevation(d.avg_time_hours),
      pickable: true,
      extruded: true,
      opacity: 1,
      getTooltip: ({object}: any) => object && {
        text: `Lat: ${object.position[1].toFixed(3)}, Lng: ${object.position[0].toFixed(3)}\nAvg Time (h): ${object.avg_time_hours?.toFixed(2) ?? '-'}\nVisits: ${object.value}\nAvg Speed: ${object.avg_speed?.toFixed(2) ?? '-'}\nAvg Range: ${object.avg_range?.toFixed(2) ?? '-'}`,
        style: {
          color: "#fff",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "0.5rem",
          borderRadius: "4px",
          fontSize: "13px"
        }
      },
    }),
  ];

  return (
    <div className="w-full h-[400px] my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={getTooltip}
        style={{ width: "100%", height: "100%" }}
      >
        <Map
          mapStyle={MAP_STYLE}
          reuseMaps
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-left" />
        </Map>
      </DeckGL>
    </div>
  );
} 