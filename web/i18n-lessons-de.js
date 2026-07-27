/* i18n-lessons-de.js — deutsche Übersetzung der Learn-Lektionen (Overlay).
 *
 * Web-only. Ändert das globale LESSONS-Objekt beim Laden, wenn die UI-Sprache
 * Deutsch ist. Kein Eingriff in core/data-tables.js.
 *
 * Übersetzt werden nur: title, slides (Prosa), task.prompt, task.hints,
 * check.label, check.hint. Klartext-NC-Code in learnSnippet(...), die SVG-Helfer
 * (learnSvg…) und <code>-Tokens bleiben WÖRTLICH unverändert. Nur erklärende
 * Kommentare in Beispiel-Snippets sind übersetzt.
 *
 * Terminologie: HEIDENHAIN Benutzer-Handbuch Klartext-Dialog / Zyklen (TNC 640/620).
 *
 * BATCH 1/… : L00, L01, L02  (weitere Lektionen folgen im selben Schema)
 */
var LESSONS_DE = {

'L00': {
  title:'Los geht’s — deine erste Minute',
  slides:[
    { html:function(){ return ''
      + '<p>Lies die <b>INFO-FOLIEN</b> mit den Pfeiltasten. Starte die Übung auf der letzten Folie. Während der Übung kannst du die Folien jederzeit wieder öffnen.'
      + (typeof _isMTab==='function' && _isMTab() ? ' Auf Mobilgeräten findest du sie wieder im Bereich <b>Lernen</b>.' : '')
      + '</p>'; } },
    { html:function(){ return ''
      + '<p>Das Fragefeld zeigt die <b>Aufgabe</b>. Schreibe nur in die hervorgehobene Antwortzeile. Jeder Druck auf Hinweis zeigt eine weitere Hilfestufe:</p>'
      + '<div style="display:grid;gap:7px;margin:12px 0;font-family:var(--mono);font-size:11px;">'
      + '<div style="display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;background:rgba(74,158,255,.06);"><b style="color:var(--accent);">&#128161; Hinweis 1</b><span>ein kleiner Anstoß</span></div>'
      + '<div style="display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;background:rgba(74,158,255,.10);"><b style="color:var(--accent);">&#128161; Hinweis 2</b><span>die Struktur</span></div>'
      + '<div style="display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--accent);border-radius:6px;background:rgba(74,158,255,.16);"><b style="color:var(--accent);">&#128161; Hinweis 3</b><span>die vollständige Lösung</span></div>'
      + '</div>'; } },
    { html:function(){ return ''
      + '<p>Die Übung nutzt den echten Editor. Drücke danach die grüne Taste <b>Prüfen</b>. Die Anforderungen erscheinen grün oder rot; beim Bearbeiten werden sie wieder ausgeblendet.'
      + (typeof _isMTab==='function' && _isMTab() ? ' Mit Lernen, Editor und 3D unten wechselst du zwischen Lektion, Antwort und Ergebnis.' : '')
      + '</p>'; } }
  ],
  tasks:[
    {
      prompt:'Schreibe einen kurzen Kommentar in die hervorgehobene Zeile',
      hints:[
        'Ein Kommentar ist eine kurze Notiz für Menschen.',
        'Schreibe deinen Text nach dem Semikolon in die hervorgehobene Zeile.',
        'Zum Beispiel: <code>; Hallo</code>'
      ],
      checks:[
        {label:'Kommentar enthält Text nach ;',
         hint:'Schreibe ein Wort nach dem Semikolon in die hervorgehobene Zeile.'},
        {label:'Programmgerüst weiterhin gültig',
         hint:'Lass BEGIN PGM HELLO und END PGM HELLO unverändert.'}
      ]
    }
  ]
},

'L01': {
  title:'Programmgerüst & BLK FORM (das Rohteil)',
  slides:[
    { html:function(){ return ''
      + '<p>Ein Programm ist reiner Text, ein <b>Satz</b> pro Zeile. Es beginnt und endet immer mit demselben Namen; <code>MM</code> = Millimeter:</p>'
      + learnSnippet('BEGIN PGM PLATE MM\n;  ...deine Sätze kommen hierhin...\nEND PGM PLATE MM')
      + '<p>Die Steuerung schreibt diese beiden Zeilen <b>automatisch</b>, wenn du ein Programm anlegst — du tippst sie nie selbst. Alles nach <code>;</code> ist ein <b>Kommentar</b> — die Steuerung ignoriert es.</p>'; } },
    { html:function(){ return ''
      + '<p><b>BLK FORM</b> = das Rohteil, gegeben durch zwei Ecken: <code>0.1</code> MIN (unten), <code>0.2</code> MAX (oben). Obere Fläche bei <code>Z+0</code>, Tiefe in <b>negativem Z</b>:</p>'
      + learnSvgBlank(100, 80, 20)
      + learnSnippet('BLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0')
      + '<p>Das <code>Z</code> nach <code>0.1</code> ist die <b>Spindelachse</b>. Der Nullpunkt kann auch <b>unten</b> liegen: <code>0.1 \u2026 Z+0</code>, <code>0.2 \u2026 Z+20</code>.</p>'; } },
    { html:function(){ return ''
      + '<p>Das komplette Gerüst — das kleinste gültige Programm:</p>'
      + learnSnippet('BEGIN PGM PLATE MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\n; Werkzeug + Bewegungen folgen in der nächsten Lektion\nEND PGM PLATE MM')
      + '<p>Schreibe es jetzt selbst \u2014 starte die <b>Übung</b> unten. Dein Rohteil erscheint in 3D, während du tippst.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Füge dem Programm einen Kommentar hinzu \u2014 z. B. beschreibe das Rohteil',
      hints:[
        'Ein Kommentar ist eine Notiz für den Menschen; die Steuerung überspringt ihn. Welches Zeichen leitet ihn ein? Folie 1 zeigt es.',
        'Setze eine eigene neue Zeile <b>über</b> die erste BLK-FORM-Zeile. Sie muss mit <code>;</code> beginnen \u2014 alles danach ist freier Text.',
        'Tippe genau das als neue Zeile vor <code>BLK FORM 0.1</code>:<br><code>; Rohteil 100 x 80 x 20</code>'
      ],
      checks:[
        {label:'Programm enthält einen Kommentar (Text nach ;)',
         hint:'Alles nach einem Semikolon ist ein Kommentar. Füge eine Zeile hinzu wie:  ; Rohteil 100 x 80 x 20'},
        {label:'Programmgerüst weiterhin gültig',
         hint:'Lass BEGIN PGM / END PGM und beide BLK-FORM-Zeilen unangetastet.'},
        {label:'Rohteil unverändert (100 \u00d7 80 \u00d7 20 mm)',
         hint:'Füge nur eine Kommentarzeile hinzu \u2014 die BLK-FORM-Zeilen bleiben, wie sie sind.'}
      ]
    },
    {
      prompt:'Füge BLK FORM für ein Rohteil 90 \u00d7 40 \u00d7 15 mm hinzu (obere Fläche bei Z+0)',
      hints:[
        'Das Rohteil braucht immer <b>zwei</b> Zeilen: Ecke 0.1 = MIN (unten), Ecke 0.2 = MAX (oben). Beobachte die 3D-Ansicht \u2014 es erscheint, sobald beide Zeilen gültig sind.',
        'Zeile 0.1 trägt auch den Spindelachsen-Buchstaben und die <b>negative</b> Tiefe: <code>BLK FORM 0.1 Z X+0 Y+0 Z-?</code><br>Zeile 0.2 trägt die ferne Ecke: <code>BLK FORM 0.2 X+? Y+? Z+0</code>',
        'Obere Fläche bei Z+0 und 15 mm tief heißt, der Boden sitzt bei Z-15:<br><code>BLK FORM 0.1 Z X+0 Y+0 Z-15</code><br><code>BLK FORM 0.2 X+90 Y+40 Z+0</code>'
      ],
      checks:[
        {label:'Programmgerüst intakt (BEGIN/END)',
         hint:'Lösche oder ändere die Zeilen BEGIN PGM / END PGM nicht \u2014 die Steuerung erzeugt sie für dich.'},
        {label:'Rohteil ist 90 \u00d7 40 mm, 15 mm tief (Z-15 \u2192 Z+0)',
         hint:'Zwei BLK-FORM-Zeilen: 0.1 Z X+0 Y+0 Z-15 und 0.2 X+90 Y+40 Z+0.'},
        {label:'Spindelachse Z in BLK FORM 0.1 deklariert',
         hint:'Der Achsbuchstabe steht direkt nach 0.1: BLK FORM 0.1 Z \u2026'}
      ]
    },
    {
      prompt:'Füge BLK FORM mit Z+0 am BODEN des Rohteils hinzu: 100 \u00d7 100 \u00d7 20 mm, obere Fläche bei Z+20',
      hints:[
        'Dieselben zwei Zeilen wie zuvor \u2014 nur der Bezugspunkt ist verschoben. Wenn der Nullpunkt an der Bodenfläche liegt, ist dann noch ein Teil des Rohteils in negativem Z?',
        'Das ganze Rohteil liegt jetzt im <b>positiven</b> Z: die MIN-Ecke sitzt bei <code>Z+0</code> und die MAX-Ecke 20 mm darüber.',
        '<code>BLK FORM 0.1 Z X+0 Y+0 Z+0</code><br><code>BLK FORM 0.2 X+100 Y+100 Z+20</code>'
      ],
      checks:[
        {label:'Programmgerüst gültig',
         hint:'Behalte BEGIN PGM BOTTOM MM \u2026 END PGM BOTTOM MM.'},
        {label:'Rohteil 100 \u00d7 100 \u00d7 20 mit Z+0 am Boden (Z+0 \u2192 Z+20)',
         hint:'Ecke 0.1 sitzt bei Z+0, Ecke 0.2 bei Z+20 \u2014 das ganze Rohteil liegt im positiven Z.'},
        {label:'Spindelachse Z in BLK FORM 0.1 deklariert',
         hint:'BLK FORM 0.1 Z X+0 Y+0 Z+0'}
      ]
    }
  ]
},

'L02': {
  title:'Werkzeug & Spindel \u2014 TOOL CALL, S, F, M3/M8',
  slides:[
    { html:function(){ return ''
      + '<p><b>TOOL CALL</b> lädt ein Werkzeug aus der Werkzeugtabelle: Werkzeugnummer, Spindelachse <code>Z</code>, Spindeldrehzahl <code>S</code> in U/min und Standard-Vorschub <code>F</code> in mm/min:</p>'
      + learnSnippet('TOOL CALL 1 Z S3000 F500')
      + '<p>Werkzeug <code>1</code> ist der Schaftfräser D10 \u2014 siehe den Reiter <b>Werkzeuge</b>.</p>'; } },
    { html:function(){ return ''
      + learnSvgTool()
      + '<p>Die Tabelle speichert, was die Steuerung nicht erraten kann: <b>L</b>, damit das programmierte Z genau trifft, <b>R</b> für die Radiuskorrektur, <b>LCUTS</b> = nutzbare Schneidenlänge.</p>'; } },
    { html:function(){ return ''
      + '<p><b>M-Funktionen</b> schalten Maschinenzustände:</p>'
      + learnSnippet('M3  ; Spindel EIN (im Uhrzeigersinn)\nM8  ; Kühlmittel EIN\n;   ...Bearbeitung...\nM5  ; Spindel AUS\nM9  ; Kühlmittel AUS')
      + '<p>Typische Reihenfolge: <b>TOOL CALL \u2192 M3 M8 \u2192 Bearbeitung \u2192 M5 M9</b>. Zerspanen mit stehender Spindel bricht Werkzeuge.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Rufe Werkzeug 1 (Schaftfräser D10) mit Spindel 3000 U/min und Vorschub 500 auf',
      hints:[
        'Ein Werkzeug wird auf einer Zeile geladen, die mit <code>TOOL CALL</code> beginnt \u2014 Folie 1 zeigt die Form.',
        'Fülle <code>TOOL CALL 1 Z S… F…</code> aus: die Spindelachse ist Z, dann Drehzahl und Vorschub.',
        '<code>TOOL CALL 1 Z S3000 F500</code>'
      ],
      checks:[
        {label:'TOOL CALL 1 Z mit S3000 und F500',
         hint:'Eine Zeile: TOOL CALL 1 Z S3000 F500'}
      ]
    },
    {
      prompt:'Schalte Spindel und Kühlmittel EIN, nach dem Werkzeug-Aufruf',
      hints:[
        'Maschinenzustände schalten mit <b>M-Funktionen</b>, eine pro Zeile \u2014 siehe Folie 3.',
        'Eine Zeile mit nur <code>M3</code> (Spindel ein), dann eine Zeile mit nur <code>M8</code> (Kühlmittel ein), unter dem TOOL CALL.',
        '<code>M3</code><br><code>M8</code>'
      ],
      checks:[
        {label:'Spindel EIN \u2014 M3', hint:'Füge einen Satz mit nur M3 hinzu.'},
        {label:'Kühlmittel EIN \u2014 M8', hint:'Füge einen Satz mit nur M8 hinzu.'},
        {label:'M3 kommt nach dem TOOL CALL',
         hint:'Zuerst das Werkzeug laden, dann die Spindel starten.'}
      ]
    },
    {
      prompt:'Bereite den Bohrer D6.8 (Werkzeug 4) vor: Werkzeug-Aufruf mit S2500 F150, Spindel und Kühlmittel EIN, und beide am Ende AUS',
      hints:[
        'Folge dem Rezept von Folie 3: Werkzeug laden, einschalten, bearbeiten, ausschalten.',
        '<code>TOOL CALL 4 Z S2500 F150</code>, dann <code>M3</code> und <code>M8</code>; lass die Bohr-Lücke; beende mit <code>M5</code>, dann <code>M9</code>.',
        '<code>TOOL CALL 4 Z S2500 F150</code><br><code>M3</code><br><code>M8</code><br>…<br><code>M5</code><br><code>M9</code>'
      ],
      checks:[
        {label:'TOOL CALL 4 Z mit S2500 und F150',
         hint:'TOOL CALL 4 Z S2500 F150'},
        {label:'M3 \u2014 Spindel EIN', hint:'Starte die Spindel nach dem Werkzeug-Aufruf.'},
        {label:'M8 \u2014 Kühlmittel EIN', hint:'Kühlmittel ein vor dem Bohren.'},
        {label:'M5 \u2014 Spindel AUS am Ende',
         hint:'Nach getaner Arbeit: M5 (und M9).'},
        {label:'M9 \u2014 Kühlmittel AUS am Ende',
         hint:'Schalte das Kühlmittel mit M9 nach M5 aus.'}
      ]
    }
  ]
},

'L03': {
  title:'Erste Bewegungen \u2014 L-Sätze, FMAX & sicheres Anfahren',
  slides:[
    { html:function(){ return ''
      + '<p>Ein <b>L</b>-Satz verfährt geradlinig zum Ziel. <code>FMAX</code> = Eilgang \u2014 nur zum Positionieren, <b>niemals zerspanen</b>. <code>F</code> = Vorschub zum Zerspanen:</p>'
      + learnSnippet('L X+50 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200')
      + '<p>Koordinaten sind <b>modal</b> \u2014 schreibe nur, was sich ändert.</p>'; } },
    { html:function(){ return ''
      + learnSvgApproach()
      + '<p>Das sichere Muster: im Eilgang <b>hoch über</b> das Teil \u2192 im Eilgang herunter auf <b>+2 mm</b> über der Oberfläche \u2192 im <b>Vorschub</b> ins Material. Fahre nie im Eilgang durch Material oder durch Raum, der nicht als frei erwiesen ist; ein Eilgang unter der Oberfläche ist nur auf einem bekannten, bereits freigefahrenen Weg sicher.</p>'; } },
    { html:function(){ return ''
      + '<p>Gerade <b>nach oben</b> mit FMAX zurückzuziehen ist in Ordnung \u2014 der Weg über dir ist bereits ausgeräumt:</p>'
      + learnSvgSafeRetract()
      + learnSnippet('L X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200\nL X+80 F300\nL Z+50 FMAX'); } }
  ],
  tasks:[
    {
      prompt:'Fahre im Eilgang auf X+20 Y+40 in sicherer Höhe Z+50',
      hints:[
        'Eine gerade Bewegung ist ein <code>L</code>-Satz; <code>FMAX</code> macht sie zum Eilgang \u2014 schnelles Positionieren, kein Zerspanen.',
        'Eine Zeile: <code>L</code>, dann das Ziel <code>X.. Y.. Z..</code>, dann <code>FMAX</code>.',
        '<code>L X+20 Y+40 Z+50 FMAX</code>'
      ],
      checks:[
        {label:'Eilgangbewegung endet bei X+20 Y+40 Z+50',
         hint:'L X+20 Y+40 Z+50 FMAX'}
      ]
    },
    {
      prompt:'Fahre im Eilgang herunter auf Z+2, dann tauche mit Vorschub F200 auf Z-3 ein',
      hints:[
        'Zwei Bewegungen: schnell bis knapp über das Teil, dann langsam mit Vorschub <b>hinein</b>. Eilgänge zerspanen nie.',
        '<code>L Z+2 FMAX</code> schwebt 2 mm darüber; <code>L Z-3 F…</code> taucht unter die Oberfläche.',
        '<code>L Z+2 FMAX</code><br><code>L Z-3 F200</code>'
      ],
      checks:[
        {label:'Eilgang stoppt bei Z+2 über der Oberfläche',
         hint:'L Z+2 FMAX \u2014 X und Y sind modal, kein Wiederholen nötig.'},
        {label:'Vorschub-Eintauchen erreicht Z-3',
         hint:'L Z-3 F200 \u2014 unter der Oberfläche immer mit F, nie FMAX.'},
        {label:'Keine Eilgangbewegung unter der Oberfläche',
         hint:'Die Bewegung unter Z+0 muss F200 nutzen, nicht FMAX.'}
      ]
    },
    {
      prompt:'Zerspane mit Vorschub F300 auf X+80 (bleib bei Z-3), dann ziehe im Eilgang FMAX auf Z+50 zurück',
      hints:[
        'Eine echte Zerspanungsbewegung hat einen Vorschub und kein <code>FMAX</code>; dann frei springen mit einem Eilgang in Z.',
        '<code>L X+80 F300</code> zerspant auf Tiefe hinüber; <code>L Z+50 FMAX</code> hebt schnell heraus.',
        '<code>L X+80 F300</code><br><code>L Z+50 FMAX</code>'
      ],
      checks:[
        {label:'Schnitt erreicht X+80 bei Z-3',
         hint:'L X+80 F300 \u2014 Z bleibt, wo es ist.'},
        {label:'Rückzug auf Z+50 mit FMAX',
         hint:'L Z+50 FMAX \u2014 gerade nach oben aus der Nut ist sicher.'},
        {label:'Kein Eilgang-Absenken unter die Oberfläche',
         hint:'Nur der Rückzug (aufwärts) darf FMAX sein.'}
      ]
    }
  ]
},

'L04': {
  title:'Erste Nut \u2014 Tiefe & inkremental IX/IY',
  slides:[
    { html:function(){ return ''
      + '<p>Eine Vorschubbewegung unter der Oberfläche <b>zerspant</b>. Das Werkzeug D10 hinterlässt eine 10 mm breite Nut entlang der Bahnmittellinie:</p>'
      + learnSvgSlotWidth()
      + learnSnippet('L Z-2 F150\nL X+80 F300'); } },
    { html:function(){ return ''
      + '<p><b>Inkrementale</b> Koordinaten <code>IX/IY/IZ</code> bewegen <b>relativ zur aktuellen Position</b> \u2014 ideal für Stufen und Muster:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL IX+20 F300\nL IY+15\nL IX+20\nL IY+15\nL IX+20\nEND PGM D MM', true)
      + learnSnippet('L IX+20 F300\nL IY+15\nL IX+20'); } },
    { html:function(){ return ''
      + '<p>Tiefere Nuten werden in <b>Schnitten</b> zerspant: Bahn fahren, zustellen, zurückfahren:</p>'
      + learnSnippet('L Z-2 F150\nL X+80 F300\nL Z-4 F150\nL X+20 F300')
      + '<p>Jeder Schnitt nimmt 2 mm \u2014 schonender fürs Werkzeug als ein 4-mm-Schnitt.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Tauche auf Z-2 mit F150 ein und fräse eine gerade Nut auf X+80 mit F300',
      hints:[
        'Gleicher Rhythmus: mit Vorschub auf Tiefe eintauchen, dann entlang der Nut zerspanen.',
        '<code>L Z-2 F…</code>, um die Tiefe zu erreichen, dann <code>L X+80 F…</code>, um zu fräsen.',
        '<code>L Z-2 F150</code><br><code>L X+80 F300</code>'
      ],
      checks:[
        {label:'Nut auf X+80 bei Z-2 gefräst',
         hint:'L Z-2 F150, dann L X+80 F300.'},
        {label:'Kein Eilgang unter der Oberfläche',
         hint:'Beide Bewegungen unter Z+0 brauchen einen Vorschub.'},
        {label:'Tiefe ist genau 2 mm',
         hint:'Prüfe Vorzeichen und Wert: Z-2.'}
      ]
    },
    {
      prompt:'Setze mit inkrementalen Bewegungen fort: IY+20, dann IX-30 (weiterhin bei Z-2)',
      hints:[
        '<code>IX</code>/<code>IY</code> sind <b>relative</b> Schritte \u2014 von der aktuellen Position, kein absoluter Punkt.',
        '<code>L IY+20 F300</code> schrittet +20 in Y; <code>L IX-30</code> dann -30 in X (der Vorschub wird übernommen).',
        '<code>L IY+20 F300</code><br><code>L IX-30</code>'
      ],
      checks:[
        {label:'Inkremental IY+20 verwendet',
         hint:'L IY+20 \u2014 das Präfix I macht es relativ.'},
        {label:'Inkremental IX-30 verwendet',
         hint:'L IX-30 \u2014 negatives Inkrement fährt in X zurück.'},
        {label:'Erster Schritt endet bei X+80 Y+60',
         hint:'Von (80,40) landet IY+20 bei (80,60).'},
        {label:'Zweiter Schritt endet bei X+50 Y+60',
         hint:'Von (80,60) landet IX-30 bei (50,60).'}
      ]
    },
    {
      prompt:'Zerspane einen zweiten, tieferen Schnitt der ersten Nut bei Z-4',
      hints:[
        'Etwas tiefer gehen, dann in die andere Richtung zurückzerspanen \u2014 ein zweiter Schnitt.',
        '<code>L Z-4 F…</code> für den tieferen Schnitt, dann <code>L X+20 F…</code>, um zurückzufräsen.',
        '<code>L Z-4 F150</code><br><code>L X+20 F300</code>'
      ],
      checks:[
        {label:'Tiefster Punkt ist Z-4',
         hint:'Zustellen: L Z-4 F150.'},
        {label:'Nut zurückgefräst auf X+20 bei Z-4',
         hint:'Nach dem Zustellen zurückfräsen: L X+20 F300.'},
        {label:'Kein Eilgang unter der Oberfläche',
         hint:'Der Schritt von Z-2 auf Z-4 braucht einen Vorschub.'}
      ]
    }
  ]
},

'L05': {
  title:'Kreisbögen \u2014 CC + C und CR',
  slides:[
    { html:function(){ return ''
      + '<p><b>CC</b> setzt den Kreismittelpunkt; <b>C</b> zerspant dann entlang dieses Kreises zum Endpunkt. Richtung: <code>DR+</code> = gegen den Uhrzeigersinn, <code>DR-</code> = im Uhrzeigersinn:</p>'
      + learnSvgArcCC()
      + learnSnippet('CC X+35 Y+45\nC X+50 Y+45 DR-')
      + '<p>Hier geht <code>DR-</code> (im Uhrzeigersinn) über die Oberseite des Kreises.</p>'; } },
    { html:function(){ return ''
      + '<p><b>CR</b> braucht keinen Mittelpunkt \u2014 nur den Endpunkt und den Radius. Das Vorzeichen von R wählt den Bogen: <code>R+</code> \u2264 180\u00b0, <code>R-</code> &gt; 180\u00b0:</p>'
      + learnSvgArcCRCompare()
      + learnSnippet('CR X+80 Y+45 R+15 DR-'); } },
    { html:function(){ return ''
      + '<p>Bogensätze verketten sich frei mit geraden Sätzen. In der Übung fräst du eine kleine geschlossene Form aus zwei Bögen und zwei Geraden \u2014 folge den drei Schritten und <b>starte am Ende die Simulation</b>, um zu sehen, was du gemacht hast.</p>'
      + learnSnippet('L ...        ; Gerade\nCC ... / C ... ; Bogen über Mittelpunkt\nCR ...       ; Bogen über Radius\nL ...        ; Gerade')
      + '<p>Richtungs-Merkhilfe: <code>DR+</code> gegen den Uhrzeigersinn, <code>DR-</code> im Uhrzeigersinn.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Füge unter dem letzten L-Satz CC X+35 Y+45 (Kreismittelpunkt) hinzu, dann einen C-Satz auf X+50 Y+45 mit Richtung im Uhrzeigersinn DR-',
      hints:[
        'Ein <code>C</code>-Bogen braucht zuerst einen Mittelpunkt: <code>CC</code> markiert ihn, dann schwenkt <code>C</code> zum Ende. <code>DR-</code> = im Uhrzeigersinn.',
        '<code>CC X+35 Y+45</code> setzt den Mittelpunkt; dann <code>C X+50 Y+45 DR-</code> bogt dorthin.',
        '<code>CC X+35 Y+45</code><br><code>C X+50 Y+45 DR-</code>'
      ],
      checks:[
        {label:'Mittelpunkt gesetzt: CC X+35 Y+45',
         hint:'CC setzt nur den Mittelpunkt \u2014 es bewegt das Werkzeug nicht.'},
        {label:'Bogen geht über die Oberseite (durch X+35 Y+60)',
         hint:'C X+50 Y+45 DR- \u2014 DR- ist im Uhrzeigersinn, über die Oberseite des Kreises.'},
        {label:'Bogen endet bei X+50 Y+45',
         hint:'Der Endpunkt steht auf dem C-Satz.'}
      ]
    },
    {
      prompt:'Setze mit CR fort: Radius 15 auf X+80 Y+45, wieder über die Oberseite (DR-)',
      hints:[
        '<code>CR</code> zeichnet einen Bogen über seinen <b>Radius</b> statt über einen Mittelpunkt \u2014 praktisch, wenn du R kennst, nicht den Mittelpunkt.',
        '<code>CR</code>, dann das Ende <code>X.. Y..</code>, der Radius <code>R+15</code>, und die Richtung <code>DR-</code>.',
        '<code>CR X+80 Y+45 R+15 DR-</code>'
      ],
      checks:[
        {label:'CR-Satz verwendet (Radiusbogen, ohne Mittelpunkt)',
         hint:'CR X+80 Y+45 R+15 DR-'},
        {label:'Bogen geht über die Oberseite (durch X+65 Y+60)',
         hint:'DR- lässt den Bogen über die Oberseite laufen; DR+ würde darunter tauchen.'},
        {label:'Bogen endet bei X+80 Y+45',
         hint:'Endpunkt und Radius stehen beide auf dem CR-Satz.'}
      ]
    },
    {
      prompt:'Schließe die Form: zerspane eine Gerade zurück auf X+50 Y+10, ziehe mit FMAX auf Z+50 zurück \u2014 dann drücke Start und schau dir an, was du gefräst hast',
      hints:[
        'Beende den Umriss mit einer geraden Rückbewegung, dann hebe frei.',
        '<code>L X+50 Y+10</code> schließt die Form; <code>L Z+50 FMAX</code> zieht zurück.',
        '<code>L X+50 Y+10</code><br><code>L Z+50 FMAX</code>'
      ],
      checks:[
        {label:'Form nach den Bögen bei X+50 Y+10 geschlossen',
         hint:'L X+50 Y+10 \u2014 ein einfacher gerader Satz.'},
        {label:'Rückzug nach dem Schließen mit FMAX auf Z+50',
         hint:'L Z+50 FMAX \u2014 gerade nach oben.'},
        {label:'Kein Eilgang-Absenken unter die Oberfläche',
         hint:'Nur der Rückzug nach oben darf FMAX sein.'}
      ]
    }
  ]
},

'L06': {
  title:'Ecken \u2014 RND-Rundung & CHF-Fase',
  slides:[
    { html:function(){ return ''
      + learnSvgCorner()
      + '<p><b>RND</b> ersetzt eine scharfe Ecke durch einen Bogen mit Radius R; <b>CHF</b> schneidet sie mit einer geraden 45\u00b0-Fase ab. Beide stehen auf einem <b>eigenen Satz zwischen zwei geraden Bewegungen</b>.</p>'; } },
    { html:function(){ return ''
      + '<p>Der Rundungssatz nennt nur den Radius \u2014 die Steuerung berechnet den Tangentenbogen selbst:</p>'
      + learnSvgRndDetail()
      + learnSnippet('L X+70 F300\nRND R10\nL Y+60'); } },
    { html:function(){ return ''
      + '<p><b>CHF</b> funktioniert genauso \u2014 die Zahl ist die Fasenlänge in mm:</p>'
      + learnSvgChfDetail()
      + learnSnippet('L X+70 F300\nCHF 8\nL Y+60'); } }
  ],
  tasks:[
    {
      prompt:'Runde die Ecke: füge RND R10 zwischen den beiden geraden Bewegungen ein',
      hints:[
        '<code>RND</code> rundet die Ecke <b>zwischen</b> zwei geraden Bewegungen \u2014 sie steht auf einer eigenen Zeile dazwischen.',
        'Eine einzige Zeile <code>RND R…</code> mit dem Radius, platziert zwischen den beiden <code>L</code>-Sätzen.',
        '<code>RND R10</code>'
      ],
      checks:[
        {label:'RND R10 auf eigenem Satz',
         hint:'Schreibe RND R10 auf die leere Zeile zwischen L X+70 und L Y+60.'},
        {label:'Ecke durch einen Bogen ersetzt',
         hint:'Der Bogen ist tangential an beide Linien \u2014 an ihnen ist keine Code-Änderung nötig.'},
        {label:'Bahn endet weiterhin bei X+70 Y+60',
         hint:'Behalte den Satz L Y+60, wie er ist.'}
      ]
    },
    {
      prompt:'Schneide dieselbe Ecke nun mit einer Fase statt einer Rundung: füge CHF 8 ein',
      hints:[
        '<code>CHF</code> legt eine gerade <b>Fase</b> über die Ecke, statt sie zu runden.',
        'Eine Zeile <code>CHF …</code> mit der Fasenbreite, wieder zwischen den beiden geraden Bewegungen.',
        '<code>CHF 8</code>'
      ],
      checks:[
        {label:'CHF 8 auf eigenem Satz',
         hint:'CHF 8 zwischen den beiden geraden Bewegungen.'},
        {label:'Ecke durch eine gerade Fase geschnitten',
         hint:'Die Fase läuft von X+62 Y+20 nach X+70 Y+28.'},
        {label:'Bahn endet weiterhin bei X+70 Y+60',
         hint:'Behalte den Satz L Y+60, wie er ist.'}
      ]
    },
    {
      prompt:'Fräse eine L-förmige Bahn mit BEIDEN: X+70 (RND R10), hoch auf Y+60 (CHF 8), dann links auf X+20',
      hints:[
        'Jede Einfügung liegt zwischen den beiden Bewegungen, die ihre Ecke bilden \u2014 also Bewegung, Einfügung, Bewegung, Einfügung, Bewegung.',
        '<code>L X+70 F300</code>, dann <code>RND R10</code>, dann <code>L Y+60</code>, dann <code>CHF 8</code>, dann <code>L X+20</code>.',
        '<code>L X+70 F300</code><br><code>RND R10</code><br><code>L Y+60</code><br><code>CHF 8</code><br><code>L X+20</code>'
      ],
      checks:[
        {label:'Erste Ecke mit RND R10 gerundet',
         hint:'L X+70 F300, dann RND R10, dann L Y+60.'},
        {label:'Zweite Ecke mit CHF 8 gefast',
         hint:'Nach L Y+60: CHF 8, dann L X+20.'},
        {label:'Fase an der zweiten Ecke geschnitten',
         hint:'Die Fase läuft von X+70 Y+52 nach X+62 Y+60.'},
        {label:'Bahn endet bei X+20 Y+60',
         hint:'Letzter Satz: L X+20.'}
      ]
    }
  ]
},

'L07': {
  title:'Radiuskorrektur \u2014 RL / RR / R0',
  slides:[
    { html:function(){ return ''
      + learnSvgComp()
      + '<p>Ohne Korrektur programmierst du die Werkzeug<b>mitte</b> \u2014 das halbe Werkzeug frisst in deine Wand. Mit <b>RL/RR</b> programmierst du die <b>Kontur</b> und die Steuerung verschiebt die Bahn um den Werkzeugradius aus der Tabelle.</p>'; } },
    { html:function(){ return ''
      + '<p>Aktiviere die Korrektur im ersten Kontursatz, angefahren von <b>außerhalb</b> des Materials; hebe sie mit <b>R0</b> nach dem Verlassen auf:</p>'
      + learnSnippet('L X+50 Y-10 Z-2 FMAX R0\nL Y+0 RL F300\nL Y+80\nL Y+90 R0')
      + '<p><code>RL</code> = Werkzeug <b>links</b> der Bahn, <code>RR</code> = rechts \u2014 in Bewegungsrichtung gesehen.</p>'; } },
    { html:function(){ return ''
      + '<p>Bei Bewegung in Y+ setzt <code>RL</code> die Werkzeugmitte auf die <b>linke</b> Seite der programmierten Kontur. Mit T1 = D10 (R5) läuft die Mitte bei X+45, während die Werkzeugschneide die programmierte Wand X+50 berührt:</p>'
      + learnSvgCompPath()
      + '<p>Du programmierst weiterhin die geforderte Wand bei X+50. Die Steuerung berechnet den 5-mm-Mittenversatz aus der Werkzeugtabelle.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Drücke Start und beobachte, wie das Werkzeug 5 mm ins Teil beißt \u2014 füge dann RR zum Satz L Y+0 hinzu und starte erneut: jetzt nimmt es nur 1 mm von der Kante',
      hints:[
        'Die Korrektur versetzt das Werkzeug um seinen Radius, damit die <b>Schneide</b> deiner Linie folgt. <code>RR</code> = Werkzeug rechts der Bahn.',
        'Füge <code>RR</code> zur bestehenden Bewegung hinzu, direkt nach der Koordinate: <code>L Y+0 RR F300</code>.',
        '<code>L Y+0 RR F300</code>'
      ],
      checks:[
        {label:'RR zum Satz L Y+0 hinzugefügt',
         hint:'Nur ein Wort ergänzen: L Y+0 RR F300'},
        {label:'Werkzeugmitte bei X+55 \u2014 nur die 1-mm-Lippe jenseits X+50 wird entfernt',
         hint:'RR setzt das Werkzeug RECHTS der +Y-Bewegung; ohne es saß die Mitte AUF der Linie und fraß 5 mm vom Teil.'}
      ]
    },
    {
      prompt:'Hebe die Korrektur auf: füge nach der Kontur einen Satz L Y+90 R0 hinzu',
      hints:[
        '<code>R0</code> schaltet die Korrektur <b>aus</b> \u2014 zurück zur Werkzeugmitte auf der Bahn.',
        'Eine Bewegung, die auf <code>R0</code> endet: <code>L Y+90 R0</code>.',
        '<code>L Y+90 R0</code>'
      ],
      checks:[
        {label:'R0 auf dem Satz Y+90, nach RR',
         hint:'L Y+90 R0 \u2014 das Werkzeug rampt zurück auf die programmierte Linie.'},
        {label:'Werkzeug kehrt bei Y+90 auf die programmierte Linie zurück',
         hint:'Mit R0 ist das Ziel nicht mehr versetzt.'}
      ]
    },
    {
      prompt:'Füge die Kontursätze hinzu: L Y+0 RL F300 (aktiviert linke Korrektur), dann L Y+80, und hebe mit L Y+90 R0 auf \u2014 das Werkzeug arbeitet nun auf der anderen Seite der Wand',
      hints:[
        '<code>RL</code> setzt das Werkzeug auf die <b>linke</b> Seite der Bahn \u2014 die andere Wandseite als RR.',
        'Einschalten <code>L Y+0 RL F300</code>, weiter zerspanen <code>L Y+80</code>, ausschalten <code>L Y+90 R0</code>.',
        '<code>L Y+0 RL F300</code><br><code>L Y+80</code><br><code>L Y+90 R0</code>'
      ],
      checks:[
        {label:'Linke Korrektur RL aktiviert',
         hint:'L Y+0 RL F300 \u2014 Kontursätze, dann mit R0 aufheben.'},
        {label:'Werkzeugmitte läuft bei X+45 \u2014 links der +Y-Bewegung',
         hint:'RL = Werkzeug LINKS der Bewegung, also bei X+45 für die Wand X+50.'}
      ]
    }
  ]
},

'L08': {
  title:'Bohren \u2014 CYCL DEF 200 + M99',
  slides:[
    { html:function(){ return ''
      + learnSvgPeckDrill()
      + '<p>Ein <b>Zyklus</b> ist eine feste Routine, gesteuert durch Q-Parameter. Zyklus <b>200</b> bohrt mit schrittweiser Tiefenzustellung \u2014 einmal definieren, an jeder Bohrung aufrufen.</p>'; } },
    { html:function(){ return ''
      + '<p>Die Tiefe <code>Q201</code> ist <b>negativ</b>, gemessen von der Oberfläche <code>Q203</code>:</p>'
      + learnSnippet('CYCL DEF 200\n  Q200=+2   ;Sicherheitsabstand\n  Q201=-10  ;Tiefe\n  Q206=+150 ;Vorschub Tiefenzustellung\n  Q202=+5   ;Zustell-Tiefe\n  Q210=+0 ;Verweilzeit oben\n  Q203=+0   ;Oberfläche Z\n  Q204=+30  ;2. Sicherheitsabstand\n  Q211=+0')
      + '<p><code>Q200</code> ist der kleine Anfahrabstand über der Bohrung. <code>Q204</code> (<b>2. Sicherheitsabstand</b>) ist die Höhe, auf die das Werkzeug <b>nach</b> der Bohrung zurückzieht \u2014 hoch genug, um sicher über Spannmittel und Vorrichtungen zur nächsten Position zu fahren.</p>'; } },
    { html:function(){ return ''
      + '<p>Der Zyklus läuft dort, wo du ihn <b>aufrufst</b>: <code>M99</code> auf einem Positioniersatz bohrt an diesem XY. Ein Satz pro Bohrung:</p>'
      + learnSnippet('L X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nL X+70 Y+50 FMAX M99')
      + '<p>(<code>M89</code> würde ihn nach <b>jedem</b> Satz aufrufen, bis M99 ihn beendet.)</p>'; } }
  ],
  tasks:[
    {
      prompt:'Definiere Zyklus 200: Tiefe 10 mm, Zustellung 5 mm, Sicherheitsabstand 2 mm, Oberfläche bei Z+0',
      hints:[
        'Ein <b>Zyklus</b> wird einmal definiert, dann an jeder Position ausgelöst. <code>CYCL DEF 200</code> ist Bohren; seine <code>Q</code>-Werte sind Tiefe, Zustellung, Abstand… (Folie).',
        'Die wichtigen: <code>Q201</code>=Tiefe -10, <code>Q202</code>=Zustellung 5, <code>Q200</code>=Abstand 2, <code>Q203</code>=Oberfläche 0.',
        'Tippe den Satz <code>CYCL DEF 200</code> von der Folie, mit <code>Q201=-10</code>, <code>Q202=+5</code>, <code>Q200=+2</code>, <code>Q203=+0</code>.'
      ],
      checks:[
        {label:'CYCL DEF 200 definiert',
         hint:'Beginne mit der Zeile: CYCL DEF 200'},
        {label:'Tiefe Q201 = -10',
         hint:'Die Tiefe ist negativ: Q201=-10.'},
        {label:'Zustellung Q202 = +5',
         hint:'Q202=+5 \u2014 der Bohrer zieht nach jeweils 5 mm zurück.'},
        {label:'Sicherheitsabstand Q200 = +2',
         hint:'Q200=+2 über der Oberfläche.'},
        {label:'Oberfläche Q203 = +0',
         hint:'Q203=+0 setzt die Werkstück-Oberfläche auf Z0.'}
      ]
    },
    {
      prompt:'Bohre eine Bohrung bei X+30 Y+30, indem du den Zyklus mit M99 aufrufst',
      hints:[
        'Der Zyklus <i>definiert</i> das Bohren nur \u2014 <code>M99</code> an einer Position löst es dort tatsächlich aus.',
        'Fahre im Eilgang zur Stelle und hänge <code>M99</code> an: <code>L X+30 Y+30 FMAX M99</code>.',
        '<code>L X+30 Y+30 FMAX M99</code>'
      ],
      checks:[
        {label:'Zyklus mit M99 aufgerufen',
         hint:'M99 steht auf dem Positioniersatz selbst.'},
        {label:'Bohrungsgrund bei X+30 Y+30 Z-10',
         hint:'L X+30 Y+30 FMAX M99'}
      ]
    },
    {
      prompt:'Füge drei weitere Bohrungen hinzu: X+70 Y+30, X+70 Y+50 und X+30 Y+50',
      hints:[
        'Gleicher Trick, drei weitere Stellen \u2014 je eine <code>M99</code>-Zeile.',
        'Eine Zeile pro Bohrung: <code>L X.. Y.. FMAX M99</code> für (70,30), (70,50), (30,50).',
        '<code>L X+70 Y+30 FMAX M99</code><br><code>L X+70 Y+50 FMAX M99</code><br><code>L X+30 Y+50 FMAX M99</code>'
      ],
      checks:[
        {label:'Bohrung bei X+70 Y+30 gebohrt',
         hint:'L X+70 Y+30 FMAX M99'},
        {label:'Bohrung bei X+70 Y+50 gebohrt',
         hint:'Ein Positioniersatz mit M99 pro Bohrung.'},
        {label:'Bohrung bei X+30 Y+50 gebohrt',
         hint:'L X+30 Y+50 FMAX M99'}
      ]
    }
  ]
},

'L09': {
  title:'Unterprogramme & eine erste Variable \u2014 LBL + Q',
  slides:[
    { html:function(){ return ''
      + '<p>Ein <b>Unterprogramm</b> ist ein benannter Codeblock: <code>LBL 1</code> öffnet ihn, <code>LBL 0</code> schließt ihn. Alles dazwischen ist der Rumpf:</p>'
      + learnSnippet('LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0')
      + '<p>Hier bohrt der Rumpf zwei Bohrungen \u2014 ein wiederverwendbares Muster.</p>'; } },
    { html:function(){ return ''
      + '<p><b>CALL LBL 1</b> führt den Rumpf von überall erneut aus \u2014 typisch nach einem Werkzeug- oder Zykluswechsel. Gleiche Positionen, kein Kopieren:</p>'
      + learnSvgLblFlow()
      + learnSnippet('CYCL DEF 200      ; Anbohren, flach\n...\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\n\nCYCL DEF 200      ; Bohren, tief\n...\nCALL LBL 1        ; dieselben Bohrungen erneut')
      + '<p>Ändere eine Bohrposition einmal \u2014 jeder Aufruf nutzt die neue.</p>'; } },
    { html:function(){ return ''
      + '<p>Eine <b>Q-Variable</b> speichert eine Zahl, die du wiederverwenden kannst. Definiere sie, dann schreibe sie statt des Werts:</p>'
      + learnSnippet('Q1 = -6           ; Nuttiefe\n...\nL Z+Q1 F150       ; eintauchen auf Q1 = -6\nL X+80 F300')
      + '<p>Eine Änderung oben ändert das ganze Programm \u2014 der Beginn der parametrischen Programmierung.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Fasse die beiden Bohrsätze in ein Unterprogramm: setze LBL 1 darüber und LBL 0 darunter',
      hints:[
        'Ein <b>Unterprogramm</b> ist ein benannter Block, den du wiederverwenden kannst. <code>LBL 1</code> öffnet ihn, <code>LBL 0</code> schließt ihn.',
        'Setze <code>LBL 1</code> auf die Zeile über die beiden Bohrsätze und <code>LBL 0</code> auf die Zeile darunter.',
        '<code>LBL 1</code><br><code>L X+30 Y+30 FMAX M99</code><br><code>L X+70 Y+30 FMAX M99</code><br><code>LBL 0</code>'
      ],
      checks:[
        {label:'LBL 1 öffnet das Unterprogramm',
         hint:'LBL 1 steht auf einem eigenen Satz, direkt über der ersten Bohrung.'},
        {label:'LBL 0 schließt es nach den Bohrungen',
         hint:'LBL 0 auf einem eigenen Satz, direkt unter der zweiten Bohrung.'},
        {label:'Beide Bohrungen weiterhin gebohrt',
         hint:'Das Einfassen darf die Sätze selbst nicht ändern.'}
      ]
    },
    {
      prompt:'Ein tieferer Bohrzyklus ist bereits unten definiert \u2014 bohre dieselben zwei Bohrungen erneut mit CALL LBL 1',
      hints:[
        'Sobald ein Label existiert, führt <code>CALL LBL 1</code> diesen Block erneut aus \u2014 kein erneutes Tippen der Bohrungen.',
        'Eine einzige Zeile genügt.',
        '<code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'Unterprogramm mit CALL LBL 1 aufgerufen',
         hint:'Ein Satz: CALL LBL 1 \u2014 nach der zweiten Zyklusdefinition.'},
        {label:'Bohrung X+30 auf die neue Tiefe Z-15 gebohrt',
         hint:'Der Aufruf fährt dieselben Positionen mit dem tieferen Zyklus.'},
        {label:'Bohrung X+70 auf die neue Tiefe Z-15 gebohrt',
         hint:'Beide Bohrungen kommen aus dem einen CALL.'}
      ]
    },
    {
      prompt:'Definiere eine Variable Q1 = -6 und nutze sie als Nuttiefe: tauche mit L Z+Q1 F150 ein, dann fräse auf X+80 mit F300',
      hints:[
        'Ein <b>Q-Parameter</b> ist eine Variable: einmal setzen, dann <code>Q1</code> schreiben, wo diese Zahl hingehört.',
        'Definiere <code>Q1 = -6</code>, tauche mit <code>L Z+Q1 F…</code> ein, dann fräse <code>L X+80 F…</code>.',
        '<code>Q1 = -6</code><br><code>L Z+Q1 F150</code><br><code>L X+80 F300</code>'
      ],
      checks:[
        {label:'Variable definiert: Q1 = -6',
         hint:'Ein Satz: Q1 = -6 (bevor sie verwendet wird).'},
        {label:'Tiefe als Z+Q1 geschrieben, nicht als Zahl',
         hint:'L Z+Q1 F150 \u2014 die Steuerung setzt -6 ein.'},
        {label:'Nut auf 6 mm Tiefe gefräst',
         hint:'Nach dem Eintauchen: L X+80 F300.'},
        {label:'Tiefster Punkt ist genau Q1 = -6',
         hint:'Prüfe das Vorzeichen: Q1 = -6, genutzt als Z+Q1.'}
      ]
    }
  ]
},

'L10': {
  title:'Polarkoordinaten \u2014 CC-Pol + LP',
  slides:[
    { html:function(){ return ''
      + '<p>Manche Muster sind von Natur aus rund. <b>CC</b> (<i>Kreismittelpunkt</i>) setzt den Pol; <b>LP</b> (<i>Gerade polar</i>) bewegt dann über <b>PR</b> (<i>Polarradius</i>) und <b>PA</b> (<i>Polarwinkel</i>):</p>'
      + learnSnippet('CC X+50 Y+40      ; der Pol\nLP PR+25 PA+0     ; 25 mm vom Pol, Winkel 0\u00b0')
      + '<p><code>PA</code> wird von der X+-Achse gemessen, gegen den Uhrzeigersinn. <code>PA+0</code> = nach rechts, <code>PA+90</code> = gerade nach oben.</p>'; } },
    { html:function(){ return ''
      + learnSvgPolar()
      + '<p>Dasselbe Bild als Code \u2014 zuerst der Kreismittelpunkt, dann der Punkt über Polarradius und Polarwinkel:</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+25 PA+40')
      + '<p>Auf der Maschinentastatur: tippe <b>L</b>, dann drücke <b>P</b> \u2014 der Satz schaltet auf Polareingabe.</p>'; } },
    { html:function(){ return ''
      + learnSvgBoltCircle()
      + '<p>Ein <b>Lochkreis</b> ist dann nur eine Zeile pro Bohrung \u2014 gleicher Polarradius, Winkel in 120\u00b0-Schritten:</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+25 PA+0 FMAX M99\nLP PR+25 PA+120 FMAX M99\nLP PR+25 PA+240 FMAX M99'); } },
    { html:function(){ return ''
      + '<p>Der Pol bleibt aktiv, bis du ein neues <code>CC</code> setzt. PR und PA sind ebenfalls modal \u2014 du kannst nur den Teil wiederholen, der sich ändert.</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+12 PA+60 FMAX M99\nLP PA+180 FMAX M99   ; PR bleibt 12\nLP PA+300 FMAX M99')
      + '<p>Keine Dreiecksrechnung, kein Taschenrechner \u2014 die Steuerung macht die Trigonometrie.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Setze den Pol CC X+50 Y+40 und bohre eine Bohrung bei PR+25 PA+0 (rufe den Zyklus mit M99 auf)',
      hints:[
        'Polarkoordinaten platzieren Punkte über <b>Radius + Winkel</b> von einem Pol. <code>CC</code> setzt den Pol; <code>LP</code> ist eine Polarbewegung.',
        '<code>CC X+50 Y+40</code> setzt den Mittelpunkt; <code>LP PR+25 PA+0 FMAX M99</code> bohrt 25 mm entfernt bei 0\u00b0.',
        '<code>CC X+50 Y+40</code><br><code>LP PR+25 PA+0 FMAX M99</code>'
      ],
      checks:[
        {label:'Pol gesetzt: CC X+50 Y+40',
         hint:'CC auf einem eigenen Satz \u2014 es definiert nur den Pol.'},
        {label:'Bohrung bei PR+25 PA+0 \u2192 X+75 Y+40',
         hint:'LP PR+25 PA+0 FMAX M99 \u2014 Winkel 0\u00b0 zeigt entlang X+.'}
      ]
    },
    {
      prompt:'Füge zwei weitere Bohrungen auf demselben Kreis hinzu: PA+120 und PA+240 (PR bleibt +25)',
      hints:[
        'Gleicher Radius \u2014 nur den <b>Winkel</b> drehen. <code>PA</code> ist der Winkel.',
        'Behalte <code>PR+25</code>, setze <code>PA</code> auf +120 und +240, je mit <code>FMAX M99</code>.',
        '<code>LP PR+25 PA+120 FMAX M99</code><br><code>LP PR+25 PA+240 FMAX M99</code>'
      ],
      checks:[
        {label:'Bohrung bei PA+120 gebohrt',
         hint:'LP PR+25 PA+120 FMAX M99'},
        {label:'Bohrung bei PA+240 gebohrt',
         hint:'LP PR+25 PA+240 FMAX M99'}
      ]
    },
    {
      prompt:'Bohre einen zweiten, kleineren Kreis: drei Bohrungen bei PR+12, Winkel PA+60, PA+180 und PA+300',
      hints:[
        'Ein engerer Ring: kleinerer Radius, drei neue Winkel.',
        'Drei Zeilen <code>LP PR+12 PA.. FMAX M99</code> bei 60\u00b0, 180\u00b0, 300\u00b0.',
        '<code>LP PR+12 PA+60 FMAX M99</code><br><code>LP PR+12 PA+180 FMAX M99</code><br><code>LP PR+12 PA+300 FMAX M99</code>'
      ],
      checks:[
        {label:'Bohrung bei PR+12 PA+60 gebohrt',
         hint:'LP PR+12 PA+60 FMAX M99'},
        {label:'Bohrung bei PR+12 PA+180 gebohrt',
         hint:'PA+180 zeigt vom Pol entlang X\u2212.'},
        {label:'Bohrung bei PR+12 PA+300 gebohrt',
         hint:'LP PR+12 PA+300 FMAX M99'}
      ]
    }
  ]
},

'L11': {
  title:'Runde Tasche \u2014 CYCL DEF 208 (Bohrfräsen)',
  slides:[
    { html:function(){ return ''
      + '<p>Zyklus <b>208</b> fräst ein rundes Loch, das <b>größer als das Werkzeug</b> ist: es taucht helikal spiralförmig ab und weitet sich dann in Ringen auf den Ziel-Durchmesser <code>Q335</code>:</p>'
      + learnSvgCycle208()
      + '<p>Die Helix macht die erste Öffnung bis <code>Q201</code>. Am Grund weiten sich Schlichtringe nach außen, bis das Werkzeug D10 die geforderte Bohrung D30 erzeugt.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Q335</b> — Ziel-<b>Durchmesser</b> der Tasche<br><b>Q334</b> — Tiefe pro Helix-<b>Umdrehung</b><br><b>Q342</b> — <b>vorgebohrter</b> Lochdurchmesser (0 = voll)<br><b>Q351</b> — +1 Gleichlauf, -1 Gegenlauf<br><b>Q370</b> — Bahnüberlappungsfaktor × Werkzeugradius (0 = automatisch)</p>'
      + learnSnippet('CYCL DEF 208\n  Q200=+2   ;Sicherheitsabstand\n  Q201=-8   ;Tiefe\n  Q206=+150 ;Vorschub Tiefenzustellung\n  Q334=+2   ;Zustellung pro Helix-Umdrehung\n  Q203=+0   ;Oberfläche Z\n  Q204=+30  ;2. Sicherheitsabstand\n  Q335=+30  ;Taschen-DURCHMESSER\n  Q342=+0   ;vorgeb. Durchmesser (0 = voll)\n  Q351=+1   ;+1 Gleichlauffräsen\n  Q370=+1   ;Bahnüberlappungsfaktor'); } },
    { html:function(){ return ''
      + '<p>Typische Anwendung: eine <b>Senkung</b> für einen Schraubenkopf in einem bestehenden \u00d86.6-Loch \u2014 der Kopf versinkt bündig:</p>'
      + learnSvgCounterboreClear()
      + learnSnippet('CYCL DEF 208\n  Q200=+2   ;Sicherheitsabstand\n  Q201=-6   ;Kopftiefe\n  Q206=+150\n  Q334=+2\n  Q203=+0\n  Q204=+30\n  Q335=+11  ;Kopfdurchmesser\n  Q342=+6.6 ;das gebohrte Loch\n  Q351=+1\n  Q370=+1   ;Bahnüberlappungsfaktor\nL X+50 Y+40 FMAX M99')
      + '<p>Mit <code>M99</code> im Bohrungszentrum aufgerufen, wie jeder Zyklus.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Definiere Zyklus 208 für eine runde Tasche: Durchmesser 30 mm, 8 mm tief, 2 mm pro Helix-Umdrehung, Sicherheitsabstand 2 mm, Oberfläche bei Z+0, Gleichlauffräsen',
      hints:[
        '<code>CYCL DEF 208</code> fräst eine runde Tasche durch helikales Abtauchen. Q-Werte setzen Durchmesser, Tiefe, Zustellung pro Umdrehung… (Folie).',
        'Beachte <code>Q201</code>=-8 Tiefe, <code>Q334</code>=2 pro Umdrehung, <code>Q335</code>=30 Durchmesser, <code>Q351</code>=+1 Gleichlauf und <code>Q370</code>=+1 Bahnüberlappung.',
        'Tippe den Satz <code>CYCL DEF 208</code> von der Folie, mit <code>Q201=-8</code>, <code>Q334=+2</code>, <code>Q335=+30</code>, <code>Q351=+1</code> und <code>Q370=+1</code>.'
      ],
      checks:[
        {label:'CYCL DEF 208 definiert',
         hint:'Beginne mit der Zeile: CYCL DEF 208'},
        {label:'Taschen-Durchmesser Q335 = +30',
         hint:'Q335 ist der DURCHMESSER, nicht der Radius.'},
        {label:'Tiefe Q201 = -8',
         hint:'Die Tiefe ist negativ: Q201=-8.'},
        {label:'Helix-Zustellung Q334 = +2',
         hint:'Q334=+2 \u2014 2 mm tiefer pro Umdrehung.'},
        {label:'Sicherheitsabstand Q200 = +2',
         hint:'Q200=+2 über der Oberfläche.'},
        {label:'Oberfläche Q203 = +0',
         hint:'Q203=+0 setzt die Oberfläche auf Z0.'},
        {label:'Gleichlauffräsen Q351 = +1',
         hint:'Q351=+1 wählt Gleichlauffräsen.'},
        {label:'Bahnüberlappungsfaktor Q370 = +1',
         hint:'Q370=+1 setzt den radialen Bahnabstand auf einen Werkzeugradius.'}
      ]
    },
    {
      prompt:'Fräse die Tasche: positioniere ins Zentrum X+50 Y+40 und rufe den Zyklus mit M99 auf',
      hints:[
        'Der Zyklus kennt die Taschenform \u2014 du bringst das Werkzeug nur ins Zentrum und löst es mit <code>M99</code> aus.',
        'Eine Zeile.',
        '<code>L X+50 Y+40 FMAX M99</code>'
      ],
      checks:[
        {label:'Zyklus mit M99 aufgerufen',
         hint:'L X+50 Y+40 FMAX M99'},
        {label:'Werkzeug erreicht die D30-Wand (Mittenbahn bei R10)',
         hint:'Mit einem D10-Werkzeug kreist die Mitte bei R15\u22125 = 10 mm vom Zentrum.'},
        {label:'Taschengrund bei Z-8',
         hint:'Die Tiefe kommt aus Q201.'}
      ]
    },
    {
      prompt:'Vergrößere die Tasche auf D40, indem du EINEN Parameter änderst, dann prüfe die neue Wand',
      hints:[
        'Der Taschendurchmesser ist ein einziger Parameter \u2014 ändere ihn und die Tasche wächst.',
        'Finde <code>Q335=+30</code> (den Ziel-Durchmesser) und mache +40 daraus.',
        '<code>Q335=+40</code>'
      ],
      checks:[
        {label:'Durchmesser geändert: Q335 = +40',
         hint:'Nur Q335 ändert sich \u2014 das ist der Sinn von Zyklen.'},
        {label:'Werkzeug erreicht die neue D40-Wand (Mittenbahn bei R15)',
         hint:'R20-Wand \u2212 R5-Werkzeug = Mitte kreist bei 15 mm.'}
      ]
    }
  ]
},

'L20': {
  title:'Präzisionsbohrung \u2014 zentrieren, bohren, reiben (Zyklus 201)',
  slides:[
    { html:function(){ return ''
      + '<p>Ein Bohrer auf einer ebenen Fläche <b>verläuft</b> \u2014 eine präzise Bohrung (etwa \u00d87 H7) beginnt mit einem <b>Zentrierbohrer</b>, der eine kleine Vertiefung macht, dann der Bohrer, dann eine <b>Reibahle</b> für das Endmaß:</p>'
      + learnSvgPrecisionChain()
      + learnSnippet('T3 CENTER_D6   ; Zentrieren ~2 mm\nT4 DRILL_D6_8  ; durchbohren\nT6 REAMER_7H7  ; auf Maß reiben')
      + '<p>Der Bohrer ist 6.8 \u2014 die Reibahle nimmt die letzten 0,2 mm ab und wird genutzt, um die Bohrung auf die geforderte H7-Toleranz fertigzustellen. Das Ergebnis hängt weiterhin von Werkzeug, Aufspannung und Schnittbedingungen ab.</p>'; } },
    { html:function(){ return ''
      + '<p>Alle drei Werkzeuge fahren <b>dieselben Positionen</b> an \u2014 genau wofür LBL da ist. Ein Label, drei Aufrufe:</p>'
      + learnSnippet('LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\n; ...Werkzeugwechsel + neuer Zyklus...\nCALL LBL 1')
      + '<p>Auf Maschinen mit Werkzeug-Vorwahl kann <code>TOOL DEF 4</code> nach einem Werkzeug-Aufruf das nächste Werkzeug vorbereiten und den Wechsel verkürzen. Das genaue Verhalten hängt vom Maschinenhersteller ab.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Zyklus 201</b> (Reiben) bewegt sich sanft: mit Vorschub hinein, optionale Verweilzeit, und \u2014 entscheidend \u2014 fährt auch mit Vorschub <b>heraus</b> (<code>Q208</code>), nie im Eilgang, damit die Reibahle die fertige Bohrung nicht verkratzt:</p>'
      + learnSnippet('CYCL DEF 201\n  Q200=+2   ;Sicherheitsabstand\n  Q201=-21  ;Tiefe\n  Q206=+80  ;Vorschub hinein\n  Q211=+0   ;Verweilzeit\n  Q208=+500 ;Vorschub HERAUS\n  Q203=+0   ;Oberfläche\n  Q204=+30  ;2. Sicherheitsabstand'); } }
  ],
  tasks:[
    {
      prompt:'Zentriere beide Positionen: schreibe LBL 1 mit L X+30 Y+30 FMAX M99 und L X+70 Y+30 FMAX M99, geschlossen durch LBL 0',
      hints:[
        'Beide Positionen werden dreimal wiederverwendet (zentrieren, bohren, reiben), also fasse sie einmal in ein Unterprogramm: <code>LBL 1</code> … <code>LBL 0</code>.',
        '<code>LBL 1</code>, dann die beiden Zeilen <code>L X.. Y.. FMAX M99</code>, dann <code>LBL 0</code>.',
        '<code>LBL 1</code><br><code>L X+30 Y+30 FMAX M99</code><br><code>L X+70 Y+30 FMAX M99</code><br><code>LBL 0</code>'
      ],
      checks:[
        {label:'Positionen liegen in LBL 1 \u2026 LBL 0',
         hint:'Die anderen Werkzeuge nutzen dieses Label erneut.'},
        {label:'Zentrierung bei X+30 Y+30, 2 mm tief',
         hint:'Der flache Zyklus 200 oben macht das Zentrieren.'},
        {label:'Zentrierung bei X+70 Y+30, 2 mm tief',
         hint:'Ein M99-Satz pro Position.'}
      ]
    },
    {
      prompt:'Durchbohren mit T4: der Werkzeugwechsel und der tiefe Zyklus sind bereit \u2014 fahre die Positionen erneut mit CALL LBL 1',
      hints:[
        'Werkzeug und tiefer Zyklus sind bereit \u2014 spiele einfach die Positionen erneut ab.',
        'Eine Zeile nutzt das Label erneut.',
        '<code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'Positionen mit CALL LBL 1 wiederverwendet',
         hint:'Ein Satz \u2014 kein Kopieren der Koordinaten.'},
        {label:'Bohrung X+30 durchbohrt (Z-24)',
         hint:'Tiefe -24 durchbricht die 20-mm-Platte.'},
        {label:'Bohrung X+70 durchbohrt (Z-24)',
         hint:'Beide Bohrungen kommen aus dem einen CALL.'}
      ]
    },
    {
      prompt:'Reibe auf 7H7 mit T6: definiere Zyklus 201 \u2014 Tiefe 21 mm, Vorschub hinein 80, Vorschub HERAUS 500, Sicherheitsabstand 2 mm, Oberfläche bei Z+0, keine Verweilzeit \u2014 und fahre die Positionen mit CALL LBL 1',
      hints:[
        'Reiben ist <code>CYCL DEF 201</code>: wie Bohren, aber mit separatem <b>Rückzugsvorschub</b> (Q208) für eine saubere Bohrung. Dann die Bohrungen erneut nutzen.',
        'Setze <code>Q201</code>=-21, <code>Q206</code>=80 hinein, <code>Q208</code>=500 heraus, <code>Q200</code>=2; schließe mit <code>CALL LBL 1</code> ab.',
        'Tippe den Satz <code>CYCL DEF 201</code> von der Folie (<code>Q201=-21</code>, <code>Q206=+80</code>, <code>Q208=+500</code>, <code>Q200=+2</code>), dann <code>CALL LBL 1</code>.'
      ],
      checks:[
        {label:'Reibzyklus 201 nach T6 definiert',
         hint:'Beginne mit: CYCL DEF 201'},
        {label:'Reibtiefe Q201 = -21',
         hint:'Q201=-21 gehört zum Zyklus 201 nach TOOL CALL 6.'},
        {label:'Vorschub hinein Q206 = +80',
         hint:'Q206=+80 ist der Reibvorschub in die Bohrung.'},
        {label:'Rückzugsvorschub Q208 = +500 (Vorschub heraus, nie Eilgang)',
         hint:'Q208 schützt die fertige Bohrung auf dem Weg heraus.'},
        {label:'Sicherheitsabstand Q200 = +2',
         hint:'Q200=+2 gehört zum Reibzyklus.'},
        {label:'Oberfläche Q203 = +0',
         hint:'Q203=+0 setzt die reale Werkstück-Oberfläche.'},
        {label:'Verweilzeit Q211 = +0',
         hint:'Keine Verweilzeit: Q211=+0.'},
        {label:'CALL LBL 1 fährt beide Positionen nach Zyklus 201',
         hint:'Setze CALL LBL 1 nach die vollständige Definition von Zyklus 201.'}
      ]
    }
  ]
},

'L21': {
  title:'Gewindebohren \u2014 CYCL DEF 209',
  slides:[
    { html:function(){ return ''
      + '<p><b>Gewindebohren</b> schneidet ein Gewinde: Spindel und Vorschub sind über die <b>Steigung</b> gekoppelt \u2014 eine Umdrehung = genau eine Steigung tiefer. Zyklus <b>209</b> bricht außerdem Späne durch Zurückfahren:</p>'
      + learnSvgThreadCycle()
      + learnSnippet('CYCL DEF 209 GEWINDEBOHREN\n  Q200=+2    ;Sicherheitsabstand\n  Q201=-15   ;Gewindetiefe\n  Q239=+1.25 ;STEIGUNG (M8 = 1.25)\n  Q203=+0    ;Oberfläche\n  Q204=+30   ;2. Sicherheitsabstand\n  Q257=+4    ;Bohrtiefe bis Spanbruch\n  Q256=+0.5  ;Rückzug = 0.5 x Steigung\n  Q336=+0    ;Spindel-Orientierung\n  Q403=+1    ;Faktor Rückzugsdrehzahl')
      + '<p><code>Q257</code>: Spanbruch alle 4 mm. <code>Q256=0.5</code> zieht um 0,5 × Steigung zurück (= 0,625 mm hier); 0 bedeutet vollen Rückzug. <code>Q403</code> skaliert die synchronisierte Rückzugsdrehzahl/-Vorschub.</p>'; } },
    { html:function(){ return ''
      + '<p>Vor dem Gewindebohren musst du das Kernloch <b>vorbohren</b>. Faustregel: <b>Bohrer-\u00d8 = Gewindegröße \u2212 Steigung</b>.</p>'
      + '<p>Ein <b>M8</b>-Gewinde (Steigung 1,25) braucht also ein <b>\u00d86.8</b>-Kernloch (8 \u2212 1,25 \u2248 6,75, gerundet auf den Standardbohrer 6,8) \u2014 genau die Bohrungen aus der letzten Lektion. Gewindebohrer = T7:</p>'
      + learnSnippet('TOOL CALL 7 Z S200 F250\n; Kernloch \u00d8 = 8 \u2212 1.25 \u2248 6.8 mm\n; Vorschub = S \u00d7 Steigung = 200 \u00d7 1.25')
      + '<p>Die Steuerung synchronisiert Spindel und Vorschub für dich \u2014 aber die Zahlen müssen stimmen.</p>'; } },
    { html:function(){ return ''
      + '<p>Aufgerufen wie jeder Zyklus \u2014 <code>M99</code> an der Position, oder das Label, das du schon hast:</p>'
      + learnSnippet('CALL LBL 1   ; bohrt das Gewinde an jeder Position im Label'); } }
  ],
  tasks:[
    {
      prompt:'Definiere den Gewindebohrzyklus: CYCL DEF 209 mit Bohrtiefe bis Spanbruch = +4, Rückzugsfaktor = +0.5, Sicherheitsabstand = +2, Gewindetiefe = -15, Gewindesteigung = +1.25, Oberfläche = +0, 2. Sicherheitsabstand = +30, Orientierung = 0 und Faktor Rückzugsdrehzahl = 1',
      hints:[
        'Gewindebohren schneidet ein Gewinde \u2014 <code>CYCL DEF 209</code>. Die Spindel synchronisiert zur <b>Steigung</b>, also setzt die Steigung den Vorschub, nicht F.',
        'Kernwerte: <code>Q201</code>=-15 Gewindetiefe, <code>Q239</code>=1.25 Steigung, <code>Q257</code>=4 Spanbruch, <code>Q200</code>=2.',
        'Tippe den Satz <code>CYCL DEF 209 Q257=+4 Q256=+0.5</code> von der Folie, mit <code>Q201=-15</code>, <code>Q239=+1.25</code>, <code>Q200=+2</code>.'
      ],
      checks:[
        {label:'Gewindebohrzyklus 209 nach T7 definiert',
         hint:'Erste Zeile: CYCL DEF 209 Q257=+4 Q256=+0.5'},
        {label:'Steigung Q239 = +1.25 (M8)',
         hint:'Die Steigung von M8 ist 1,25 mm.'},
        {label:'Gewindetiefe Q201 = -15',
         hint:'Die Tiefe ist negativ, wie bei jedem Zyklus.'},
        {label:'Bohrtiefe Spanbruch Q257 = +4',
         hint:'Q257=+4: nach jeweils 4 mm Gewindebohren zurückfahren.'},
        {label:'Rückzug bei Spanbruch Q256 = +0.5',
         hint:'Q256=+0.5 setzt den kurzen Spanbruch-Rückzug.'},
        {label:'Sicherheitsabstand Q200 = +2',
         hint:'Q200=+2 über der Oberfläche.'},
        {label:'Oberfläche Q203 = +0',
         hint:'Q203=+0 setzt die Oberfläche auf Z0.'},
        {label:'2. Sicherheitsabstand Q204 = +30',
         hint:'Q204=+30 ist die finale Rückzugshöhe.'},
        {label:'Spindel-Orientierung Q336 = 0',
         hint:'Q336=+0 belässt die Orientierung bei null.'},
        {label:'Faktor Rückzugsdrehzahl Q403 = +1',
         hint:'Q403=+1 hält die synchronisierte Rückzugsdrehzahl gleich der Gewindebohrdrehzahl.'}
      ]
    },
    {
      prompt:'Bohre das erste Gewinde: positioniere auf X+30 Y+30 und rufe den Zyklus mit M99 auf',
      hints:[
        'Genau wie beim Bohren \u2014 fahre zur Bohrung und löse den Zyklus mit <code>M99</code> aus.',
        'Eine Positionierzeile mit <code>M99</code>.',
        '<code>L X+30 Y+30 FMAX M99</code>'
      ],
      checks:[
        {label:'Zyklus 209 bei X+30 Y+30 mit M99 aufgerufen',
         hint:'L X+30 Y+30 FMAX M99 nach der Definition von Zyklus 209.'}
      ]
    },
    {
      prompt:'Bohre stattdessen beide Gewinde auf einmal: ersetze den einzelnen Aufruf durch CALL LBL 1',
      hints:[
        'Beide Positionen liegen bereits in <code>LBL 1</code> \u2014 nutze sie erneut statt des einzelnen Aufrufs.',
        'Ersetze die einzelne Zeile durch den Label-Aufruf.',
        '<code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'Label nach Zyklus 209 für das Gewindebohren wiederverwendet',
         hint:'CALL LBL 1 \u2014 dieselben zwei gespeicherten Positionen, jetzt mit aktivem Zyklus 209.'}
      ]
    }
  ]
},

'L22': {
  title:'Anfasen \u2014 Senker & der DL/DR-Trick',
  slides:[
    { html:function(){ return ''
      + '<p>Der <b>90\u00b0-Senker</b> (T5) bricht scharfe Kanten. Sein Bezugspunkt ist die <b>Spitze</b>, daher ist in der Tabelle R \u2248 0. Der Trick für eine 1 \u00d7 45\u00b0-Fase:</p>'
      + learnSvgChamfer()
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2')
      + '<p>In der konfigurierten T5-Einrichtung dieses Simulators verschiebt <code>DR+2</code> die <b>Bahn</b> 2 mm von der Kante weg und <code>DL-2</code> senkt den Bezugspunkt um 2 mm, was die gezeigte 1-mm-Fase erzeugt. An einer realen Maschine prüfe Werkzeugbezug, gemessene Geometrie und Vorzeichen der Korrektur vor der Bearbeitung.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Bohrungskanten \u2014 zwei Wege.</b> Der schnelle Weg: lass den 90\u00b0-Senker mit einem einfachen <code>CYCL DEF 200</code> <b>wie ein Bohrer eintauchen</b>. Funktioniert nur, wenn die Bohrung <b>kleiner als der Senkerdurchmesser</b> ist, damit der Kegel den Rand erreicht:</p>'
      + learnSvgChamferMethods()
      + learnSnippet('TOOL CALL 5 Z S2000 F2000 DL-2 DR+2\nCYCL DEF 200\n  Q201=-4   ;4 mm ab der Spitze eintauchen\n  Q203=+2   ;Oberfläche +2 hebt DL-2 auf\n  ...\nCALL LBL 1')
      + '<p><code>DL-2</code> senkt die Spitze um 2 mm und <code>Q203=+2</code> hebt die Oberfläche um dieselben 2 mm \u2014 sie heben sich auf, sodass die 4-mm-Eintauchung an der realen Oberkante beginnt. Die Kegelbreite in dieser Tiefe bestimmt die Fase.</p>'
      + '<p>Bei einer <b>größeren Bohrung</b> kann der Kegel den Rand durch Eintauchen nicht mehr erreichen \u2014 dann fräse die Kante mit <code>CYCL DEF 208</code> und setze <code>Q342</code> auf den bestehenden Bohrungsdurchmesser. Das teilt dem Zyklus die vorbearbeitete Öffnung mit und ändert seine Bahn und Plausibilitätsprüfungen:</p>'
      + learnSnippet('CYCL DEF 208\n  Q201=-1   ;nur die Kante\n  Q335=+7   ;Ziel\n  Q342=+6.8 ;vorgebohrt!\n  ...')
      + '<p>Bohren ist schneller; Fräsen ist die Wahl, sobald die Bohrung breiter als das Werkzeug ist.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Konturkanten</b>: fahre einfach die Kontur noch einmal mit T5 \u2014 dieselben Sätze, dasselbe RL, nur 1 mm unter der Oberkante:</p>'
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nL X+50 Y-10 Z-1 FMAX R0\nL Y+0 RL F500\nL Y+80\nL Y+90 R0')
      + '<p>Die Korrektur versetzt den Kegel um DR, die Kante erhält eine saubere 1 \u00d7 45\u00b0.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Entgrate die gebohrte Bohrung mit dem Senker: rufe T5 mit DL-2 DR+2 auf (beliebiger Vorschub/Drehzahl, z. B. S2000 F2000), dann einen Bohrzyklus CYCL DEF 200, der 4 mm ab der Spitze eintaucht \u2014 setze Q203=+2, damit die +2-Oberfläche das DL-2 aufhebt, und CALL LBL 1',
      hints:[
        'Der 90\u00b0-Senker entgratet durch <b>Eintauchen</b> wie ein Bohrer. Die <code>DL/DR</code>-Deltas verschieben Spitze und Bahn, sodass der Kegel den Rand bei 1 mm trifft (Folie 2).',
        'Rufe <code>TOOL CALL 5 Z S… F… DL-2 DR+2</code> auf, dann ein <code>CYCL DEF 200</code> mit <code>Q201=-4</code> und <code>Q203=+2</code> (die +2 hebt DL-2 auf), dann <code>CALL LBL 1</code>.',
        '<code>TOOL CALL 5 Z S2000 F2000 DL-2 DR+2</code><br>ein <code>CYCL DEF 200</code>-Satz mit <code>Q201=-4</code>, <code>Q203=+2</code><br><code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'T5 mit DL-2 aufgerufen',
         hint:'TOOL CALL 5 Z S2000 F2000 DL-2 DR+2 \u2014 beliebiger Vorschub/Drehzahl.'},
        {label:'\u2026und DR+2 \u2014 das Paar erzeugt die 1-mm-Fase',
         hint:'Beide Deltas auf demselben TOOL-CALL-Satz.'},
        {label:'Bohrzyklus 200 nach T5 definiert',
         hint:'Der Senker taucht einfach wie ein Bohrer in die Bohrung.'},
        {label:'Q203=+2 gehört zum Senkerzyklus',
         hint:'Oberfläche +2 und DL-2 heben sich auf \u2014 die 4-mm-Tiefe beginnt dann an der realen Oberkante.'},
        {label:'Q201=-4 \u2014 4 mm Eintauchen ab der Spitze',
         hint:'Diese 4 mm Eintauchen erzeugen mit einem 90\u00b0-Kegel die Fase.'},
        {label:'Sicherheitsabstand Q200 = +2',
         hint:'Nutze Q200=+2 im Senkerzyklus.'},
        {label:'Vorschub Tiefenzustellung Q206 = +150',
         hint:'Nutze Q206=+150 im Senkerzyklus.'},
        {label:'Verweilzeit Q211 = +0',
         hint:'Keine Verweilzeit: Q211=+0.'},
        {label:'CALL LBL 1 fährt die Fase nach T5',
         hint:'Nutze dasselbe Label wie beim Bohren erneut.'}
      ]
    },
    {
      prompt:'Entgrate die gefräste Bohrung (größer als das Werkzeug): rufe T5 mit DL-2 DR+2 auf (beliebiger Vorschub/Drehzahl, z. B. S15000 F500), dann schreibe CYCL DEF 208 für den Kantenbruch \u2014 Q201=-1 für eine 1-mm-Fase und Q342 = der gefräste Bohrungsdurchmesser \u2014 und CALL LBL 1',
      hints:[
        'Wenn die Bohrung breiter als das Werkzeug ist, erreicht der Kegel sie durch Eintauchen nicht \u2014 fräse den Rand mit <code>CYCL DEF 208</code> und teile dem Zyklus mit <code>Q342</code> den bestehenden Bohrungsdurchmesser mit (Folie 2).',
        'Rufe <code>TOOL CALL 5 … DL-2 DR+2</code> auf, dann <code>CYCL DEF 208</code> mit <code>Q201=-1</code> und <code>Q342=+10</code> (der gefräste Durchmesser), dann <code>CALL LBL 1</code>.',
        '<code>TOOL CALL 5 Z S15000 F500 DL-2 DR+2</code><br>ein <code>CYCL DEF 208</code>-Satz mit <code>Q201=-1</code>, <code>Q342=+10</code>, <code>Q335=+10</code>, <code>Q351=+1</code>, <code>Q370=+1</code><br><code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'T5 mit DL-2 aufgerufen',
         hint:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2 \u2014 beliebiger Vorschub/Drehzahl.'},
        {label:'\u2026und DR+2 \u2014 das Paar erzeugt die 1-mm-Fase',
         hint:'Beide Deltas auf demselben TOOL-CALL-Satz.'},
        {label:'Entgratzyklus 208 nach T5 definiert',
         hint:'Ein zweites CYCL DEF 208, diesmal nur für den Kantenbruch.'},
        {label:'Q201=-1 \u2014 der Kantenbruch ist 1 mm tief',
         hint:'Nur der Rand, nicht die ganze Bohrung \u2014 Q201=-1.'},
        {label:'Q342 = gefräster Bohrungsdurchmesser (10 oder 9.999)',
         hint:'Q342 muss dem Durchmesser entsprechen, auf den die Bohrung gefräst wurde \u2014 nutze +10 oder +9.999.'},
        {label:'Nenn-Durchmesser Q335 = +10',
         hint:'Q335=+10 hält den Ziel-Durchmesser am bestehenden Rand.'},
        {label:'Gleichlauffräsen Q351 = +1',
         hint:'Nutze Q351=+1 für Gleichlauffräsen.'},
        {label:'Bahnüberlappungsfaktor Q370 = +1',
         hint:'Nutze Q370=+1 für einen radialen Bahnabstand von einem Werkzeugradius.'},
        {label:'CALL LBL 1 fährt die Fase nach T5',
         hint:'Nutze dasselbe Label wie beim Fräsen erneut.'}
      ]
    },
    {
      prompt:'Fase die gesamte Außenkontur mit T5 (beliebiger Vorschub/Drehzahl): fahre außerhalb des Rohteils bei R0 an, tauche auf Z-1 ein, behalte DL-2 DR+2 am Werkzeug-Aufruf, dann fahre die vier Wände des 50\u00d750-Blocks mit RL und hebe mit R0 beim Verlassen des Teils auf',
      hints:[
        'Eine Kontur anfasen = dieselben Wände noch einmal mit dem Senker fahren, 1 mm unter der Oberkante, mit <code>RL</code> (Folie 3).',
        'Vom Anfahren die Korrektur einschalten <code>L X+15 RL F500</code>, die vier Wände abfahren, dann <code>R0</code> nach dem Verlassen des Blocks aufheben.',
        '<code>L X+15 RL F500</code><br><code>L Y+65</code><br><code>L X+65</code><br><code>L Y+15</code><br><code>L X+10</code><br><code>L X+0 R0</code>'
      ],
      checks:[
        {label:'T5 mit DL-2 DR+2 für die 1-mm-Fase',
         hint:'Bereits im Starter \u2014 behalte DL-2 DR+2 am Werkzeug-Aufruf.'},
        {label:'Kontur mit RL-Korrektur gefräst',
         hint:'Aktiviere RL im ersten Wandsatz: L X+15 RL F500.'},
        {label:'Linke Kante gefast (Spitzenbahn 2 mm neben der Wand X+15)',
         hint:'DR+2 versetzt die Kegelbahn nach außen \u2014 die 90\u00b0-Kante trifft die Materialecke bei 1 mm.'},
        {label:'Obere Kante gefast (Ecke Y+65 erreicht)',
         hint:'L Y+65, dann L X+65 fährt die volle Blockkante.'},
        {label:'Korrektur mit R0 nach dem Verlassen des Teils aufgehoben',
         hint:'Beende mit L X+0 R0 frei vom Block.'}
      ]
    }
  ]
},

'L23': {
  title:'Parametrische Kontur \u2014 ein Profil, gefräst und dann gefast',
  slides:[
    { html:function(){ return ''
      + '<p>Hier das Teil aus der <b>Zeichnung</b>: ein 90\u00d790-Profil mit einer <b>R15</b>-gerundeten Ecke und einer <b>15\u00d745\u00b0</b>-Fase. Das Rohteil ist 100\u00d7100 mit <b>5 mm Aufmaß</b> \u2014 Oberkante bei Z+5, Grund bei Z0:</p>'
      + learnSvgPartProfile(); } },
    { html:function(){ return ''
      + '<p><b>Die Idee:</b> schreibe das Profil <b>einmal</b> in ein Unterprogramm und lass eine einzige Variable <code>Q1</code> die Tiefe setzen. Gleiche Bahn, tief gefräst und dann flach gefast:</p>'
      + learnSnippet('LBL 1\nL X+10 Y-10 Z+50 FMAX R0  ; außen anfahren\nL Z+Q1 FMAX          ; auf Q1 eintauchen\nL X+5 RL F500        ; Korrektur ein\nL Y+95               ; hoch\nRND R15              ; Ecke runden\nL X+95               ; hinüber\nL Y+5                ; herunter\nCHF 15               ; Ecke fasen\nL X-5                ; untere Wand über den Start hinaus (Überlappung)\nL Z+50 FMAX R0       ; Rückzug + Korrektur aus\nLBL 0')
      + '<p>Ändere das Werkzeug und eine Zahl \u2014 das ist die ganze Arbeit.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Fräs-Durchgang:</b> rufe den Fräser, setze die Grundtiefe und platziere das Profil direkt danach in <code>LBL 1</code>. Das Label <b>läuft, wo es steht</b>, also fräst der Fräser es einmal \u2014 Q1=0 nimmt alle 5 mm ab:</p>'
      + learnSvgFinalPasses()
      + learnSnippet('TOOL CALL 1 Z S3000 F500\nQ1 = +0\nLBL 1\n  ... Profil ...\nLBL 0')
      + '<p><b>Fas-Durchgang:</b> darunter, wechsle zum 90\u00b0-Senker mit <code>DL-2 DR+2</code>, und diesmal <b>CALL</b> dasselbe Label. Die Oberkante des Teils ist bei Z+5, also taucht <code>Q1=+4</code> den Kegel 1 mm unter die Oberfläche \u2014 ein sauberer Kantenbruch, ohne das Profil neu zu schreiben:</p>'
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nQ1 = +4        ; 1 mm unter der Z+5-Oberkante\nCALL LBL 1'); } }
  ],
  tasks:[
    {
      prompt:'Schreibe das Profil selbst \u2014 der Fräser T1 ist bereits aufgerufen. Setze Q1 = +0, dann platziere das Profil in LBL 1 \u2026 LBL 0 (es läuft, wo du es schreibst, hier ist also kein CALL nötig). Schritte: anfahren X+10 Y-10 R0 \u00b7 eintauchen Z+Q1 \u00b7 X+5 RL \u00b7 Y+95 \u00b7 RND R15 \u00b7 X+95 \u00b7 Y+5 \u00b7 CHF 15 \u00b7 X-5 \u00b7 Z+50 R0.',
      hints:[
        'Ein Profil in einem Unterprogramm, seine Tiefe gesteuert durch <code>Q1</code>. Es läuft, wo es steht (Fall-Through), also hier kein CALL \u2014 baue nur <code>LBL 1 … LBL 0</code>.',
        'Reihenfolge: <code>Q1 = +0</code>, <code>LBL 1</code>, anfahren <code>X+10 Y-10 R0</code>, eintauchen <code>Z+Q1</code>, <code>X+5 RL</code>, <code>Y+95</code>, <code>RND R15</code>, <code>X+95</code>, <code>Y+5</code>, <code>CHF 15</code>, <code>X-5</code>, Rückzug <code>Z+50 R0</code>, <code>LBL 0</code>.',
        '<code>Q1 = +0</code><br><code>LBL 1</code><br><code>L X+10 Y-10 Z+50 FMAX R0</code><br><code>L Z+Q1 FMAX</code><br><code>L X+5 F500 RL</code><br><code>L Y+95</code><br><code>RND R15</code><br><code>L X+95</code><br><code>L Y+5</code><br><code>CHF 15</code><br><code>L X-5</code><br><code>L Z+50 FMAX R0</code><br><code>LBL 0</code>'
      ],
      checks:[
        {label:'Tiefenvariable gesetzt: Q1 = +0',
         hint:'Q1 = +0 vor dem Profil.'},
        {label:'Profil in LBL 1 \u2026 LBL 0 eingefasst',
         hint:'LBL 1 öffnet das Unterprogramm, LBL 0 schließt es.'},
        {label:'Anfahren außerhalb des Rohteils bei R0',
         hint:'L X+10 Y-10 Z+50 FMAX R0.'},
        {label:'Eintauchen auf die variable Tiefe Z+Q1',
         hint:'L Z+Q1 FMAX.'},
        {label:'Profil mit RL-Korrektur gefräst',
         hint:'L X+5 RL F500 schaltet die Korrektur ein.'},
        {label:'R15-gerundete Ecke',
         hint:'RND R15 nach L Y+95.'},
        {label:'15\u00d745\u00b0-Fase',
         hint:'CHF 15 zwischen L Y+5 und L X+5.'},
        {label:'Korrektur beim Rückzug aufgehoben (Z+50 R0)',
         hint:'L Z+50 FMAX R0 \u2014 Korrektur an lassen, bis das Werkzeug frei ist, beim Rückzug aufheben.'},
        {label:'Linke Wand bis zum Grund gefräst (Werkzeugmitte X+0)',
         hint:'Das D10-Werkzeug läuft 5 mm außerhalb der Wand X+5.'}
      ]
    },
    {
      prompt:'Fräs-Durchgang: das Profil steht bereits unten in LBL 1. Rufe den Schaftfräser (T1) und setze Q1 auf die Grundtiefe +0 \u2014 das Profil läuft direkt danach (es steht direkt darunter, hier ist also kein CALL nötig). Rohteil-Oberkante Z+5 \u2192 Zerspanen auf Z0 nimmt alle 5 mm Aufmaß ab.',
      hints:[
        'Das Profil steht darunter und läuft per Fall-Through \u2014 du brauchst davor nur das Werkzeug und die Tiefe.',
        'Rufe den Fräser <code>TOOL CALL 1 Z S3000 F500</code> (mit <code>M3</code>/<code>M8</code>) und setze <code>Q1 = +0</code>, damit er auf den Z0-Grund zerspant.',
        '<code>TOOL CALL 1 Z S3000 F500</code><br><code>M3</code><br><code>M8</code><br><code>Q1 = +0</code>'
      ],
      checks:[
        {label:'Schaftfräser T1 aufgerufen (S3000 F500)',
         hint:'TOOL CALL 1 Z S3000 F500'},
        {label:'Q1 = 0 \u2014 Tiefe auf den Grund gesetzt',
         hint:'Q1 = +0 bevor das Profil läuft.'},
        {label:'Wand bis zum Z0-Grund gefräst (5 mm Aufmaß entfernt)',
         hint:'Mit Q1=0 erreicht das Eintauchen Z0 und räumt die 5 mm darüber ab.'},
        {label:'Rechte Wand ebenfalls durchgefräst',
         hint:'Das einzelne Profil fährt alle vier Seiten ab.'}
      ]
    },
    {
      prompt:'Fas-Durchgang: der Fräser fährt das Profil bereits einmal (es ist in LBL 1 direkt nach dem Fräser definiert). Darunter, rufe den 90\u00b0-Senker (T5) mit DL-2 DR+2 auf, setze Q1 auf +4 \u2014 die Oberkante des Teils ist bei Z+5, also taucht +4 den Kegel 1 mm unter die Oberfläche für den Kantenbruch \u2014 und CALL LBL 1, um dasselbe Profil erneut zu nutzen',
      hints:[
        'Nutze exakt dasselbe Profil mit anderem Werkzeug und anderer Tiefe erneut \u2014 diesmal musst du es mit <code>CALL</code> aufrufen, da es oben bereits einmal lief.',
        'Rufe <code>TOOL CALL 5 … DL-2 DR+2</code> auf, setze <code>Q1 = +4</code> (1 mm unter der Z+5-Oberkante), dann <code>CALL LBL 1</code>.',
        '<code>TOOL CALL 5 Z S15000 F500 DL-2 DR+2</code><br><code>M3</code><br><code>M8</code><br><code>Q1 = +4</code><br><code>CALL LBL 1</code>'
      ],
      checks:[
        {label:'Senker T5 mit DL-2 DR+2',
         hint:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2 \u2014 beliebiger Vorschub/Drehzahl.'},
        {label:'Q1 = +4 \u2014 1 mm unter der Z+5-Oberkante',
         hint:'Oberkante ist Z+5, also ergibt +4 einen 1-mm-Kantenbruch.'},
        {label:'Dasselbe Profil mit CALL LBL 1 wiederverwendet',
         hint:'Genau dasselbe Label \u2014 nur Werkzeug und Tiefe geändert.'},
        {label:'Linke Kante bei Z+4 gefast (Kegelversatz ~2 mm)',
         hint:'DR+2 versetzt den Kegel; die 90\u00b0-Kante bricht die obere Ecke.'},
        {label:'Rechte Kante ebenfalls gefast \u2014 volles Profil wiederverwendet',
         hint:'CALL LBL 1 fährt die ganze Kontur mit dem Senker.'}
      ]
    }
  ]
}

};

// Overlay auf das globale LESSONS anwenden, wenn die UI-Sprache Deutsch ist.
(function(){
  if (!(window.I18N && I18N.getLang() === 'de')) return;
  if (typeof LESSONS === 'undefined' || !Array.isArray(LESSONS)) return;
  LESSONS.forEach(function(les){
    var d = LESSONS_DE[les.id];
    if (!d) return;
    if (d.title)  les.title  = d.title;
    if (d.slides) les.slides = d.slides;
    if (d.tasks && les.tasks) {
      d.tasks.forEach(function(dt, i){
        var t = les.tasks[i];
        if (!t) return;
        if (dt.prompt) t.prompt = dt.prompt;
        if (dt.hints)  t.hints  = dt.hints;
        if (dt.checks && t.checks) {
          dt.checks.forEach(function(dc, j){
            if (!t.checks[j]) return;
            if (dc.label) t.checks[j].label = dc.label;
            if (dc.hint)  t.checks[j].hint  = dc.hint;
          });
        }
      });
    }
  });
})();
