/* i18n-demos-de.js — web-only German comment overlay for core/demo-programs.js.
 * Parallel `code` text for each EXTRA_DEMO_PROGRAMS entry, matched by `name`.
 * Klartext (BLK FORM, TOOL CALL, CYCL DEF, M-codes, Q-tokens) is byte-identical
 * to the English source; only text after `;` is translated.
 */
var EXTRA_DEMO_PROGRAMS_DE = [
  { name: 'Chamfering', code: `BEGIN PGM PROGRAM MM
; Fasen - Oberkante rundum brechen, 1mm x 45°
; Rohteil: 50 x 50 x 20 mm. T5 Senker 90°, DL-1 DR+1 = Spitzen-Offset für
; eine 1mm-Kantenfase (siehe core/tool-table.js: DL=-DR/tan(T-ANGLE/2), und
; T-ANGLE=90 => tan(45)=1 => DL=-DR).
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
TOOL CALL 5 Z S18000 F1000 DL-1 DR+1 ; T5 Senker 90°
M3 ; Spindel EIN — im Uhrzeigersinn
M8 ; Kühlmittel EIN — Flutung
L X+0 Y+55 Z+50 FMAX R0
L X+0 Y+55 Z+19 F1000
L Y+35 RL ; linke Radiuskorrektur aktivieren
CC X+0 Y+30 ; Kreismittelpunkt für tangentialen Einfahrbogen
C X+0 Y+25 DR+ ; fährt tangential auf die Oberkante
L X+25
L Y-25
L X-25
L Y+25
L X+10
CC X+10 Y+30 ; Kreismittelpunkt für tangentialen Ausfahrbogen
C X+10 Y+35 DR+ ; fährt tangential von der Kante weg
L Z+50 FMAX R0
M5 ; Spindel AUS
M9 ; Kühlmittel AUS
END PGM PROGRAM MM` },

  { name: 'Rough & Finish', code: `BEGIN PGM PROGRAM MM
; Schrupp- und Schlichtfräsen - quadratische Kontur, zwei Durchgänge mit demselben Werkzeug
; Rohteil: 50 x 50 x 20 mm. T1 Schaftfräser räumt das Profil in zwei Durchgängen:
; Schruppen hinterlässt ein 44 x 44 mm Quadrat (3mm Aufmaß je Seite entfernt), Schlichten
; bringt es auf das endgültige 42 x 42 mm Quadrat mit CHF 1-Ecken.
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
TOOL CALL 1 Z S10000 F1500 ; T1 Schaftfräser D10
M3 ; Spindel EIN — im Uhrzeigersinn
M8 ; Kühlmittel EIN — Flutung
;
;--------------------------------------------------
; Schrupp-Durchgang - auf 44 x 44 (entfernt 3mm je Seite)
;--------------------------------------------------
L X+0 Y+50 Z+50 FMAX R0
L X+0 Y+50 Z+0 F1500
L Y+42 RL ; linke Radiuskorrektur aktivieren
CC X+0 Y+32 ; Kreismittelpunkt für tangentialen Einfahrbogen
C X+0 Y+22 DR+ ; fährt tangential auf die 44x44-Kontur
L X+22
CHF 1
L Y-22
CHF 1
L X-22
CHF 1
L Y+22
CHF 1
L X+10
CC X+10 Y+32 ; Kreismittelpunkt für tangentialen Ausfahrbogen
C X+10 Y+42 DR+ ; fährt tangential von der Kontur weg
L Z+50 FMAX R0
;
;--------------------------------------------------
; Schlicht-Durchgang - auf 42 x 42 (entfernt das letzte 1mm je Seite)
;--------------------------------------------------
L X+0 Y+49 Z+50 FMAX R0
L X+0 Y+49 Z+0 F800
L Y+41 RL ; linke Radiuskorrektur aktivieren
CC X+0 Y+31 ; Kreismittelpunkt für tangentialen Einfahrbogen
C X+0 Y+21 DR+ ; fährt tangential auf die 42x42-Kontur
L X+21
CHF 1
L Y-21
CHF 1
L X-21
CHF 1
L Y+21
CHF 1
L X+10
CC X+10 Y+31 ; Kreismittelpunkt für tangentialen Ausfahrbogen
C X+10 Y+41 DR+ ; fährt tangential von der Kontur weg
L Z+50 FMAX R0
M5 ; Spindel AUS
M9 ; Kühlmittel AUS
END PGM PROGRAM MM` },

  { name: 'Thread Hole', code: `BEGIN PGM PROGRAM MM
; Gewindebohrung - bohren, entgraten, M8 gewindebohren
; Rohteil: 50 x 50 x 20 mm, eine Bohrung mittig (X0 Y0)
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
;--------------------------------------------------
; T4 - Bohrer D6,8 (Kernlochdurchmesser für M8x1,25, durchgehend)
;--------------------------------------------------
TOOL CALL 4 Z S14000 F300
TOOL DEF 5 ; Werkzeug fürs nächste TOOL CALL ins Magazin vorladen
M3 ; Spindel EIN — im Uhrzeigersinn
M8 ; Kühlmittel EIN — Flutung
CYCL DEF 200 ;Bohren
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-24 ;Tiefe [mm]
Q206 FAUTO ;Vorschub Zustellung [mm/min]
Q202=+11.5 ;Zustelltiefe [mm]
Q210=+0 ;Verweilzeit oben [s]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q211=+0 ;Verweilzeit unten [s]
Q395=+0 ;Tiefenbezug (Werkzeugspitze)
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T5 - Fase / Senker 90° D8 (Entgraten vor dem Gewindebohren)
; DL-2 DR+2 = Spitzen-Offset für Kantenfase
;--------------------------------------------------
TOOL CALL 5 Z S18000 F1000 DL-2 DR+2
TOOL DEF 7 ; Werkzeug fürs nächste TOOL CALL ins Magazin vorladen
M3
M8
CYCL DEF 208 ;Bohrfräsen
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-1 ;Tiefe [mm]
Q206=+150 ;Vorschub Zustellung [mm/min]
Q334=+0 ;Zustellung pro Schnitt [mm]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q335=+8 ;SOLL-Durchmesser [mm]
Q342=+7.999 ;Vorbohrdurchmesser [mm]
Q351=+1 ;Frässtrategie
Q370=+1 ;Bahnüberlappungsfaktor
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T7 - Gewindebohrer M8 (Gewindebohren mit Spanbruch)
;--------------------------------------------------
TOOL CALL 7 Z S350
M3
M8
CYCL DEF 209 ;Gewindebohren mit Spanbruch
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-22 ;Gewindetiefe [mm]
Q239=+1.25 ;Gewindesteigung [mm]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q257=+11 ;Zustelltiefe für Spanbruch [mm]
Q256=+0 ;Rückzug bei Spanbruch (0 = vollständiger Rückzug) [mm]
Q336=+0 ;Spindelwinkel [deg]
Q403=+1 ;Drehzahlfaktor Rückzug
L X+0 Y+0 FMAX M99
M5
M9
END PGM PROGRAM MM` },

  { name: 'Precise Hole', code: `BEGIN PGM PROGRAM MM
; Präzisionsbohrung - ankörnen, bohren, entgraten, auf 7H7 reiben
; Rohteil: 50 x 50 x 20 mm, eine Bohrung mittig (X0 Y0)
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
;--------------------------------------------------
; T3 - Zentrierbohrer D6 (Ankörnen, damit T4 nicht verläuft)
;--------------------------------------------------
TOOL CALL 3 Z S18000 F300
TOOL DEF 4 ; Werkzeug fürs nächste TOOL CALL ins Magazin vorladen
M3 ; Spindel EIN — im Uhrzeigersinn
M8 ; Kühlmittel EIN — Flutung
CYCL DEF 200 ;Bohren
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-1 ;Tiefe [mm]
Q206=+150 ;Vorschub Zustellung [mm/min]
Q202=+1 ;Zustelltiefe [mm]
Q210=+0 ;Verweilzeit oben [s]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q211=+0 ;Verweilzeit unten [s]
L X+0 Y+0 FMAX M99
M5 ; Spindel AUS
M9 ; Kühlmittel AUS
;
;--------------------------------------------------
; T4 - Bohrer D6,8 (durchgehend, mit Durchbruch-Spiel)
;--------------------------------------------------
TOOL CALL 4 Z S14000 F300
TOOL DEF 5 ; Werkzeug fürs nächste TOOL CALL ins Magazin vorladen
M3
M8
CYCL DEF 200 ;Bohren
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-24 ;Tiefe [mm]
Q206 FAUTO ;Vorschub Zustellung [mm/min]
Q202=+11.5 ;Zustelltiefe [mm]
Q210=+0 ;Verweilzeit oben [s]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q211=+0 ;Verweilzeit unten [s]
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T5 - Fase / Senker 90° D8 (Entgraten vor dem Reiben)
; DL-2 DR+2 = Spitzen-Offset für Kantenfase
;--------------------------------------------------
TOOL CALL 5 Z S18000 F1000 DL-2 DR+2
TOOL DEF 6 ; Werkzeug fürs nächste TOOL CALL ins Magazin vorladen
M3
M8
CYCL DEF 208 ;Bohrfräsen
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-1 ;Tiefe [mm]
Q206=+150 ;Vorschub Zustellung [mm/min]
Q334=+0 ;Zustellung pro Schnitt [mm]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
Q335=+7 ;SOLL-Durchmesser [mm]
Q342=+6.999 ;Vorbohrdurchmesser [mm]
Q351=+1 ;Frässtrategie
Q370=+1 ;Bahnüberlappungsfaktor
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T6 - Reibahle D7 H7 (Präzisionsreiben auf Endmaß)
;--------------------------------------------------
TOOL CALL 6 Z S12200 F300
M3
M8
CYCL DEF 201 ;Reiben
Q200=+2 ;Sicherheits-Abstand [mm]
Q201=-22 ;Tiefe [mm]
Q206 FAUTO ;Vorschub Reiben [mm/min]
Q211=+0 ;Verweilzeit unten [s]
Q208=+0 ;Vorschub Rückzug [mm/min]
Q203=+20 ;Oberflächen-Koordinate [mm]
Q204=+50 ;2. Sicherheits-Abstand [mm]
L X+0 Y+0 FMAX M99
M5
M9
END PGM PROGRAM MM` }
];

(function () {
  if (!window.I18N || I18N.getLang() !== 'de') return;
  if (typeof EXTRA_DEMO_PROGRAMS === 'undefined') return;
  EXTRA_DEMO_PROGRAMS.forEach(function (demo) {
    var de = EXTRA_DEMO_PROGRAMS_DE.filter(function (d) { return d.name === demo.name; })[0];
    if (de) demo.code = de.code;
  });
})();
