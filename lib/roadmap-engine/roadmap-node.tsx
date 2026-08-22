'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type {
  ButtonNode,
  LabelNode,
  LegendNode,
  LineNode,
  LinkGroupNode,
  ParagraphNode,
  RoadmapNode,
  SectionNode,
  SubtopicNode,
  TitleNode,
  TopicNode,
  TopicProgressStatus,
} from './types';

export interface CustomNodeData {
  node: RoadmapNode;
  status?: TopicProgressStatus;
  isSearchMatch?: boolean;
  isSearchDimmed?: boolean;
  onSelectTopic?: (nodeId: string, element: HTMLElement) => void;
}

const HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  pointerEvents: 'none',
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  border: 'none',
  background: 'transparent',
};

export function RoadmapHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={{ ...HANDLE_STYLE, top: 0 }} />
      <Handle type="source" position={Position.Top} id="top" style={{ ...HANDLE_STYLE, top: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ ...HANDLE_STYLE, right: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...HANDLE_STYLE, right: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ ...HANDLE_STYLE, bottom: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...HANDLE_STYLE, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...HANDLE_STYLE, left: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ ...HANDLE_STYLE, left: 0 }} />
    </>
  );
}

function getLineStyle(style?: string): 'solid' | 'dashed' | 'dotted' {
  if (style === 'dashed' || style === 'dotted') return style;
  return 'solid';
}

function searchClassName(nodeData: CustomNodeData): string {
  const parts = ['roadmap-block'];
  if (nodeData.isSearchDimmed) parts.push('is-search-dimmed');
  if (nodeData.isSearchMatch) parts.push('is-search-match');
  return parts.join(' ');
}

function asNodeData(data: NodeProps['data']): CustomNodeData {
  return data as unknown as CustomNodeData;
}

export const TitleNodeComponent = memo(function TitleNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as TitleNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-title ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        textAlign: customStyle?.textAlign || 'center',
        fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : '28px',
        fontWeight: customStyle?.fontWeight || 700,
      }}
    >
      <RoadmapHandles />
      <h1 className="font-bold tracking-tight leading-tight m-0" style={{ overflowWrap: 'anywhere' }}>
        {node.data.text}
      </h1>
      {node.data.subtitle && (
        <p className="mt-1 text-sm m-0" style={{ overflowWrap: 'anywhere', fontWeight: 400 }}>
          {node.data.subtitle}
        </p>
      )}
    </div>
  );
});

function TopicCard({
  node,
  nodeData,
  kind,
}: {
  node: TopicNode | SubtopicNode;
  nodeData: CustomNodeData;
  kind: 'topic' | 'subtopic';
}) {
  const customStyle = node.data.style;
  const status = nodeData.status || 'pending';
  const radius = kind === 'topic' ? 6 : 4;

  const handleActivate = (element: HTMLElement) => {
    nodeData.onSelectTopic?.(node.id, element);
  };

  return (
    <div
      id={`node-${node.id}`}
      role="button"
      tabIndex={0}
      data-status={status}
      aria-label={`${node.data.order ? `Paso ${node.data.order}. ` : ''}${node.data.label}${node.data.detail ? `: ${node.data.detail}` : ''} - Estado: ${status}`}
      onClick={(e) => handleActivate(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate(e.currentTarget);
        }
      }}
      className={`roadmap-node-card roadmap-node-${kind} ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
        borderStyle: getLineStyle(customStyle?.lineStyle),
        borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : `${radius}px`,
        padding: customStyle?.padding ? `${customStyle.padding}px` : '6px 10px',
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : kind === 'topic' ? '15px' : '13.5px',
        ['--roadmap-topic-bg' as string]: customStyle?.backgroundColor,
        ['--roadmap-subtopic-bg' as string]: customStyle?.backgroundColor,
      }}
    >
      <RoadmapHandles />
      {node.data.order && (
        <span className="roadmap-node-step" aria-hidden="true">
          {node.data.order}
        </span>
      )}
      <div className="roadmap-card-body">
        {!node.data.order && node.data.code && (
          <span className="roadmap-node-code">{node.data.code}</span>
        )}
        <span
          className="roadmap-node-label-text"
          style={{ textAlign: customStyle?.textAlign || 'center' }}
        >
          {node.data.label}
        </span>
        {node.data.detail && <span className="roadmap-node-detail">{node.data.detail}</span>}
      </div>
    </div>
  );
}

export const TopicNodeComponent = memo(function TopicNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  return <TopicCard node={nodeData.node as TopicNode} nodeData={nodeData} kind="topic" />;
});

export const SubtopicNodeComponent = memo(function SubtopicNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  return <TopicCard node={nodeData.node as SubtopicNode} nodeData={nodeData} kind="subtopic" />;
});

export const SectionNodeComponent = memo(function SectionNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as SectionNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-section ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        backgroundColor: customStyle?.backgroundColor || 'transparent',
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2px',
        borderStyle: getLineStyle(customStyle?.lineStyle || 'dashed'),
        borderColor: customStyle?.borderColor || 'color-mix(in srgb, var(--roadmap-ink) 28%, transparent)',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '6px',
        padding: customStyle?.padding ? `${customStyle.padding}px` : '14px 18px',
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        textAlign: customStyle?.textAlign || 'left',
        fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : '12px',
        pointerEvents: 'none',
      }}
    >
      <div className="font-bold uppercase tracking-wider select-none" style={{ overflowWrap: 'anywhere' }}>
        {node.data.label}
      </div>
    </div>
  );
});

export const ParagraphNodeComponent = memo(function ParagraphNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as ParagraphNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-paragraph ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        backgroundColor: customStyle?.backgroundColor || 'transparent',
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : customStyle?.borderColor ? '1.5px' : '0px',
        borderStyle: getLineStyle(customStyle?.lineStyle),
        borderColor: customStyle?.borderColor || 'transparent',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '4px',
        padding: customStyle?.padding ? `${customStyle.padding}px` : '8px 10px',
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        textAlign: customStyle?.textAlign || 'left',
        fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : '14px',
        fontWeight: customStyle?.fontWeight || 400,
      }}
    >
      <RoadmapHandles />
      <p className="m-0 leading-snug w-full" style={{ overflowWrap: 'anywhere' }}>
        {node.data.text}
      </p>
    </div>
  );
});

export const LabelNodeComponent = memo(function LabelNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as LabelNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-label ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        color: customStyle?.textColor || 'var(--roadmap-ink)',
        textAlign: customStyle?.textAlign || 'center',
        fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : '14px',
        fontWeight: customStyle?.fontWeight || 700,
      }}
    >
      <RoadmapHandles />
      <span className="font-bold tracking-wide" style={{ overflowWrap: 'anywhere' }}>
        {node.data.text}
      </span>
    </div>
  );
});

export const ButtonNodeComponent = memo(function ButtonNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as ButtonNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-button-wrap ${searchClassName(nodeData)}`}
      style={{ width: node.size.width, height: node.size.height }}
    >
      <RoadmapHandles />
      <a
        href={node.data.href}
        target={node.data.target || '_blank'}
        rel="noopener noreferrer"
        className="roadmap-node-button"
        style={{
          backgroundColor: customStyle?.backgroundColor || 'var(--roadmap-subtopic-bg)',
          borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
          borderStyle: getLineStyle(customStyle?.lineStyle),
          borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
          borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '5px',
          padding: customStyle?.padding ? `${customStyle.padding}px` : '8px 12px',
          fontSize: customStyle?.fontSize ? `${customStyle.fontSize}px` : '13px',
          color: customStyle?.textColor || 'var(--roadmap-ink)',
        }}
      >
        <span style={{ overflowWrap: 'anywhere' }}>{node.data.label}</span>
        <span className="ml-1.5 text-xs opacity-75" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
});

export const LinkGroupNodeComponent = memo(function LinkGroupNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as LinkGroupNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-linkgroup ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        backgroundColor: customStyle?.backgroundColor || 'var(--roadmap-paper)',
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
        borderStyle: getLineStyle(customStyle?.lineStyle),
        borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '5px',
        padding: customStyle?.padding ? `${customStyle.padding}px` : '10px 12px',
      }}
    >
      {node.data.title && (
        <h4 className="font-bold text-xs uppercase tracking-wider m-0 mb-2" style={{ overflowWrap: 'anywhere' }}>
          {node.data.title}
        </h4>
      )}
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {node.data.links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold flex items-start gap-1"
              style={{ color: 'var(--roadmap-connector)', overflowWrap: 'anywhere' }}
            >
              <span aria-hidden="true">•</span>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const LegendNodeComponent = memo(function LegendNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as LegendNode;
  const customStyle = node.data.style;

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-legend ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        backgroundColor: customStyle?.backgroundColor || 'var(--roadmap-paper)',
        borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : '2.5px',
        borderStyle: getLineStyle(customStyle?.lineStyle),
        borderColor: customStyle?.borderColor || 'var(--roadmap-ink)',
        borderRadius: customStyle?.borderRadius ? `${customStyle.borderRadius}px` : '5px',
        padding: customStyle?.padding ? `${customStyle.padding}px` : '10px 12px',
      }}
    >
      {node.data.title && (
        <h4 className="font-bold text-xs uppercase tracking-wider m-0 mb-2" style={{ overflowWrap: 'anywhere' }}>
          {node.data.title}
        </h4>
      )}
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
            <span className="font-medium" style={{ overflowWrap: 'anywhere' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const LineNodeComponent = memo(function LineNodeComponent({ data }: NodeProps) {
  const nodeData = asNodeData(data);
  const node = nodeData.node as LineNode;
  const customStyle = node.data.style;
  const isHorizontal = node.data.orientation === 'horizontal';
  const borderStyle = getLineStyle(customStyle?.lineStyle);
  const thickness = customStyle?.borderWidth || 2;
  const color = customStyle?.borderColor || 'var(--roadmap-ink)';

  return (
    <div
      id={`node-${node.id}`}
      className={`roadmap-node-line ${searchClassName(nodeData)}`}
      style={{
        width: node.size.width,
        height: node.size.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: isHorizontal ? '100%' : `${thickness}px`,
          height: isHorizontal ? `${thickness}px` : '100%',
          borderTop: isHorizontal ? `${thickness}px ${borderStyle} ${color}` : undefined,
          borderLeft: !isHorizontal ? `${thickness}px ${borderStyle} ${color}` : undefined,
        }}
      />
    </div>
  );
});

export const nodeTypes = {
  title: TitleNodeComponent,
  topic: TopicNodeComponent,
  subtopic: SubtopicNodeComponent,
  section: SectionNodeComponent,
  paragraph: ParagraphNodeComponent,
  label: LabelNodeComponent,
  button: ButtonNodeComponent,
  linkGroup: LinkGroupNodeComponent,
  legend: LegendNodeComponent,
  line: LineNodeComponent,
};
