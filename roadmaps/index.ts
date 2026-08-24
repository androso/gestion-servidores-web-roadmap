import type { RoadmapDocument, TopicDetails } from '../lib/roadmap-engine/types';
import gestionServidoresWebData from './gestion-servidores-web/roadmap.json';
import gestionServidoresWebTopics from './gestion-servidores-web/topics.json';
import cienciaDeDatosData from './ciencia-de-datos/roadmap.json';
import cienciaDeDatosTopics from './ciencia-de-datos/topics.json';
import estructuraDeDatosData from './estructura-de-datos/roadmap.json';
import estructuraDeDatosTopics from './estructura-de-datos/topics.json';
import programacionOrientadaAEventosData from './programacion-orientada-a-eventos/roadmap.json';
import programacionOrientadaAEventosTopics from './programacion-orientada-a-eventos/topics.json';
import disenoArquitecturaDeSistemasData from './diseno-arquitectura-de-sistemas/roadmap.json';
import disenoArquitecturaDeSistemasTopics from './diseno-arquitectura-de-sistemas/topics.json';

export const gestionServidoresWebRoadmap: RoadmapDocument = {
  ...(gestionServidoresWebData as unknown as Omit<RoadmapDocument, 'topics'>),
  topics: gestionServidoresWebTopics as Record<string, TopicDetails>,
};

export const cienciaDeDatosRoadmap: RoadmapDocument = {
  ...(cienciaDeDatosData as unknown as Omit<RoadmapDocument, 'topics'>),
  topics: cienciaDeDatosTopics as Record<string, TopicDetails>,
};

export const estructuraDeDatosRoadmap: RoadmapDocument = {
  ...(estructuraDeDatosData as unknown as Omit<RoadmapDocument, 'topics'>),
  topics: estructuraDeDatosTopics as Record<string, TopicDetails>,
};

export const programacionOrientadaAEventosRoadmap: RoadmapDocument = {
  ...(programacionOrientadaAEventosData as unknown as Omit<RoadmapDocument, 'topics'>),
  topics: programacionOrientadaAEventosTopics as Record<string, TopicDetails>,
};

export const disenoArquitecturaDeSistemasRoadmap: RoadmapDocument = {
  ...(disenoArquitecturaDeSistemasData as unknown as Omit<RoadmapDocument, 'topics'>),
  topics: disenoArquitecturaDeSistemasTopics as Record<string, TopicDetails>,
};

export const roadmaps: RoadmapDocument[] = [
  gestionServidoresWebRoadmap,
  cienciaDeDatosRoadmap,
  estructuraDeDatosRoadmap,
  programacionOrientadaAEventosRoadmap,
  disenoArquitecturaDeSistemasRoadmap,
];

export const roadmapsBySlug: Record<string, RoadmapDocument> = {
  'gestion-servidores-web': gestionServidoresWebRoadmap,
  'servidores-web': gestionServidoresWebRoadmap,
  'ciencia-de-datos': cienciaDeDatosRoadmap,
  'estructura-de-datos': estructuraDeDatosRoadmap,
  'programacion-orientada-a-eventos': programacionOrientadaAEventosRoadmap,
  'diseno-arquitectura-de-sistemas': disenoArquitecturaDeSistemasRoadmap,
};

export function getRoadmapBySlug(slug?: string | null): RoadmapDocument {
  if (!slug) {
    return roadmaps[0];
  }
  return roadmapsBySlug[slug] || roadmaps[0];
}

export function getAllRoadmaps(): RoadmapDocument[] {
  return roadmaps;
}
