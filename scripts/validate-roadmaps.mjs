import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID_NODE_TYPES = new Set([
  'title',
  'topic',
  'subtopic',
  'section',
  'paragraph',
  'label',
  'button',
  'linkGroup',
  'legend',
  'line',
]);

export const CONNECTABLE_TYPES = new Set(['title', 'topic', 'subtopic', 'paragraph', 'label', 'button']);

const VALID_HANDLES = new Set(['top', 'right', 'bottom', 'left']);
const VALID_ROUTES = new Set(['bezier', 'smoothstep', 'straight']);
const VALID_RESOURCE_TYPES = new Set(['official', 'article', 'video', 'guide', 'repository']);
const NON_OVERLAP_TYPES = new Set(['section', 'line']);

// Smallest content area Fit View must still be able to show the whole document in.
const FIT_REFERENCE_WIDTH = 1280;
const FIT_REFERENCE_HEIGHT = 800;

export function isAllowedUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// A study step is a two-digit number, optionally suffixed to mark a parallel branch (20a / 20b).
const STEP_PATTERN = /^\d{2,}[a-z]?$/;

function stepOf(node) {
  const order = node?.data?.order;
  if (typeof order !== 'string' || !STEP_PATTERN.test(order)) return null;
  return Number.parseInt(order, 10);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function validateViewport(viewport, label, minZoom, maxZoom, addError) {
  if (!viewport || typeof viewport !== 'object') {
    addError(label, `${label} must be an object with x, y, and zoom`);
    return;
  }
  if (typeof viewport.x !== 'number' || !Number.isFinite(viewport.x)) {
    addError(`${label}.x`, 'Viewport x must be a finite number');
  }
  if (typeof viewport.y !== 'number' || !Number.isFinite(viewport.y)) {
    addError(`${label}.y`, 'Viewport y must be a finite number');
  }
  if (typeof viewport.zoom !== 'number' || !Number.isFinite(viewport.zoom)) {
    addError(`${label}.zoom`, 'Viewport zoom must be a finite number');
  } else if (viewport.zoom < minZoom || viewport.zoom > maxZoom) {
    addError(
      `${label}.zoom`,
      `Zoom ${viewport.zoom} is outside canvas range [${minZoom}, ${maxZoom}]`
    );
  }
}

export function validateRoadmapDocument(doc, options = {}) {
  const errors = [];
  const slug = doc?.slug || options.fallbackSlug || 'unknown-slug';

  function addError(targetId, message) {
    errors.push(`${slug}:${targetId}: ${message}`);
  }

  if (!doc || typeof doc !== 'object') {
    errors.push(`${slug}:root: Document must be an object`);
    return { valid: false, errors };
  }

  if (doc.schemaVersion !== 1) {
    addError('schemaVersion', `Expected schemaVersion to be 1, received ${doc.schemaVersion}`);
  }

  if (typeof doc.slug !== 'string' || doc.slug.trim().length === 0) {
    addError('slug', 'Slug must be a non-empty string');
  }

  if (typeof doc.title !== 'string' || doc.title.trim().length === 0) {
    addError('title', 'Title must be a non-empty string');
  }
  if (typeof doc.description !== 'string' || doc.description.trim().length === 0) {
    addError('description', 'Description must be a non-empty string');
  }

  if (!doc.canvas || typeof doc.canvas !== 'object') {
    addError('canvas', 'Canvas configuration is required');
  } else {
    const { width, height } = doc.canvas;
    if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
      addError('canvas.width', 'Canvas width must be a finite positive number');
    }
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
      addError('canvas.height', 'Canvas height must be a finite positive number');
    }
  }

  const canvasWidth = doc.canvas?.width || 0;
  const canvasHeight = doc.canvas?.height || 0;
  const minZoom = typeof doc.canvas?.minZoom === 'number' && Number.isFinite(doc.canvas.minZoom) ? doc.canvas.minZoom : 0.2;
  const maxZoom = typeof doc.canvas?.maxZoom === 'number' && Number.isFinite(doc.canvas.maxZoom) ? doc.canvas.maxZoom : 2.5;

  if (doc.canvas && typeof doc.canvas === 'object') {
    if (!doc.canvas.initialViewport) {
      addError('canvas.initialViewport', 'canvas.initialViewport is required');
    } else {
      validateViewport(doc.canvas.initialViewport, 'canvas.initialViewport', minZoom, maxZoom, addError);
    }
    if (doc.canvas.mobileInitialViewport) {
      validateViewport(
        doc.canvas.mobileInitialViewport,
        'canvas.mobileInitialViewport',
        minZoom,
        maxZoom,
        addError
      );
    }

    if (canvasWidth > 0 && canvasHeight > 0) {
      const fitZoom = Math.min(
        FIT_REFERENCE_WIDTH / canvasWidth,
        FIT_REFERENCE_HEIGHT / canvasHeight
      );
      if (minZoom > fitZoom) {
        addError(
          'canvas.minZoom',
          `minZoom ${minZoom} prevents Fit View from showing the whole ${canvasWidth}x${canvasHeight} document; use ${fitZoom.toFixed(2)} or lower`
        );
      }
    }
  }

  if (!Array.isArray(doc.nodes) || doc.nodes.length === 0) {
    addError('nodes', 'Nodes must be a non-empty array');
  }

  const nodeIds = new Set();
  const nodeById = new Map();
  const trackableNodeIds = new Set();
  const overlapCandidates = [];

  if (Array.isArray(doc.nodes)) {
    for (const node of doc.nodes) {
      if (!node || typeof node !== 'object') {
        addError('nodes', 'Encountered invalid node entry');
        continue;
      }

      const nodeId = node.id;
      if (typeof nodeId !== 'string' || nodeId.trim().length === 0) {
        addError('nodes', 'Node is missing a valid id string');
        continue;
      }

      if (nodeIds.has(nodeId)) {
        addError(nodeId, `Duplicate node id '${nodeId}'`);
      }
      nodeIds.add(nodeId);
      nodeById.set(nodeId, node);

      if (!VALID_NODE_TYPES.has(node.type)) {
        addError(nodeId, `Unsupported node type '${node.type}'`);
      }

      if (node.type === 'topic' || node.type === 'subtopic') {
        trackableNodeIds.add(nodeId);
      }

      if (
        !node.position ||
        typeof node.position.x !== 'number' ||
        !Number.isFinite(node.position.x) ||
        typeof node.position.y !== 'number' ||
        !Number.isFinite(node.position.y)
      ) {
        addError(nodeId, 'Node position must have finite x and y coordinates');
      }

      if (
        !node.size ||
        typeof node.size.width !== 'number' ||
        !Number.isFinite(node.size.width) ||
        node.size.width <= 0 ||
        typeof node.size.height !== 'number' ||
        !Number.isFinite(node.size.height) ||
        node.size.height <= 0
      ) {
        addError(nodeId, 'Node size must have finite positive width and height');
      }

      if (
        canvasWidth > 0 &&
        canvasHeight > 0 &&
        node.position &&
        node.size &&
        Number.isFinite(node.position.x) &&
        Number.isFinite(node.position.y) &&
        Number.isFinite(node.size.width) &&
        Number.isFinite(node.size.height)
      ) {
        if (node.position.x < 0 || node.position.y < 0) {
          addError(nodeId, `Node position (${node.position.x}, ${node.position.y}) is negative`);
        }
        if (node.position.x + node.size.width > canvasWidth) {
          addError(
            nodeId,
            `Node right edge (${node.position.x + node.size.width}) exceeds canvas width (${canvasWidth})`
          );
        }
        if (node.position.y + node.size.height > canvasHeight) {
          addError(
            nodeId,
            `Node bottom edge (${node.position.y + node.size.height}) exceeds canvas height (${canvasHeight})`
          );
        }
      }

      if (!NON_OVERLAP_TYPES.has(node.type) && node.position && node.size) {
        overlapCandidates.push({
          id: nodeId,
          x: node.position.x,
          y: node.position.y,
          width: node.size.width,
          height: node.size.height,
        });
      }

      if (!node.data || typeof node.data !== 'object') {
        addError(nodeId, 'Node data object is missing');
      } else {
        if (node.type === 'title') {
          if (typeof node.data.text !== 'string' || node.data.text.trim().length === 0) {
            addError(nodeId, 'Title node requires non-empty data.text');
          }
        } else if (node.type === 'topic' || node.type === 'subtopic' || node.type === 'section') {
          if (typeof node.data.label !== 'string' || node.data.label.trim().length === 0) {
            addError(nodeId, `${node.type} node requires non-empty data.label`);
          }
        } else if (node.type === 'paragraph' || node.type === 'label') {
          if (typeof node.data.text !== 'string' || node.data.text.trim().length === 0) {
            addError(nodeId, `${node.type} node requires non-empty data.text`);
          }
        } else if (node.type === 'button') {
          if (typeof node.data.label !== 'string' || node.data.label.trim().length === 0) {
            addError(nodeId, 'Button node requires non-empty data.label');
          }
          if (typeof node.data.href !== 'string' || node.data.href.trim().length === 0) {
            addError(nodeId, 'Button node requires non-empty data.href');
          } else if (!isAllowedUrl(node.data.href)) {
            addError(nodeId, `Invalid URL '${node.data.href}'`);
          }
        } else if (node.type === 'linkGroup') {
          if (!Array.isArray(node.data.links) || node.data.links.length === 0) {
            addError(nodeId, 'LinkGroup node requires non-empty data.links array');
          } else {
            for (const [index, link] of node.data.links.entries()) {
              if (!link || typeof link.label !== 'string' || link.label.trim().length === 0) {
                addError(nodeId, `Link-group item ${index} requires a non-empty label`);
              }
              if (!link || typeof link.url !== 'string' || link.url.trim().length === 0) {
                addError(nodeId, `Link-group item ${index} requires a non-empty url`);
              } else if (!isAllowedUrl(link.url)) {
                addError(nodeId, `Invalid URL '${link.url}'`);
              }
            }
          }
        } else if (node.type === 'legend') {
          if (!Array.isArray(node.data.items) || node.data.items.length === 0) {
            addError(nodeId, 'Legend node requires non-empty data.items array');
          }
        } else if (node.type === 'line') {
          if (node.data.orientation !== 'horizontal' && node.data.orientation !== 'vertical') {
            addError(nodeId, "Line node requires data.orientation to be 'horizontal' or 'vertical'");
          }
        }
      }
    }
  }

  for (let i = 0; i < overlapCandidates.length; i++) {
    for (let j = i + 1; j < overlapCandidates.length; j++) {
      const a = overlapCandidates[i];
      const b = overlapCandidates[j];
      if (rectsOverlap(a, b)) {
        addError(a.id, `Node overlaps '${b.id}'`);
      }
    }
  }

  const connectedTrackableIds = new Set();

  if (Array.isArray(doc.edges)) {
    const edgeIds = new Set();
    for (const edge of doc.edges) {
      if (!edge || typeof edge !== 'object') {
        addError('edges', 'Encountered invalid edge entry');
        continue;
      }

      const edgeId = edge.id;
      if (typeof edgeId !== 'string' || edgeId.trim().length === 0) {
        addError('edges', 'Edge is missing a valid id string');
        continue;
      }

      if (edgeIds.has(edgeId)) {
        addError(edgeId, `Duplicate edge id '${edgeId}'`);
      }
      edgeIds.add(edgeId);

      if (!nodeIds.has(edge.source)) {
        addError(edgeId, `Edge source '${edge.source}' does not exist in nodes`);
      }
      if (!nodeIds.has(edge.target)) {
        addError(edgeId, `Edge target '${edge.target}' does not exist in nodes`);
      }

      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      if (sourceNode && !CONNECTABLE_TYPES.has(sourceNode.type)) {
        addError(edgeId, `Edge source '${edge.source}' has non-connectable type '${sourceNode.type}'`);
      }
      if (targetNode && !CONNECTABLE_TYPES.has(targetNode.type)) {
        addError(edgeId, `Edge target '${edge.target}' has non-connectable type '${targetNode.type}'`);
      }

      if (!edge.sourceHandle || !VALID_HANDLES.has(edge.sourceHandle)) {
        addError(edgeId, `Edge must provide a valid sourceHandle`);
      }
      if (!edge.targetHandle || !VALID_HANDLES.has(edge.targetHandle)) {
        addError(edgeId, `Edge must provide a valid targetHandle`);
      }
      if (edge.route && !VALID_ROUTES.has(edge.route)) {
        addError(edgeId, `Invalid route '${edge.route}'`);
      }

      const sourceStep = stepOf(sourceNode);
      const targetStep = stepOf(targetNode);
      if (sourceStep !== null && targetStep !== null && sourceStep >= targetStep) {
        addError(
          edgeId,
          `Study order must increase along an edge: '${edge.source}' is step ${sourceNode.data.order} but '${edge.target}' is step ${targetNode.data.order}`
        );
      }

      if (trackableNodeIds.has(edge.source)) connectedTrackableIds.add(edge.source);
      if (trackableNodeIds.has(edge.target)) connectedTrackableIds.add(edge.target);
    }
  }

  for (const trackableId of trackableNodeIds) {
    if (!connectedTrackableIds.has(trackableId)) {
      addError(trackableId, 'topic/subtopic is disconnected');
    }
  }

  const seenOrders = new Map();
  for (const trackableId of trackableNodeIds) {
    const node = nodeById.get(trackableId);
    const order = node?.data?.order;
    if (typeof order !== 'string' || !STEP_PATTERN.test(order)) {
      addError(trackableId, "topic/subtopic must declare a study order like '07' or '20a'");
      continue;
    }
    if (seenOrders.has(order)) {
      addError(trackableId, `Duplicate study order '${order}', already used by '${seenOrders.get(order)}'`);
    } else {
      seenOrders.set(order, trackableId);
    }
  }

  if (!doc.topics || typeof doc.topics !== 'object' || Array.isArray(doc.topics)) {
    addError('topics', 'Topics map is missing or not an object');
  } else {
    for (const trackableId of trackableNodeIds) {
      const details = doc.topics[trackableId];
      if (!details || typeof details !== 'object') {
        addError(trackableId, `Missing topic details entry for node '${trackableId}'`);
        continue;
      }

      if (typeof details.title !== 'string' || details.title.trim().length === 0) {
        addError(trackableId, 'Topic details requires non-empty title');
      }
      if (typeof details.content !== 'string' || details.content.trim().length === 0) {
        addError(trackableId, 'Topic details requires non-empty markdown content');
      }

      if (!Array.isArray(details.sourceRefs) || details.sourceRefs.length === 0) {
        addError(trackableId, 'Topic details requires at least one source reference in sourceRefs');
      } else {
        for (const ref of details.sourceRefs) {
          if (!ref || typeof ref.label !== 'string' || ref.label.trim().length === 0) {
            addError(trackableId, 'Source reference requires non-empty label');
          }
          if (!ref || typeof ref.locator !== 'string' || ref.locator.trim().length === 0) {
            addError(trackableId, 'Source reference requires non-empty locator');
          }
          if (ref && ref.url !== undefined && !isAllowedUrl(ref.url)) {
            addError(trackableId, `Invalid URL '${ref.url}'`);
          }
        }
      }

      if (details.resources) {
        if (!Array.isArray(details.resources)) {
          addError(trackableId, 'Topic resources must be an array');
        } else {
          for (const res of details.resources) {
            if (!res || !VALID_RESOURCE_TYPES.has(res.type)) {
              addError(trackableId, `Invalid resource type '${res?.type}'`);
            }
            if (!res || typeof res.title !== 'string' || res.title.trim().length === 0) {
              addError(trackableId, 'Resource requires non-empty title');
            }
            if (!res || typeof res.url !== 'string' || res.url.trim().length === 0) {
              addError(trackableId, 'Resource requires non-empty url');
            } else if (!isAllowedUrl(res.url)) {
              addError(trackableId, `Invalid URL '${res.url}'`);
            }
          }
        }
      }
    }

    for (const detailKey of Object.keys(doc.topics)) {
      if (!trackableNodeIds.has(detailKey)) {
        addError(detailKey, `Orphan topic detail '${detailKey}' does not match any topic or subtopic node`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      trackableCount: trackableNodeIds.size,
      disconnectedCount: [...trackableNodeIds].filter((id) => !connectedTrackableIds.has(id)).length,
    },
  };
}

export function validateRoadmapCollection(entries) {
  const errors = [];
  if (!Array.isArray(entries)) {
    return { valid: false, errors: ['collection: Entries must be an array'] };
  }

  const slugs = new Map();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') {
      errors.push('collection: Encountered invalid collection entry');
      continue;
    }
    const directory = entry.directory;
    const document = entry.document;
    if (typeof directory !== 'string' || directory.trim().length === 0) {
      errors.push('collection: Directory name must be a non-empty string');
      continue;
    }
    const slug = document?.slug;
    if (typeof slug !== 'string' || slug.trim().length === 0) {
      errors.push(`collection: Document in directory '${directory}' is missing a slug`);
      continue;
    }
    if (directory !== slug) {
      errors.push(`collection: Directory '${directory}' does not match document slug '${slug}'`);
    }
    if (slugs.has(slug)) {
      errors.push(
        `collection: Duplicate document slug '${slug}' (directories: ${slugs.get(slug)}, ${directory})`
      );
    } else {
      slugs.set(slug, directory);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const rootDir = process.cwd();
  const roadmapsDir = path.join(rootDir, 'roadmaps');

  if (!fs.existsSync(roadmapsDir)) {
    console.error('Error: roadmaps directory not found');
    process.exit(1);
  }

  const dirEntries = fs.readdirSync(roadmapsDir, { withFileTypes: true });
  const collectionEntries = [];
  let totalErrors = 0;
  let totalValidated = 0;

  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const roadmapPath = path.join(roadmapsDir, slug, 'roadmap.json');
    const topicsPath = path.join(roadmapsDir, slug, 'topics.json');

    if (!fs.existsSync(roadmapPath)) {
      console.error(`${slug}:file: Missing roadmap.json`);
      totalErrors++;
      continue;
    }
    if (!fs.existsSync(topicsPath)) {
      console.error(`${slug}:file: Missing topics.json`);
      totalErrors++;
      continue;
    }

    try {
      const roadmapData = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
      const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
      const combinedDoc = { ...roadmapData, topics: topicsData };
      collectionEntries.push({ directory: slug, document: combinedDoc });
    } catch (e) {
      console.error(`${slug}:json: Failed to parse JSON: ${e.message}`);
      totalErrors++;
    }
  }

  const collectionResult = validateRoadmapCollection(collectionEntries);
  if (!collectionResult.valid) {
    for (const err of collectionResult.errors) {
      console.error(err);
    }
    totalErrors += collectionResult.errors.length;
  }

  for (const entry of collectionEntries) {
    const result = validateRoadmapDocument(entry.document, { fallbackSlug: entry.directory });
    totalValidated++;
    const disconnected = result.stats?.disconnectedCount ?? 0;
    const trackable = result.stats?.trackableCount ?? 0;
    console.log(
      `${entry.document.slug || entry.directory}: ${trackable} topic/subtopic node(s), ${disconnected} disconnected.`
    );

    if (!result.valid) {
      for (const err of result.errors) {
        console.error(err);
      }
      totalErrors += result.errors.length;
    }
  }

  if (totalErrors > 0) {
    console.error(`\nValidation failed with ${totalErrors} error(s) across ${totalValidated} roadmap(s).`);
    process.exit(1);
  } else {
    console.log(`✓ All ${totalValidated} roadmap(s) passed validation with 0 errors.`);
    process.exit(0);
  }
}
