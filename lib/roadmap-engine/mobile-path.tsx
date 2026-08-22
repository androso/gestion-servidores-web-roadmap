'use client';

import React, { useEffect } from 'react';
import type {
  ButtonNode,
  LabelNode,
  LegendNode,
  LinkGroupNode,
  ParagraphNode,
  RoadmapNode,
  SectionNode,
  SubtopicNode,
  TitleNode,
  TopicNode,
  TopicProgressStatus,
} from './types';
import type { MobileStackItem } from './mobile-layout';

export interface MobilePathProps {
  items: MobileStackItem[];
  progress: Record<string, TopicProgressStatus>;
  matchingNodeIds: Set<string>;
  isSearching: boolean;
  onSelectTopic: (nodeId: string, element: HTMLElement) => void;
}

function searchClassName(isMatch: boolean, isDimmed: boolean) {
  const parts = ['roadmap-block'];
  if (isDimmed) parts.push('is-search-dimmed');
  if (isMatch) parts.push('is-search-match');
  return parts.join(' ');
}

function getLineStyle(style?: string): 'solid' | 'dashed' | 'dotted' {
  if (style === 'dashed' || style === 'dotted') return style;
  return 'solid';
}

function railKind(node: RoadmapNode, indent: boolean): 'step' | 'support' | 'meta' {
  if (node.type === 'topic') return 'step';
  if (node.type === 'subtopic' || indent) return 'support';
  return 'meta';
}

function PathTitle({ node }: { node: TitleNode }) {
  return (
    <div id={`path-${node.id}`} className="roadmap-node-title mobile-path-title">
      <h1>{node.data.text}</h1>
      {node.data.subtitle ? <p>{node.data.subtitle}</p> : null}
    </div>
  );
}

function PathTopic({
  node,
  kind,
  status,
  searchClass,
  onSelectTopic,
}: {
  node: TopicNode | SubtopicNode;
  kind: 'topic' | 'subtopic';
  status: TopicProgressStatus;
  searchClass: string;
  onSelectTopic: (nodeId: string, element: HTMLElement) => void;
}) {
  const customStyle = node.data.style;
  const radius = kind === 'topic' ? 6 : 4;

  const activate = (element: HTMLElement) => onSelectTopic(node.id, element);

  return (
    <div
      id={`path-${node.id}`}
      role="button"
      tabIndex={0}
      data-status={status}
      aria-label={`${node.data.order ? `Paso ${node.data.order}. ` : ''}${node.data.label}${node.data.detail ? `: ${node.data.detail}` : ''} - Estado: ${status}`}
      onClick={(event) => activate(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate(event.currentTarget);
        }
      }}
      className={`roadmap-node-card roadmap-node-${kind} mobile-path-card ${searchClass}`}
      style={{
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
        borderStyle: getLineStyle(customStyle?.lineStyle),
        borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : `${radius}px`,
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        ['--roadmap-topic-bg' as string]: customStyle?.backgroundColor,
        ['--roadmap-subtopic-bg' as string]: customStyle?.backgroundColor,
      }}
    >
      {node.data.order ? (
        <span className="roadmap-node-step" aria-hidden="true">
          {node.data.order}
        </span>
      ) : null}
      <div className="roadmap-card-body">
        {!node.data.order && node.data.code ? (
          <span className="roadmap-node-code">{node.data.code}</span>
        ) : null}
        <span className="roadmap-node-label-text">{node.data.label}</span>
        {node.data.detail ? <span className="roadmap-node-detail">{node.data.detail}</span> : null}
      </div>
    </div>
  );
}

function PathSection({ node, searchClass }: { node: SectionNode; searchClass: string }) {
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-section mobile-path-section ${searchClass}`}>
      {node.data.label}
    </div>
  );
}

function PathParagraph({ node, searchClass }: { node: ParagraphNode; searchClass: string }) {
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-paragraph ${searchClass}`}>
      <p className="m-0 leading-snug w-full">{node.data.text}</p>
    </div>
  );
}

function PathLabel({ node, searchClass }: { node: LabelNode; searchClass: string }) {
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-label ${searchClass}`}>
      <span className="font-bold tracking-wide">{node.data.text}</span>
    </div>
  );
}

function PathButton({ node, searchClass }: { node: ButtonNode; searchClass: string }) {
  const customStyle = node.data.style;
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-button-wrap ${searchClass}`}>
      <a
        href={node.data.href}
        target={node.data.target || '_blank'}
        rel="noopener noreferrer"
        className="roadmap-node-button mobile-path-button"
        style={{
          backgroundColor: customStyle?.backgroundColor || 'var(--roadmap-subtopic-bg)',
          borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
          borderStyle: getLineStyle(customStyle?.lineStyle),
          borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
          borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '5px',
          color: customStyle?.textColor || 'var(--roadmap-ink)',
        }}
      >
        <span>{node.data.label}</span>
        <span className="ml-1.5 text-xs opacity-75" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}

function PathLinkGroup({ node, searchClass }: { node: LinkGroupNode; searchClass: string }) {
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-linkgroup mobile-path-box ${searchClass}`}>
      {node.data.title ? (
        <h4 className="font-bold text-xs uppercase tracking-wider m-0 mb-2">{node.data.title}</h4>
      ) : null}
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {node.data.links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold flex items-start gap-1"
              style={{ color: 'var(--roadmap-connector)' }}
            >
              <span aria-hidden="true">•</span>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PathLegend({ node, searchClass }: { node: LegendNode; searchClass: string }) {
  return (
    <div id={`path-${node.id}`} className={`roadmap-node-legend mobile-path-box ${searchClass}`}>
      {node.data.title ? (
        <h4 className="font-bold text-xs uppercase tracking-wider m-0 mb-2">{node.data.title}</h4>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {node.data.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-3.5 h-3.5 shrink-0"
              style={{
                backgroundColor: item.color,
                border: '1.5px solid var(--roadmap-ink)',
                borderRadius: '3px',
              }}
            />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PathNode({
  node,
  status,
  searchClass,
  onSelectTopic,
}: {
  node: RoadmapNode;
  status: TopicProgressStatus;
  searchClass: string;
  onSelectTopic: (nodeId: string, element: HTMLElement) => void;
}) {
  switch (node.type) {
    case 'title':
      return <PathTitle node={node} />;
    case 'topic':
      return (
        <PathTopic
          node={node}
          kind="topic"
          status={status}
          searchClass={searchClass}
          onSelectTopic={onSelectTopic}
        />
      );
    case 'subtopic':
      return (
        <PathTopic
          node={node}
          kind="subtopic"
          status={status}
          searchClass={searchClass}
          onSelectTopic={onSelectTopic}
        />
      );
    case 'section':
      return <PathSection node={node} searchClass={searchClass} />;
    case 'paragraph':
      return <PathParagraph node={node} searchClass={searchClass} />;
    case 'label':
      return <PathLabel node={node} searchClass={searchClass} />;
    case 'button':
      return <PathButton node={node} searchClass={searchClass} />;
    case 'linkGroup':
      return <PathLinkGroup node={node} searchClass={searchClass} />;
    case 'legend':
      return <PathLegend node={node} searchClass={searchClass} />;
    default:
      return null;
  }
}

export function MobilePath({
  items,
  progress,
  matchingNodeIds,
  isSearching,
  onSelectTopic,
}: MobilePathProps) {
  useEffect(() => {
    if (!isSearching) return;
    const firstMatch = items.find((item) => matchingNodeIds.has(item.node.id));
    if (!firstMatch) return;
    const el = document.getElementById(`path-${firstMatch.node.id}`);
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ block: 'center', behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [isSearching, matchingNodeIds, items]);

  return (
    <ol className="mobile-path">
      {items.map((item) => {
        const isMatch = isSearching && matchingNodeIds.has(item.node.id);
        const isDimmed = isSearching && !matchingNodeIds.has(item.node.id);
        const status = progress[item.node.id] || 'pending';
        const kind = railKind(item.node, item.indent);

        return (
          <li
            key={item.node.id}
            className={`mobile-path-item is-${kind}${item.indent ? ' is-indent' : ''}`}
          >
            <PathNode
              node={item.node}
              status={status}
              searchClass={searchClassName(isMatch, isDimmed)}
              onSelectTopic={onSelectTopic}
            />
          </li>
        );
      })}
    </ol>
  );
}
