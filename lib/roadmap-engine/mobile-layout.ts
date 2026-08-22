import type { RoadmapNode, SectionNode } from './types';

export interface MobileStackItem {
  node: RoadmapNode;
  indent: boolean;
}

function parseOrder(order?: string): { n: number; suffix: string } {
  if (!order) return { n: Number.POSITIVE_INFINITY, suffix: '' };
  const match = order.match(/^(\d+)(.*)$/);
  if (!match) return { n: Number.POSITIVE_INFINITY, suffix: order };
  return { n: Number(match[1]), suffix: match[2] };
}

function studyOrder(node: RoadmapNode) {
  if (node.type !== 'topic' && node.type !== 'subtopic') return undefined;
  const parsed = parseOrder(node.data.order);
  return Number.isFinite(parsed.n) ? parsed : undefined;
}

function isNumbered(node: RoadmapNode) {
  return Boolean(studyOrder(node));
}

function isPathNote(node: RoadmapNode) {
  return node.type === 'paragraph' || node.type === 'label';
}

function isFooterMaterial(node: RoadmapNode) {
  return node.type === 'linkGroup' || node.type === 'button' || node.type === 'legend';
}

function centerOf(node: RoadmapNode) {
  return {
    x: node.position.x + node.size.width / 2,
    y: node.position.y + node.size.height / 2,
  };
}

function compareByPosition(a: RoadmapNode, b: RoadmapNode): number {
  if (a.position.y !== b.position.y) return a.position.y - b.position.y;
  return a.position.x - b.position.x;
}

function compareNumbered(a: RoadmapNode, b: RoadmapNode): number {
  const orderA = studyOrder(a);
  const orderB = studyOrder(b);
  if (orderA && orderB) {
    if (orderA.n !== orderB.n) return orderA.n - orderB.n;
    if (orderA.suffix !== orderB.suffix) return orderA.suffix.localeCompare(orderB.suffix);
  }
  return compareByPosition(a, b);
}

function nearestNumbered(note: RoadmapNode, numbered: RoadmapNode[]): RoadmapNode {
  const noteY = centerOf(note).y;
  let best = numbered[0];
  let bestDistance = Math.abs(centerOf(best).y - noteY);
  for (const candidate of numbered) {
    const distance = Math.abs(centerOf(candidate).y - noteY);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Numbered cards stay in study order. Comments sit beside the closest step
 * (before it if they were authored above, after if they were beside/below).
 * Link groups and buttons stay at the end of the group.
 */
function orderGroup(nodes: RoadmapNode[]): RoadmapNode[] {
  const numbered = nodes.filter(isNumbered).sort(compareNumbered);
  if (numbered.length === 0) {
    return nodes.slice().sort(compareByPosition);
  }

  const notes = nodes.filter(isPathNote);
  const footer = nodes.filter(isFooterMaterial).sort(compareByPosition);
  const other = nodes
    .filter((node) => !isNumbered(node) && !isPathNote(node) && !isFooterMaterial(node))
    .sort(compareByPosition);

  const before: RoadmapNode[][] = numbered.map(() => []);
  const after: RoadmapNode[][] = numbered.map(() => []);

  for (const note of notes) {
    const nearest = nearestNumbered(note, numbered);
    const index = numbered.indexOf(nearest);
    if (centerOf(note).y < nearest.position.y) {
      before[index].push(note);
    } else {
      after[index].push(note);
    }
  }

  for (const bucket of before) bucket.sort(compareByPosition);
  for (const bucket of after) bucket.sort(compareByPosition);

  const ordered: RoadmapNode[] = [];
  for (let index = 0; index < numbered.length; index += 1) {
    ordered.push(...before[index], numbered[index], ...after[index]);
  }

  return [...ordered, ...other, ...footer];
}

function contains(section: SectionNode, node: RoadmapNode) {
  const point = centerOf(node);
  return (
    point.x >= section.position.x &&
    point.x <= section.position.x + section.size.width &&
    point.y >= section.position.y &&
    point.y <= section.position.y + section.size.height
  );
}

function isIndented(node: RoadmapNode) {
  return node.type === 'subtopic' || node.type === 'paragraph' || node.type === 'label';
}

/**
 * Rebuilds an authored (wide) roadmap as a single numbered stack for phones.
 * Section boxes become compact headers; decorative lines and intro notes are omitted.
 */
export function layoutRoadmapForMobile(nodes: RoadmapNode[]): MobileStackItem[] {
  const sections = nodes
    .filter((node): node is SectionNode => node.type === 'section')
    .slice()
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

  const rest = nodes.filter((node) => node.type !== 'section' && node.type !== 'line');

  const assigned = new Set<string>();
  const firstSectionY = sections[0]?.position.y ?? Number.POSITIVE_INFINITY;

  const introNotes = rest.filter(
    (node) =>
      node.type === 'paragraph' && node.position.y + node.size.height / 2 < firstSectionY
  );
  const skippedIntroIds = new Set(introNotes.map((node) => node.id));

  const preface = orderGroup(
    rest.filter((node) => {
      if (skippedIntroIds.has(node.id)) return false;
      return node.position.y + node.size.height / 2 < firstSectionY;
    })
  );

  for (const node of preface) assigned.add(node.id);

  const sectionGroups = sections.map((section) => {
    const children = orderGroup(
      rest.filter((node) => !assigned.has(node.id) && contains(section, node))
    );
    for (const child of children) assigned.add(child.id);
    return { section, children };
  });

  const leftover = orderGroup(
    rest.filter((node) => !assigned.has(node.id) && !skippedIntroIds.has(node.id))
  );

  const items: MobileStackItem[] = [];

  for (const node of preface) {
    items.push({ node, indent: isIndented(node) });
  }

  for (const group of sectionGroups) {
    items.push({ node: group.section, indent: false });
    for (const child of group.children) {
      items.push({ node: child, indent: isIndented(child) });
    }
  }

  for (const node of leftover) {
    items.push({ node, indent: isIndented(node) });
  }

  return items;
}
