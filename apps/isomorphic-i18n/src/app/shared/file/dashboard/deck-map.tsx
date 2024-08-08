"use client";

import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import {AmbientLight, PointLight, LightingEffect, Color, PickingInfo, MapViewState} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';
import InfoPanel from '@/app/shared/file/dashboard/deck-infopanel'; 

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/WorldFishCenter/datatest/main/data/predicted_tracks.csv';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 125.7,
  latitude: -8.75,
  zoom: 8.5,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

function getTooltip({object}: PickingInfo) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;

  return `
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${count} Accidents
  `;
}

type DataPoint = { longitude: number, latitude: number, year: number, gear: string };
interface CSVDataPoint {
  year: number;
  lat: number;
  lng: number;
  Gear: string;
  [key: string]: any;  // for any other properties in the CSV
}

export default function App({
  mapStyle = MAP_STYLE,
}: {
  mapStyle?: string;
}) {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [filteredData, setFilteredData] = useState<DataPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverage, setCoverage] = useState(0.5);
  const [radius, setRadius] = useState(500);
  const [selectedGears, setSelectedGears] = useState<string[]>(["Hand Line", "Gill Net", "Long Line"]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await load(DATA_URL, CSVLoader);
        const points: DataPoint[] = (result.data as CSVDataPoint[]).map(d => ({
          longitude: d.lng,
          latitude: d.lat,
          year: d.year,
          gear: d.Gear
        }));
        setData(points);
        setFilteredData(points);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load map data. Please try again later.");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.filter(d => selectedGears.includes(d.gear));
      setFilteredData(filtered);
    }
  }, [data, selectedGears]);

  const handleGearChange = (gear: string) => {
    setSelectedGears(prev =>
      prev.includes(gear) ? prev.filter(g => g !== gear) : [...prev, gear]
    );
  };

  const layers = filteredData ? [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      colorRange,
      coverage,
      data: filteredData,
      elevationRange: [0, 3000],
      elevationScale: 30,
      extruded: true,
      getPosition: d => [d.longitude, d.latitude],
      pickable: true,
      radius,
      material: {
        ambient: 0.8,  
        diffuse: 0.7, 
        shininess: 40,
        specularColor: [51, 51, 51]
      },
      transitions: {
        elevationScale: 3000
      }
    })
  ] : [];

  if (error) {
    return <div className="w-full h-full flex items-center justify-center">Error: {error}</div>;
  }

  if (!data) {
    return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>
      <InfoPanel
        accidents={filteredData?.length ?? 0}
        radius={radius}
        onRadiusChange={setRadius}
        radiusMin={500}
        radiusMax={2000}
        radiusStep={500}
        selectedGears={selectedGears}
        onGearChange={handleGearChange}
        gears={["Hand Line", "Gill Net", "Long Line"]}
      />
    </div>
  );
}
