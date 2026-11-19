// What's New is web-only. A static app cannot discover a GitHub merge time
// offline, so each announced release carries its explicit production merge
// timestamp. Set `mergedAt` to the real production merge time when merged.
var WHATS_NEW_RELEASE = {
  // The popup shows no version number; About is the single place for it.
  mergedAt: '2026-11-19T15:50:00Z',
  visibleDays: 10,
  content: {
    en: {
      meta: 'Updates',
      title: 'What’s new',
      close: 'Close',
      intro: '',
      items: [
        'Lesson practice is calmer: you write only in the highlighted lines, and the keys the task needs are marked.',
        'After the last task you go straight to the next lesson; the final lesson is free practice without hints.'
      ]
    },
    de: {
      meta: 'Neuigkeiten',
      title: 'Was ist neu?',
      close: 'Schließen',
      intro: '',
      items: [
        'Ruhigeres Üben in den Lektionen: Du schreibst nur in die markierten Zeilen, und die Tasten der Aufgabe sind hervorgehoben.',
        'Nach der letzten Aufgabe geht es direkt zur nächsten Lektion; die letzte Lektion ist freies Üben ohne Tipps.'
      ]
    }
  }
};

var _whatsNewExpiryTimer = null;

function _whatsNewIsActive(nowMs, mergedAt, visibleDays){
  var startMs = typeof mergedAt === 'number' ? mergedAt : Date.parse(mergedAt);
  var days = Number(visibleDays);
  if(!isFinite(nowMs) || !isFinite(startMs) || !isFinite(days) || days <= 0) return false;
  return nowMs >= startMs && nowMs < startMs + days * 24 * 60 * 60 * 1000;
}

function _whatsNewPreview(){
  return typeof location !== 'undefined' && /\.workers\.dev$/.test(location.hostname)
    && /(?:\?|&)preview-whats-new=1(?:&|$)/.test(location.search);
}

function _whatsNewContent(){
  var lang = typeof I18N !== 'undefined' && I18N.getLang ? I18N.getLang() : 'en';
  return WHATS_NEW_RELEASE.content[lang] || WHATS_NEW_RELEASE.content.en;
}

function _hideWhatsNew(btn){
  btn.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
  var overlay = document.getElementById('whatsNewOverlay');
  if(overlay) overlay.hidden = true;
}

function initWhatsNew(nowMs){
  var btn = document.getElementById('whatsNewBtn');
  if(!btn) return;
  var now = nowMs === undefined ? Date.now() : nowMs;
  var active = _whatsNewPreview() || _whatsNewIsActive(
    now,
    WHATS_NEW_RELEASE.mergedAt,
    WHATS_NEW_RELEASE.visibleDays
  );
  if(active) btn.hidden = false;
  else _hideWhatsNew(btn);
  if(_whatsNewExpiryTimer){
    clearTimeout(_whatsNewExpiryTimer);
    _whatsNewExpiryTimer = null;
  }
  if(active && !_whatsNewPreview()){
    var endMs = Date.parse(WHATS_NEW_RELEASE.mergedAt)
      + WHATS_NEW_RELEASE.visibleDays * 24 * 60 * 60 * 1000;
    _whatsNewExpiryTimer = setTimeout(function(){
      _hideWhatsNew(btn);
      _whatsNewExpiryTimer = null;
    }, endMs - now);
  }
}

function openWhatsNew(){
  var overlay = document.getElementById('whatsNewOverlay');
  var btn = document.getElementById('whatsNewBtn');
  if(!overlay || !btn || btn.hidden) return;
  if(!_whatsNewPreview() && !_whatsNewIsActive(Date.now(), WHATS_NEW_RELEASE.mergedAt, WHATS_NEW_RELEASE.visibleDays)){
    initWhatsNew();
    return;
  }
  var copy = _whatsNewContent();
  document.getElementById('whatsNewMeta').textContent = copy.meta;
  document.getElementById('whatsNewTitle').textContent = copy.title;
  var intro = document.getElementById('whatsNewIntro');
  intro.textContent = copy.intro;
  intro.hidden = !copy.intro;
  document.querySelector('.whats-new-close').setAttribute('aria-label', copy.close);
  document.getElementById('whatsNewItems').innerHTML = copy.items.map(function(item){
    return '<li><span aria-hidden="true">&#10003;</span><span>' + item + '</span></li>';
  }).join('');
  overlay.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  var close = overlay.querySelector('.whats-new-close');
  if(close) close.focus();
}

function closeWhatsNew(){
  var overlay = document.getElementById('whatsNewOverlay');
  var btn = document.getElementById('whatsNewBtn');
  if(!overlay) return;
  overlay.hidden = true;
  if(btn){
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }
}

if(typeof document !== 'undefined'){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ initWhatsNew(); });
  } else {
    initWhatsNew();
  }
  document.addEventListener('keydown', function(event){
    var overlay = document.getElementById('whatsNewOverlay');
    if(event.key === 'Escape' && overlay && !overlay.hidden) closeWhatsNew();
  });
}
