'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MarkerType, type Node, type Edge } from '@xyflow/react';
import { RoadmapCanvas } from './roadmap-canvas';
import { TopicDrawer } from './topic-drawer';
import { MobilePath } from './mobile-path';
import { useRoadmapProgress } from './use-roadmap-progress';
import { useIsMobileViewport } from './use-mobile-viewport';
import { layoutRoadmapForMobile } from './mobile-layout';
import { resolveRoadmapTheme, roadmapThemeCssVars } from './theme';
import type { RoadmapDocument } from './types';

export interface InteractiveRoadmapProps {
  roadmap: RoadmapDocument;
  searchQuery?: string;
  className?: string;
}

export function InteractiveRoadmap({
  roadmap,
  searchQuery = '',
  className = '',
}: InteractiveRoadmapProps) {
  const { progress, setTopicStatus } = useRoadmapProgress(roadmap.slug);
  const isMobile = useIsMobileViewport();
  const [hydrated, setHydrated] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const showMobile = !hydrated || isMobile;
  const showDesktop = !hydrated || !isMobile;

  const mobileItems = useMemo(
    () => layoutRoadmapForMobile(roadmap.nodes),
    [roadmap.nodes]
  );

  const handleSelectTopic = useCallback((nodeId: string, element: HTMLElement) => {
    setSelectedNodeId(nodeId);
    setTriggerElement(element);
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'topic' || node.type === 'subtopic') {
        const el = document.getElementById(`node-${node.id}`);
        handleSelectTopic(node.id, el || (document.activeElement as HTMLElement));
      }
    },
    [handleSelectTopic]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const searchMatchingNodeIds = useMemo(() => {
    if (!isSearching) return new Set<string>();

    const matches = new Set<string>();
    for (const node of roadmap.nodes) {
      const idMatch = node.id.toLowerCase().includes(normalizedQuery);
      let textMatch = false;

      if (node.type === 'topic' || node.type === 'subtopic') {
        textMatch =
          node.data.label.toLowerCase().includes(normalizedQuery) ||
          Boolean(node.data.order?.toLowerCase().includes(normalizedQuery)) ||
          Boolean(node.data.code?.toLowerCase().includes(normalizedQuery)) ||
          Boolean(node.data.detail?.toLowerCase().includes(normalizedQuery));
      } else if (node.type === 'title') {
        textMatch =
          node.data.text.toLowerCase().includes(normalizedQuery) ||
          Boolean(node.data.subtitle?.toLowerCase().includes(normalizedQuery));
      } else if (node.type === 'section' || node.type === 'button') {
        textMatch = node.data.label.toLowerCase().includes(normalizedQuery);
      } else if (node.type === 'paragraph' || node.type === 'label') {
        textMatch = node.data.text.toLowerCase().includes(normalizedQuery);
      } else if (node.type === 'linkGroup') {
        textMatch =
          Boolean(node.data.title?.toLowerCase().includes(normalizedQuery)) ||
          node.data.links.some(
            (link) =>
              link.label.toLowerCase().includes(normalizedQuery) ||
              link.url.toLowerCase().includes(normalizedQuery)
          );
      } else if (node.type === 'legend') {
        textMatch =
          Boolean(node.data.title?.toLowerCase().includes(normalizedQuery)) ||
          node.data.items.some((item) => item.label.toLowerCase().includes(normalizedQuery));
      }

      const topicDetails = roadmap.topics[node.id];
      const detailsMatch =
        topicDetails &&
        (topicDetails.title.toLowerCase().includes(normalizedQuery) ||
          topicDetails.content.toLowerCase().includes(normalizedQuery));

      if (idMatch || textMatch || detailsMatch) {
        matches.add(node.id);
      }
    }
    return matches;
  }, [isSearching, normalizedQuery, roadmap.nodes, roadmap.topics]);

  const flowNodes: Node[] = useMemo(() => {
    if (!showDesktop) return [];

    return roadmap.nodes.map((node) => {
      const isMatch = isSearching && searchMatchingNodeIds.has(node.id);
      const isDimmed = isSearching && !searchMatchingNodeIds.has(node.id);
      const status = progress[node.id] || 'pending';

      const defaultZIndex = node.type === 'section' ? -1 : 1;
      const nonInteractive = node.type === 'section' || node.type === 'line';

      return {
        id: node.id,
        type: node.type,
        position: { x: node.position.x, y: node.position.y },
        selectable: !nonInteractive,
        focusable: node.type === 'topic' || node.type === 'subtopic',
        style: {
          width: node.size.width,
          height: node.size.height,
          zIndex: node.zIndex ?? defaultZIndex,
          pointerEvents: nonInteractive ? 'none' : undefined,
        },
        data: {
          node,
          status,
          isSearchMatch: isMatch,
          isSearchDimmed: isDimmed,
          onSelectTopic: handleSelectTopic,
        },
      };
    });
  }, [showDesktop, roadmap.nodes, isSearching, searchMatchingNodeIds, progress, handleSelectTopic]);

  const theme = useMemo(() => resolveRoadmapTheme(roadmap.theme), [roadmap.theme]);
  const themeVars = useMemo(() => roadmapThemeCssVars(theme), [theme]);

  const nodeTypeById = useMemo(
    () => new Map(roadmap.nodes.map((node) => [node.id, node.type])),
    [roadmap.nodes]
  );

  const flowEdges: Edge[] = useMemo(() => {
    if (!showDesktop) return [];

    return roadmap.edges.map((edge) => {
      const isDimmed =
        isSearching &&
        (!searchMatchingNodeIds.has(edge.source) || !searchMatchingNodeIds.has(edge.target));
      const stroke = edge.style?.strokeColor || theme.connectorColor;
      const isSupport =
        nodeTypeById.get(edge.source) === 'subtopic' ||
        nodeTypeById.get(edge.target) === 'subtopic';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'roadmapEdge',
        animated: Boolean(edge.style?.animated),
        markerEnd: edge.arrow
          ? {
              type: MarkerType.ArrowClosed,
              color: stroke,
              width: 16,
              height: 16,
            }
          : undefined,
        data: {
          edge,
          isSearchDimmed: isDimmed,
          isSupport,
        },
      };
    });
  }, [showDesktop, roadmap.edges, isSearching, searchMatchingNodeIds, theme.connectorColor, nodeTypeById]);

  const selectedTopic = selectedNodeId ? roadmap.topics[selectedNodeId] || null : null;
  const currentStatus = selectedNodeId ? progress[selectedNodeId] || 'pending' : 'pending';
  const selectedStep = useMemo(() => {
    if (!selectedNodeId) return undefined;
    const node = roadmap.nodes.find((candidate) => candidate.id === selectedNodeId);
    return node && (node.type === 'topic' || node.type === 'subtopic')
      ? node.data.order
      : undefined;
  }, [roadmap.nodes, selectedNodeId]);

  return (
    <div
      className={`roadmap-viewer relative w-full h-full ${className}`}
      style={
        {
          ...themeVars,
          backgroundColor: theme.paper,
          color: theme.ink,
        } as React.CSSProperties
      }
    >
      {showMobile ? (
        <div className="roadmap-mobile-host">
          <MobilePath
            items={mobileItems}
            progress={progress}
            matchingNodeIds={searchMatchingNodeIds}
            isSearching={isSearching}
            onSelectTopic={handleSelectTopic}
          />
        </div>
      ) : null}

      {showDesktop ? (
        <div className="roadmap-desktop-host">
          <RoadmapCanvas
            key={roadmap.slug}
            nodes={flowNodes}
            edges={flowEdges}
            canvas={roadmap.canvas}
            theme={roadmap.theme}
            onNodeClick={handleNodeClick}
          />
        </div>
      ) : null}

      <TopicDrawer
        topic={selectedTopic}
        nodeId={selectedNodeId}
        step={selectedStep}
        status={currentStatus}
        onClose={handleCloseDrawer}
        onStatusChange={(status) => {
          if (selectedNodeId) {
            setTopicStatus(selectedNodeId, status);
          }
        }}
        triggerElement={triggerElement}
      />
    </div>
  );
}
