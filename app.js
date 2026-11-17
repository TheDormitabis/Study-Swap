/* Study Swap — SPA educativa (vanilla JS). Los datos se guardan en localStorage. */
(() => {
  'use strict';

  const STORAGE_KEY = 'studySwapState_v1';
  const defaults = {
    name: 'Jhonny', grade: '6.º grado', favorites: 'Matemática, Ciencia', style: 'Visual', studyTime: '30 min/día', goal: 'Seguir aprendiendo y mejorar cada día.', avatar: '🧑🏻‍🎓',
    points: 1250, level: 12, streak: 7, dailyProgress: 2, overallProgress: 72, completedTopics: 18,
    dark: false, language: 'Español', reminder: true, sound: true, likedVideo: false, savedVideo: false,
    errors: [], notificationsRead: false, completedTopicIds: ['fractions-intro']
  };
  let state = loadState();
  let currentPage = 'home';
  let selectedSubject = 'Matemática';
  let selectedTopic = 'Fracciones';
  let subjectTab = 'topics';
  let badgeTab = 'all';
  let noticeTab = 'all';
  let quizMode = 'normal';
  let quizQuestions = [];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswers = [];
  let quizSelected = null;
  let quizLocked = false;
  let videoTimer = null;
  let videoSeconds = 0;
  let activeError = null;
  let toastTimeout = null;

  const subjects = [
    { name: 'Matemática', icon: '🧮', color: '#efe8ff', accent: '#8764df', progress: 80, topics: ['Números y operaciones', 'Fracciones', 'Geometría', 'Medidas', 'Estadística y probabilidad'] },
    { name: 'Comunicación', icon: '📖', color: '#ffeaf3', accent: '#df7ba8', progress: 60, topics: ['Comprensión lectora', 'Tipos de textos', 'Gramática', 'Ortografía'] },
    { name: 'Ciencia y Tecnología', icon: '⚛️', color: '#e6f7f2', accent: '#52b99a', progress: 70, topics: ['Los seres vivos', 'Materia y energía', 'El sistema solar', 'Nuestro planeta'] },
    { name: 'Historia', icon: '🏛️', color: '#fff0dd', accent: '#dba15f', progress: 55, topics: ['Primeras civilizaciones', 'Culturas del Perú', 'Edad Media', 'Historia contemporánea'] },
    { name: 'Inglés', icon: '💬', color: '#eeedff', accent: '#8372dd', progress: 40, topics: ['Greetings', 'Everyday vocabulary', 'Present simple', 'My family'] },
    { name: 'Arte', icon: '🎨', color: '#fff0e7', accent: '#e99566', progress: 35, topics: ['Colores y formas', 'Dibujo creativo', 'Texturas', 'Expresión artística'] },
    { name: 'Educación Física', icon: '🏋️', color: '#e8f1ff', accent: '#6194d4', progress: 20, topics: ['Movimiento y salud', 'Coordinación', 'Deportes en equipo', 'Hábitos saludables'] }
  ];

  const questionBank = [
    { id: 'q-fraction', subject: 'Matemática', topic: 'Fracciones', text: '¿Qué fracción representa la parte sombreada?', visual: 'pie', answers: ['1/4', '2/4', '3/4', '4/4'], correct: 2, explanation: 'El círculo está dividido en cuatro partes iguales y tres están sombreadas. Por eso representa 3/4.' },
    { id: 'q-numerator', subject: 'Matemática', topic: 'Fracciones', text: 'En la fracción 2/5, ¿cuál es el denominador?', visual: 'fraction', fraction: '2/5', answers: ['2', '5', '7', '10'], correct: 1, explanation: 'El denominador es el número de abajo. Indica en cuántas partes iguales se divide el todo.' },
    { id: 'q-add', subject: 'Matemática', topic: 'Números y operaciones', text: '¿Cuánto es 24 ÷ 6?', visual: 'none', answers: ['3', '4', '6', '8'], correct: 1, explanation: '24 dividido entre 6 es 4, porque 6 × 4 = 24.' },
    { id: 'q-equivalent', subject: 'Matemática', topic: 'Fracciones', text: '¿Cuál de estas fracciones es equivalente a 1/2?', visual: 'fraction', fraction: '1/2', answers: ['1/3', '2/3', '2/4', '3/4'], correct: 2, explanation: '2/4 equivale a 1/2: ambas fracciones representan la mitad de una unidad.' },
    { id: 'q-perimeter', subject: 'Matemática', topic: 'Geometría', text: 'Un cuadrado tiene lados de 3 cm. ¿Cuál es su perímetro?', visual: 'square', answers: ['6 cm', '9 cm', '12 cm', '15 cm'], correct: 2, explanation: 'El perímetro suma sus cuatro lados: 3 + 3 + 3 + 3 = 12 cm.' }
  ];

  const badges = [
    { title: 'Primer paso', icon: '⭐', desc: 'Crea tu cuenta y empieza a aprender.', earned: true },
    { title: 'Explorador', icon: '🧭', desc: 'Visita 5 temas diferentes.', earned: true },
    { title: 'Estrella', icon: '🌟', desc: 'Resuelve 10 preguntas.', earned: true },
    { title: 'Aprendiz', icon: '💠', desc: 'Completa 3 videos educativos.', earned: false },
    { title: 'Constante', icon: '💗', desc: 'Mantén una racha de 7 días.', earned: true },
    { title: 'Maestro', icon: '🏅', desc: 'Completa un curso entero.', earned: false },
    { title: 'Lector', icon: '📚', desc: 'Lee 10 lecciones.', earned: false },
    { title: 'Genio', icon: '🧠', desc: 'Consigue 100 respuestas correctas.', earned: false }
  ];

  const notices = [
    { icon: '🏆', title: '¡Nuevo logro!', body: 'Has obtenido la insignia “Constante”.', time: 'Hace 5 min', type: 'achievement' },
    { icon: '🔥', title: 'Reto diario', body: 'Te queda una actividad para completar tu reto.', time: 'Hace 1 hora', type: 'system' },
    { icon: '▶️', title: 'Nuevo video', body: 'Se ha agregado un nuevo video en Matemática.', time: 'Hace 3 horas', type: 'system' },
    { icon: '💡', title: 'Consejo de estudio', body: 'Recuerda repasar tus errores para mejorar.', time: 'Hace 5 horas', type: 'system' },
    { icon: '🌟', title: '¡Felicidades!', body: 'Has completado tu primera semana de estudio.', time: 'Ayer', type: 'achievement' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...saved };
    } catch (error) {
      console.warn('No se pudo leer el progreso guardado:', error);
      return { ...defaults };
    }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) { console.warn('No se pudo guardar el progreso:', error); }
  }
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), 2400);
  }
  function go(page) {
    if (!$('#page-' + page)) page = 'home';
    currentPage = page;
    $$('.page').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    $$('.nav-item, .mobile-nav-item').forEach(el => el.classList.toggle('active', el.dataset.nav === page || (page === 'subject' && el.dataset.nav === 'subjects') || (page === 'lesson' && el.dataset.nav === 'subjects') || (page === 'challenge' && el.dataset.nav === 'home')));
    const labels = { home: 'Tu espacio de aprendizaje', profile: 'Tu perfil', subjects: 'Explora tus materias', subject: selectedSubject, lesson: selectedTopic, video: 'Video educativo', quiz: 'Hora de practicar', challenge: 'Tu reto diario', results: 'Tus resultados', progress: 'Tu progreso', badges: 'Tus insignias', errors: 'Repaso de errores', notifications: 'Notificaciones', settings: 'Configuración', logout: 'Cerrar sesión' };
    $('#breadcrumb').innerHTML = `${escapeHTML(labels[page] || 'Study Swap')} <span>✦</span>`;
    $('#sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'profile') renderProfile();
    if (page === 'progress') renderProgress();
    if (page === 'badges') renderBadges();
    if (page === 'errors') renderErrors();
    if (page === 'notifications') renderNotifications();
    if (page === 'settings') syncSettings();
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function formatNumber(value) { return Number(value || 0).toLocaleString('en-US'); }
  function updateGlobalUI() {
    $('#welcomeName').textContent = state.name;
    $('#sideName').textContent = state.name;
    $('#sideAvatar').textContent = state.avatar;
    $('#topAvatar').textContent = state.avatar;
    $('#profileAvatar').textContent = state.avatar;
    $('#topStreak').textContent = state.streak;
    $('#homeLevel').textContent = state.level;
    $('#homePoints').textContent = formatNumber(state.points);
    $('#homeStreak').textContent = `${state.streak} 🔥`;
    $('#dailyProgress').textContent = `${Math.min(state.dailyProgress, 5)}/5`;
    $('#dailyBar').style.width = `${Math.min(state.dailyProgress, 5) * 20}%`;
    $('#taskQuizCount').textContent = `${Math.min(state.dailyProgress, 5)}/5`;
    $('#taskQuizCheck').classList.toggle('done', state.dailyProgress >= 5);
    $('#taskQuizCheck').textContent = state.dailyProgress >= 5 ? '✓' : '○';
    $('#profileName').textContent = state.name;
    $('#profileGrade').textContent = `Estudiante de ${state.grade}`;
    $('#profileLevel').textContent = state.level;
    $('#profilePoints').textContent = formatNumber(state.points);
    $('#profileStreak').textContent = `${state.streak} días`;
    $('#infoGrade').textContent = state.grade;
    $('#infoFav').textContent = state.favorites;
    $('#infoStyle').textContent = state.style;
    $('#infoTime').textContent = state.studyTime;
    $('#goalText').textContent = state.goal;
    $('#overallPercent').textContent = `${state.overallProgress}%`;
    $('#completedTopics').textContent = `${state.completedTopics} de 25 temas`;
    $('#progressLevel').textContent = state.level;
    $('#badgeEarned').textContent = badges.filter(b => b.earned).length;
    document.body.classList.toggle('dark', !!state.dark);
    $('#darkToggle').checked = !!state.dark;
    $('#reminderToggle').checked = !!state.reminder;
    $('#soundToggle').checked = !!state.sound;
    $('#languageSelect').value = state.language;
  }

  function renderSubjects() {
    $('#subjectsGrid').innerHTML = subjects.map(subject => `
      <button class="subject-card" data-subject="${escapeHTML(subject.name)}">
        <span class="subject-icon" style="background:${subject.color}">${subject.icon}</span>
        <span class="subject-copy"><strong>${escapeHTML(subject.name)}</strong><small>Explora sus temas y actividades</small><span class="subject-progress-line"><span style="width:${subject.progress}%;background:${subject.accent}"></span></span></span>
        <span class="subject-arrow">›</span>
      </button>`).join('');
  }
  function openSubject(name) {
    selectedSubject = name;
    const subject = subjects.find(s => s.name === name) || subjects[0];
    $('#subjectIcon').textContent = subject.icon;
    $('#subjectTitle').textContent = subject.name;
    $('#subjectPercent').textContent = `${subject.progress}%`;
    subjectTab = 'topics';
    $$('#subjectTabs .tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'topics'));
    $('#subjectTopics').classList.remove('hidden');
    $('#subjectLevels').classList.add('hidden');
    $('#subjectTopics').innerHTML = subject.topics.map((topic, index) => {
      const progress = name === 'Matemática' ? [3, 2, 1, 0, 0][index] || 0 : Math.max(0, Math.min(4, Math.round(subject.progress / 20) - (index % 2)));
      const id = topicId(name, topic);
      const completed = state.completedTopicIds.includes(id);
      return `<button class="topic-row" data-topic="${escapeHTML(topic)}"><span class="topic-number">${index + 1}</span><span class="topic-info"><strong>${escapeHTML(topic)}</strong><small>${completed ? 'Lección completada' : 'Aprende con ejemplos y práctica'}</small></span><span class="topic-progress"><span class="progress-track"><span style="width:${Math.min(100, progress * 20 + (completed ? 20 : 0))}%"></span></span><strong>${completed ? 5 : progress}/5</strong></span><span class="topic-arrow">›</span></button>`;
    }).join('');
    $('#subjectLevels').innerHTML = [
      ['🌱', 'Nivel 1 · Inicial', 'Conceptos y fundamentos'], ['🌿', 'Nivel 2 · En progreso', 'Practica nuevos desafíos'], ['🌳', 'Nivel 3 · Avanzado', 'Domina cada tema']
    ].map(level => `<article class="level-card"><span>${level[0]}</span><strong>${level[1]}</strong><small>${level[2]}</small></article>`).join('');
    go('subject');
  }
  function topicId(subject, topic) { return `${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; }
  function openLesson(topic) {
    selectedTopic = topic;
    $('#lessonTitle').textContent = topic;
    $('#lessonQuestion').textContent = topic === 'Fracciones' ? '¿Qué son las fracciones?' : `¿Qué aprenderemos sobre ${topic.toLowerCase()}?`;
    $('#lessonCategory').textContent = `${selectedSubject.toUpperCase()} · TEMA`;
    go('lesson');
  }

  function renderProfile() { updateGlobalUI(); }
  function renderProgress() {
    const values = subjects.map(s => ({ ...s }));
    $('#progressSubjectList').innerHTML = values.map(subject => `
      <div class="progress-subject"><span class="progress-subject-icon" style="background:${subject.color}">${subject.icon}</span><strong>${escapeHTML(subject.name)}</strong><small>${subject.progress}%</small><span class="progress-track"><span style="width:${subject.progress}%;background:${subject.accent}"></span></span></div>`).join('');
  }
  function renderBadges() {
    const filtered = badges.filter(b => badgeTab === 'all' || (badgeTab === 'earned' ? b.earned : !b.earned));
    $('#badgesGrid').innerHTML = filtered.map(b => `<article class="badge-card ${b.earned ? '' : 'locked'}"><div class="badge-art">${b.earned ? b.icon : '🔒'}</div><strong>${escapeHTML(b.title)}</strong><p>${escapeHTML(b.desc)}</p><span class="badge-status">${b.earned ? '✓ Obtenida' : 'Por lograr'}</span></article>`).join('');
  }
  function renderErrors() {
    const errors = state.errors || [];
    $('#errorCount').textContent = `${errors.length} ${errors.length === 1 ? 'pendiente' : 'pendientes'}`;
    $('#taskErrorCount').textContent = errors.length ? `0/${Math.min(1, errors.length)}` : '0/1';
    if (!errors.length) {
      $('#errorList').innerHTML = '<div class="empty-state"><span>🌟</span><strong>¡Todo en orden!</strong><p>Aún no tienes preguntas para repasar. Sigue practicando.</p></div>';
      return;
    }
    $('#errorList').innerHTML = errors.map((err, i) => `<article class="error-item"><span class="error-num">${i + 1}</span><div class="error-copy"><strong>${escapeHTML(err.topic || 'Pregunta')}</strong><small>${escapeHTML(err.text)}</small></div><button data-review-error="${i}">Revisar</button></article>`).join('');
  }
  function renderNotifications() {
    const filtered = notices.filter(n => noticeTab === 'all' || n.type === noticeTab);
    $('#notificationList').innerHTML = filtered.map((n, i) => `<article class="notification-item ${!state.notificationsRead && i === 0 ? 'unread' : ''}"><span class="notice-icon">${n.icon}</span><div class="notice-copy"><strong>${escapeHTML(n.title)}</strong><p>${escapeHTML(n.body)}</p></div><span class="notice-time">${n.time}</span></article>`).join('');
  }
  function syncSettings() {
    $('#darkToggle').checked = !!state.dark;
    $('#reminderToggle').checked = !!state.reminder;
    $('#soundToggle').checked = !!state.sound;
    $('#languageSelect').value = state.language;
  }

  function beginQuiz(mode = 'normal', questionSet = questionBank) {
    quizMode = mode;
    quizQuestions = [...questionSet];
    quizIndex = 0;
    quizScore = 0;
    quizAnswers = [];
    quizSelected = null;
    quizLocked = false;
    $('#quizType').textContent = mode === 'daily' ? 'RETO DIARIO · MATEMÁTICA' : mode === 'review' ? 'REPASO · TUS ERRORES' : 'PRÁCTICA · FRACCIONES';
    renderQuizQuestion();
    go('quiz');
  }
  function renderQuestionVisual(question) {
    if (question.visual === 'pie') return '<div class="quiz-pie"><span class="pie-shade"></span><span class="pie-shade second"></span><span class="pie-shade third"></span></div>';
    if (question.visual === 'fraction') return `<div style="display:flex;align-items:center;gap:20px;font-family:Nunito;font-size:28px;color:var(--purple)"><strong>${escapeHTML(question.fraction)}</strong><span style="font-size:36px">＝</span><span style="font-size:14px;color:var(--muted)">Observa y piensa ✦</span></div>`;
    if (question.visual === 'square') return '<div style="width:90px;height:90px;border:3px solid #8764df;background:repeating-linear-gradient(90deg,#efe8ff 0 20px,#fff 20px 22px);display:grid;place-items:center;color:#7754d6;font-weight:900">3 cm</div>';
    return '<div style="font-size:34px;color:var(--purple);font-family:Nunito;font-weight:900">✦　?　✦</div>';
  }
  function renderQuizQuestion() {
    const question = quizQuestions[quizIndex];
    if (!question) return finishQuiz();
    quizSelected = null;
    quizLocked = false;
    $('#quizBar').style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
    $('#quizCounter').textContent = `${quizIndex + 1} / ${quizQuestions.length}`;
    $('#questionNumber').textContent = String(quizIndex + 1).padStart(2, '0');
    $('#questionText').textContent = question.text;
    $('#questionVisual').innerHTML = renderQuestionVisual(question);
    $('#answerList').innerHTML = question.answers.map((answer, i) => `<button class="answer-option" data-answer="${i}"><span class="answer-letter">${'ABCD'[i]}</span><span>${escapeHTML(answer)}</span></button>`).join('');
    $('#quizFeedback').classList.add('hidden');
    $('#quizFeedback').classList.remove('incorrect-feedback');
    $('#quizNext').disabled = true;
    $('#quizNext').innerHTML = quizIndex === quizQuestions.length - 1 ? 'Ver resultados <span>→</span>' : 'Siguiente pregunta <span>→</span>';
  }
  function chooseAnswer(index) {
    if (quizLocked) return;
    quizLocked = true;
    quizSelected = index;
    const question = quizQuestions[quizIndex];
    const correct = index === question.correct;
    if (correct) quizScore++;
    quizAnswers.push({ question, selected: index, correct });
    $$('#answerList .answer-option').forEach((button, i) => {
      button.disabled = true;
      if (i === question.correct) button.classList.add('correct');
      else if (i === index) button.classList.add('incorrect');
      if (i === index && correct) button.classList.add('selected');
    });
    const feedback = $('#quizFeedback');
    feedback.classList.remove('hidden');
    feedback.classList.toggle('incorrect-feedback', !correct);
    $('#feedbackIcon').textContent = correct ? '✓' : '↻';
    $('#feedbackTitle').textContent = correct ? '¡Correcto!' : '¡Buen intento!';
    $('#feedbackText').textContent = correct ? question.explanation : `La respuesta correcta es ${question.answers[question.correct]}. ${question.explanation}`;
    $('#quizNext').disabled = false;
    $('#quizNext').innerHTML = quizIndex === quizQuestions.length - 1 ? 'Ver resultados <span>→</span>' : 'Siguiente pregunta <span>→</span>';
  }
  function nextQuizStep() {
    if (!quizLocked) return;
    quizIndex++;
    if (quizIndex >= quizQuestions.length) finishQuiz();
    else renderQuizQuestion();
  }
  function finishQuiz() {
    const total = quizQuestions.length || 1;
    const percent = Math.round((quizScore / total) * 100);
    const dailyCompleted = quizMode === 'daily' && state.dailyProgress + quizQuestions.length >= 5;
    const pointsEarned = quizMode === 'review' ? 0 : quizScore * 10 + (dailyCompleted ? 50 : 0);
    state.points += pointsEarned;
    state.dailyProgress = Math.min(5, state.dailyProgress + (quizMode === 'daily' ? quizQuestions.length : 0));
    if (quizMode !== 'review') {
      quizAnswers.filter(a => !a.correct).forEach(a => {
        state.errors.unshift({ id: a.question.id, subject: a.question.subject, topic: a.question.topic, text: a.question.text, answers: a.question.answers, correct: a.question.correct, explanation: a.question.explanation });
      });
      state.errors = state.errors.slice(0, 20);
      if (percent >= 60) {
        state.overallProgress = Math.min(100, state.overallProgress + 1);
        state.completedTopics = Math.min(25, state.completedTopics + (percent === 100 ? 1 : 0));
      }
      saveState();
    }
    $('#resultScore').textContent = `${quizScore}/${total}`;
    $('#resultPercent').textContent = percent >= 80 ? '¡Excelente!' : percent >= 60 ? '¡Muy bien!' : '¡Sigue practicando!';
    $('#resultSummary').textContent = `Has completado ${quizScore} de ${total} preguntas (${percent}%).`;
    $('#rewardPoints').textContent = `+${pointsEarned}`;
    $('#scoreRing').style.background = `conic-gradient(#56c99d 0 ${percent}%,#e8e3f1 ${percent}% 100%)`;
    updateGlobalUI();
    go('results');
  }
  function reviewAllAnswers() {
    const lines = quizAnswers.map((a, i) => `${i + 1}. ${a.question.text}\nTu respuesta: ${a.question.answers[a.selected]}\nRespuesta correcta: ${a.question.answers[a.question.correct]}\n${a.correct ? '✓ Correcta' : '✗ Para repasar'}`).join('\n\n');
    showModal(`<h2>Revisión de respuestas</h2><p>Este es el resumen de tu práctica.</p><div class="review-summary">${quizAnswers.map((a, i) => `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><strong style="font-size:11px">${i + 1}. ${escapeHTML(a.question.text)}</strong><p style="margin:4px 0 0">Tu respuesta: <b>${escapeHTML(a.question.answers[a.selected])}</b> ${a.correct ? '✓' : '✗'}<br>Correcta: <b>${escapeHTML(a.question.answers[a.question.correct])}</b></p></div>`).join('')}</div><div class="modal-actions"><button class="button button-primary" id="closeReview">Cerrar</button></div>`);
    $('#closeReview').addEventListener('click', closeModal);
  }
  function showModal(html) {
    $('#modalContent').innerHTML = html;
    $('#modalBackdrop').classList.remove('hidden');
  }
  function closeModal() { $('#modalBackdrop').classList.add('hidden'); }
  function editProfileModal() {
    showModal(`<h2 id="modalTitle">Editar perfil</h2><p>Actualiza tus datos de estudiante.</p><form id="profileForm" class="form-grid">
      <div class="form-field"><label for="editName">Nombre</label><input id="editName" maxlength="30" required value="${escapeHTML(state.name)}"></div>
      <div class="form-field"><label for="editGrade">Grado escolar</label><select id="editGrade"><option ${state.grade === '1.º grado' ? 'selected' : ''}>1.º grado</option><option ${state.grade === '2.º grado' ? 'selected' : ''}>2.º grado</option><option ${state.grade === '3.º grado' ? 'selected' : ''}>3.º grado</option><option ${state.grade === '4.º grado' ? 'selected' : ''}>4.º grado</option><option ${state.grade === '5.º grado' ? 'selected' : ''}>5.º grado</option><option ${state.grade === '6.º grado' ? 'selected' : ''}>6.º grado</option></select></div>
      <div class="form-field"><label for="editFavorites">Materias favoritas</label><input id="editFavorites" value="${escapeHTML(state.favorites)}" maxlength="60"></div>
      <div class="form-field"><label for="editStyle">Estilo de aprendizaje</label><select id="editStyle"><option ${state.style === 'Visual' ? 'selected' : ''}>Visual</option><option ${state.style === 'Auditivo' ? 'selected' : ''}>Auditivo</option><option ${state.style === 'Práctico' ? 'selected' : ''}>Práctico</option><option ${state.style === 'Lectura y escritura' ? 'selected' : ''}>Lectura y escritura</option></select></div>
      <div class="form-field"><label for="editTime">Tiempo de estudio diario</label><select id="editTime"><option ${state.studyTime === '15 min/día' ? 'selected' : ''}>15 min/día</option><option ${state.studyTime === '30 min/día' ? 'selected' : ''}>30 min/día</option><option ${state.studyTime === '45 min/día' ? 'selected' : ''}>45 min/día</option><option ${state.studyTime === '60 min/día' ? 'selected' : ''}>60 min/día</option></select></div>
      <div class="form-field"><label for="editGoal">Mi meta</label><textarea id="editGoal" maxlength="110">${escapeHTML(state.goal)}</textarea></div>
      <div class="modal-actions"><button type="button" class="button button-secondary" id="cancelProfile">Cancelar</button><button class="button button-primary" type="submit">Guardar cambios</button></div></form>`);
    $('#cancelProfile').addEventListener('click', closeModal);
    $('#profileForm').addEventListener('submit', event => {
      event.preventDefault();
      state.name = $('#editName').value.trim() || state.name;
      state.grade = $('#editGrade').value;
      state.favorites = $('#editFavorites').value.trim() || state.favorites;
      state.style = $('#editStyle').value;
      state.studyTime = $('#editTime').value;
      state.goal = $('#editGoal').value.trim() || state.goal;
      saveState(); updateGlobalUI(); closeModal(); toast('Perfil actualizado correctamente.');
    });
  }
  function handleAction(action) {
    switch (action) {
      case 'edit-profile': editProfileModal(); break;
      case 'daily': { const remaining = 5 - state.dailyProgress; if (remaining <= 0) { toast('¡Reto diario completado! Vuelve mañana para una nueva misión.'); go('challenge'); break; } beginQuiz('daily', questionBank.slice(0, remaining).map((q, i) => ({ ...q, id: `daily-${q.id}-${i}` }))); break; }
      case 'continue': openSubject('Matemática'); openLesson('Fracciones'); break;
      case 'open-video': go('video'); break;
      case 'start-quiz': beginQuiz('normal'); break;
      case 'lesson-next':
        if (!state.completedTopicIds.includes(topicId(selectedSubject, selectedTopic))) state.completedTopicIds.push(topicId(selectedSubject, selectedTopic));
        saveState(); go('video'); break;
      case 'back-subject': go('subject'); break;
      case 'back-lesson': go('lesson'); break;
      case 'favorite-video': $('#videoHeart').classList.toggle('selected'); toast('Añadido a tus favoritos.'); break;
      case 'like-video': state.likedVideo = !state.likedVideo; saveState(); $('#likeButton').classList.toggle('selected', state.likedVideo); toast(state.likedVideo ? '¡Gracias por tu apoyo!' : 'Ya no te gusta este video.'); break;
      case 'save-video': state.savedVideo = !state.savedVideo; saveState(); $('#saveButton').classList.toggle('selected', state.savedVideo); toast(state.savedVideo ? 'Video guardado para después.' : 'Video eliminado de guardados.'); break;
      case 'share-video': shareVideo(); break;
      case 'video-frac': selectVideo('Tipos de fracciones'); break;
      case 'video-sum': selectVideo('Suma de fracciones'); break;
      case 'video-comp': selectVideo('Compara fracciones'); break;
      case 'exit-quiz': showModal('<h2>¿Salir de la práctica?</h2><p>Tu avance en este quiz no se guardará. Puedes continuar aprendiendo en otra sección.</p><div class="modal-actions"><button class="button button-secondary" id="stayQuiz">Seguir aquí</button><button class="button button-primary" id="leaveQuiz">Salir</button></div>'); $('#stayQuiz').addEventListener('click', closeModal); $('#leaveQuiz').addEventListener('click', () => { closeModal(); go(quizMode === 'daily' ? 'challenge' : 'subject'); }); break;
      case 'review-answers': reviewAllAnswers(); break;
      case 'next-topic': openSubject('Matemática'); openLesson('Geometría'); break;
      case 'mark-notifications': state.notificationsRead = true; saveState(); renderNotifications(); toast('Notificaciones marcadas como leídas.'); break;
      case 'confirm-logout': state = { ...defaults, name: state.name, avatar: state.avatar }; saveState(); updateGlobalUI(); go('home'); toast('Sesión de demostración cerrada.'); break;
      case 'password': showModal('<h2>Cambiar contraseña</h2><p>Esta demostración no está conectada a un servicio de autenticación. En producción, esta acción se conectaría a tu proveedor de cuentas.</p><div class="modal-actions"><button class="button button-primary" id="closeInfo">Entendido</button></div>'); $('#closeInfo').addEventListener('click', closeModal); break;
      case 'notification-prefs': showModal('<h2>Preferencias de notificaciones</h2><p>Activa o desactiva los avisos de retos y logros desde esta sección de configuración.</p><div class="setting-row"><span>Recordatorios de estudio</span><label class="switch"><input id="modalReminder" type="checkbox" '+(state.reminder?'checked':'')+'><span></span></label></div><div class="setting-row"><span>Sonidos y avisos</span><label class="switch"><input id="modalSound" type="checkbox" '+(state.sound?'checked':'')+'><span></span></label></div><div class="modal-actions"><button class="button button-primary" id="saveNoticePrefs">Guardar</button></div>'); $('#saveNoticePrefs').addEventListener('click', () => { state.reminder = $('#modalReminder').checked; state.sound = $('#modalSound').checked; saveState(); syncSettings(); closeModal(); toast('Preferencias guardadas.'); }); break;
      case 'help': showModal('<h2>Centro de ayuda</h2><p><b>¿Cómo avanzo?</b><br>Elige una materia, abre un tema y completa las prácticas.<br><br><b>¿Se guarda mi progreso?</b><br>Sí. Esta versión guarda el progreso localmente en este navegador.<br><br><b>¿Puedo usarlo en otro dispositivo?</b><br>Para sincronizar datos entre dispositivos se necesita un backend y una cuenta real.</p><div class="modal-actions"><button class="button button-primary" id="closeInfo">Cerrar</button></div>'); $('#closeInfo').addEventListener('click', closeModal); break;
      case 'feedback': showModal('<h2>Enviar sugerencia</h2><p>Cuéntanos qué te gustaría mejorar. En esta demo el mensaje no se envía a un servidor.</p><div class="form-grid"><div class="form-field"><label for="suggestionText">Tu sugerencia</label><textarea id="suggestionText" placeholder="Me gustaría que Study Swap..."></textarea></div><button class="button button-primary" id="sendSuggestion">Guardar sugerencia en esta sesión</button></div>'); $('#sendSuggestion').addEventListener('click', () => { closeModal(); toast('¡Gracias por compartir tu sugerencia!'); }); break;
      default: break;
    }
  }
  function shareVideo() {
    const shareText = 'Estoy aprendiendo fracciones con Study Swap. ¡Aprende, juega y avanza!';
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(shareText).then(() => toast('Texto de invitación copiado.')).catch(() => toast(shareText));
    else toast(shareText);
  }
  function resetVideo() { if (videoTimer) { clearInterval(videoTimer); videoTimer = null; $('#videoPlay').textContent = '▶'; } videoSeconds = 0; $('#videoProgress').style.width = '0%'; $('#videoTime').textContent = '00:00 / 06:45'; }
  function selectVideo(title) { resetVideo(); $('.video-title-row h1').textContent = `${title} — Explicación fácil y divertida`; toast(`Seleccionaste: ${title}`); }
  function toggleVideo() {
    const button = $('#videoPlay');
    if (videoTimer) {
      clearInterval(videoTimer); videoTimer = null; button.textContent = '▶';
    } else {
      button.textContent = 'Ⅱ';
      videoTimer = setInterval(() => {
        videoSeconds = Math.min(405, videoSeconds + 1);
        $('#videoProgress').style.width = `${videoSeconds / 405 * 100}%`;
        const mm = String(Math.floor(videoSeconds / 60)).padStart(2, '0');
        const ss = String(videoSeconds % 60).padStart(2, '0');
        $('#videoTime').textContent = `${mm}:${ss} / 06:45`;
        if (videoSeconds >= 405) { clearInterval(videoTimer); videoTimer = null; button.textContent = '↻'; }
      }, 1000);
    }
  }

  // Eventos delegados de navegación y tarjetas
  document.addEventListener('click', event => {
    const nav = event.target.closest('[data-nav]');
    if (nav) { event.preventDefault(); go(nav.dataset.nav); return; }
    const action = event.target.closest('[data-action]');
    if (action) { handleAction(action.dataset.action); return; }
    const subject = event.target.closest('[data-subject]');
    if (subject) { openSubject(subject.dataset.subject); return; }
    const topic = event.target.closest('[data-topic]');
    if (topic) { openLesson(topic.dataset.topic); return; }
    const answer = event.target.closest('[data-answer]');
    if (answer) { chooseAnswer(Number(answer.dataset.answer)); return; }
    const error = event.target.closest('[data-review-error]');
    if (error) {
      const item = state.errors[Number(error.dataset.reviewError)];
      if (!item) return;
      activeError = item;
      beginQuiz('review', [{ id: item.id, subject: item.subject, topic: item.topic, text: item.text, visual: 'none', answers: item.answers, correct: item.correct, explanation: item.explanation }]);
    }
  });
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#subjectTabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]'); if (!tab) return;
    subjectTab = tab.dataset.tab;
    $$('#subjectTabs .tab').forEach(el => el.classList.toggle('active', el === tab));
    $('#subjectTopics').classList.toggle('hidden', subjectTab !== 'topics');
    $('#subjectLevels').classList.toggle('hidden', subjectTab !== 'levels');
  });
  $('#quizNext').addEventListener('click', nextQuizStep);
  $('#videoPlay').addEventListener('click', toggleVideo);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', event => { if (event.target === $('#modalBackdrop')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  $('.badge-tabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-badge-tab]'); if (!tab) return;
    badgeTab = tab.dataset.badgeTab;
    $$('.badge-tabs .tab').forEach(el => el.classList.toggle('active', el === tab));
    renderBadges();
  });
  $('.notification-tabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-notice-tab]'); if (!tab) return;
    noticeTab = tab.dataset.noticeTab;
    $$('.notification-tabs .tab').forEach(el => el.classList.toggle('active', el === tab));
    renderNotifications();
  });
  $('#darkToggle').addEventListener('change', event => { state.dark = event.target.checked; saveState(); updateGlobalUI(); });
  $('#reminderToggle').addEventListener('change', event => { state.reminder = event.target.checked; saveState(); toast('Preferencia de recordatorio actualizada.'); });
  $('#soundToggle').addEventListener('change', event => { state.sound = event.target.checked; saveState(); toast('Preferencia de sonido actualizada.'); });
  $('#languageSelect').addEventListener('change', event => { state.language = event.target.value; saveState(); toast(`Idioma seleccionado: ${state.language}. La traducción completa requiere cargar el paquete de idioma.`); });

  // Inicia los valores visuales y los contenidos dinámicos.
  renderSubjects();
  renderProfile();
  renderProgress();
  renderBadges();
  renderErrors();
  renderNotifications();
  syncSettings();
  $('#likeButton').classList.toggle('selected', state.likedVideo);
  $('#saveButton').classList.toggle('selected', state.savedVideo);
  updateGlobalUI();
})();
