/* i18n.js — web-only lightweight localization layer.
 *
 * Design goals:
 *  - Multi-language ready: add a language = add its code to LANGS + a map in I18N.
 *  - English is NOT stored here. The English source lives in the markup/JS as the
 *    fallback argument to t(key, english). If a key is missing for the active
 *    language, we fall back to that English string. Nothing breaks, ever.
 *  - No build step, classic script (loads before the deferred app scripts).
 *
 * Klartext syntax (BLK FORM, TOOL CALL, CYCL DEF, L, C, M3, Q200 …) is NC code,
 * not UI text — it is identical on a German control and must never be translated.
 * Only the descriptive prose around it is localized.
 */
(function () {
  'use strict';

  var LANGS = ['en', 'de'];                 // add 'sk', 'cs', … here later
  var LANG_NAMES = { en: 'EN', de: 'DE' };  // and their short labels here
  var STORE_KEY = 'tncsim.lang';

  // Translation maps. English is intentionally absent (it is the in-code source).
  var I18N = {
    de: {
      // header
      'logo.sub': 'Online-CNC-Simulator für Heidenhain TNC',
      'theme.title': 'Hell/Dunkel umschalten',
      'about.title': 'Über TNC Sim',
      'about.label': 'ⓘ Über',

      // editor panel header
      'panel.learn': 'Lernen',
      'panel.learnTitle': 'Interaktive Lektionen für Einsteiger',
      'panel.help': 'Hilfe',
      'panel.helpTitle': 'Kontexthilfe',
      'panel.mlist': 'M-Liste',
      'panel.mlistTitle': 'Alle definierten M-Funktionen auflisten',
      'panel.export': 'Export',
      'panel.exportTitle': 'program.H herunterladen',
      'panel.import': 'Import',
      'panel.importTitle': '.H-Programmdatei laden',
      'editor.blocks': 'Sätze',                 // Heidenhain: NC-Satz = one block/line
      'autosave.pending': 'Änderungen ausstehend',
      'autosave.saving': 'Wird gespeichert…',
      'autosave.saved': 'Gespeichert',
      'autosave.restored': 'Wiederhergestellt',
      'autosave.lesson': 'Lektion – Änderungen werden nicht gespeichert',
      'autosave.error': 'Speichern fehlgeschlagen',

      // Learn: lesson chrome, task card, live goals
      'learn.lesson': 'Lektion',
      'learn.title': 'Lernen \u2014 Heidenhain-Grundlagen',
      'learn.allLessons': 'Alle Lektionen',
      'learn.close': 'Lernen schlie\u00dfen',
      'learn.task': 'AUFGABE',
      'learn.answerMarker': 'DEINE ANTWORT \u2014 AUFGABE',
      'learn.answerKicker': 'DEINE ANTWORT',
      'learn.answerMarkedShort': 'Tippe unter der markierten ; >>> Zeile',
      'learn.answerWholeShort': 'Schreibe deine Antwort in den Editor darunter',
      'learn.answerAtMark': 'Tippe direkt unter der markierten <code>; &gt;&gt;&gt;</code> Zeile im hervorgehobenen Editor.',
      'learn.answerWhole': 'Schreibe deine Antwort in den hervorgehobenen Editor.',
      'learn.infoSlides': 'INFO-FOLIEN',
      'learn.reviewTheory': 'Lektionstheorie jederzeit ansehen',
      'learn.doneWhen': 'FERTIG, WENN',
      'learn.hint': 'TIPP',
      'learn.answer': 'L\u00d6SUNG',
      'learn.hintBtn': 'Tipp',
      'learn.showAnswer': 'L\u00f6sung zeigen',
      'learn.hintMore': 'Einen weiteren Tipp anzeigen',
      'learn.reset': 'Zur\u00fccksetzen',
      'learn.resetTask': 'Startprogramm neu laden',
      'learn.check': 'Pr\u00fcfen',
      'learn.next': 'Weiter',
      'learn.finish': 'Lektion abschlie\u00dfen',
      'learn.passed': 'Alle Ziele erreicht \u2014 gut gemacht!',
      'learn.lessonDone': 'Lektion abgeschlossen.',
      'learn.pressRun': 'Dr\u00fccke <b>Start</b> und sieh dein Programm in 3D.',
      'learn.readyNext': 'Bereit f\u00fcr die n\u00e4chste Aufgabe.',
      'learn.slide': 'Folie',
      'learn.prevSlide': 'Vorherige Folie',
      'learn.nextSlide': 'N\u00e4chste Folie',
      'learn.startPractice': '\u00dcbung starten',
      'learn.continuePractice': '\u00dcbung fortsetzen',
      'learn.practiceUnlock': 'Die \u00dcbung wird auf der letzten Info-Folie freigeschaltet',
      'learn.startHere': 'HIER STARTEN',
      'learn.complete': 'Lektionen abgeschlossen',
      'learn.resetProgress': 'Fortschritt zur\u00fccksetzen',
      'learn.intro': 'Kurze Lektionen mit kleinen \u00dcbungen, gel\u00f6st im <b>echten Editor</b> \u2014 der Simulator pr\u00fcft deinen Code. Der Fortschritt wird gespeichert.',
      'learn.finalNote': 'Schlie\u00dfe das abschlie\u00dfende Projekt ab, um den Kurs zu beenden. Versuche danach, Ma\u00dfe zu \u00e4ndern oder einen absichtlichen Fehler zu reparieren, ohne die L\u00f6sung zu \u00f6ffnen.',

      // toolbar
      'toolbar.stale': '⚠ neu ausführen',
      'toolbar.run': 'Start',
      'toolbar.step': 'Schritt',                // Heidenhain term: Einzelsatz
      'toolbar.stop': 'Stopp',
      'toolbar.reset': 'Reset',
      'toolbar.quality': 'QUALITÄT',
      'toolbar.qLow': 'Niedrig',
      'toolbar.qDef': 'Std',
      'toolbar.qHigh': 'Hoch',
      'toolbar.speed': 'TEMPO',

      // view tabs
      'view.3d': '3D-Ansicht',
      'view.2d': 'XY-Werkzeugbahn',
      'view.tools': 'Werkzeugtabelle',

      // canvas overlay buttons
      'canvas.measure': '◎ Messen',
      'canvas.refine': '◆ Verfeinern',
      'refine.title': 'Hochpräzises Netz berechnen',
      'canvas.path': '⛶ Bahn',
      'path.title': 'Werkzeugbahn ein-/ausblenden',
      'blkform.title': 'Werkstück ausblenden, nur Werkzeugbahn zeigen',
      'refine.indicator': 'Netz wird verfeinert…',

      // mobile tab bar
      'mobile.editor': 'Editor',
      'mobile.learn': 'Lernen',

      // footer
      'footer.bug': '🐛 Fehler mit einem Klick melden / Verbesserung vorschlagen',

      // cycle picker
      'cycle.select': 'Zyklus wählen',

      // bug report / suggestion modal
      'bug.title': '🐛 Fehler melden oder Verbesserung vorschlagen',
      'bug.choiceProblem': '🐛 Problem melden',
      'bug.choiceSuggest': '💡 Verbesserung vorschlagen',
      'bug.cancel': 'Abbrechen',
      'bug.close': 'Schließen',
      'bug.sendBug': 'Bericht senden',
      'bug.sendSuggest': 'Vorschlag senden',
      'bug.bugPh': 'Optional weitere Details hinzufügen…',
      'bug.suggestPh': 'Was möchtest du ergänzen oder verbessern?',
      'bug.warnBug': 'Der Bericht ist anonym. TNC Sim erfasst keine personenbezogenen Daten. Deine Beschreibung, das aktuelle NC-Programm und grundlegende technische Diagnosedaten werden an unseren öffentlichen GitHub-Tracker gesendet. Bitte gib keine vertraulichen Informationen an.',
      'bug.warnSuggest': 'Der Vorschlag ist anonym. TNC Sim erfasst keine personenbezogenen Daten. Dein Text und grundlegende technische Diagnosedaten werden an unseren öffentlichen GitHub-Tracker gesendet. Bitte gib keine vertraulichen Informationen an.',
      'bug.pf.js': 'Der Simulator ist bei der Verarbeitung dieses Programms auf einen internen Fehler gestoßen.',
      'bug.pf.lesson': 'Die Lektionsprüfung akzeptiert möglicherweise eine korrekte Lösung nicht.',
      'bug.pf.validator': 'Der Validator bewertet dieses Programm möglicherweise falsch.',
      'bug.pf.default': 'Das simulierte Ergebnis oder die Werkzeugbahn ist für dieses Programm möglicherweise falsch.',
      'bug.needText': 'Bitte beschreibe zuerst deinen Vorschlag.',
      'bug.sending': 'Wird gesendet…',
      'bug.sent': 'Danke! Dein Bericht wurde veröffentlicht: ',
      'bug.failed': 'Senden fehlgeschlagen. Bitte versuche es später erneut.',
      'bug.verifyFailed': 'Verifizierung fehlgeschlagen. Bitte versuche es erneut.',
      'bug.offline': 'Der Verifizierungsdienst ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',

      // help modal
      'help.title': 'TNC Sim — Hilfe'
    }
  };

  var _lang = (function () {
    try {
      var s = localStorage.getItem(STORE_KEY);
      if (s && LANGS.indexOf(s) >= 0) return s;
    } catch (e) {}
    return 'en';
  })();

  function t(key, fallback) {
    var m = I18N[_lang];
    if (m && Object.prototype.hasOwnProperty.call(m, key)) return m[key];
    return fallback;               // English source string
  }

  function getLang() { return _lang; }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0) return;
    try { localStorage.setItem(STORE_KEY, l); } catch (e) {}
    // v1: a full reload guarantees every dynamically rendered string is redrawn
    // in the new language. Live re-render can replace this later.
    location.reload();
  }

  function cycleLang() {
    setLang(LANGS[(LANGS.indexOf(_lang) + 1) % LANGS.length]);
  }

  // Sweep static DOM. Supported attributes:
  //   data-i18n        -> element.textContent
  //   data-i18n-html   -> element.innerHTML   (use when the value contains markup/emoji)
  //   data-i18n-title  -> title attribute
  //   data-i18n-aria   -> aria-label attribute
  //   data-i18n-ph     -> placeholder attribute
  function applyDom(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), el.textContent);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), el.innerHTML);
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'), el.title);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), el.getAttribute('aria-label') || ''));
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-ph'), el.placeholder || '');
    });
  }

  function init() {
    document.documentElement.setAttribute('lang', _lang);
    var lbl = document.getElementById('langLabel');
    // Button shows the language you'd switch TO, not the current one
    // (English page shows "DE", German page shows "EN").
    if (lbl) {
      var next = LANGS[(LANGS.indexOf(_lang) + 1) % LANGS.length];
      lbl.textContent = LANG_NAMES[next] || next.toUpperCase();
    }
    applyDom(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.I18N = {
    t: t, getLang: getLang, setLang: setLang, cycleLang: cycleLang,
    applyDom: applyDom, langs: LANGS, names: LANG_NAMES
  };
  window.t = t;   // global shorthand for use inside app.js / panels.js
})();
