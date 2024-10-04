"use client";

import React, { useEffect, useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetCard from '@components/cards/widget-card';
import SimpleBar from '@ui/simplebar';
import { useMedia } from '@hooks/use-media';
import { useTranslation } from '@/app/i18n/client';

const COLORS = [
  '#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D',
  '#6B46FF', '#A461D8', '#E77EA3', '#FFB2B2', '#FFDBDB', '#FFC107',
  '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
  '#CDDC39', '#FFEB3B', '#795548', '#9E9E9E', '#607D8B'
];

interface GearTreemapProps {
  className?: string;
  lang?: string;
}

const GearTreemap: React.FC<GearTreemapProps> = ({ className, lang }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isTablet = useMedia('(max-width: 800px)', false);
  const { t } = useTranslation(lang!, 'common');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/gear-tree');
        const jsonData = await response.json();

        // Process and sort data
        const processedData = jsonData
          .map((item: any, index: number) => {
            // Sort the children (gear types) by size in descending order
            item.children.sort((a: any, b: any) => b.size - a.size);
            // Calculate total size for the parent node and assign it to 'size'
            item.size = item.children.reduce((sum: number, child: any) => sum + child.size, 0);
            // Assign a color index for consistent coloring
            item.colorIndex = index;
            return item;
          })
          // Sort the parent nodes (BMUs) by size in descending order
          .sort((a: any, b: any) => b.size - a.size);

        setData(processedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (!data || data.length === 0) return <div>No data available.</div>;

  return (
    <WidgetCard
      title={t('Gear Tree Map')}
      titleClassName="font-normal text-gray-700 sm:text-base font-inter"
      className={className}
    >
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <Treemap
              data={data}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
              isAnimationActive={false}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
};

interface CustomizedContentProps {
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  children?: any;
  colors: string[];
  root?: any;
  [key: string]: any;
}

const MIN_RECT_WIDTH_FOR_LABEL = 40;
const MIN_RECT_HEIGHT_FOR_LABEL = 20;

const CustomizedContent: React.FC<CustomizedContentProps> = (props) => {
  const {
    depth = 0,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index = 0,
    name = '',
    colors,
    root,
    colorIndex,
  } = props;

  const isLeafNode = !props.children || props.children.length === 0;

  // Determine fill color and styles based on depth
  let fillColor = 'rgba(255, 255, 255, 0)';
  let strokeColor = '#fff';
  let strokeWidth = 1;
  let fontSize = 14;
  let textColor = '#fff';

  if (depth === 1) {
    // BMU level
    fillColor = colors[colorIndex % colors.length];
    strokeColor = '#000'; // Use a darker stroke for BMUs
    strokeWidth = 2;
    fontSize = 16;
    textColor = '#000'; // Use black text for better contrast
  } else if (depth === 2) {
    // Gear level
    fillColor = 'rgba(255, 255, 255, 0.7)'; // Semi-transparent fill
    strokeColor = '#fff';
    strokeWidth = 1;
    fontSize = 12;
    textColor = '#000';
  }

  // Check if rectangle is large enough for label
  const shouldRenderLabel = width > MIN_RECT_WIDTH_FOR_LABEL && height > MIN_RECT_HEIGHT_FOR_LABEL;

  return (
    <g>
      {/* Render the rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeOpacity: 1,
        }}
      />
      {/* Render the label if the rectangle is large enough */}
      {shouldRenderLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + fontSize / 2}
          textAnchor="middle"
          fill={textColor}
          fontSize={fontSize}
          pointerEvents="none"
        >
          {name}
        </text>
      )}
    </g>
  );
};

const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { name, value, depth } = data;

    if (depth === 1) {
      // BMU (Landing Site)
      return (
        <div className="custom-tooltip bg-white p-2 shadow rounded">
          <p className="font-semibold">{`Landing Site: ${name}`}</p>
          <p>{`Total Gear Count: ${value || data.size || 0}`}</p>
        </div>
      );
    } else if (depth === 2) {
      // Gear Type
      return (
        <div className="custom-tooltip bg-white p-2 shadow rounded">
          <p className="font-semibold">{`Gear: ${name}`}</p>
          <p>{`Count: ${value || data.size || 0}`}</p>
        </div>
      );
    }
  }

  return null;
};

export default GearTreemap;
