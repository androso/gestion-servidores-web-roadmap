'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';
import type { RoadmapEdge } from './types';

export interface CustomEdgeData {
  edge: RoadmapEdge;
  isSearchDimmed?: boolean;
  isSupport?: boolean;
}

export const RoadmapEdgeComponent = memo(function RoadmapEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const edgeData = data as unknown as CustomEdgeData | undefined;
  const edge = edgeData?.edge;
  const route = edge?.route || 'smoothstep';

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (route === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else if (route === 'bezier') {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 10,
    });
  }

  const isSupport = edgeData?.isSupport;
  const strokeColor = edge?.style?.strokeColor || 'var(--roadmap-connector)';
  const strokeWidth = edge?.style?.strokeWidth ?? (isSupport ? 1.75 : 3);
  const lineStyle = edge?.style?.lineStyle || 'solid';

  let strokeDasharray: string | undefined;
  if (lineStyle === 'dashed') {
    strokeDasharray = '6 6';
  } else if (lineStyle === 'dotted') {
    strokeDasharray = '2 4';
  }

  const isDimmed = edgeData?.isSearchDimmed;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          opacity: isDimmed ? 0.2 : isSupport ? 0.45 : 1,
          transition: 'opacity 0.2s ease',
        }}
      />
      {edge?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              fontFamily: 'var(--font-balsamiq-sans)',
            }}
            className={`nodrag nopan px-2 py-0.5 rounded text-[11px] font-bold select-none ${
              isDimmed ? 'opacity-20' : 'opacity-100'
            }`}
          >
            {edge.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const edgeTypes = {
  roadmapEdge: RoadmapEdgeComponent,
  smoothstep: RoadmapEdgeComponent,
  bezier: RoadmapEdgeComponent,
  straight: RoadmapEdgeComponent,
};
