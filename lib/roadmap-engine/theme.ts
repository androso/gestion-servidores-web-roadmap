import type { RoadmapTheme } from './types';

export const DEFAULT_ROADMAP_THEME: Required<RoadmapTheme> = {
  paper: '#fbfbf8',
  ink: '#111827',
  topicBg: '#f9d95c',
  subtopicBg: '#fff2a8',
  connectorColor: '#2563eb',
  progressBg: '#dad1fd',
  searchMatchBorder: '#1d4ed8',
};

export function resolveRoadmapTheme(theme?: RoadmapTheme): Required<RoadmapTheme> {
  return {
    paper: theme?.paper ?? DEFAULT_ROADMAP_THEME.paper,
    ink: theme?.ink ?? DEFAULT_ROADMAP_THEME.ink,
    topicBg: theme?.topicBg ?? DEFAULT_ROADMAP_THEME.topicBg,
    subtopicBg: theme?.subtopicBg ?? DEFAULT_ROADMAP_THEME.subtopicBg,
    connectorColor: theme?.connectorColor ?? DEFAULT_ROADMAP_THEME.connectorColor,
    progressBg: theme?.progressBg ?? DEFAULT_ROADMAP_THEME.progressBg,
    searchMatchBorder: theme?.searchMatchBorder ?? DEFAULT_ROADMAP_THEME.searchMatchBorder,
  };
}

export function roadmapThemeCssVars(theme: Required<RoadmapTheme>): Record<string, string> {
  return {
    '--roadmap-paper': theme.paper,
    '--roadmap-ink': theme.ink,
    '--roadmap-topic-bg': theme.topicBg,
    '--roadmap-subtopic-bg': theme.subtopicBg,
    '--roadmap-connector': theme.connectorColor,
    '--roadmap-progress-bg': theme.progressBg,
    '--roadmap-search-match-border': theme.searchMatchBorder,
  };
}
