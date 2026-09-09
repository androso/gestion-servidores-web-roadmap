# Guía de Autoría de Rutas de Aprendizaje para Agentes CLI

Esta guía define el procedimiento estándar para que un agente de repositorio (Codex, Gemini CLI u otro) genere e integre una ruta de aprendizaje interactiva a partir de documentos de curso locales.

## Estándar conceptual obligatorio

Antes de diseñar, migrar o reorganizar cualquier roadmap, **leer y aplicar `prompts/conceptual-roadmap-standard.md`**. Ese documento define la arquitectura pedagógica común del repositorio y no es opcional.

La precedencia entre ambos documentos es:

- `prompts/conceptual-roadmap-standard.md` gobierna la **topología pedagógica**: dependencias conceptuales, orden de estudio, ramas, checkpoints, relación entre teoría y aplicación y organización de secciones.
- Esta guía, `prompts/generate-course-roadmap.md`, gobierna la **implementación mecánica**: esquema JSON, geometría, handles, validación, registro, recursos y revisión visual.
- Si una recomendación de esta guía sobre topología entra en tensión con el estándar conceptual, seguir el estándar conceptual **sin violar el esquema, el validador ni las restricciones técnicas**.
- La “columna vertebral con apoyos laterales” es un patrón visual preferido, no una autorización para convertir alternativas conceptuales en una cadena artificial. Cuando el estándar conceptual requiera ramas paralelas, la geometría debe adaptarse a ellas.

Un roadmap nuevo no se considera correctamente autorado si el agente no ha revisado ambos documentos.

---

## 1. Principios y Reglas Inviolables

1. **Sin dependencias de API en tiempo de ejecución**: Toda la ruta, nodos, conexiones, detalles y temas se compilan como datos estáticos dentro del repositorio. La aplicación desplegada nunca debe invocar APIs de modelos (OpenAI, Anthropic, Gemini, etc.), bases de datos remotos ni autenticación.
2. **Prohibido copiar activos o contenido restringido**: No copiar assets propietarios, SVGs cerrados ni contenido con derechos restrictivos de plataformas externas.
3. **Trazabilidad académica estricta**: Cada tema o subtema debe incluir al menos una referencia de origen (`sourceRefs`) con etiqueta y localizador exacto (número de diapositiva, sección de guía, página de lectura). Verificar el localizador contra el archivo real; si no existe en el documento de clase, usar el encabezado exacto del sílabo. Nunca inventar un rango de páginas o diapositivas.
4. **Recursos verificados exclusivamente**: Solo incluir enlaces externos HTTP/HTTPS públicos y verificables cuyo título coincida con el destino. Nunca inventar enlaces ni sustituir una página precisa por la portada genérica del sitio.
5. **Documentos fuente y PDFs de clase**: Guardar los originales en `course-inputs/<slug>/` (ignorado por git). Copiar los PDFs de clase a `public/<slug>/materiales/` y enlazarlos en `sourceRefs.url` con una ruta absoluta del sitio (`/ciencia-de-datos/materiales/...`). No publicar Markdown de autoría. Un servidor estático basta: con `Content-Type: application/pdf` y sin `Content-Disposition: attachment`, el visor del navegador abre el archivo en lugar de forzar la descarga.
6. **Vista inicial autorada, no auto-ajuste**: Cada documento debe declarar un `canvas.initialViewport` legible (y `mobileInitialViewport` opcional). Prohibido el `fitView` automático al cargar el documento completo. Fit View es una acción explícita del visitante; Reset debe devolver al viewport autorado. El `minZoom` debe ser lo bastante bajo para que Fit View muestre el documento completo en un área de 1280×800; con documentos altos esto significa valores cercanos a `0.15`, no `0.35`.
7. **Grafo de aprendizaje completo**: Cada nodo `topic` o `subtopic` debe participar en al menos un edge. Leyendas, etiquetas, párrafos y grupos de enlaces se usan solo donde mejoran la jerarquía, no como relleno.

---

## 2. Flujo de Trabajo Paso a Paso

### Paso 1: Lectura e Inspección de Documentos del Curso
1. Mover los archivos del curso a `course-inputs/<slug>/` (o leerlos ahí si ya están).
2. Extraer:
   - Objetivos de aprendizaje y resultados formativos.
   - Módulos, unidades o bloques temáticos.
   - Temas (`topic`) y conceptos detallados (`subtopic`).
   - Relaciones de prerrequisitos y dependencias lógicas.
   - Localizadores exactos verificados en el archivo (por ejemplo, `Diapositiva 7 — El recorrido completo de una petición`).

### Paso 2: Diseño de Topología y Geometría Absoluta
1. Usar por defecto la **columna vertebral con apoyos laterales** cuando represente correctamente la progresión conceptual:
   - Los pasos principales de la ruta son `topic` y normalmente se apilan en una columna principal.
   - Los conceptos de apoyo son `subtopic` y se colocan junto al paso que amplían.
   - Las ramas paralelas deben ocupar carriles o columnas propias y conservar una lectura inequívoca como alternativas.
   - Prohibido usar una rejilla uniforme donde todas las tarjetas parecen iguales: sin jerarquía visual no hay orden de lectura.
   - Prohibido forzar una columna única si eso convierte alternativas conceptuales en falsos prerrequisitos secuenciales.
2. Numerar la secuencia de estudio en `data.order` para **cada** `topic` y `subtopic`:
   - Formato `"01"`, `"02"`, … y sufijo de rama para caminos paralelos: `"20a"` / `"20b"`.
   - La numeración debe reflejar la progresión pedagógica definida por el estándar conceptual.
   - Invariante obligatorio: en todo `edge`, el número del origen debe ser menor que el del destino. El validador lo rechaza si no se cumple.
   - Los números son únicos y sustituyen a cualquier código temático. No inventar códigos tipo `F01`/`C05`: numeran por tema, no por orden, y contradicen el recorrido real.
3. Asignar coordenadas absolutas `position: { x, y }` y dimensiones `size: { width, height }`:
   - Tarjetas de la columna vertebral: 360–450px de ancho, 96–100px de alto como referencia general.
   - Tarjetas de apoyo: 300–330px de ancho, 88px de alto como referencia general.
   - En ramas paralelas se pueden ajustar dimensiones cuando sea necesario para mantener carriles claros, siempre que el texto siga siendo legible y el validador pase.
   - Cada `topic`/`subtopic` declara `data.detail`: una frase corta visible en el mapa, distinta del Markdown del cajón.
   - Separación entre filas: suficiente para que insignias, flechas y tarjetas no se toquen.
   - Espaciado horizontal suficiente para que cada rama tenga un carril visual propio.
   - Secciones de fondo (`section`): `zIndex: -1` cubriendo el área del módulo correspondiente; no interceptan clics ni se conectan.
   - Los párrafos de nota no deben caer sobre el trazado de un conector: colocarlos en una columna libre de la misma fila.
4. Bloques conectables: `title`, `topic`, `subtopic`, `paragraph`, `label`, `button`. No conectar `section`, `legend`, `linkGroup` ni `line`.
5. Asignar conectores (`edges`) con `sourceHandle` y `targetHandle` obligatorios (`top`, `bottom`, `left`, `right`).
   - **Todo `edge` lleva `arrow: true`.** Sin punta de flecha el sentido del recorrido es invisible y el mapa deja de indicar qué va después.
   - Usar `route: "smoothstep" | "bezier" | "straight"`.
   - Paso principal → siguiente paso principal: preferir `bottom` → `top` `straight` cuando no haya bifurcación.
   - Paso principal → apoyo, y apoyo → apoyo de la misma fila: normalmente `right` → `left` `straight`.
   - Horquillas, convergencias y saltos entre secciones: usar el trazado que mantenga cada dependencia fuera de tarjetas no relacionadas.
   - **Un conector no debe atravesar una tarjeta ajena a esa dependencia.** Si ocurre, cambiar posiciones, carriles o handles; no aceptar un edge oculto bajo nodos.
   - El motor adelgaza y atenúa por sí solo los conectores que tocan un `subtopic`, de modo que la ruta principal resalta. No hace falta declarar estilos para conseguirlo.
6. Incluir una `legend` que explique cómo leer el mapa: que se sigue la numeración, qué distingue un paso principal de un concepto de apoyo y qué significan los sufijos de rama.
7. Inspeccionar el texto de cada nodo al zoom del `initialViewport` (no al zoom mínimo). No debe haber recorte, elipsis ni tarjetas solapadas (salvo `section` y `line`).

### Paso 3: Redacción de Contenido Markdown y Referencias
1. Para cada nodo de tipo `topic` o `subtopic`:
   - Escribir `data.detail` (una frase) para el bloque del mapa.
   - Redactar explicación técnica concisa y estructurada en formato Markdown (`content`) para el cajón. El cajón renderiza GFM (tablas, listas, citas y código en línea) y omite el `# <Título>` inicial porque ya muestra el título del tema.
   - Definir `sourceRefs` obligatorios con `label`, `locator` específico verificado y `url` al PDF en `public/<slug>/materiales/` cuando el archivo exista. No apuntar a `course-inputs/`.
   - Añadir `resources` externos solo si la URL es HTTP/HTTPS, accesible y el título describe el destino real.
   - Si la ruta introduce una corrección metodológica frente al material de clase, identificar explícitamente qué afirma la fuente y qué se corrige en la guía; no reescribir silenciosamente el contenido original.

### Paso 4: Creación de Archivos JSON
Crear el directorio `roadmaps/<slug>/` con:
1. `roadmaps/<slug>/roadmap.json`:
   ```json
   {
     "schemaVersion": 1,
     "slug": "<slug>",
     "title": "<Título del Curso>",
     "description": "<Descripción del curso>",
     "canvas": {
       "width": 1240,
       "height": 3000,
       "minZoom": 0.15,
       "maxZoom": 1.75,
       "initialViewport": { "x": 170, "y": 28, "zoom": 0.86 },
       "mobileInitialViewport": { "x": -52, "y": -170, "zoom": 0.85 }
     },
     "theme": {
       "paper": "#fbfbf8",
       "ink": "#111827",
       "topicBg": "#f9d95c",
       "subtopicBg": "#fff2a8",
       "connectorColor": "#2563eb",
       "progressBg": "#dad1fd",
       "searchMatchBorder": "#1d4ed8"
     },
     "nodes": [ ... ],
     "edges": [ ... ]
   }
   ```
   El `initialViewport` de escritorio debe abrir el título y la sección de fundamentos a tamaño legible. El viewport móvil debe situar el primer tema cerca de la esquina superior izquierda y permitir pan. No usar ajuste automático al documento completo.
2. `roadmaps/<slug>/topics.json`:
   ```json
   {
     "<node-id>": {
       "title": "<Título del Tema>",
       "content": "# <Título>\n\nExplicación técnica...",
       "sourceRefs": [
         {
           "label": "Clase X — Título del documento",
           "locator": "Diapositiva N — Encabezado real"
         }
       ],
       "resources": [ ... ]
     }
   }
   ```

### Paso 5: Registro en la Aplicación
1. Abrir `roadmaps/index.ts`.
2. Importar los dos archivos JSON creados.
3. Añadir la ruta combinada al array `roadmaps` y al mapa `roadmapsBySlug`.

### Paso 6: Validación Estricta
Ejecutar:
```bash
npm run validate:roadmaps
npm run test:roadmaps
```
Si el validador reporta errores de límites de lienzo, nodos desconectados, handles faltantes, URLs inválidas, solapes, IDs duplicados, `data.order` ausente o duplicado, o un orden de estudio que retrocede a lo largo de un conector, corregir los archivos JSON y volver a ejecutar la validación.

### Paso 7: Inspección Visual y Ajustes de Diagramación
1. Iniciar el servidor local:
   ```bash
   npm run dev
   ```
2. Abrir en navegador `http://localhost:3000/?roadmap=<slug>`.
3. Verificar visualmente:
   - Que el zoom inicial sea el autorado, no el mínimo ni un fit del documento entero.
   - Que ningún nodo quede cortado, con elipsis, ni sobreponga a otro nodo de contenido.
   - Que los conectores tengan trazados limpios y no atraviesen tarjetas de forma confusa.
   - Que las ramas alternativas se lean como ramas y no como una secuencia accidental provocada por cruces de edges.
   - Que la búsqueda resalte los nodos correctos sin escalarlos.
   - Que Fit View muestre el documento completo y que Reset vuelva al viewport autorado.
   - Que al hacer clic en un tema se abra el panel lateral con su contenido Markdown y referencias, con contraste legible y tablas renderizadas como tablas.
   - Que Escape, el fondo y el botón de cierre restablezcan el foco al nodo activador.
   - Que el seguimiento de progreso funcione y persista en localStorage.
4. Ajustar coordenadas y tamaños según sea necesario hasta lograr una jerarquía visual clara.
5. Confirmar que no quedan copias desplegables de los documentos de clase fuera de `course-inputs/`.
