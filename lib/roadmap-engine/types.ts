export type HandleDirection = 'top' | 'right' | 'bottom' | 'left';

export type EdgeRoute = 'bezier' | 'smoothstep' | 'straight';

export type LineOrientation = 'horizontal' | 'vertical';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export type TextAlign = 'left' | 'center' | 'right';

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  textAlign?: TextAlign;
  lineStyle?: LineStyle;
}

export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  lineStyle?: LineStyle;
  animated?: boolean;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

interface BaseNode<TType extends string, TData> {
  id: string;
  type: TType;
  position: NodePosition;
  size: NodeSize;
  zIndex?: number;
  data: TData;
}

export type TitleNode = BaseNode<
  'title',
  {
    text: string;
    subtitle?: string;
    style?: NodeStyle;
  }
>;

export type TopicNode = BaseNode<
  'topic',
  {
    label: string;
    /** Position in the study sequence, e.g. "07" or "20a" for a parallel branch. */
    order?: string;
    code?: string;
    week?: string;
    detail?: string;
    style?: NodeStyle;
  }
>;

export type SubtopicNode = BaseNode<
  'subtopic',
  {
    label: string;
    /** Position in the study sequence, e.g. "07" or "20a" for a parallel branch. */
    order?: string;
    code?: string;
    week?: string;
    detail?: string;
    style?: NodeStyle;
  }
>;

export type SectionNode = BaseNode<
  'section',
  {
    label: string;
    style?: NodeStyle;
  }
>;

export type ParagraphNode = BaseNode<
  'paragraph',
  {
    text: string;
    style?: NodeStyle;
  }
>;

export type LabelNode = BaseNode<
  'label',
  {
    text: string;
    style?: NodeStyle;
  }
>;

export type ButtonNode = BaseNode<
  'button',
  {
    label: string;
    href: string;
    target?: string;
    style?: NodeStyle;
  }
>;

export interface LinkItem {
  label: string;
  url: string;
}

export type LinkGroupNode = BaseNode<
  'linkGroup',
  {
    title?: string;
    links: LinkItem[];
    style?: NodeStyle;
  }
>;

export interface LegendItem {
  label: string;
  color: string;
}

export type LegendNode = BaseNode<
  'legend',
  {
    title?: string;
    items: LegendItem[];
    style?: NodeStyle;
  }
>;

export type LineNode = BaseNode<
  'line',
  {
    orientation: LineOrientation;
    style?: NodeStyle;
  }
>;

export type RoadmapNode =
  | TitleNode
  | TopicNode
  | SubtopicNode
  | SectionNode
  | ParagraphNode
  | LabelNode
  | ButtonNode
  | LinkGroupNode
  | LegendNode
  | LineNode;

export type RoadmapNodeType = RoadmapNode['type'];

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandleDirection;
  targetHandle?: HandleDirection;
  route?: EdgeRoute;
  label?: string;
  arrow?: boolean;
  style?: EdgeStyle;
}

export interface ViewportConfig {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  minZoom?: number;
  maxZoom?: number;
  initialViewport: ViewportConfig;
  mobileInitialViewport?: ViewportConfig;
}

export interface RoadmapTheme {
  paper?: string;
  ink?: string;
  topicBg?: string;
  subtopicBg?: string;
  connectorColor?: string;
  progressBg?: string;
  searchMatchBorder?: string;
}

export type ResourceType = 'official' | 'article' | 'video' | 'guide' | 'repository';

export interface TopicResource {
  type: ResourceType;
  title: string;
  url: string;
}

export interface SourceReference {
  label: string;
  locator: string;
  url?: string;
}

export interface TopicDetails {
  title: string;
  week?: string;
  content: string;
  resources?: TopicResource[];
  sourceRefs: SourceReference[];
}

export type TopicProgressStatus = 'pending' | 'learning' | 'done' | 'skipped';

export type TopicProgressMap = Record<string, TopicProgressStatus>;

export interface RoadmapDocument {
  schemaVersion: 1;
  slug: string;
  title: string;
  description: string;
  canvas: CanvasConfig;
  theme?: RoadmapTheme;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  topics: Record<string, TopicDetails>;
}
