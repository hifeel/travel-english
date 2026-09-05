/* shared player for all lessons */
(function (global) {
  var currentAudio = null;
  var currentTurn = null;
  var playAllMode = false;
  var playAllIndex = 0;
  var showEn = true;
  var showKo = true;
  var repeatOn = false;
  var advanceTimer = null;

  function turns() {
    return Array.prototype.slice.call(document.querySelectorAll('.turn'));
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
  function killAudio() {
    clearAdvanceTimer();
    try { speechSynthesis.cancel(); } catch (e) {}
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.ontimeupdate = null;
      try { currentAudio.pause(); } catch (e) {}
      try { currentAudio.removeAttribute('src'); currentAudio.load(); } catch (e) {}
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
    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      clearAdvanceTimer();
      if (onDone) onDone();
    }
    killAudio();
    currentTurn = el;
    markPlaying(el);
    if (!src) {
      speakFallback(el, done);
      return;
    }
    var audio = new Audio();
    currentAudio = audio;
    audio.preload = 'auto';
    audio.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=8';
    audio.addEventListener('ended', function () {
      if (audio.currentTime < 0.35) return;
      done();
    });
    audio.addEventListener('error', function () {
      speakFallback(el, done);
    });
    audio.addEventListener('loadedmetadata', function () {
      var dur = audio.duration;
      if (isFinite(dur) && dur > 0.4) {
        advanceTimer = setTimeout(function () {
          if (!finished && currentTurn === el && audio.ended) done();
        }, Math.ceil(dur * 1000) + 800);
      }
    });
    var p = audio.play();
    if (p && p.catch) p.catch(function () { speakFallback(el, done); });
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
      }, 350);
    });
  }
  function playAll() {
    if (playAllMode) {
      stopCurrent();
      return;
    }
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
  function toggleRepeat() {
    repeatOn = !repeatOn;
    var btn = document.getElementById('toggleRepeat');
    if (btn) btn.classList.toggle('off', !repeatOn);
  }
  global.TEPlayer = {
    playTurn: playTurn,
    playAll: playAll,
    toggleLang: toggleLang,
    toggleRepeat: toggleRepeat,
    stopCurrent: stopCurrent
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
