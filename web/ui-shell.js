// ui-shell -- web-specific. Design experiment (branch design/ui-simplify).
//
// Groups rarely used controls into three menus so the main screen keeps only
// what is used all the time:
//   Help     -> hover help, quick reference, M functions, Klartext guide
//   Program  -> import, export, reset, clear
//   Settings -> language, theme, 3D quality, editor text size
// The demo picker stays beside Undo/Redo, and the footer is a single line
// asking for bug reports and suggestions.
// The original buttons stay in index.html (other code and tests refer to them)
// and are hidden by the "UI shell" block at the end of web/styles.css. This
// file only adds the menu buttons and calls the same global functions.

(function(){
  'use strict';

  var DE = {
    'Help':'Hilfe', 'Program':'Programm', 'Settings':'Einstellungen', 'About':'Über',
    'Hover help':'Hilfe beim Überfahren', 'Quick reference':'Kurzreferenz',
    'M functions':'M-Funktionen', 'Klartext guide':'Klartext-Anleitung',
    'Support this project:':'Projekt unterstützen:',
    'report a bug or suggest an improvement':'Fehler melden oder Verbesserung vorschlagen',
    'report a bug or idea':'Fehler oder Idee melden',
    'Import…':'Importieren…', 'Export':'Exportieren',
    'Reset to default program':'Auf Standardprogramm zurücksetzen',
    'Clear program':'Programm leeren',
    'Language':'Sprache', 'Theme':'Design', 'Dark':'Dunkel', 'Light':'Hell',
    '3D quality':'3D-Qualität', 'Editor text size':'Editor-Schriftgröße',
    'Smaller text':'Kleinere Schrift', 'Larger text':'Größere Schrift',
    'Android app on Google Play':'Android-App bei Google Play'
  };
  function lang(){ try { return I18N.getLang(); } catch(e){ return 'en'; } }
  function tr(s){ return (lang() === 'de' && DE[s]) || s; }

  var ICON = {
    help:'<path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4.2"/><circle cx="12" cy="17.4" r=".6" fill="currentColor"/><circle cx="12" cy="12" r="9.2"/>',
    file:'<path d="M6 3.5h7.5L18 8v12.5H6z"/><path d="M13.5 3.5V8H18"/>',
    gear:'<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8"/>',
    info:'<circle cx="12" cy="12" r="9.2"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/>',
    learn:'<path d="M12 4.5L2.5 9.2 12 13.9l9.5-4.7z"/><path d="M6.2 11.2v4.2c0 1.3 2.6 2.4 5.8 2.4s5.8-1.1 5.8-2.4v-4.2"/><path d="M21.5 9.2v4.6"/>',
    caret:'<path d="M7 10l5 5 5-5"/>'
  };
  function icon(name, cls){
    return '<svg class="' + (cls || 'us-ico') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }
  function el(tag, cls, html){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(html != null) n.innerHTML = html;
    return n;
  }
  function call(name){
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){ if(typeof window[name] === 'function') window[name].apply(window, args); };
  }

  /* ── One open popover at a time ─────────────────────────────────── */
  var open = null;   // { btn, pop }
  var qualityHome = null;   // toolbar wrapper the quality group returns to
  function closeMenu(){
    if(!open) return;
    // The quality group is only lent to the Settings popover; give it back so
    // nothing that looks it up ever finds it detached.
    var q = document.getElementById('qualityGroup');
    if(q && qualityHome && open.pop.contains(q)) qualityHome.appendChild(q);
    open.pop.remove();
    open.btn.setAttribute('aria-expanded', 'false');
    open = null;
  }
  function place(btn, pop){
    var r = btn.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(r.right - w, window.innerWidth - w - 8);
    if(r.left + w <= window.innerWidth - 8) left = r.left;
    left = Math.max(8, left);
    var top = r.bottom + 6;
    if(top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }
  function openMenu(btn, build){
    if(open && open.btn === btn){ closeMenu(); return; }
    closeMenu();
    var pop = el('div', 'us-pop');
    pop.setAttribute('role', 'menu');
    build(pop);
    document.body.appendChild(pop);
    place(btn, pop);
    btn.setAttribute('aria-expanded', 'true');
    open = { btn:btn, pop:pop };
    var first = pop.querySelector('button, a');
    if(first) try { first.focus({ preventScroll:true }); } catch(e){}
  }
  document.addEventListener('mousedown', function(e){
    if(open && !open.pop.contains(e.target) && !open.btn.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && open){ var b = open.btn; closeMenu(); b.focus(); }
  });
  window.addEventListener('resize', closeMenu);
  window.addEventListener('blur', closeMenu);

  /* ── Menu building blocks ───────────────────────────────────────── */
  function item(pop, label, fn, opts){
    opts = opts || {};
    var b = el(opts.href ? 'a' : 'button', 'us-item' + (opts.danger ? ' us-danger' : '') + (opts.current ? ' us-current' : ''));
    b.setAttribute('role', 'menuitem');
    if(opts.href){ b.href = opts.href; if(opts.blank){ b.target = '_blank'; b.rel = 'noopener noreferrer'; } }
    else b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', function(){
      closeMenu();
      // Deferred: the app's own document click handler must not see the state
      // this action is about to change (it would undo hover-help immediately).
      if(fn) setTimeout(fn, 0);
    });
    pop.appendChild(b);
    return b;
  }
  function sep(pop){ pop.appendChild(el('div', 'us-sep')); }
  function heading(pop, label){ pop.appendChild(el('div', 'us-head', label)); }
  function row(pop, label){
    var r = el('div', 'us-row');
    r.appendChild(el('span', 'us-row-l', label));
    var c = el('div', 'us-row-c');
    r.appendChild(c);
    pop.appendChild(r);
    return c;
  }
  function seg(parent, options, current, onPick){
    var g = el('div', 'us-seg');
    options.forEach(function(o){
      var b = el('button', o.value === current ? 'on' : '');
      b.type = 'button';
      b.textContent = o.label;
      b.setAttribute('aria-pressed', o.value === current ? 'true' : 'false');
      b.addEventListener('click', function(){ onPick(o.value, g, b); });
      g.appendChild(b);
    });
    parent.appendChild(g);
    return g;
  }

  /* ── Help ───────────────────────────────────────────────────────── */
  function buildHelp(pop){
    var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
    if(!coarse) item(pop, tr('Hover help'), call('toggleKpHelp'));
    item(pop, tr('Quick reference'), call('openHelp'));
    item(pop, tr('M functions'), call('openMCodesList'));
    item(pop, tr('Klartext guide'), null, { href: lang() === 'de' ? '/de/learn/' : '/learn/' });
  }

  /* ── Program ────────────────────────────────────────────────────── */
  function buildProgram(pop){
    item(pop, tr('Import…'), call('importProgram'));
    item(pop, tr('Export'), call('exportProgram'));
  }

  /* ── Settings ───────────────────────────────────────────────────── */
  function buildSettings(pop){
    pop.classList.add('us-settings');
    pop.setAttribute('role', 'dialog');

    seg(row(pop, tr('Language')), [{ value:'en', label:'English' }, { value:'de', label:'Deutsch' }], lang(),
      function(v){ if(v !== lang()) I18N.setLang(v); });

    var light = document.documentElement.getAttribute('data-theme') === 'light';
    seg(row(pop, tr('Theme')), [{ value:'dark', label:tr('Dark') }, { value:'light', label:tr('Light') }], light ? 'light' : 'dark',
      function(v, g, b){
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if((v === 'light') !== isLight && typeof toggleTheme === 'function') toggleTheme();
        Array.prototype.forEach.call(g.children, function(x){
          x.className = x === b ? 'on' : ''; x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
      });

    // The real quality buttons are shown here, so setQuality() keeps its state.
    var q = document.getElementById('qualityGroup');
    if(q) row(pop, tr('3D quality')).appendChild(q);

    var c = row(pop, tr('Editor text size'));
    var g = el('div', 'us-step');
    var minus = el('button', '', 'A−'), val = el('span', 'us-step-v'), plus = el('button', '', 'A+');
    minus.type = plus.type = 'button';
    minus.title = tr('Smaller text'); plus.title = tr('Larger text');
    function sync(){
      var fs = typeof _editorFs !== 'undefined' ? _editorFs : 12;
      val.textContent = fs + ' px';
      minus.disabled = typeof _EDITOR_FS_MIN !== 'undefined' && fs <= _EDITOR_FS_MIN;
      plus.disabled = typeof _EDITOR_FS_MAX !== 'undefined' && fs >= _EDITOR_FS_MAX;
    }
    minus.addEventListener('click', function(){ if(typeof editorFsBy === 'function') editorFsBy(-1); sync(); });
    plus.addEventListener('click', function(){ if(typeof editorFsBy === 'function') editorFsBy(1); sync(); });
    g.appendChild(minus); g.appendChild(val); g.appendChild(plus);
    c.appendChild(g);
    sync();
  }

  /* ── Mount ──────────────────────────────────────────────────────── */
  function menuButton(cls, label, iconName, build, withCaret, skip){
    var b = el('button', cls, icon(iconName) + '<span class="us-lbl">' + label + '</span>' + (withCaret ? icon('caret', 'us-caret') : ''));
    b.type = 'button';
    b.setAttribute('aria-haspopup', 'true');
    b.setAttribute('aria-expanded', 'false');
    b.title = label;
    b.addEventListener('click', function(){
      if(skip && skip()){ closeMenu(); return; }
      openMenu(b, build);
    });
    return b;
  }

  function mount(){
    var q = document.getElementById('qualityGroup');
    if(q) qualityHome = q.parentElement;

    // Learn gets the same icon + label shape as Help and Program. Its label is
    // set here, so the i18n sweep must not overwrite the button's content.
    var learnBtn = document.getElementById('learnBtn');
    if(learnBtn){
      var learnLabel = (typeof t === 'function') ? t('panel.learn', 'Learn') : 'Learn';
      learnBtn.removeAttribute('data-i18n');
      learnBtn.classList.add('us-btn');
      learnBtn.innerHTML = icon('learn') + '<span class="us-lbl">' + learnLabel + '</span>';
    }

    var actions = document.querySelector('.panel-header .ph-actions');
    if(actions){
      // While hover help is on, this button is the way out of it: the app's own
      // click handler switches hover help off for any control, so no menu opens.
      var helpBtn = menuButton('ph-btn us-btn', tr('Help'), 'help', buildHelp, true,
        function(){ return typeof kpHelpMode !== 'undefined' && !!kpHelpMode; });
      helpBtn.id = 'usHelpBtn';
      var progBtn = menuButton('ph-btn us-btn', tr('Program'), 'file', buildProgram, true);
      progBtn.id = 'usProgramBtn';
      actions.appendChild(helpBtn);
      actions.appendChild(progBtn);
    }

    var badges = document.querySelector('.header-badges');
    if(badges){
      var setBtn = menuButton('us-btn us-head-btn', tr('Settings'), 'gear', buildSettings, false);
      setBtn.id = 'usSettingsBtn';
      var aboutBtn = el('button', 'us-btn us-head-btn', icon('info') + '<span class="us-lbl">' + tr('About') + '</span>');
      aboutBtn.type = 'button';
      aboutBtn.id = 'usAboutBtn';
      aboutBtn.title = tr('About');
      aboutBtn.addEventListener('click', function(){ closeMenu(); if(typeof openAboutPopup === 'function') openAboutPopup(); });
      badges.appendChild(setBtn);
      badges.appendChild(aboutBtn);
    }

    // Hover help changes the old Help button's look; mirror it on the new one.
    if(typeof window.toggleKpHelp === 'function'){
      var orig = window.toggleKpHelp;
      window.toggleKpHelp = function(){
        var r = orig.apply(this, arguments);
        var b = document.getElementById('usHelpBtn');
        if(b) b.classList.toggle('us-active', typeof kpHelpMode !== 'undefined' && !!kpHelpMode);
        return r;
      };
    }

    // About takes over the links that used to sit in the footer.
    if(typeof window.openAboutPopup === 'function'){
      var origAbout = window.openAboutPopup;
      window.openAboutPopup = function(){
        var r = origAbout.apply(this, arguments);
        var ov = document.getElementById('_aboutOverlay');
        // The corrected-programs library is no longer linked from the app.
        if(ov) Array.prototype.forEach.call(ov.querySelectorAll('a[href$="/examples/"]'), function(a){ a.remove(); });
        if(ov && !ov.querySelector('.us-play')){
          var mail = ov.querySelector('a[href^="mailto:"]');
          if(mail){
            var a = el('a', 'us-play');
            a.href = 'https://play.google.com/store/apps/details?id=org.tncsim.twa&pcampaignid=web_share';
            a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.textContent = tr('Android app on Google Play');
            a.style.cssText = 'flex:1 1 100%;display:inline-flex;align-items:center;justify-content:center;padding:8px 10px;font-size:11px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text2);text-decoration:none;';
            mail.parentNode.insertBefore(a, mail);
          }
        }
        return r;
      };
    }

    // Always visible: the one thing the project asks of its users.
    var footer = document.querySelector('footer');
    if(footer){
      var sup = el('button', 'us-support',
        '<span>' + tr('Support this project:') + '</span>'
        + '<b class="us-sup-long">' + tr('report a bug or suggest an improvement') + '</b>'
        + '<b class="us-sup-short">' + tr('report a bug or idea') + '</b>');
      sup.type = 'button';
      sup.id = 'usSupportBtn';
      sup.addEventListener('click', function(){ closeMenu(); if(typeof openBugReport === 'function') openBugReport(); });
      footer.appendChild(sup);
    }

    document.documentElement.classList.add('ui-shell');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
