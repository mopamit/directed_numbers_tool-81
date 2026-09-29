(() => {
  'use strict';

  const compact = new URLSearchParams(location.search).get('view') === 'compact';
  document.body.classList.toggle('compact', compact);

  const state = {
    range: 10,
    current: 0,
    start: null,
    orientation: 'vertical',
  };

  const els = {
    clearStartBtn: document.getElementById('clearStartBtn'),
    rangeButtons: document.getElementById('rangeButtons'),
    rangeNote: document.getElementById('rangeNote'),
    orientationBtn: document.getElementById('orientationBtn'),
    orientationText: document.getElementById('orientationText'),
    toolTitle: document.getElementById('toolTitle'),
    toolInstruction: document.getElementById('toolInstruction'),
    verticalView: document.getElementById('verticalView'),
    horizontalView: document.getElementById('horizontalView'),
    verticalTrack: document.getElementById('verticalTrack'),
    horizontalTrack: document.getElementById('horizontalTrack'),
    currentValue: document.getElementById('currentValue'),
    startValue: document.getElementById('startValue'),
    setStartBtn: document.getElementById('setStartBtn'),
    returnStartBtn: document.getElementById('returnStartBtn'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    resetBtn: document.getElementById('resetBtn'),
    helpBtn: document.getElementById('helpBtn'),
    helpModal: document.getElementById('helpModal'),
    closeHelpBtn: document.getElementById('closeHelpBtn'),
    closeHelpAction: document.getElementById('closeHelpAction')
  };

  function formatNumber(n) {
    if (n < 0) return `\u2066−${Math.abs(n)}\u2069`;
    return String(n);
  }


  function clamp(value) {
    return Math.max(-state.range, Math.min(state.range, value));
  }

  function renderTracks() {
    els.verticalTrack.innerHTML = '';
    els.horizontalTrack.innerHTML = '';

    for (let n = state.range; n >= -state.range; n--) {
      els.verticalTrack.appendChild(makeNumberButton(n, 'vertical-number'));
    }

    for (let n = -state.range; n <= state.range; n++) {
      els.horizontalTrack.appendChild(makeNumberButton(n, 'horizontal-number'));
    }

    updateMarkers();
    requestAnimationFrame(() => scrollActiveIntoView(true));
  }

  function makeNumberButton(n, baseClass) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${baseClass} ${n > 0 ? 'positive' : n < 0 ? 'negative' : 'zero'}`;
    btn.dataset.value = n;
    btn.textContent = formatNumber(n);
    btn.setAttribute('aria-label', `בחר ${n}`);
    btn.addEventListener('click', () => setCurrent(n));
    return btn;
  }

  function updateMarkers() {
    document.querySelectorAll('.vertical-number.current,.horizontal-number.current,.vertical-number.start-point,.horizontal-number.start-point')
      .forEach(el => el.classList.remove('current', 'start-point'));

    document.querySelectorAll(`[data-value="${state.start}"]`).forEach(el => el.classList.add('start-point'));
    document.querySelectorAll(`[data-value="${state.current}"]`).forEach(el => el.classList.add('current'));

    document.querySelectorAll('.vertical-number,.horizontal-number').forEach(button => {
      const n = Number(button.dataset.value);
      button.setAttribute('aria-pressed', String(n === state.current));
      button.setAttribute('aria-label', `בחר ${n}${n === state.start ? ', נקודת התחלה' : ''}`);
    });
    els.currentValue.textContent = formatNumber(state.current);
    els.startValue.textContent = state.start === null ? 'לא נקבעה' : formatNumber(state.start);
    updateButtons();
  }

  function updateButtons() {
    const canAdd = state.current + 1 <= state.range;
    const canSubtract = state.current - 1 >= -state.range;
    els.upBtn.disabled = !canAdd;
    els.rightBtn.disabled = !canAdd;
    els.downBtn.disabled = !canSubtract;
    els.leftBtn.disabled = !canSubtract;
    els.returnStartBtn.disabled = state.start === null || state.current === state.start;
    els.clearStartBtn.disabled = state.start === null;
  }

  function scrollActiveIntoView(center = false) {
    const horizontal = state.orientation === 'horizontal';
    // Only explicit view/range changes position the horizontal viewport.
    if (horizontal && !center) return;
    const container = document.getElementById(horizontal ? 'horizontalScroll' : 'verticalScroll');
    const active = container.querySelector('.current');
    if (!active) return;
    const box = active.getBoundingClientRect();
    const viewport = container.getBoundingClientRect();
    if (horizontal) container.scrollLeft += box.left - viewport.left - (container.clientWidth - box.width) / 2;
    else if (center || box.top < viewport.top || box.bottom > viewport.bottom)
      container.scrollTop += box.top - viewport.top - (container.clientHeight - box.height) / 2;
  }

  function setCurrent(value) {
    state.current = clamp(value);
    updateMarkers();
    requestAnimationFrame(() => scrollActiveIntoView());
  }

  function move(delta) {
    const target = state.current + delta;
    if (target > state.range || target < -state.range) return;
    setCurrent(target);
  }

  function setStart() {
    state.start = state.current;
    els.startValue.textContent = state.start === null ? 'לא נקבעה' : formatNumber(state.start);
    updateMarkers();
  }

  function returnToStart() {
    if (state.start !== null) setCurrent(state.start);
  }

  function setRange(range) {
    state.range = range;
    state.current = clamp(state.current);
    if (state.start !== null) state.start = clamp(state.start);
    els.rangeButtons.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.range) === range);
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.range) === range));
    });
    els.rangeNote.textContent = `מ־${formatNumber(-range)} עד ${range}`;
    renderTracks();
  }

  function toggleOrientation() {
    state.orientation = state.orientation === 'vertical' ? 'horizontal' : 'vertical';
    const horizontal = state.orientation === 'horizontal';

    els.verticalView.hidden = horizontal;
    els.horizontalView.hidden = !horizontal;
    els.orientationText.textContent = horizontal ? 'עבור למעלית אנכית' : 'עבור לציר אופקי';
    els.toolTitle.textContent = horizontal ? 'ציר המספרים' : 'מעלית המספרים';
    els.toolInstruction.textContent = horizontal
      ? 'לחצו על מספר לבחירת מיקום, או ימינה כדי להוסיף 1 ושמאלה כדי להחסיר 1.'
      : 'לחצו על מספר לבחירת מיקום, או למעלה כדי להוסיף 1 ולמטה כדי להחסיר 1.';

    requestAnimationFrame(() => scrollActiveIntoView(true));
  }

  function reset() {
    state.range = 10;
    state.current = 0;
    state.start = null;
    state.orientation = 'vertical';
    els.verticalView.hidden = false;
    els.horizontalView.hidden = true;
    els.orientationText.textContent = 'עבור לציר אופקי';
    els.toolTitle.textContent = 'מעלית המספרים';
    els.toolInstruction.textContent = 'לחצו על מספר לבחירת מיקום, או השתמשו בחצים כדי להוסיף ולהחסיר 1.';
    setRange(10);
    document.getElementById('activeChallenge').hidden = true;
  }

  let modalTrigger = null;
  function openModal(modal, trigger) {
    modalTrigger = trigger;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.querySelector('.app-shell').inert = true;
    modal.querySelector('button').focus();
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
    document.querySelector('.app-shell').inert = false;
    modalTrigger?.focus();
  }
  function openHelp() { openModal(els.helpModal, els.helpBtn); }
  function closeHelp() { closeModal(els.helpModal); }

  const challenges = [
    { start: 5, html: 'התחילו בקומה 5 ובצעו: <bdi dir="ltr">5 + 3 − 2 + 8 − 1</bdi>. לאיזו קומה הגעתם?', range: 15 },
    { start: 3, html: 'התחילו בקומה 3 ובצעו: <bdi dir="ltr">3 − 6 + 4 − 1</bdi>. לאיזו קומה הגעתם?', range: 10 },
    { start: 5, html: 'התחילו בקומה 5 ובצעו: <bdi dir="ltr">5 + 2 − 7 − 3 + 4</bdi>. לאיזו קומה הגעתם?', range: 10 },
    { start: 2, html: 'עדי התחילה בקומה 2 והגיעה לקומה <bdi>−5</bdi>. כמה קומות היא ירדה?', range: 10 },
    { start: -3, html: 'ערן התחיל בקומה <bdi>−3</bdi> והגיע לקומה 7. כמה קומות הוא עלה?', range: 10 },
    { start: -5, html: 'איתי התחיל בקומה <bdi>−5</bdi>, עבר בקומה מעל 0 והגיע לקומה <bdi>−4</bdi>. תארו 3 מסלולים אפשריים של איתי.', range: 10 }
  ];
  const challengesModal = document.getElementById('challengesModal');
  const challengesBtn = document.getElementById('challengesBtn');
  const activeChallenge = document.getElementById('activeChallenge');
  challenges.forEach(challenge => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = challenge.html;
    button.addEventListener('click', () => {
      state.current = state.start = challenge.start;
      setRange(Math.max(state.range, challenge.range));
      activeChallenge.innerHTML = challenge.html;
      activeChallenge.hidden = false;
      closeModal(challengesModal);
    });
    document.getElementById('challengeChoices').appendChild(button);
  });
  challengesBtn.addEventListener('click', () => openModal(challengesModal, challengesBtn));
  document.getElementById('closeChallengesBtn').addEventListener('click', () => closeModal(challengesModal));
  challengesModal.addEventListener('click', e => { if (e.target === challengesModal) closeModal(challengesModal); });
  els.clearStartBtn.addEventListener('click', () => { state.start = null; updateMarkers(); });

  els.rangeButtons.addEventListener('click', e => {
    const btn = e.target.closest('button[data-range]');
    if (btn) setRange(Number(btn.dataset.range));
  });

  els.orientationBtn.addEventListener('click', toggleOrientation);
  els.upBtn.addEventListener('click', () => move(1));
  els.rightBtn.addEventListener('click', () => move(1));
  els.downBtn.addEventListener('click', () => move(-1));
  els.leftBtn.addEventListener('click', () => move(-1));
  els.setStartBtn.addEventListener('click', setStart);
  els.returnStartBtn.addEventListener('click', returnToStart);
  els.resetBtn.addEventListener('click', reset);
  els.helpBtn.addEventListener('click', openHelp);
  els.closeHelpBtn.addEventListener('click', closeHelp);
  els.closeHelpAction.addEventListener('click', closeHelp);
  els.helpModal.addEventListener('click', e => { if (e.target === els.helpModal) closeHelp(); });

  document.addEventListener('keydown', e => {
    const modal = [els.helpModal, challengesModal].find(item => !item.hidden);
    if (modal) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(modal); }
      if (e.key === 'Tab') {
        const buttons = [...modal.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const keys = state.orientation === 'horizontal' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowUp', 'ArrowDown'];
    if (keys.includes(e.key)) { e.preventDefault(); move(e.key === keys[0] ? 1 : -1); }
  });

  setRange(10);
})();
