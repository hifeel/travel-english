/* shared player for all lessons */
(function (global) {
  var currentAudio = null;
  var currentTurn = null;
  var playAllMode = false;
  var playAllIndex = 0;
  var showEn = true;
  var showKo = true;
  var REPEAT_KEY = 'te-repeat';
  var repeatOn = false;
  try { repeatOn = localStorage.getItem(REPEAT_KEY) === '1'; } catch (e) {}
  var advanceTimer = null;

  function turns() {
    return Array.prototype.slice.call(document.querySelectorAll('.turn')).filter(function (t) {
      var src = t.getAttribute('data-src');
      return src && t.querySelector('.play-btn');
    });
  }
  function syncPlayAllBtn() {
    var a = playAllBtn();
    if (!a) return;
    a.classList.toggle('is-hidden', turns().length === 0);
  }
  function playAllBtn() {
    return document.getElementById('playAllBtn');
  }
  function clearAdvanceTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }
  function resetTurnButtons() {
    document.querySelectorAll('.turn').forEach(function (t) {
      t.classList.remove('playing');
      var b = t.querySelector('.play-btn');
      if (b) {
        b.classList.remove('playing');
        b.textContent = '\u25b6';
      }
    });
  }
  function resetAllButtons() {
    resetTurnButtons();
    var a = playAllBtn();
    if (a) {
      a.classList.remove('playing');
      a.textContent = '\u25b6 \uc804\uccb4 \uc7ac\uc0dd';
    }
  }
  function markPlaying(el) {
    resetTurnButtons();
    var a = playAllBtn();
    if (playAllMode && a) {
      a.classList.add('playing');
      a.textContent = '\u25a0 \uc815\uc9c0';
    }
    if (!el) return;
    el.classList.add('playing');
    var btn = el.querySelector('.play-btn');
    if (btn) {
      btn.classList.add('playing');
      btn.textContent = '\u25a0';
    }
  }
  var playSeq = 0;
  function killAudio() {
    clearAdvanceTimer();
    playSeq += 1;
    try { speechSynthesis.cancel(); } catch (e) {}
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      try { currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
  }
  function stopCurrent() {
    killAudio();
    resetAllButtons();
    currentTurn = null;
    playAllMode = false;
  }
  function speakFallback(el, onDone) {
    try {
      var en = el && el.querySelector('.en');
      if (!en) { if (onDone) onDone(); return; }
      var u = new SpeechSynthesisUtterance(en.textContent.trim());
      u.lang = 'en-US';
      u.rate = 0.95;
      u.onend = function () { if (onDone) onDone(); };
      u.onerror = function () { if (onDone) onDone(); };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) {
      if (onDone) onDone();
    }
  }
  function playSrc(el, onDone) {
    var src = el.getAttribute('data-src');
    killAudio();
    var seq = playSeq;
    var finished = false;
    function alive() { return seq === playSeq && currentTurn === el; }
    function done() {
      if (finished || seq !== playSeq) return;
      finished = true;
      clearAdvanceTimer();
      if (onDone) onDone();
    }
    currentTurn = el;
    markPlaying(el);
    if (!src) {
      done();
      return;
    }
    var audio = new Audio();
    currentAudio = audio;
    audio.preload = 'auto';
    audio.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=13';
    audio.addEventListener('ended', function () {
      if (!alive()) return;
      done();
    });
    audio.addEventListener('error', function () {
      if (!alive()) return;
      done();
    });
    var p = audio.play();
    if (p && p.catch) p.catch(function () { if (alive()) done(); });
  }
  function playTurn(el) {
    if (currentTurn === el && currentAudio && !currentAudio.paused && !playAllMode) {
      stopCurrent();
      return;
    }
    playAllMode = false;
    function afterOne() {
      if (repeatOn && currentTurn === el && !playAllMode) {
        setTimeout(function () {
          if (repeatOn && currentTurn === el && !playAllMode) {
            playSrc(el, afterOne);
          }
        }, 250);
        return;
      }
      el.classList.remove('playing');
      var btn = el.querySelector('.play-btn');
      if (btn) {
        btn.classList.remove('playing');
        btn.textContent = '\u25b6';
      }
      currentAudio = null;
      currentTurn = null;
      resetAllButtons();
    }
    playSrc(el, afterOne);
  }
  function playNextInAll() {
    if (!playAllMode) return;
    var list = turns();
    if (playAllIndex >= list.length) {
      if (repeatOn) {
        playAllIndex = 0;
        playNextInAll();
        return;
      }
      stopCurrent();
      return;
    }
    var el = list[playAllIndex];
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    playSrc(el, function () {
      if (!playAllMode) return;
      playAllIndex += 1;
      setTimeout(function () {
        if (playAllMode) playNextInAll();
      }, 80);
    });
  }
  function playAll() {
    if (playAllMode) {
      stopCurrent();
      return;
    }
    if (!turns().length) return;
    playAllMode = true;
    playAllIndex = 0;
    var a = playAllBtn();
    if (a) {
      a.classList.add('playing');
      a.textContent = '\u25a0 \uc815\uc9c0';
    }
    playNextInAll();
  }
  function toggleLang(lang) {
    if (lang === 'en') {
      showEn = !showEn;
      document.body.classList.toggle('hide-en', !showEn);
      document.getElementById('toggleEn').classList.toggle('off', !showEn);
    } else {
      showKo = !showKo;
      document.body.classList.toggle('hide-ko', !showKo);
      document.getElementById('toggleKo').classList.toggle('off', !showKo);
    }
  }
  function syncRepeatBtn() {
    var btn = document.getElementById('toggleRepeat');
    if (btn) btn.classList.toggle('off', !repeatOn);
  }
  function toggleRepeat() {
    repeatOn = !repeatOn;
    try { localStorage.setItem(REPEAT_KEY, repeatOn ? '1' : '0'); } catch (e) {}
    syncRepeatBtn();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncRepeatBtn);
  } else {
    setTimeout(syncRepeatBtn, 0);
  }
  global.TEPlayer = {
    playTurn: playTurn,
    playAll: playAll,
    toggleLang: toggleLang,
    toggleRepeat: toggleRepeat,
    stopCurrent: stopCurrent,
    syncPlayAllBtn: syncPlayAllBtn
  };
})(window);
(function (global) {
  var KEY = 'te-done';
  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a.map(String) : [];
    } catch (e) { return []; }
  }
  function save(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  function isDone(id) {
    return load().indexOf(String(id)) >= 0;
  }
  function setDone(id, on) {
    id = String(id);
    var a = load();
    var i = a.indexOf(id);
    if (on && i < 0) a.push(id);
    if (!on && i >= 0) a.splice(i, 1);
    save(a);
    return on;
  }
  function toggle(id) {
    return setDone(id, !isDone(id));
  }
  global.TEDone = { isDone: isDone, setDone: setDone, toggle: toggle, load: load };
})(window);
(function (global) {
  var KEY = 'te-bookmarks-v1';
  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function save(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  function makeKey(lessonId, turnIndex) {
    return String(lessonId) + ':' + String(turnIndex);
  }
  function has(lessonId, turnIndex) {
    var k = makeKey(lessonId, turnIndex);
    return load().some(function (item) { return item.key === k; });
  }
  function toggle(lessonId, turnIndex, turn, lesson) {
    var k = makeKey(lessonId, turnIndex);
    var list = load();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].key === k) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      list.splice(idx, 1);
      save(list);
      return false;
    } else {
      list.unshift({
        key: k,
        lessonId: String(lessonId),
        lessonTitleEn: (lesson && lesson.title_en) || '',
        lessonTitleKo: (lesson && lesson.title_ko) || '',
        turnIndex: turnIndex,
        speaker: (turn && (turn.speaker || (turn.role === 'you' ? 'You' : 'Staff'))) || '',
        role: (turn && turn.role) || '',
        en: (turn && turn.en) || '',
        ko: (turn && turn.ko) || '',
        audio: (turn && turn.audio) || '',
        time: Date.now()
      });
      save(list);
      return true;
    }
  }
  function remove(key) {
    var list = load().filter(function (item) { return item.key !== key; });
    save(list);
  }
  global.TEBookmark = {
    load: load,
    has: has,
    toggle: toggle,
    remove: remove
  };
})(window);
(function (global) {
  // Reuse the ?v= this file was loaded with rather than keeping a second
  // number in sync by hand. app.js?v=16 once served a body that still asked
  // for lessons.json?v=15, so a browser holding the old script kept showing
  // the old lesson list; one knob in the <script> tag cannot drift from
  // itself.
  var V = (function () {
    try {
      var s = document.currentScript ||
              document.querySelector('script[src*="app.js"]');
      var m = s && /[?&]v=([^&#]+)/.exec(s.src);
      if (m) return m[1];
    } catch (e) {}
    return '0';
  })();
  function fetchJson(url) {
    // no-store as well as the version query: Pages caches JSON for ten
    // minutes, so a freshly added lesson is otherwise invisible for that long
    // even though the request goes out.
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + V,
                 { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.json();
    });
  }
  function loadLessons() {
    return fetchJson('data/lessons.json').catch(function () {
      return fetchJson('data/index.json').then(function (idx) {
        return Promise.all((idx.ids || []).map(function (id) {
          return fetchJson('data/lessons/' + id + '.json');
        }));
      }).then(function (lessons) {
        return { lessons: lessons };
      });
    });
  }
  function loadLesson(id) {
    id = String(id || '');
    return fetchJson('data/lessons/' + id + '.json').catch(function () {
      return loadLessons().then(function (data) {
        var lesson = (data.lessons || []).find(function (l) {
          return String(l.id) === id || l.slug === id;
        });
        if (!lesson) throw new Error('not found');
        return lesson;
      });
    });
  }
  global.TEData = { loadLessons: loadLessons, loadLesson: loadLesson };
})(window);
