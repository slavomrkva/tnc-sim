/* i18n-cycles-de.js — web-only German overlay for the CYCLES table (core/data-tables.js).
 * Mutates cycle/parameter *names* in place before the cycle picker or Q popups read
 * them, so both the picker dropdown and the auto-inserted CYCL DEF comments come out
 * localized. CYCL DEF numbers, Q-numbers and default values (Klartext) are untouched.
 */
(function () {
  if (!window.I18N || I18N.getLang() !== 'de') return;
  if (typeof CYCLES === 'undefined') return;

  var CYCLE_NAMES_DE = {
    200: 'Bohren',
    201: 'Reiben',
    209: 'Gewindebohren mit Spanbruch',
    208: 'Bohrfräsen'
  };

  var PARAM_NAMES_DE = {
    'Safety clearance':      'Sicherheits-Abstand',
    'Depth':                 'Tiefe',
    'Feed rate — plunge':    'Vorschub Zustellung',
    'Plunging depth':        'Zustelltiefe',
    'Dwell time at top':     'Verweilzeit oben',
    'Surface coordinate':    'Oberflächen-Koordinate',
    '2nd safety clearance':  '2. Sicherheits-Abstand',
    'Dwell time at depth':   'Verweilzeit unten',
    'Depth reference':       'Tiefenbezug',
    'Feed rate — reaming':   'Vorschub Reiben',
    'Retraction feed rate':  'Vorschub Rückzug',
    'Thread depth':          'Gewindetiefe',
    'Thread pitch':          'Gewindesteigung',
    'Depth per chip break':  'Zustelltiefe Spanbruch',
    'Chip break retract':    'Rückzug Spanbruch',
    'Spindle angle':         'Spindelwinkel',
    'Retraction factor':     'Rückzugfaktor',
    'Infeed per pass':       'Zustellung pro Schnitt',
    'Nominal diameter':      'Nenndurchmesser',
    'Pre-drilled dia.':      'Vorbohrdurchmesser',
    'Milling mode':          'Frässtrategie'
  };

  CYCLES.forEach(function (cyc) {
    if (CYCLE_NAMES_DE[cyc.num]) cyc.name = CYCLE_NAMES_DE[cyc.num];
    cyc.params.forEach(function (p) {
      if (PARAM_NAMES_DE[p.name]) p.name = PARAM_NAMES_DE[p.name];
    });
  });
})();
