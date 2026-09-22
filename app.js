(() => {
  'use strict';

  const state = {
    range: 10,
    current: 0,
    start: 0,
    orientation: 'vertical',
  };

  const els = {
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
    requestAnimationFrame(scrollActiveIntoView);
  }

  function makeNumberButton(n, baseClass) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${baseClass} ${n > 0 ? 'positive' : n < 0 ? 'negative' : 'zero'}`;
    btn.dataset.value = n;
    btn.textContent = formatNumber(n);
    btn.setAttribute('aria-label', `בחר ${n}`);
    btn.addEventListener('click', () => setCurrent(n, false));
    return btn;
  }

  function updateMarkers() {
    document.querySelectorAll('.vertical-number.current,.horizontal-number.current,.vertical-number.start-point,.horizontal-number.start-point')
      .forEach(el => el.classList.remove('current', 'start-point'));

    document.querySelectorAll(`[data-value="${state.start}"]`).forEach(el => el.classList.add('start-point'));
    document.querySelectorAll(`[data-value="${state.current}"]`).forEach(el => el.classList.add('current'));

    els.currentValue.textContent = formatNumber(state.current);
    els.startValue.textContent = formatNumber(state.start);
    updateButtons();
  }

  function updateButtons() {
    const canAdd = state.current + 1 <= state.range;
    const canSubtract = state.current - 1 >= -state.range;
    els.upBtn.disabled = !canAdd;
    els.rightBtn.disabled = !canAdd;
    els.downBtn.disabled = !canSubtract;
    els.leftBtn.disabled = !canSubtract;
    els.returnStartBtn.disabled = state.current === state.start;
  }

  function scrollActiveIntoView() {
    const selector = state.orientation === 'vertical' ? '.vertical-number.current' : '.horizontal-number.current';
    const active = document.querySelector(selector);
    if (!active) return;
    active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }


  function setCurrent(value, recordOperation = false, delta = 0) {
    const next = clamp(value);
    state.current = next;
    updateMarkers();
    requestAnimationFrame(scrollActiveIntoView);
  }

  function move(delta) {
    const target = state.current + delta;
    if (target > state.range || target < -state.range) return;
    setCurrent(target, true, delta);
  }

  function setStart() {
    state.start = state.current;
    els.startValue.textContent = formatNumber(state.start);
    updateMarkers();
  }

  function returnToStart() {
    setCurrent(state.start, false);
  }

  function setRange(range) {
    state.range = range;
    state.current = clamp(state.current);
    state.start = clamp(state.start);
    els.rangeButtons.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.range) === range);
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

    requestAnimationFrame(scrollActiveIntoView);
  }

  function reset() {
    state.range = 10;
    state.current = 0;
    state.start = 0;
    state.orientation = 'vertical';
    els.verticalView.hidden = false;
    els.horizontalView.hidden = true;
    els.orientationText.textContent = 'עבור לציר אופקי';
    els.toolTitle.textContent = 'מעלית המספרים';
    els.toolInstruction.textContent = 'לחצו על מספר לבחירת מיקום, או השתמשו בחצים כדי להוסיף ולהחסיר 1.';
    setRange(10);
    updatePreview(0, 1, 1);
  }

  function openHelp() {
    els.helpModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeHelp() {
    els.helpModal.hidden = true;
    document.body.style.overflow = '';
  }

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
    if (e.key === 'Escape' && !els.helpModal.hidden) closeHelp();
    if (state.orientation === 'horizontal') {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    } else {
      if (e.key === 'ArrowUp') move(1);
      if (e.key === 'ArrowDown') move(-1);
    }
  });

  renderTracks();
  updatePreview(0, 1, 1);
})();
