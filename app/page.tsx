'use client';

import { useMemo, useState } from 'react';

type Track = 'shared' | 'iis' | 'express' | 'security' | 'integration';

type RoadmapNode = {
  id: string;
  code: string;
  title: string;
  summary: string;
  detail: string;
  track: Track;
  accent: string;
  classes: string;
  tags: string[];
  prerequisites: string[];
  unlocks: string[];
};

type Filter = 'all' | Track;

const nodes: RoadmapNode[] = [
  {
    id: 'client-server',
    code: 'F01',
    title: 'Cliente y servidor',
    summary: 'Quién pide, quién escucha y quién responde.',
    detail:
      'El navegador, una app o Postman inicia la petición; el servidor escucha y devuelve una respuesta. Esta relación sostiene todo el flujo que se estudia después.',
    track: 'shared',
    accent: 'cyan',
    classes: 'Clase 2',
    tags: ['fundamento', 'HTTP'],
    prerequisites: [],
    unlocks: ['HTTP', 'Flujo de petición'],
  },
  {
    id: 'network-addressing',
    code: 'F02',
    title: 'IP y puertos',
    summary: 'La dirección y la puerta donde vive un servicio.',
    detail:
      'Una IP identifica la máquina en la red y un puerto identifica el servicio dentro de ella. El curso usa esta pareja para explicar dónde recibe una aplicación sus peticiones.',
    track: 'shared',
    accent: 'cyan',
    classes: 'Clase 2',
    tags: ['fundamento', 'red'],
    prerequisites: ['Cliente y servidor'],
    unlocks: ['Flujo de petición', 'Bindings'],
  },
  {
    id: 'http',
    code: 'F03',
    title: 'HTTP',
    summary: 'El idioma común entre cliente y servidor.',
    detail:
      'HTTP lleva la petición desde el cliente y devuelve la respuesta. Sus métodos, rutas, parámetros, cabeceras y códigos de estado aparecen en cada implementación.',
    track: 'shared',
    accent: 'cyan',
    classes: 'Clase 2–3',
    tags: ['fundamento', 'protocolo'],
    prerequisites: ['Cliente y servidor'],
    unlocks: ['Flujo de petición', 'Rutas dinámicas'],
  },
  {
    id: 'process-runtime',
    code: 'F04',
    title: 'Proceso y entorno',
    summary: 'Un programa en ejecución, con memoria y contexto.',
    detail:
      'El contenedor web corre como proceso. Terminal, VM y sistema operativo son el entorno que permite instalarlo, iniciarlo, detenerlo y convertirlo luego en un servicio persistente.',
    track: 'shared',
    accent: 'cyan',
    classes: 'Clase 2',
    tags: ['fundamento', 'proceso'],
    prerequisites: [],
    unlocks: ['Ciclo de vida', 'Servicio del sistema'],
  },
  {
    id: 'request-flow',
    code: 'C01',
    title: 'Flujo de una petición',
    summary: 'Navegador → servidor → contenedor → handler → respuesta.',
    detail:
      'El navegador envía una petición; el servidor la recibe en un puerto; si necesita lógica, la delega al contenedor; el handler genera el resultado y la respuesta vuelve por el mismo camino.',
    track: 'shared',
    accent: 'green',
    classes: 'Clase 2',
    tags: ['arquitectura', 'cadena principal'],
    prerequisites: ['Cliente y servidor', 'IP y puertos', 'HTTP'],
    unlocks: ['Servidor vs. contenedor', 'Rutas dinámicas'],
  },
  {
    id: 'web-container',
    code: 'C02',
    title: 'Contenedor web',
    summary: 'Recibe, decide, ejecuta y administra la petición.',
    detail:
      'Un contenedor web recibe la petición delegada por el servidor, decide qué pieza de código debe atenderla, ejecuta esa pieza y devuelve el resultado. También administra sesiones, seguridad y concurrencia.',
    track: 'shared',
    accent: 'green',
    classes: 'Clase 2',
    tags: ['concepto central', 'servlet'],
    prerequisites: ['Flujo de una petición'],
    unlocks: ['Servlet / route handler', 'Ciclo de vida'],
  },
  {
    id: 'static-dynamic',
    code: 'C03',
    title: 'Estático vs. dinámico',
    summary: 'Archivo existente frente a respuesta calculada.',
    detail:
      'HTML, CSS, imágenes y PDF pueden entregarse tal como existen. Cuando la respuesta cambia según quién pregunta o qué pregunta, se necesita ejecutar lógica en un contenedor.',
    track: 'shared',
    accent: 'green',
    classes: 'Clase 2–3',
    tags: ['clasificación', 'contenido'],
    prerequisites: ['Servidor vs. contenedor'],
    unlocks: ['Arquitectura de producción', 'Rutas dinámicas'],
  },
  {
    id: 'server-container',
    code: 'C04',
    title: 'Servidor web vs. contenedor',
    summary: 'Dos responsabilidades que un producto puede combinar.',
    detail:
      'El servidor web entrega archivos, maneja conexiones, TLS o proxy. El contenedor ejecuta lógica dinámica. IIS y Node.js + Express pueden cubrir ambos roles, aunque con mecanismos distintos.',
    track: 'shared',
    accent: 'green',
    classes: 'Clase 3',
    tags: ['arquitectura', 'producción'],
    prerequisites: ['Contenedor web', 'Estático vs. dinámico'],
    unlocks: ['Decisión tecnológica', 'Arquitectura Nginx → Express'],
  },
  {
    id: 'typescript',
    code: 'T01',
    title: 'TypeScript → JavaScript',
    summary: 'Escribir con tipos, compilar y ejecutar el resultado.',
    detail:
      'El curso usa TypeScript en las dos ramas. El código fuente se compila con tsc a JavaScript, y ese archivo compilado es el que ejecuta Node.js o que IIS carga mediante iisnode.',
    track: 'shared',
    accent: 'purple',
    classes: 'Clase 2, 6–8',
    tags: ['herramienta', 'compilación'],
    prerequisites: ['Proceso y entorno'],
    unlocks: ['http.createServer', 'IIS + iisnode', 'Express'],
  },
  {
    id: 'manual-container',
    code: 'T02',
    title: 'Mini-contenedor con Node',
    summary: 'http.createServer y routing manual.',
    detail:
      'La primera implementación muestra la teoría sin una abstracción: se crea el servidor HTTP, se analiza la URL, se compara url.pathname y se llama al handler correcto. Una ruta desconocida devuelve 404.',
    track: 'shared',
    accent: 'purple',
    classes: 'Clase 2–3',
    tags: ['TypeScript', 'routing'],
    prerequisites: ['TypeScript → JavaScript', 'Contenedor web'],
    unlocks: ['Express como abstracción', 'Servlet / route handler'],
  },
  {
    id: 'lifecycle',
    code: 'C05',
    title: 'Ciclo de vida',
    summary: 'init → service → destroy.',
    detail:
      'El contenedor inicializa la aplicación, atiende peticiones durante su servicio y libera recursos al apagarse. Esta idea conecta el código con W3SVC, systemd, launchd y los servicios de Windows.',
    track: 'shared',
    accent: 'purple',
    classes: 'Clase 2, 7',
    tags: ['operación', 'proceso'],
    prerequisites: ['Proceso y entorno', 'Contenedor web'],
    unlocks: ['Servicio persistente'],
  },
  {
    id: 'technology-choice',
    code: 'D01',
    title: 'Elegir el modelo',
    summary: 'Propietario o libre distribución según el contexto.',
    detail:
      'La decisión no es cuál es mejor en abstracto. SLA, soporte, presupuesto, flexibilidad, auditoría y requisitos de la organización determinan qué modelo conviene.',
    track: 'shared',
    accent: 'orange',
    classes: 'Clase 4',
    tags: ['decisión', 'SLA'],
    prerequisites: ['Servidor web vs. contenedor'],
    unlocks: ['Rama IIS', 'Rama Node.js + Express'],
  },
  {
    id: 'iis-environment',
    code: 'I01',
    title: 'Windows Server + VM',
    summary: 'Preparar el entorno propietario en VirtualBox.',
    detail:
      'La rama IIS comienza con una máquina virtual Windows Server, acceso de administrador, memoria, CPU, disco y red configurados para practicar sin alterar el equipo principal.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 5',
    tags: ['Windows Server', 'VirtualBox'],
    prerequisites: ['Elegir el modelo'],
    unlocks: ['Rol Web Server (IIS)'],
  },
  {
    id: 'iis-install',
    code: 'I02',
    title: 'Instalar IIS',
    summary: 'Activar el rol Web Server y verificar W3SVC.',
    detail:
      'IIS viene con Windows Server como rol. Se puede habilitar desde Server Manager o PowerShell y se verifica con W3SVC en ejecución y la página predeterminada en localhost.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 5',
    tags: ['IIS', 'W3SVC'],
    prerequisites: ['Windows Server + VM'],
    unlocks: ['Sitio IIS'],
  },
  {
    id: 'iis-site',
    code: 'I03',
    title: 'Sitio IIS',
    summary: 'Nombre, ruta física y punto de entrada.',
    detail:
      'Un sitio IIS reúne configuración, una carpeta física, una binding y la configuración de ejecución. El sitio convierte la instalación genérica en una aplicación identificable.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 6',
    tags: ['IIS Manager', 'sitio'],
    prerequisites: ['Instalar IIS'],
    unlocks: ['Bindings', 'Application Pool'],
  },
  {
    id: 'iis-bindings',
    code: 'I04',
    title: 'Bindings y documento',
    summary: 'IP + puerto + host y el archivo por defecto.',
    detail:
      'La binding determina cómo llega una petición al sitio. El documento predeterminado define qué archivo se entrega cuando se solicita la raíz sin indicar un archivo concreto.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 6',
    tags: ['IP', 'puerto', 'host'],
    prerequisites: ['Sitio IIS', 'IP y puertos'],
    unlocks: ['Verificación IIS'],
  },
  {
    id: 'iis-pool',
    code: 'I05',
    title: 'Application Pool',
    summary: 'Aislar el proceso que ejecuta cada sitio.',
    detail:
      'Cada sitio puede ejecutar en su propio Application Pool. El aislamiento reduce el radio de impacto cuando una aplicación falla o se compromete.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 6, 9',
    tags: ['aislamiento', 'proceso'],
    prerequisites: ['Sitio IIS', 'Ciclo de vida'],
    unlocks: ['Seguridad IIS', 'Verificación IIS'],
  },
  {
    id: 'iis-node',
    code: 'I06',
    title: 'iisnode + web.config',
    summary: 'El puente entre IIS y Node.js compilado.',
    detail:
      'iisnode permite que IIS ejecute una aplicación Node.js. web.config conecta el handler de IIS con app.js, el archivo JavaScript generado desde TypeScript.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 6',
    tags: ['iisnode', 'web.config'],
    prerequisites: ['IIS', 'TypeScript → JavaScript'],
    unlocks: ['Despliegue IIS'],
  },
  {
    id: 'iis-deploy',
    code: 'I07',
    title: 'Desplegar y verificar IIS',
    summary: 'Compilar, publicar, probar y resolver errores.',
    detail:
      'El recorrido completo es: app.ts, compilación a app.js, web.config, sitio, Application Pool, binding y prueba en navegador. Los errores 500.19 y 500.1002 se tratan como nodos de troubleshooting.',
    track: 'iis',
    accent: 'orange',
    classes: 'Clase 6',
    tags: ['despliegue', 'troubleshooting'],
    prerequisites: ['Bindings y documento', 'Application Pool', 'iisnode + web.config'],
    unlocks: ['Seguridad IIS', 'Despliegue integrador'],
  },
  {
    id: 'node-toolchain',
    code: 'N01',
    title: 'Node.js, npm y TypeScript',
    summary: 'Instalar el runtime y preparar el proyecto.',
    detail:
      'La rama libre instala Node.js, npm, TypeScript y los tipos de Node y Express. El mismo lenguaje del curso se mantiene mientras cambia el runtime y el modelo de distribución.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 7',
    tags: ['Node.js', 'npm'],
    prerequisites: ['Elegir el modelo', 'TypeScript → JavaScript'],
    unlocks: ['Aplicación Express'],
  },
  {
    id: 'express-app',
    code: 'N02',
    title: 'Aplicación Express',
    summary: 'La abstracción práctica del mini-contenedor.',
    detail:
      'Express recibe peticiones, registra rutas y delega cada una a su handler. Reemplaza el routing manual de http.createServer sin cambiar el problema conceptual que el contenedor resuelve.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 7–8',
    tags: ['Express', 'contenedor'],
    prerequisites: ['Node.js, npm y TypeScript', 'Mini-contenedor con Node'],
    unlocks: ['Rutas dinámicas', 'Servicio persistente'],
  },
  {
    id: 'dynamic-routes',
    code: 'N03',
    title: 'Rutas dinámicas',
    summary: 'app.get, req, res y parámetros de consulta.',
    detail:
      'Una ruta registrada con app.get o app.post se comporta como el servlet del modelo teórico. req contiene la petición; res permite devolver HTML, JSON y códigos de estado.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 8',
    tags: ['routes', 'req/res'],
    prerequisites: ['Aplicación Express', 'Servlet / route handler'],
    unlocks: ['/saludo', '/info', '/cotizacion'],
  },
  {
    id: 'route-lab',
    code: 'N04',
    title: 'Práctica de endpoints',
    summary: '/saludo, /info y /cotizacion con respuestas reales.',
    detail:
      'Las rutas convierten la teoría en un servicio comprobable: saludo usa un nombre, info muestra datos del servidor y cotizacion calcula IVA. La entrada inválida debe producir 400.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 8',
    tags: ['JSON', 'validación'],
    prerequisites: ['Rutas dinámicas'],
    unlocks: ['Validación defensiva', 'Despliegue integrador'],
  },
  {
    id: 'service-branch',
    code: 'N05',
    title: 'Servicio persistente',
    summary: 'systemd, launchd o NSSM según el sistema.',
    detail:
      'La aplicación debe seguir funcionando sin una terminal abierta. Linux usa systemd, macOS usa launchd y Windows puede usar NSSM o un servicio de Windows; son alternativas operativas, no pasos acumulativos.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 7–8',
    tags: ['systemd', 'launchd', 'NSSM'],
    prerequisites: ['Aplicación Express', 'Ciclo de vida'],
    unlocks: ['Verificación del servicio', 'Seguridad'],
  },
  {
    id: 'service-check',
    code: 'N06',
    title: 'Verificar el servicio',
    summary: 'Estado del sistema y respuesta en localhost.',
    detail:
      'La operación se confirma desde dos ángulos: el gestor del sistema reporta que la aplicación está activa y una petición a localhost:3000 devuelve una respuesta real.',
    track: 'express',
    accent: 'blue',
    classes: 'Clase 7–8',
    tags: ['operación', 'prueba'],
    prerequisites: ['Servicio persistente', 'Rutas dinámicas'],
    unlocks: ['Despliegue integrador'],
  },
  {
    id: 'attacker-mindset',
    code: 'S01',
    title: 'Pensar como atacante',
    summary: 'Cada parámetro es una puerta de entrada.',
    detail:
      'La seguridad empieza al preguntar por dónde se puede romper el sistema. Cada ruta que acepta datos del usuario debe definir límites, errores y privilegios antes de considerarse terminada.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 9',
    tags: ['mentalidad', 'riesgo'],
    prerequisites: ['Práctica de endpoints'],
    unlocks: ['Validación', 'Errores seguros', 'Headers'],
  },
  {
    id: 'input-validation',
    code: 'S02',
    title: 'Validar entrada',
    summary: 'Aceptar solo datos presentes, válidos y acotados.',
    detail:
      'La ruta de cotización valida que monto exista, sea numérico, no sea negativo y no exceda 1,000,000. Si falla, responde 400 y no ejecuta la lógica de negocio.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 8–9',
    tags: ['400 Bad Request', 'límites'],
    prerequisites: ['Práctica de endpoints'],
    unlocks: ['Cotización segura', 'Despliegue integrador'],
  },
  {
    id: 'safe-errors',
    code: 'S03',
    title: 'Errores seguros',
    summary: 'Detalle en logs; mensaje genérico para el usuario.',
    detail:
      'Un stack trace puede revelar rutas, librerías y detalles internos. El servidor registra el error para el administrador y devuelve un mensaje genérico que no ayuda a un atacante.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 9',
    tags: ['logs', '500'],
    prerequisites: ['Pensar como atacante'],
    unlocks: ['Hardening Express'],
  },
  {
    id: 'helmet-rate-limit',
    code: 'S04',
    title: 'Headers y rate limiting',
    summary: 'Helmet para cabeceras y límites contra abuso.',
    detail:
      'Helmet agrega cabeceras HTTP de seguridad. express-rate-limit limita, por ejemplo, a 100 peticiones por minuto para reducir saturación y automatización abusiva.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 9',
    tags: ['Helmet', 'rate limit'],
    prerequisites: ['Errores seguros', 'Validar entrada'],
    unlocks: ['Checkpoint de seguridad'],
  },
  {
    id: 'least-privilege',
    code: 'S05',
    title: 'Menor privilegio',
    summary: 'appweb y Application Pool aislado.',
    detail:
      'Node no debe correr como root y cada sitio IIS debe tener aislamiento. El componente recibe solo el acceso necesario, así una falla limita el daño posible en el sistema.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 6–9',
    tags: ['appweb', 'aislamiento'],
    prerequisites: ['Application Pool', 'Servicio persistente'],
    unlocks: ['Checkpoint de seguridad'],
  },
  {
    id: 'iis-hardening',
    code: 'S06',
    title: 'Hardening de IIS',
    summary: 'Directory browsing, errores, HTTPS y actualizaciones.',
    detail:
      'En IIS se deshabilita el listado de directorios, se ocultan errores detallados, se configura HTTPS y se mantiene Windows actualizado. Son las mismas ideas de defensa aplicadas a otra rama.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 9',
    tags: ['IIS', 'HTTPS'],
    prerequisites: ['Desplegar y verificar IIS', 'Application Pool'],
    unlocks: ['Checkpoint de seguridad'],
  },
  {
    id: 'security-checkpoint',
    code: 'S07',
    title: 'Checkpoint de seguridad',
    summary: 'Aplicar y explicar una defensa en el servicio.',
    detail:
      'El ejercicio pide aplicar y documentar medidas sobre el contenedor Express. La meta es justificar por qué cada control reduce el riesgo, no memorizar una lista de paquetes.',
    track: 'security',
    accent: 'pink',
    classes: 'Clase 9',
    tags: ['práctica', 'evidencia'],
    prerequisites: ['Headers y rate limiting', 'Menor privilegio', 'Hardening de IIS'],
    unlocks: ['Despliegue integrador'],
  },
  {
    id: 'integration',
    code: 'M01',
    title: 'Despliegue integrador',
    summary: 'Node/Express operativo e IIS disponible como respaldo.',
    detail:
      'El caso final publica bienvenida y cotización en Node.js + Express + TypeScript, aplica una medida de seguridad, recompila y reinicia el servicio. IIS debe seguir accesible como respaldo.',
    track: 'integration',
    accent: 'green',
    classes: 'Clase 10',
    tags: ['caso real', '10 puntos'],
    prerequisites: ['Verificar el servicio', 'Checkpoint de seguridad', 'Desplegar y verificar IIS'],
    unlocks: ['Maestría'],
  },
  {
    id: 'mastery',
    code: 'M02',
    title: 'Maestría: explicar, desplegar, defender',
    summary: 'Elegir una arquitectura y demostrar que funciona.',
    detail:
      'La unidad termina cuando puedes explicar el flujo, elegir entre IIS y Express con criterio, desplegar rutas dinámicas, mantener el proceso activo y defender cada control básico de seguridad.',
    track: 'integration',
    accent: 'green',
    classes: 'Clases 2–10',
    tags: ['parcial 1', 'laboratorio 1'],
    prerequisites: ['Despliegue integrador'],
    unlocks: [],
  },
];

const courseClasses = [
  ['13/07', 'Bienvenida y diagnóstico', 'Inicio'],
  ['15/07', 'Contenedores web', 'Fundamentos'],
  ['20/07', 'Servidor vs. contenedor', 'Fundamentos'],
  ['22/07', 'Propietario vs. libre', 'Decisión'],
  ['27/07', 'Instalación de IIS', 'IIS'],
  ['29/07', 'Configuración de IIS', 'IIS'],
  ['10/08', 'Node.js + Express', 'Express'],
  ['12/08', 'Rutas dinámicas', 'Express'],
  ['17/08', 'Buenas prácticas y seguridad', 'Seguridad'],
  ['18/08', 'Práctica 1', 'Práctica'],
  ['19/08', 'Despliegue integrador', 'Maestría'],
];

const filterOptions: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todo el mapa' },
  { id: 'shared', label: 'Base común' },
  { id: 'iis', label: 'Rama IIS' },
  { id: 'express', label: 'Rama Express' },
  { id: 'security', label: 'Seguridad' },
];

const nodeMap = new Map(nodes.map((node) => [node.title, node]));

function NodeCard({
  node,
  completed,
  onSelect,
}: {
  node: RoadmapNode;
  completed: boolean;
  onSelect: (node: RoadmapNode) => void;
}) {
  return (
    <button
      className={`node-card accent-${node.accent} ${completed ? 'is-complete' : ''}`}
      onClick={() => onSelect(node)}
      type="button"
    >
      <span className="node-card-topline">
        <span className="node-code">{node.code}</span>
        <span className="node-status" aria-label={completed ? 'Completado' : 'Pendiente'}>
          {completed ? '✓' : '·'}
        </span>
      </span>
      <span className="node-title">{node.title}</span>
      <span className="node-summary">{node.summary}</span>
      <span className="node-meta">
        <span>{node.classes}</span>
        <span className="node-open">Abrir →</span>
      </span>
    </button>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  tone = 'green',
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: string;
}) {
  return (
    <div className="section-heading">
      <span className={`section-index tone-${tone}`}>{index}</span>
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<RoadmapNode | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showClasses, setShowClasses] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return new Set(
      nodes
        .filter((node) => activeFilter === 'all' || node.track === activeFilter)
        .filter((node) => {
          if (!normalized) return true;
          return [node.title, node.summary, node.detail, ...node.tags, node.code]
            .join(' ')
            .toLowerCase()
            .includes(normalized);
        })
        .map((node) => node.id),
    );
  }, [activeFilter, query]);

  const progress = Math.round((completed.size / nodes.length) * 100);

  const toggleComplete = (id: string) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isVisible = (id: string) => visible.has(id);
  const node = (id: string) => nodes.find((item) => item.id === id)!;

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Gestión de Servidores Web, inicio">
          <span className="brand-mark">GS</span>
          <span className="brand-copy">
            <strong>GESTIÓN DE</strong>
            <span>SERVIDORES WEB</span>
          </span>
        </a>
        <div className="topbar-center">
          <span className="topbar-kicker">Roadmap de la Unidad 1</span>
          <span className="topbar-dot" />
          <span>11 clases · 2 rutas</span>
        </div>
        <button className="topbar-action" onClick={() => scrollTo('mastery')} type="button">
          Ver final <span>↓</span>
        </button>
      </header>

      <div className="layout" id="top">
        <aside className="sidebar">
          <div className="sidebar-sticky">
            <div className="side-block">
              <p className="side-label">En este mapa</p>
              <nav className="side-nav" aria-label="Secciones del roadmap">
                <button onClick={() => scrollTo('foundations')} type="button">
                  <span className="nav-number">01</span> Fundamentos
                </button>
                <button onClick={() => scrollTo('decision')} type="button">
                  <span className="nav-number">02</span> Decisión y ramas
                </button>
                <button onClick={() => scrollTo('security')} type="button">
                  <span className="nav-number">03</span> Seguridad
                </button>
                <button onClick={() => scrollTo('integration')} type="button">
                  <span className="nav-number">04</span> Integración
                </button>
              </nav>
            </div>

            <div className="progress-card">
              <div className="progress-card-top">
                <span>Tu avance</span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p>{completed.size} de {nodes.length} conceptos marcados</p>
              {completed.size > 0 && (
                <button className="reset-progress" onClick={() => setCompleted(new Set())} type="button">
                  Reiniciar avance
                </button>
              )}
            </div>

            <div className="side-block side-course">
              <button className="side-label side-label-button" onClick={() => setShowClasses((value) => !value)} type="button">
                <span>Orden de clases</span>
                <span>{showClasses ? '−' : '+'}</span>
              </button>
              {showClasses && (
                <ol className="class-list">
                  {courseClasses.map(([date, title, section], index) => (
                    <li key={`${date}-${title}`}>
                      <span className="class-index">{String(index + 1).padStart(2, '0')}</span>
                      <span><b>{title}</b><small>{date} · {section}</small></span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <p className="source-note">Conceptos reorganizados desde las clases 2–10 del curso.</p>
          </div>
        </aside>

        <div className="main-column">
          <section className="hero">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-content">
              <div className="eyebrow-row">
                <span className="eyebrow-dot" />
                <span>Mapa de aprendizaje · actualizado 2026</span>
              </div>
              <h1>Del primer <em>request</em><br />a un despliegue defendible.</h1>
              <p className="hero-copy">
                Aprende cómo se conectan HTTP, los contenedores web, IIS y Node.js + Express. Sigue las dependencias, elige una rama y vuelve a converger en una entrega completa.
              </p>
              <div className="hero-stats">
                <div><strong>34</strong><span>nodos de concepto</span></div>
                <div><strong>02</strong><span>implementaciones</span></div>
                <div><strong>01</strong><span>caso integrador</span></div>
              </div>
            </div>
            <div className="hero-terminal" aria-hidden="true">
              <div className="terminal-bar"><span /><span /><span /><small>request-flow.ts</small></div>
              <div className="terminal-code">
                <span><i>01</i> <b>const</b> request = browser.send(<mark>“/saludo”</mark>)</span>
                <span><i>02</i> <b>const</b> route = container.resolve(request)</span>
                <span><i>03</i> <b>return</b> route.handler(request)</span>
                <span className="terminal-result"><i>04</i> <span>→ 200 OK · response</span></span>
              </div>
            </div>
          </section>

          <section className="roadmap-controls" aria-label="Controles del roadmap">
            <div className="filter-group">
              <span className="control-label">Filtrar por ruta</span>
              <div className="filter-pills">
                {filterOptions.map((option) => (
                  <button
                    className={activeFilter === option.id ? 'is-active' : ''}
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar concepto..." />
              {query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')} type="button">×</button>}
            </label>
          </section>

          <div className="mobile-nav">
            <button onClick={() => scrollTo('foundations')} type="button">Fundamentos</button>
            <button onClick={() => scrollTo('decision')} type="button">Ramas</button>
            <button onClick={() => scrollTo('security')} type="button">Seguridad</button>
            <button onClick={() => scrollTo('integration')} type="button">Final</button>
          </div>

          <div className="roadmap-intro">
            <span className="roadmap-line" />
            <p>Lee de arriba hacia abajo. Las líneas muestran dependencias; los colores muestran dónde estás dentro del sistema.</p>
          </div>

          <div className="roadmap-canvas">
            <section className="roadmap-section" id="foundations">
              <SectionHeading index="01" eyebrow="Base común" title="Entender el terreno" description="Antes de elegir una tecnología, arma el modelo mental: quién recibe, qué se ejecuta y cómo viaja una petición." tone="cyan" />
              <div className="node-grid four-col">
                {['client-server', 'network-addressing', 'http', 'process-runtime'].map((id) => (
                  <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
              <div className="flow-connector" aria-hidden="true"><span /></div>
              <div className="node-grid three-col">
                {['request-flow', 'web-container', 'static-dynamic'].map((id) => (
                  <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
              <div className="callout-note"><span>↳</span><p>Regla del curso: si la respuesta cambia según quién pregunta o qué pregunta, necesitas un contenedor.</p></div>
            </section>

            <section className="roadmap-section compact-section">
              <SectionHeading index="01B" eyebrow="Construir para entender" title="Del concepto al proceso" description="La primera implementación expone el mecanismo antes de ocultarlo detrás de un framework." tone="purple" />
              <div className="node-grid three-col">
                {['server-container', 'typescript', 'manual-container'].map((id) => (
                  <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
              <div className="connector-pair" aria-hidden="true"><span /><span /></div>
              <div className="node-grid two-col narrow-grid">
                {['lifecycle', 'technology-choice'].map((id) => (
                  <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
            </section>

            <section className="roadmap-section branch-section" id="decision">
              <SectionHeading index="02" eyebrow="Punto de decisión" title="Elegir una implementación" description="El contexto decide el camino: soporte contractual y entorno corporativo apuntan a IIS; flexibilidad y ecosistema abierto apuntan a Node.js + Express." tone="orange" />
              <div className="decision-node-wrap">
                <div className="decision-rail" aria-hidden="true"><span /><span /><i /></div>
                {isVisible('technology-choice') && <NodeCard node={node('technology-choice')} completed={completed.has('technology-choice')} onSelect={setSelected} />}
              </div>
              <div className="branch-columns">
                <div className="branch-column branch-iis">
                  <div className="branch-label"><span className="branch-icon">I</span><div><b>Rama propietaria</b><strong>IIS / Windows Server</strong></div><span className="branch-count">07 nodos</span></div>
                  <div className="node-stack">
                    {['iis-environment', 'iis-install', 'iis-site', 'iis-bindings', 'iis-pool', 'iis-node', 'iis-deploy'].map((id) => (
                      isVisible(id) && <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                    ))}
                  </div>
                </div>
                <div className="branch-column branch-express">
                  <div className="branch-label"><span className="branch-icon">N</span><div><b>Rama libre</b><strong>Node.js + Express</strong></div><span className="branch-count">06 nodos</span></div>
                  <div className="node-stack">
                    {['node-toolchain', 'express-app', 'dynamic-routes', 'route-lab', 'service-branch', 'service-check'].map((id) => (
                      isVisible(id) && <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="branch-footnote"><span>↘</span><p>Dos implementaciones, el mismo problema: mantener un proceso que reciba HTTP, ejecute lógica y responda de forma verificable.</p></div>
            </section>

            <section className="roadmap-section convergence-section" id="security">
              <SectionHeading index="03" eyebrow="Convergencia" title="Construir con defensa" description="La seguridad reaparece en ambas ramas: validar, ocultar detalles, limitar abuso y reducir privilegios." tone="pink" />
              <div className="convergence-bridge" aria-hidden="true"><span /><span /><span /></div>
              <div className="node-grid three-col security-grid">
                {['attacker-mindset', 'input-validation', 'safe-errors', 'helmet-rate-limit', 'least-privilege', 'iis-hardening'].map((id) => (
                  isVisible(id) && <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
              <div className="flow-connector" aria-hidden="true"><span /></div>
              <div className="checkpoint-row">
                {isVisible('security-checkpoint') && <NodeCard node={node('security-checkpoint')} completed={completed.has('security-checkpoint')} onSelect={setSelected} />}
                <div className="principle-card"><span className="principle-mark">+</span><div><b>Principio transversal</b><strong>Menor privilegio</strong><p>El componente solo recibe el acceso que necesita para funcionar.</p></div></div>
              </div>
            </section>

            <section className="roadmap-section final-section" id="integration">
              <SectionHeading index="04" eyebrow="Prueba de dominio" title="Integrar y demostrar" description="El final no añade teoría: pide conectar lo aprendido, elegir con criterio y dejar evidencia de que funciona." tone="green" />
              <div className="integration-route">
                <div className="integration-line" aria-hidden="true"><span /><span /><span /></div>
                {['integration', 'mastery'].map((id) => (
                  isVisible(id) && <NodeCard key={id} node={node(id)} completed={completed.has(id)} onSelect={setSelected} />
                ))}
              </div>
              <div className="deliverable-grid">
                <div><span>01</span><p><b>Express activo</b><small>/bienvenida y /cotizacion responden después de recompilar y reiniciar.</small></p></div>
                <div><span>02</span><p><b>IIS disponible</b><small>El sitio configurado permanece accesible como respaldo.</small></p></div>
                <div><span>03</span><p><b>Evidencia clara</b><small>Capturas, medida de seguridad y reflexión comparativa.</small></p></div>
              </div>
            </section>
          </div>

          <footer className="site-footer">
            <div><span className="footer-mark">GS</span><p>Gestión de Servidores Web<br /><small>Roadmap de la Unidad 1</small></p></div>
            <p className="footer-note">Conceptos conectados desde las clases 2–10 · UNIVO</p>
          </footer>
        </div>
      </div>

      {selected && (
        <div className="detail-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <aside className={`detail-panel accent-${selected.accent}`} aria-label={`Detalle de ${selected.title}`}>
            <div className="detail-header"><span className="node-code">{selected.code}</span><button aria-label="Cerrar detalle" onClick={() => setSelected(null)} type="button">×</button></div>
            <div className="detail-accent-line" />
            <p className="detail-track">{selected.track === 'shared' ? 'BASE COMÚN' : selected.track === 'iis' ? 'RAMA IIS' : selected.track === 'express' ? 'RAMA EXPRESS' : selected.track === 'security' ? 'SEGURIDAD' : 'INTEGRACIÓN'}</p>
            <h2>{selected.title}</h2>
            <p className="detail-summary">{selected.summary}</p>
            <p className="detail-body">{selected.detail}</p>
            <div className="detail-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="detail-links">
              <div><small>Requiere</small><p>{selected.prerequisites.length ? selected.prerequisites.map((item) => nodeMap.get(item)?.title ?? item).join(' · ') : 'Punto de entrada del mapa'}</p></div>
              <div><small>Desbloquea</small><p>{selected.unlocks.length ? selected.unlocks.join(' · ') : 'Cierre de la unidad'}</p></div>
            </div>
            <div className="detail-actions">
              <button className={`complete-button ${completed.has(selected.id) ? 'is-complete' : ''}`} onClick={() => toggleComplete(selected.id)} type="button">
                <span>{completed.has(selected.id) ? '✓' : '○'}</span>{completed.has(selected.id) ? 'Concepto completado' : 'Marcar como completado'}
              </button>
              <span className="detail-class">{selected.classes}</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
