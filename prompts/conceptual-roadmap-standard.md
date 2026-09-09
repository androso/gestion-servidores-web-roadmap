# Estándar conceptual para todos los roadmaps

Este documento define la arquitectura pedagógica común de **todos** los roadmaps del repositorio. Su propósito es evitar que las rutas se conviertan en una transcripción del calendario de clases y asegurar que funcionen como mapas de aprendizaje: el orden visual, la numeración y las flechas deben responder principalmente a **dependencias conceptuales**, no a la fecha en que un tema fue impartido.

La reorganización de Ciencia de Datos sirve como implementación de referencia, pero **no como plantilla temática**. Cada asignatura debe derivar su propia topología a partir de sus materiales y de las relaciones entre sus conceptos.

## 1. Principio rector: el roadmap representa conocimiento, no calendario

Una secuencia de clases responde a «¿qué vimos primero?». Un roadmap conceptual debe responder a preguntas distintas:

- ¿qué necesito comprender antes de estudiar este tema?;
- ¿qué concepto explica o justifica al siguiente?;
- ¿qué temas son alternativas y bajo qué condiciones se elige entre ellas?;
- ¿qué parte es fundamento, qué parte es aplicación y qué parte es evaluación?;
- ¿cómo se integra todo al final en una tarea, laboratorio, caso o proyecto?

Por tanto, `Clase 1`, `Semana 3`, `Laboratorio 2` o `Parcial 1` pueden conservarse en referencias, detalles o hitos, pero **no deben determinar por sí solos la estructura del grafo**.

La cronología es evidencia de cobertura académica. La topología es una representación del aprendizaje.

## 2. Fidelidad a las fuentes

La reorganización conceptual cambia la estructura, no autoriza a inventar contenido.

1. Cada `topic` y `subtopic` debe seguir respaldado por `sourceRefs` reales.
2. Los títulos, explicaciones y ejemplos deben respetar el contenido de los materiales del curso.
3. Si dos materiales presentan conceptos en un orden poco pedagógico, se pueden reordenar siempre que no se altere lo que las fuentes afirman.
4. Una relación de prerrequisito puede inferirse para ordenar el mapa cuando es necesaria para comprender el contenido, pero no debe presentarse falsamente como una afirmación textual del profesor.
5. Si una explicación externa corrige, amplía o cuestiona al material de clase, debe distinguirse de lo que la fuente original sostiene. No corregir silenciosamente una fuente.
6. No crear un nodo conceptual nuevo únicamente para llenar un hueco visual. Un nodo de estudio requiere soporte académico real.

## 3. Modelo mental para construir la ruta

Antes de posicionar tarjetas, construir mentalmente un DAG de aprendizaje.

Para cada concepto `B`, preguntar:

> ¿Qué concepto `A` debería poder explicar el estudiante antes de que `B` tenga sentido?

Si la respuesta es clara, `A → B` es una dependencia candidata.

No todas las relaciones temáticas son dependencias. Dos conceptos pueden estar relacionados y aun así ser ramas paralelas. Las flechas deben ser escasas y significativas: una flecha significa «esto prepara lo siguiente», no simplemente «ambos aparecen en la misma unidad».

## 4. Roles pedagógicos de los nodos

### 4.1 Fundamentos

Definiciones, vocabulario, modelos mentales, principios y componentes mínimos que permiten comprender el dominio. Deben aparecer temprano incluso si alguna clase los retomó más tarde.

### 4.2 Conceptos de apoyo

Detalles que amplían un paso principal: propiedades, variantes, mecanismos internos, métricas, comandos, criterios, fórmulas o comparaciones. Normalmente son `subtopic` y se ubican lateralmente.

### 4.3 Decisiones conceptuales

Cuando el curso enseña alternativas, el mapa debe explicar **por qué o cuándo** se elige una rama, no convertir las alternativas en una cadena artificial.

Ejemplos generales:

- elegir una estructura de datos según acceso, mutabilidad u operaciones;
- elegir una estrategia de despliegue según plataforma y restricciones;
- elegir un método numérico según las propiedades del problema;
- elegir una arquitectura según drivers y atributos de calidad;
- elegir un modelo estadístico según la variable respuesta.

Cuando corresponda, introducir un nodo de decisión respaldado por los materiales y desplegar ramas paralelas que después convergen.

### 4.4 Aplicaciones y laboratorios

Los ejercicios concretos deben aparecer después de los conceptos que utilizan. Un laboratorio es evidencia de dominio, no el fundamento teórico del siguiente concepto salvo que el curso realmente lo use como prerrequisito.

### 4.5 Evaluaciones y checkpoints

Un parcial, quiz, entrega o checkpoint es un **hito de evaluación**, no conocimiento en sí mismo.

Regla por defecto:

- no usar un examen como puente obligatorio entre dos conceptos;
- colocarlo al final del bloque que evalúa o como hito lateral;
- conectar hacia él desde los conceptos principales que cubre cuando sea útil;
- no hacer que conceptos posteriores «dependan» del examen únicamente porque ocurrió antes en el calendario.

### 4.6 Integración

El final de la ruta debe mostrar cómo los conceptos se combinan en una capacidad observable: resolver un caso, diseñar una solución, implementar un sistema, analizar un dataset, desplegar un servicio, justificar decisiones o completar un proyecto.

## 5. Las secciones deben expresar fases conceptuales

Las `section` no deben limitarse a copiar `Semana X` o `Clase Y`.

Los nombres de sección deben describir la función cognitiva del bloque, por ejemplo:

- Fundamentos y vocabulario;
- Representación y estructuras;
- Diseño y toma de decisiones;
- Implementación;
- Evaluación y diagnóstico;
- Seguridad y operación;
- Aplicación e integración.

Estos son ejemplos, **no una lista obligatoria**. Cada asignatura debe producir sus propias fases a partir de su contenido.

Una sección puede mencionar las clases que la respaldan, pero el nombre principal debe explicar qué aprende el estudiante.

## 6. Orden conceptual frente a orden cronológico

Al migrar un roadmap existente:

1. Inventariar todos los `topic` y `subtopic` actuales.
2. Ignorar temporalmente sus números y coordenadas.
3. Clasificarlos como fundamento, apoyo, decisión, rama, aplicación, evaluación o integración.
4. Identificar dependencias reales.
5. Construir la columna vertebral conceptual.
6. Colocar apoyos laterales junto al concepto que explican.
7. Separar alternativas en ramas cuando no exista una dependencia real entre ellas.
8. Mover laboratorios y casos después de los conceptos que utilizan.
9. Mover exámenes/checkpoints al cierre del alcance que evalúan.
10. Solo entonces volver a numerar y diagramar.

La pregunta de control es:

> Si un estudiante nunca hubiera visto el horario del curso, ¿el recorrido seguiría teniendo sentido?

Si la respuesta es no, el mapa probablemente sigue demasiado acoplado a la cronología.

## 7. Numeración

`data.order` representa orden de estudio.

- Usar `01`, `02`, `03`… para una ruta lineal.
- Usar sufijos como `20a`, `20b` solo para ramas paralelas reales.
- Evitar saltos accidentales de numeración.
- Evitar que la numeración de secciones contradiga su posición visual.
- Una flecha entre nodos numerados siempre debe avanzar en el orden permitido por el validador.

La numeración no debe intentar conservar números históricos si estos perjudican la lectura conceptual.

## 8. Columna vertebral, apoyos y ramas

La topología preferida sigue siendo la **columna vertebral con apoyos laterales**:

- la izquierda responde «qué estudio después»;
- la derecha explica «qué necesito entender dentro de este paso»;
- las ramas muestran alternativas o especializaciones;
- las convergencias muestran capacidades compartidas.

No crear una cadena lineal únicamente para evitar una bifurcación. Si dos tecnologías, metodologías, modelos o estructuras son alternativas, representarlas como alternativas.

Tampoco crear bifurcaciones decorativas: una rama debe tener un significado pedagógico claro.

## 9. Descripciones del roadmap

La propiedad `description` debe describir el **arco conceptual actual** de la ruta y mantenerse sincronizada con su estructura.

Evitar descripciones del tipo:

> Clases 1 a 8: tema A, tema B, tema C.

Preferir:

> Ruta conceptual desde los fundamentos de A, pasando por B y los criterios para elegir C, hasta su aplicación e integración.

Si se agregan nuevos bloques al roadmap, actualizar también la descripción.

## 10. Qué hacer con ejemplos concretos

Los ejemplos deben reforzar un concepto que ya fue presentado.

Orden recomendado:

`concepto → mecanismo → criterio/métrica → ejemplo → diagnóstico/reflexión`

No usar accidentalmente:

`ejemplo → concepto no explicado → otro ejemplo → teoría`

salvo que el material esté diseñado explícitamente como aprendizaje inductivo y la ruta quiera conservar esa metodología.

## 11. Qué hacer con errores, advertencias y límites

Advertencias metodológicas importantes deben ubicarse junto al concepto al que limitan.

Ejemplos generales:

- supuestos de un modelo junto a ese modelo;
- riesgos de seguridad junto al despliegue/operación correspondiente;
- complejidad o trade-offs junto a la estructura o algoritmo;
- condiciones de convergencia junto al método numérico;
- limitaciones de una arquitectura junto a sus drivers y decisiones.

No acumular todas las advertencias al final si el estudiante necesita conocerlas antes de aplicar la técnica.

## 12. Aplicación a disciplinas distintas

El estándar es deliberadamente independiente de la materia.

### Cursos de programación y estructuras

Priorizar modelo mental → representación → operaciones → criterios de elección → implementación → práctica.

### Cursos de infraestructura y servidores

Priorizar arquitectura de petición/servicio → componentes → decisiones de plataforma → configuración/despliegue → seguridad → operación → integración.

### Cursos de ingeniería de software y arquitectura

Priorizar problema/contexto → stakeholders/drivers → proceso → alternativas → documentación/modelado → evaluación de decisiones → entrega.

### Cursos de seguridad

Priorizar activos/objetivos → riesgos/controles → marcos y gobernanza → implementación/evidencia → auditoría/evaluación.

### Cursos matemáticos y numéricos

Priorizar problema → fundamento matemático → condiciones/supuestos → algoritmo → error/convergencia → comparación → aplicación.

### Cursos de datos y estadística

Priorizar problema → datos/calidad → exploración → evaluación → selección de familia/modelo → diagnóstico → aplicación reproducible.

Estas secuencias son heurísticas. Las fuentes del curso siguen mandando.

## 13. Migración de los roadmaps existentes del repositorio

Este estándar aplica a todos los roadmaps registrados actualmente en `roadmaps/index.ts`:

- `gestion-servidores-web`;
- `ciencia-de-datos`;
- `estructura-de-datos`;
- `programacion-orientada-a-eventos`;
- `diseno-arquitectura-de-sistemas`;
- `aplicacion-tecnicas-ingenieria-software`;
- `desarrollo-aplicaciones-moviles-basicas`;
- `gestion-seguridad-sistemas-informaticos`;
- `metodos-numericos`.

También aplica automáticamente a cualquier curso nuevo que se incorpore al registro.

La migración de una asignatura no debe copiar mecánicamente la estructura de otra. **Ciencia de Datos es un ejemplo del criterio, no un molde de seis secciones para todo el repositorio.**

## 14. Checklist de revisión conceptual

Antes de considerar terminado cualquier roadmap, comprobar:

- [ ] La ruta tiene una narrativa conceptual que puede explicarse en una frase.
- [ ] Los fundamentos aparecen antes de las técnicas que dependen de ellos.
- [ ] Las secciones expresan fases de aprendizaje, no solo fechas de clase.
- [ ] Las flechas representan dependencia o progresión pedagógica real.
- [ ] Las alternativas se muestran como ramas cuando corresponde.
- [ ] Los ejemplos aparecen después de los conceptos que aplican.
- [ ] Los checkpoints no funcionan como falsos prerrequisitos.
- [ ] La numeración es legible y coherente con el grafo.
- [ ] La descripción del roadmap coincide con su contenido actual.
- [ ] Todos los nodos conservan trazabilidad hacia los materiales.
- [ ] No se inventó contenido para mejorar la diagramación.
- [ ] La ruta sigue teniendo sentido aunque se oculten las referencias a semanas y clases.
- [ ] El cierre integra conocimientos en una capacidad observable.

## 15. Criterio de éxito

Un roadmap bien organizado no debe sentirse como una tabla de contenidos dibujada.

Debe permitir que un estudiante explique el curso como una cadena de razonamiento:

> parto de los fundamentos → comprendo las piezas y sus relaciones → aprendo los criterios para decidir → practico las técnicas → evalúo sus resultados y límites → integro todo en una solución o evidencia de dominio.

La forma concreta de esa cadena cambia por asignatura. El estándar común es que el **conocimiento determine la ruta y el calendario solo documente de dónde provino**.
