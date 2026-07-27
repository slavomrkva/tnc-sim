// What's New is web-only. A static app cannot discover a GitHub merge time
// offline, so each announced release carries its explicit production merge
// timestamp. Update `mergedAt` when the branch is merged to production.
var WHATS_NEW_RELEASE = {
  version: '0.911',
  mergedAt: '2026-07-27T14:04:35+02:00',
  visibleDays: 10,
  content: {
    en: {
      meta: 'v0.911 · Learn update',
      title: 'What’s new',
      close: 'Close',
      intro: 'Lessons are now easier to scan and complete:',
      items: [
        'A clearer three-column desktop layout with the task directly above the editor.',
        'Highlighted questions and answer rows make it obvious where to type.',
        'Info slides stay available during practice, and results appear only after Check.',
        'Comment answers now edit reliably with Backspace and Delete.'
      ]
    },
    de: {
      meta: 'v0.911 · Lern-Update',
      title: 'Was ist neu?',
      close: 'Schließen',
      intro: 'Lektionen sind jetzt übersichtlicher und einfacher zu bearbeiten:',
      items: [
        'Klareres Desktop-Layout mit drei Spalten und der Aufgabe direkt über dem Editor.',
        'Hervorgehobene Fragen und Antwortzeilen zeigen deutlich, wo du schreiben sollst.',
        'Info-Folien bleiben während der Übung verfügbar; Ergebnisse erscheinen erst nach Prüfen.',
        'Kommentarantworten lassen sich zuverlässig mit Rücktaste und Entf bearbeiten.'
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
