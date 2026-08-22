'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type Viewport,
} from '@xyflow/react';
import { nodeTypes } from './roadmap-node';
import { edgeTypes } from './roadmap-edge';
import { resolveRoadmapTheme, roadmapThemeCssVars } from './theme';
import type { CanvasConfig, RoadmapTheme } from './types';

const MOBILE_BREAKPOINT = 768;

function subscribeToViewport(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

export function pickAuthoredViewport(canvas: CanvasConfig): Viewport {
  if (isMobileViewport() && canvas.mobileInitialViewport) {
    return canvas.mobileInitialViewport;
  }
  return canvas.initialViewport;
}

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
  const isMobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, () => false);
  const authoredViewport =
    isMobile && canvas.mobileInitialViewport ? canvas.mobileInitialViewport : canvas.initialViewport;

  const canvasStyle = {
    ...themeVars,
    backgroundColor: resolvedTheme.paper,
    color: resolvedTheme.ink,
    fontFamily: 'var(--font-balsamiq-sans)',
  } as React.CSSProperties;

  return (
    <div className="roadmap-canvas w-full h-full relative select-none overflow-hidden" style={canvasStyle}>
      <ReactFlow
        key={isMobile ? 'mobile' : 'desktop'}
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
        minZoom={authoredViewport.zoom}
        maxZoom={authoredViewport.zoom}
        defaultViewport={authoredViewport}
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
