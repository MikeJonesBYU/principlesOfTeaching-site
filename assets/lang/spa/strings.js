/* Spanish UI strings (window.TDS_STRINGS). Chrome only — skill names and
   descriptions come from skills-data.js / descriptions.js. Section names use the
   manual's official Spanish wording (from the data), not these strings.
   NOTE: the framing copy (indexLead, noteHtml) is a faithful draft translation
   of the author's English vision text — review/adjust wording as desired. */
window.TDS_STRINGS = {
  // Per-language hero image filename (resolved against assets/).
  "graphic": "graphic-spa.png",

  // ---- index.html ----
  "indexTitle": "Enseñanza al estilo de Cristo — Generador de combinaciones de habilidades",
  "diagramAlt": "Principios de la enseñanza de Cristo: un anillo exterior con las leyendas «Amar a quienes enseña» y «Enseñar por el Espíritu» rodea tres círculos superpuestos —«Centrarse en Jesucristo», «Enseñar la doctrina» y «Fomentar el aprendizaje diligente»— que se unen en el centro: «Conversión a Jesucristo».",
  "indexHeading": "Cree una combinación de habilidades de enseñanza al estilo de Cristo",
  "indexLead": "Cada semana, elija una habilidad de cada uno de los cinco principios anteriores y trabaje en ella en su próxima lección. Si cada maestro sigue esta sencilla práctica, mejoraremos en gran manera la conversión a Jesucristo.",
  "btnProblem": "Ayúdeme con un problema de enseñanza",
  "btnPickOwn": "Quiero elegir mis propias habilidades",
  "btnRandom": "O deme una combinación al azar",
  "indexHint": "¿No sabe por dónde empezar? Comience con una dificultad que esté enfrentando, o elija habilidades usted mismo, u obtenga un conjunto al azar.",

  // ---- problems.html (problem-driven page) — NOTE: problem/category TEXT is still
  //      English (single-source problems-data.js); only this chrome is translated. ----
  "problemsTitle": "Encuentre ayuda para una dificultad al enseñar",
  "problemsHeading": "¿Qué está pasando en su clase?",
  "problemsLead": "Encuentre la dificultad que se parezca a lo que está enfrentando y vaya a algunas habilidades de la guía que pueden ayudar. Busque por lo que está pasando o explore por categoría.",
  "problemsSearchPlaceholder": "Busque lo que pasa — «nadie participa», «aburridos», «difícil de amar»…",
  "problemsAll": "Todas las dificultades",
  "problemsCountFmt": "Mostrando {n} de {total} dificultades",
  "problemsSkillsLabel": "Habilidades que pueden ayudar",
  "problemsEmpty": "Ninguna dificultad coincidió con esa búsqueda. Pruebe otras palabras o",
  "problemsEmptyReset": "muestre todas las dificultades",
  "backHome": "← Volver a la página principal",
  "noteHtml": "<strong>¿Le parece mucho trabajar en cinco habilidades?</strong> Elija 2 o 3 &mdash; o incluso solo 1 &mdash; para trabajar. El progreso constante y sostenible importa mucho más que tratar de hacerlo todo a la vez. Como enseñó el Señor: &ldquo;no se requiere que el hombre corra más aprisa de lo que sus fuerzas le permitan&rdquo; (<a href=\"https://www.churchofjesuschrist.org/study/scriptures/bofm/mosiah/4?lang=spa&amp;id=p27#p27\" target=\"_blank\" rel=\"noopener\">Mosíah 4:27</a>).",
  "resultsPlaceholder": "Aquí aparecerán sus cinco habilidades.",
  "btnPermalink": "Deme un enlace permanente a este conjunto de cinco habilidades",
  "permalinkHint": "Copia un enlace que puede guardar y volver a abrir más tarde; muestra la descripción completa de cada habilidad.",
  "navBrowseAll": "Ver la lista completa de todas las habilidades →",

  // ---- select.html ----
  "selectTitle": "Arme su página de habilidades de enseñanza al estilo de Cristo",
  "backToGenerator": "← Volver al generador de combinaciones de habilidades",
  "selectHeading": "Elija una habilidad de cada principio",
  "selectLead": "Elija una habilidad de los cinco principios que aparecen a continuación. Cuando cada principio tenga una selección, presione <strong>Crear mi página</strong> para ver la descripción completa de cada habilidad que eligió &mdash; con un enlace permanente que puede guardar.",
  "statusPick": "Elija una",
  "statusDone": "✓ Seleccionada",
  "progressFmt": "{n} de {total} elegidas",
  "btnMakePage": "Crear mi página",

  // ---- summary.html ----
  "summaryTitle": "Sus habilidades de enseñanza al estilo de Cristo",
  "chooseDifferent": "Elegir otras habilidades",
  "chooseDifferentBack": "← Elegir otras habilidades",
  "summaryHeading": "Sus habilidades de enseñanza al estilo de Cristo",
  "summaryLead": "Una habilidad de cada uno de los cinco principios, con la descripción completa de cada una. Use el botón de abajo para copiar un enlace permanente que puede guardar y volver a abrir cuando quiera.",
  "summaryLoading": "Cargando sus habilidades…",
  "learnMore": "Más información sobre esta habilidad →",
  "descUnavailable": "(La descripción de esta habilidad no está disponible.)",
  "summaryEmptyHtml": "Aún no se ha seleccionado ninguna habilidad. <a href=\"select.html\">Elija una habilidad de cada principio</a> para crear su página.",
  "summaryNotFoundHtml": "No se pudieron encontrar esas habilidades. <a href=\"select.html\">Empiece de nuevo</a>.",
  "navBackGenerator": "Volver al generador",
  "navBrowseAllShort": "Ver todas las habilidades",

  // ---- structure.html ----
  "structureTitle": "Habilidades para el desarrollo del maestro — Estructura",
  "structureHeading": "Habilidades para el desarrollo del maestro",
  "structureSubHtml": "Índice jerárquico &mdash; fuente: <a href=\"https://www.churchofjesuschrist.org/study/manual/teacher-development-skills?lang=spa\" target=\"_blank\" rel=\"noopener\">churchofjesuschrist.org</a>. Cada habilidad enlaza directamente a su sección en el sitio oficial.",
  "expandAll": "Expandir todo",
  "collapseAll": "Contraer todo",
  "skillsCountFmt": "({n} habilidades)",

  // ---- shared (share.js toasts) ----
  "toastCopied": "Enlace copiado al portapapeles. Guárdelo para volver a estas cinco habilidades en cualquier momento.",
  "toastCopyFail": "No se pudo copiar automáticamente. Su enlace:"
};
