// What's New is web-only. A static app cannot discover a GitHub merge time
// offline, so each announced release carries its explicit production merge
// timestamp. Update `mergedAt` when the branch is merged to production.
var WHATS_NEW_RELEASE = {
  version: '0.936',
  mergedAt: '2026-07-31T21:05:23+02:00',
  visibleDays: 10,
  content: {
    en: {
      meta: 'v0.936 · Klartext guide',
      title: 'What’s new',
      close: 'Close',
      intro: 'A new searchable Heidenhain Klartext guide is available:',
      items: [
        '15 step-by-step lessons with direct practice in TNC Sim.',
        'English and German pages with clear language switching.',
        'A new Guide link on desktop and mobile.'
      ]
    },
    de: {
      meta: 'v0.936 · Klartext-Anleitung',
      title: 'Was ist neu?',
      close: 'Schließen',
      intro: 'Eine neue durchsuchbare Heidenhain-Klartext-Anleitung ist verfügbar:',
      items: [
        '15 Lektionen mit Schritt-für-Schritt-Anleitungen und direkter Übung in TNC Sim.',
        'Englische und deutsche Seiten mit klarer Sprachumschaltung.',
        'Ein neuer Link zur Anleitung auf Desktop- und Mobilgeräten.'
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
  var active = _whatsNewIsActive(
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
  if(active){
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
  if(!_whatsNewIsActive(Date.now(), WHATS_NEW_RELEASE.mergedAt, WHATS_NEW_RELEASE.visibleDays)){
    initWhatsNew();
    return;
  }
  var copy = _whatsNewContent();
  document.getElementById('whatsNewMeta').textContent = copy.meta;
  document.getElementById('whatsNewTitle').textContent = copy.title;
  document.getElementById('whatsNewIntro').textContent = copy.intro;
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
