'use client';

import React, { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import { nodeTypes } from './roadmap-node';
import { edgeTypes } from './roadmap-edge';
import { resolveRoadmapTheme, roadmapThemeCssVars } from './theme';
import type { CanvasConfig, RoadmapTheme } from './types';

interface RoadmapCanvasInnerProps {
  nodes: Node[];
  edges: Edge[];
  canvas: CanvasConfig;
  theme?: RoadmapTheme;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

function RoadmapCanvasInner({
  nodes,
  edges,
  canvas,
  theme,
  onNodeClick,
}: RoadmapCanvasInnerProps) {
  const resolvedTheme = useMemo(() => resolveRoadmapTheme(theme), [theme]);
  const themeVars = useMemo(() => roadmapThemeCssVars(resolvedTheme), [resolvedTheme]);
  const viewport = canvas.initialViewport;

  const canvasStyle = {
    ...themeVars,
    backgroundColor: resolvedTheme.paper,
    color: resolvedTheme.ink,
    fontFamily: 'var(--font-balsamiq-sans)',
  } as React.CSSProperties;

  return (
    <div className="roadmap-canvas w-full h-full relative select-none overflow-hidden" style={canvasStyle}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        minZoom={viewport.zoom}
        maxZoom={viewport.zoom}
        defaultViewport={viewport}
        onNodeClick={onNodeClick}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

export interface RoadmapCanvasProps {
  nodes: Node[];
  edges: Edge[];
  canvas: CanvasConfig;
  theme?: RoadmapTheme;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
