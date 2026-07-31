import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lessonsDe } from './learn-content-de.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const learnRoot = resolve(root, 'learn');
const siteUrl = 'https://tncsim.org';
const generatedOn = '2026-07-31';

const lessons = [
  {
    id: 'L01', number: 1, slug: 'program-skeleton-blk-form',
    title: 'Program skeleton and BLK FORM',
    seoTitle: 'Heidenhain BLK FORM and Program Structure | TNC Sim',
    description: 'Learn the BEGIN PGM, END PGM and BLK FORM blocks used to define a Heidenhain Klartext program and its 3D workpiece blank.',
    intro: 'Start a Klartext program with a valid program skeleton, then describe the workpiece blank that TNC Sim will display and machine in 3D.',
    points: [
      'Open and close a program with matching BEGIN PGM and END PGM blocks.',
      'Use BLK FORM 0.1 for the minimum corner and BLK FORM 0.2 for the maximum corner.',
      'Check that every maximum coordinate is greater than its matching minimum coordinate.'
    ],
    explanation: [
      'The program name and unit belong in both structural blocks. MM selects millimetres. The two BLK FORM blocks define opposite corners of a rectangular workpiece in X, Y and Z.',
      'BLK FORM describes stock geometry; it does not move the tool. Once both corners are valid, TNC Sim can create the blank for the interactive 3D view.'
    ],
    code: `BEGIN PGM PLATE MM
BLK FORM 0.1 Z X+0 Y+0 Z-20
BLK FORM 0.2 X+100 Y+80 Z+0
END PGM PLATE MM`
  },
  {
    id: 'L02', number: 2, slug: 'tool-call-spindle-feed',
    title: 'TOOL CALL, spindle speed and feed',
    seoTitle: 'Heidenhain TOOL CALL, Spindle Speed and Feed | TNC Sim',
    description: 'Learn how TOOL CALL selects a tool, working axis, spindle speed and feed in a Heidenhain Klartext program.',
    intro: 'Prepare the first machining operation by calling a defined tool and setting the values that control spindle speed and feed.',
    points: [
      'Call a tool by number and select its working spindle axis.',
      'Set spindle speed with S and feed rate with F.',
      'Use M3 for clockwise spindle rotation and M8 for flood coolant in the simulator.'
    ],
    explanation: [
      'A tool must already exist in TOOL DEF or the Tool Table before it is called. In TOOL CALL 1 Z S10000 F2000, 1 is the tool number, Z is the working axis, S is spindle speed and F is feed rate.',
      'TOOL CALL prepares tool data, while M functions control machine states. TNC Sim models the supported spindle and coolant functions in the program simulation.'
    ],
    code: `TOOL CALL 1 Z S10000 F2000
M3 ; spindle clockwise
M8 ; flood coolant`
  },
  {
    id: 'L03', number: 3, slug: 'linear-moves-safe-approach',
    title: 'Linear moves, FMAX and safe approach',
    seoTitle: 'Heidenhain L Blocks, FMAX and Safe Approach | TNC Sim',
    description: 'Learn how Heidenhain L blocks position the tool with rapid FMAX moves and controlled feed moves in Klartext.',
    intro: 'Build a safe approach sequence with fast clearance moves above the workpiece and a controlled cutting move near the material.',
    points: [
      'Program straight tool motion with L blocks.',
      'Use FMAX for rapid positioning clear of the workpiece.',
      'Switch to a programmed feed before the cutting move.'
    ],
    explanation: [
      'An L block moves the tool in a straight line to the programmed endpoint. Coordinates omitted from a block remain unchanged, so a Z-only move keeps the current X and Y position.',
      'Rapid positioning is intended for clearance motion, not cutting. Approach the workpiece from a known safe height and use a controlled feed when entering material.'
    ],
    code: `L X+20 Y+40 Z+50 FMAX
L Z+2 FMAX
L Z-5 F200
L Z+50 FMAX`
  },
  {
    id: 'L04', number: 4, slug: 'incremental-coordinates-slot',
    title: 'Incremental coordinates and a first slot',
    seoTitle: 'Heidenhain Incremental Coordinates IX and IY | TNC Sim',
    description: 'Learn how IX and IY program incremental Klartext moves while cutting a simple slot in the TNC Sim 3D simulator.',
    intro: 'Combine an absolute starting point with incremental moves measured from the current tool position.',
    points: [
      'Recognize the difference between absolute and incremental coordinates.',
      'Use IX and IY for distances relative to the current position.',
      'Keep depth, cutting feed and retract moves explicit.'
    ],
    explanation: [
      'An absolute X or Y value targets a coordinate in the active datum system. An incremental IX or IY value adds a signed distance to the current position instead.',
      'Incremental moves are useful for local geometry, but each result depends on the position reached by the previous block. Simulating the sequence makes that dependency visible.'
    ],
    code: `L X+20 Y+40 Z+2 FMAX
L Z-5 F200
L IX+60 F400
L IY+20
L IX-60
L Z+50 FMAX`
  },
  {
    id: 'L05', number: 5, slug: 'circular-arcs-cc-c-cr',
    title: 'Circular arcs with CC, C and CR',
    seoTitle: 'Heidenhain Circular Arcs with CC, C and CR | TNC Sim',
    description: 'Learn how CC defines a circle centre and how C and CR create circular arcs in Heidenhain Klartext programming.',
    intro: 'Program circular contours either from a defined circle centre or from a radius, then inspect the resulting path in 3D and XY views.',
    points: [
      'Define a circle centre with CC without moving the tool.',
      'Use C for an arc around the active CC centre.',
      'Use CR when the arc is defined by its radius and direction.'
    ],
    explanation: [
      'Before a C block, CC stores the centre coordinates in the active plane. The last tool position is the arc start; C supplies the endpoint and DR selects the direction of rotation.',
      'CR describes an arc by endpoint, radius and rotation direction. It is useful when the radius is known directly and no reusable centre is needed.'
    ],
    code: `L X+45 Y+25 FMAX
CC X+25 Y+25
C X+25 Y+45 DR+
CR X+5 Y+25 R+20 DR+`
  },
  {
    id: 'L06', number: 6, slug: 'corner-rounding-chamfer',
    title: 'Corner rounding with RND and chamfers with CHF',
    seoTitle: 'Heidenhain RND Corner Rounding and CHF Chamfer | TNC Sim',
    description: 'Learn how RND creates a tangent corner radius and CHF inserts a chamfer between straight Klartext contour blocks.',
    intro: 'Replace sharp contour corners with a programmed radius or a straight chamfer while keeping the surrounding path connected.',
    points: [
      'Insert RND between contour blocks and set its rounding radius.',
      'Insert CHF between two straight lines and set the chamfer side length.',
      'Leave enough adjacent contour length for the requested transition.'
    ],
    explanation: [
      'RND creates a circular transition tangent to the contour elements before and after it. CHF trims two straight lines and connects them with a straight chamfer.',
      'Both functions depend on neighbouring contour geometry. TNC Sim validates the transition and displays the resulting toolpath before machining.'
    ],
    code: `L X+50 Y+0
RND R10
L X+50 Y+50
CHF 8
L X+0 Y+50`
  },
  {
    id: 'L07', number: 7, slug: 'radius-compensation-rl-rr-r0',
    title: 'Radius compensation with RL, RR and R0',
    seoTitle: 'Heidenhain Tool Radius Compensation RL, RR and R0 | TNC Sim',
    description: 'Learn how RL and RR offset the tool centre from a Klartext contour and how R0 cancels radius compensation.',
    intro: 'Program the finished part contour while the control offsets the tool-centre path by the active cutter radius.',
    points: [
      'Choose RL or RR from the tool movement direction along the programmed contour.',
      'Approach the compensated contour with enough space for the offset.',
      'Cancel compensation with R0 on a suitable departure move.'
    ],
    explanation: [
      'RL places the tool to the left of the programmed contour and RR places it to the right, viewed in the direction of tool travel. The tool radius comes from the active tool data.',
      'Compensation changes the tool-centre path, not the programmed finished contour. TNC Sim keeps exact line and arc geometry through compensation and shows the offset path for inspection.'
    ],
    code: `TOOL CALL 1 Z S10000 F500
L X+0 Y+60 Z+2 FMAX R0
L Z-5 F200
L X+10 Y+50 RL
L X+50
L Y+10
L X+60 R0`
  },
  {
    id: 'L08', number: 8, slug: 'drilling-cycle-200',
    title: 'Drilling with CYCL DEF 200',
    seoTitle: 'Heidenhain Drilling Cycle 200 Tutorial | TNC Sim',
    description: 'Learn the key Q parameters of Heidenhain CYCL DEF 200 and call the drilling cycle at programmed hole positions.',
    intro: 'Define one drilling operation with cycle parameters, then reuse it at one or more XY positions.',
    points: [
      'Set safety clearance, depth, plunge feed and pecking depth.',
      'Define the workpiece surface and second safety clearance.',
      'Call the active cycle at a position with M99.'
    ],
    explanation: [
      'CYCL DEF 200 stores a drilling cycle. Its Q parameters describe the Z motion and feed behaviour, while a later positioning block supplies the hole coordinates.',
      'M99 calls the active cycle at the programmed position. This separates reusable process data from the list of hole locations.'
    ],
    code: `CYCL DEF 200 ; Drilling
 Q200=+2   ; safety clearance
 Q201=-15  ; depth
 Q206=+150 ; plunge feed
 Q202=+5   ; pecking depth
 Q210=+0   ; dwell at top
 Q203=+0   ; surface coordinate
 Q204=+50  ; second safety clearance
 Q211=+0   ; dwell at bottom
L X+30 Y+30 FMAX M99`
  },
  {
    id: 'L09', number: 9, slug: 'subprograms-labels-q-parameters',
    title: 'Subprograms, labels and Q parameters',
    seoTitle: 'Heidenhain LBL Subprograms and Q Parameters | TNC Sim',
    description: 'Learn how LBL defines a reusable Klartext program section, CALL LBL invokes it and Q parameters store values.',
    intro: 'Reuse a programmed sequence instead of duplicating blocks, and introduce a numeric Q parameter for a value that may change.',
    points: [
      'Mark a labeled program section with LBL and end a subprogram with LBL 0.',
      'Invoke the section with CALL LBL.',
      'Assign a numeric value to a Q parameter and reuse it in program blocks.'
    ],
    explanation: [
      'Labels identify a program location. A subprogram is defined at its label and returns at LBL 0; CALL LBL transfers execution to that labeled section.',
      'Q parameters store numeric values for later expressions or coordinates. They make dimensions and repeated operations easier to adjust consistently.'
    ],
    code: `LBL 1
 L X+Q1 Y+Q1 FMAX M99
LBL 0

Q1 = +30
CALL LBL 1
L Z+50 FMAX`
  },
  {
    id: 'L10', number: 10, slug: 'polar-coordinates-cc-lp',
    title: 'Polar coordinates with CC and LP',
    seoTitle: 'Heidenhain Polar Coordinates with CC and LP | TNC Sim',
    description: 'Learn how a CC pole, polar radius PR and polar angle PA define Klartext positions with LP blocks.',
    intro: 'Place repeated or rotational geometry around a pole by describing each point with a radius and angle.',
    points: [
      'Define the pole in the active plane with CC.',
      'Use LP with PR for polar radius and PA for polar angle.',
      'Use signed angles and incremental polar values deliberately.'
    ],
    explanation: [
      'For polar programming, CC defines the pole. LP then positions the tool using PR, the distance from the pole, and PA, the angular position around it.',
      'Polar coordinates are especially useful for bolt circles and rotational patterns because the radius can remain constant while only the angle changes.'
    ],
    code: `CC X+50 Y+50
LP PR+30 PA+0 FMAX
LP PR+30 PA+120
LP PR+30 PA+240`
  },
  {
    id: 'L11', number: 11, slug: 'circular-pocket-cycle-208',
    title: 'Circular pocket milling with CYCL DEF 208',
    seoTitle: 'Heidenhain Circular Pocket Cycle 208 Tutorial | TNC Sim',
    description: 'Learn the main Q parameters for Heidenhain CYCL DEF 208 circular pocket milling and call the cycle in TNC Sim.',
    intro: 'Define a circular pocket operation with a target diameter, depth, infeed and overlap, then call it at the pocket centre.',
    points: [
      'Set safety clearances, depth, plunge feed and infeed per pass.',
      'Define nominal diameter, pre-drilled diameter and milling direction.',
      'Control path overlap with Q370 and call the cycle with M99.'
    ],
    explanation: [
      'Cycle 208 mills a circular pocket or bore around the programmed centre. Its parameter set controls vertical approach, helical infeed and radial machining.',
      'The active tool and pocket dimensions must form a valid cutting setup. TNC Sim checks the supported parameters and visualizes each generated pass.'
    ],
    code: `CYCL DEF 208 ; Circular Pocket Milling
 Q200=+2   ; safety clearance
 Q201=-10  ; depth
 Q206=+150 ; plunge feed
 Q334=+2   ; infeed per pass
 Q203=+0   ; surface coordinate
 Q204=+30  ; second safety clearance
 Q335=+30  ; nominal diameter
 Q342=+0   ; pre-drilled diameter
 Q351=+1   ; milling mode
 Q370=+1   ; path overlap factor
L X+50 Y+50 FMAX M99`
  },
  {
    id: 'L20', number: 12, slug: 'precision-hole-cycle-201',
    title: 'Precision holes with drilling and Cycle 201 reaming',
    seoTitle: 'Heidenhain Reaming Cycle 201 for Precision Holes | TNC Sim',
    description: 'Learn a spot, drill and ream sequence using Heidenhain CYCL DEF 201 for a precision hole.',
    intro: 'Build a realistic multi-tool hole process: establish the centre, drill undersize and finish the bore with a reamer.',
    points: [
      'Use a centre drill before the full-depth drilling operation.',
      'Leave appropriate material for the reaming tool.',
      'Define reaming depth, feed and retract behaviour with Cycle 201.'
    ],
    explanation: [
      'A precision reamed hole is normally produced in stages. Spotting helps establish location, drilling creates the undersize bore and reaming finishes the diameter and surface.',
      'Cycle 201 stores the supported reaming motion and feed parameters. The same labeled hole positions can be reused across the tool changes.'
    ],
    code: `TOOL CALL 6 Z S1200 F200
M3
CYCL DEF 201 ; Reaming
 Q200=+2   ; safety clearance
 Q201=-20  ; depth
 Q206=+200 ; reaming feed
 Q211=+0   ; dwell at bottom
 Q208=+500 ; retraction feed
 Q203=+0   ; surface coordinate
 Q204=+50  ; second safety clearance
L X+30 Y+30 FMAX M99`
  },
  {
    id: 'L21', number: 13, slug: 'tapping-cycle-209',
    title: 'Thread tapping with CYCL DEF 209',
    seoTitle: 'Heidenhain Tapping Cycle 209 Tutorial | TNC Sim',
    description: 'Learn how Heidenhain CYCL DEF 209 uses thread depth, pitch and chip-breaking parameters to tap a prepared hole.',
    intro: 'Program a tapping operation after the correct core hole has been drilled, using pitch and depth values that match the selected tap.',
    points: [
      'Set thread depth and pitch for the required thread.',
      'Control chip-breaking infeed and retract factor.',
      'Call the cycle only at prepared hole positions.'
    ],
    explanation: [
      'Cycle 209 synchronizes tapping motion with the programmed thread pitch. The hole must already have the correct core diameter and enough depth for the operation.',
      'Q257 controls the infeed depth used for chip breaking. Q256 is a retract factor expressed in thread pitches; zero requests a full retract in the simulator.'
    ],
    code: `CYCL DEF 209 ; Tapping with Chip Breaking
 Q200=+2    ; safety clearance
 Q201=-15   ; thread depth
 Q239=+1.25 ; thread pitch
 Q203=+0    ; surface coordinate
 Q204=+30   ; second safety clearance
 Q257=+4    ; chip-breaking infeed depth
 Q256=+0.5  ; chip-break retract factor
 Q336=+0    ; spindle angle
 Q403=+1    ; retraction factor
L X-30 Y+30 FMAX M99`
  },
  {
    id: 'L22', number: 14, slug: 'chamfering-dl-dr-tool-offsets',
    title: 'Chamfering with DL and DR tool offsets',
    seoTitle: 'Heidenhain Chamfering with DL and DR Offsets | TNC Sim',
    description: 'Learn how TOOL CALL DL and DR delta offsets position a countersink for programmed edge chamfering in TNC Sim.',
    intro: 'Use temporary tool-length and tool-radius delta values to place the cutting flank of a countersink on a hole or contour edge.',
    points: [
      'Understand DL as a delta to tool length and DR as a delta to tool radius.',
      'Apply offsets only for the operation that requires them.',
      'Verify the effective tool geometry and resulting chamfer in simulation.'
    ],
    explanation: [
      'DL and DR supplement the active tool data in a TOOL CALL block. They can shift the programmed reference point so a specific part of a shaped tool follows the target edge.',
      'The required values depend on the real tool geometry and setup. The lesson demonstrates the simulator workflow; production values must always be verified independently.'
    ],
    code: `TOOL CALL 5 Z S10000 F1000 DL-2 DR+2
M3
CYCL DEF 208 ; edge chamfer operation
 Q200=+2   ; safety clearance
 Q201=-1   ; edge-break depth
 Q206=+300 ; plunge feed
 Q334=+1   ; infeed per helix turn
 Q203=+0   ; surface coordinate
 Q204=+30  ; second safety clearance
 Q335=+10  ; nominal diameter
 Q342=+10  ; existing milled diameter
 Q351=+1   ; climb milling
 Q370=+1   ; path overlap factor
L X+50 Y+50 FMAX M99`
  },
  {
    id: 'L23', number: 15, slug: 'parametric-contour-q-parameters',
    title: 'Parametric contours with Q parameters',
    seoTitle: 'Heidenhain Parametric Contours with Q Parameters | TNC Sim',
    description: 'Learn how Q parameters drive one reusable Klartext profile through milling and chamfering passes.',
    intro: 'Collect important dimensions in Q parameters, then use the same programmed profile for more than one machining pass.',
    points: [
      'Assign named numeric dimensions to Q parameters at the start of the program.',
      'Use the parameters in contour coordinates and process values.',
      'Reuse the profile with different tools, depths or offsets.'
    ],
    explanation: [
      'A parametric contour separates design values from the blocks that use them. Changing one parameter can update every dependent coordinate or depth consistently.',
      'The final TNC Sim lesson combines earlier topics: tool calls, safe positioning, contour functions, compensation, labels and a second chamfering pass.'
    ],
    code: `Q1 = +0
LBL 1
 L X+10 Y-10 Z+50 FMAX R0
 L Z+Q1 FMAX
 L X+5 F500 RL
 L Y+95
 RND R15
 L X+95
 L Y+5
 CHF 15
 L X-5
 L Z+50 FMAX R0
LBL 0`
  }
];

const localeCopy = {
  en: {
    pathPrefix: '',
    ogLocale: 'en_US',
    languageName: 'English',
    alternateLanguageName: 'Deutsch',
    primaryNavigation: 'Primary navigation',
    breadcrumbNavigation: 'Breadcrumb',
    lessonNavigation: 'Lesson navigation',
    courseFeaturesLabel: 'Course features',
    headerSubtitle: 'Heidenhain Klartext learning',
    allLessons: 'All lessons',
    openSimulator: 'Open simulator',
    homeLabel: 'TNC Sim home',
    learnLabel: 'Learn',
    lessonLabel: 'Lesson',
    courseEyebrow: 'Interactive Klartext course',
    startInteractive: 'Start this interactive lesson',
    seeExample: 'See the example',
    whatYouLearn: 'What you will learn',
    practiceTitle: 'Practice in the real editor',
    practiceText: 'The interactive lesson opens inside TNC Sim, checks your Klartext blocks and lets you inspect the result in the 3D view.',
    howItWorks: 'How it works',
    exampleEyebrow: 'Klartext example',
    exampleTitle: 'Try the essential blocks',
    exampleText: 'This compact example introduces the lesson topic. Use the guided practice for the complete checked exercise.',
    safetyTitle: 'Early-release simulator:',
    safetyText: 'use TNC Sim for learning and visualization. Always verify an NC program on the real control or with another trusted method before machining.',
    readyEyebrow: 'Ready to practice?',
    readyTitle: 'Write the blocks and check the 3D result',
    openLesson: (number) => `Open lesson ${number} in TNC Sim`,
    previous: 'Previous',
    next: 'Next',
    course: 'Course',
    independentText: 'TNC Sim is an independent open-source project and is not affiliated with or endorsed by HEIDENHAIN GmbH.',
    privacyLabel: 'Privacy',
    hubTitle: 'Learn Heidenhain Klartext Programming Online | TNC Sim',
    hubDescription: 'Follow 15 practical Heidenhain Klartext lessons with checked exercises and interactive 3D CNC simulation in TNC Sim.',
    hubCourseName: 'Learn Heidenhain Klartext with TNC Sim',
    hubEyebrow: 'Open-source · self-paced · interactive 3D practice',
    hubHeading: 'Learn Heidenhain Klartext programming online',
    hubLead: 'Build a complete CNC milling program step by step. Each topic explains the essential blocks, then opens a checked exercise in the real TNC Sim editor and 3D simulator.',
    startLessonOne: 'Start lesson 1',
    browseLessons: 'Browse all lessons',
    features: ['15 lessons', 'Checked exercises', '3D CNC simulation', 'No installation'],
    pathEyebrow: 'From blank to complete part',
    pathTitle: 'A practical Klartext learning path',
    pathText: 'Begin with program structure, tool setup and safe linear moves. Continue through arcs, corner transitions, compensation, cycles, labels, polar coordinates and a final parametric contour. The pages below are readable references; the linked exercises run inside TNC Sim.',
    contentsEyebrow: 'Course contents',
    contentsTitle: 'Klartext lessons',
    contentsText: 'Choose a reference page or open its interactive exercise.',
    hubSafetyTitle: 'Independent learning tool:',
    hubSafetyText: 'TNC Sim is not affiliated with or endorsed by HEIDENHAIN GmbH. It is an early-release simulator and does not replace verification on a real control.',
    educationalBeginner: 'Beginner',
    educationalIntermediate: 'Intermediate'
  },
  de: {
    pathPrefix: '/de',
    ogLocale: 'de_DE',
    languageName: 'Deutsch',
    alternateLanguageName: 'English',
    primaryNavigation: 'Hauptnavigation',
    breadcrumbNavigation: 'Brotkrümelnavigation',
    lessonNavigation: 'Lektionsnavigation',
    courseFeaturesLabel: 'Kursmerkmale',
    headerSubtitle: 'Heidenhain-Klartext lernen',
    allLessons: 'Alle Lektionen',
    openSimulator: 'Simulator öffnen',
    homeLabel: 'TNC-Sim-Startseite',
    learnLabel: 'Lernen',
    lessonLabel: 'Lektion',
    courseEyebrow: 'Interaktiver Klartext-Kurs',
    startInteractive: 'Interaktive Lektion starten',
    seeExample: 'Beispiel ansehen',
    whatYouLearn: 'Das lernst du',
    practiceTitle: 'Im echten Editor üben',
    practiceText: 'Die interaktive Lektion öffnet sich in TNC Sim, prüft deine Klartext-Sätze und zeigt das Ergebnis in der 3D-Ansicht.',
    howItWorks: 'So funktioniert es',
    exampleEyebrow: 'Klartext-Beispiel',
    exampleTitle: 'Probiere die wichtigsten Sätze aus',
    exampleText: 'Dieses kompakte Beispiel führt in das Thema ein. Die vollständige, geprüfte Aufgabe findest du in der geführten Übung.',
    safetyTitle: 'Simulator in früher Entwicklungsphase:',
    safetyText: 'Nutze TNC Sim zum Lernen und Visualisieren. Prüfe ein NC-Programm vor der Bearbeitung immer an der realen Steuerung oder mit einer anderen zuverlässigen Methode.',
    readyEyebrow: 'Bereit zum Üben?',
    readyTitle: 'Schreibe die Sätze und prüfe das 3D-Ergebnis',
    openLesson: (number) => `Lektion ${number} in TNC Sim öffnen`,
    previous: 'Zurück',
    next: 'Weiter',
    course: 'Kurs',
    independentText: 'TNC Sim ist ein unabhängiges Open-Source-Projekt und weder mit der HEIDENHAIN GmbH verbunden noch von ihr unterstützt.',
    privacyLabel: 'Datenschutz',
    hubTitle: 'Heidenhain Klartext online lernen | TNC Sim',
    hubDescription: 'Lerne Heidenhain Klartext in 15 praktischen Lektionen mit geprüften Aufgaben und interaktiver 3D-CNC-Simulation in TNC Sim.',
    hubCourseName: 'Heidenhain Klartext mit TNC Sim lernen',
    hubEyebrow: 'Open Source · selbstbestimmt · interaktive 3D-Übungen',
    hubHeading: 'Heidenhain Klartext online lernen',
    hubLead: 'Baue Schritt für Schritt ein vollständiges CNC-Fräsprogramm auf. Jedes Thema erklärt die wichtigsten Sätze und öffnet danach eine geprüfte Übung im echten TNC-Sim-Editor mit 3D-Simulation.',
    startLessonOne: 'Lektion 1 starten',
    browseLessons: 'Alle Lektionen ansehen',
    features: ['15 Lektionen', 'Geprüfte Aufgaben', '3D-CNC-Simulation', 'Keine Installation'],
    pathEyebrow: 'Vom Rohteil zum fertigen Werkstück',
    pathTitle: 'Ein praktischer Lernweg für Klartext',
    pathText: 'Beginne mit Programmaufbau, Werkzeugen und sicheren linearen Bewegungen. Danach folgen Kreisbögen, Eckenübergänge, Radiuskorrektur, Zyklen, Labels, Polarkoordinaten und eine abschließende parametrische Kontur. Die Seiten unten dienen als lesbare Referenz; die verlinkten Übungen laufen in TNC Sim.',
    contentsEyebrow: 'Kursinhalt',
    contentsTitle: 'Klartext-Lektionen',
    contentsText: 'Wähle eine Referenzseite oder öffne die zugehörige interaktive Übung.',
    hubSafetyTitle: 'Unabhängiges Lernwerkzeug:',
    hubSafetyText: 'TNC Sim ist weder mit der HEIDENHAIN GmbH verbunden noch von ihr unterstützt. Der Simulator befindet sich in einer frühen Entwicklungsphase und ersetzt keine Prüfung an einer realen Steuerung.',
    educationalBeginner: 'Anfänger',
    educationalIntermediate: 'Fortgeschritten'
  }
};

function localizedLessons(locale) {
  if (locale === 'en') return lessons;
  return lessons.map((lesson) => ({ ...lesson, ...lessonsDe[lesson.id] }));
}

function localizedPath(locale, suffix = '') {
  return `${localeCopy[locale].pathPrefix}/learn/${suffix}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function jsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

function head({ title, description, canonical, locale, alternatePath, type = 'article', structuredData }) {
  const copy = localeCopy[locale];
  const englishUrl = `${siteUrl}${localizedPath('en', alternatePath)}`;
  const germanUrl = `${siteUrl}${localizedPath('de', alternatePath)}`;
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${englishUrl}">
  <link rel="alternate" hreflang="de" href="${germanUrl}">
  <link rel="alternate" hreflang="x-default" href="${englishUrl}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <meta name="theme-color" content="#14b8a6">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${copy.ogLocale}">
  <meta property="og:locale:alternate" content="${localeCopy[locale === 'en' ? 'de' : 'en'].ogLocale}">
  <meta property="og:image" content="${siteUrl}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${siteUrl}/og-image.png">
  <script type="application/ld+json">${jsonLd(structuredData)}</script>
  <link rel="stylesheet" href="/learn/learn.css">
</head>`;
}

function siteHeader(locale, alternatePath = '') {
  const copy = localeCopy[locale];
  const alternateLocale = locale === 'en' ? 'de' : 'en';
  return `<header class="site-header">
  <a class="brand" href="/" aria-label="${copy.homeLabel}">
    <img src="/icon-192.png" alt="" width="42" height="42">
    <span><strong>TNC Sim</strong><small>${copy.headerSubtitle}</small></span>
  </a>
  <nav aria-label="${copy.primaryNavigation}">
    <a class="all-lessons" href="${localizedPath(locale)}">${copy.allLessons}</a>
    <a class="language-link" href="${localizedPath(alternateLocale, alternatePath)}" lang="${alternateLocale}" hreflang="${alternateLocale}">${copy.alternateLanguageName}</a>
    <a class="button small" href="/?lang=${locale}">${copy.openSimulator}</a>
  </nav>
</header>`;
}

function siteFooter(locale) {
  const copy = localeCopy[locale];
  return `<footer class="site-footer">
  <p>${copy.independentText}</p>
  <p><a href="https://github.com/slavomrkva/tnc-sim">GitHub</a> · <a href="/privacy.html">${copy.privacyLabel}</a> · <a href="mailto:info@tncsim.org">info@tncsim.org</a></p>
</footer>`;
}

function lessonPage(locale, lesson, index, courseLessons) {
  const copy = localeCopy[locale];
  const alternatePath = `${lesson.slug}/`;
  const canonical = `${siteUrl}${localizedPath(locale, alternatePath)}`;
  const previous = courseLessons[index - 1];
  const next = courseLessons[index + 1];
  const cta = `/?lang=${locale}&amp;learn=${lesson.id}&amp;utm_source=learn_guide&amp;utm_medium=website&amp;utm_campaign=learn_pages`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description: lesson.description,
    url: canonical,
    inLanguage: locale,
    educationalLevel: index < 7 ? copy.educationalBeginner : copy.educationalIntermediate,
    learningResourceType: 'Tutorial',
    isPartOf: {
      '@type': 'Course',
      name: copy.hubCourseName,
      url: `${siteUrl}${localizedPath(locale)}`
    },
    provider: {
      '@type': 'Organization',
      name: 'TNC Sim',
      url: `${siteUrl}/`
    }
  };

  return `${head({ title: lesson.seoTitle, description: lesson.description, canonical, locale, alternatePath, structuredData })}
<body>
${siteHeader(locale, alternatePath)}
<main>
  <nav class="breadcrumbs" aria-label="${copy.breadcrumbNavigation}"><a href="/">TNC Sim</a><span>/</span><a href="${localizedPath(locale)}">${copy.learnLabel}</a><span>/</span><span>${copy.lessonLabel} ${lesson.number}</span></nav>
  <article class="lesson">
    <header class="hero compact">
      <p class="eyebrow">${copy.courseEyebrow} · ${copy.lessonLabel} ${lesson.number} / ${courseLessons.length}</p>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lead">${escapeHtml(lesson.intro)}</p>
      <div class="hero-actions">
        <a class="button" href="${cta}">${copy.startInteractive}</a>
        <a class="text-link" href="#example">${copy.seeExample}</a>
      </div>
    </header>

    <section class="content-grid" aria-labelledby="learn-heading">
      <div>
        <h2 id="learn-heading">${copy.whatYouLearn}</h2>
        <ul class="check-list">${lesson.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
      </div>
      <aside class="course-note">
        <strong>${copy.practiceTitle}</strong>
        <p>${copy.practiceText}</p>
      </aside>
    </section>

    <section class="explanation">
      <h2>${copy.howItWorks}</h2>
      ${lesson.explanation.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </section>

    <section id="example" class="example">
      <div>
        <p class="eyebrow">${copy.exampleEyebrow}</p>
        <h2>${copy.exampleTitle}</h2>
        <p>${copy.exampleText}</p>
      </div>
      <pre><code>${escapeHtml(lesson.code)}</code></pre>
    </section>

    <aside class="safety-note"><strong>${copy.safetyTitle}</strong> ${copy.safetyText}</aside>

    <section class="lesson-cta">
      <div><p class="eyebrow">${copy.readyEyebrow}</p><h2>${copy.readyTitle}</h2></div>
      <a class="button" href="${cta}">${copy.openLesson(lesson.number)}</a>
    </section>

    <nav class="lesson-nav" aria-label="${copy.lessonNavigation}">
      ${previous ? `<a href="${localizedPath(locale, `${previous.slug}/`)}"><span>${copy.previous}</span><strong>${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="next" href="${localizedPath(locale, `${next.slug}/`)}"><span>${copy.next}</span><strong>${escapeHtml(next.title)}</strong></a>` : `<a class="next" href="${localizedPath(locale)}"><span>${copy.course}</span><strong>${copy.allLessons}</strong></a>`}
    </nav>
  </article>
</main>
${siteFooter(locale)}
</body>
</html>
`;
}

function hubPage(locale, courseLessons) {
  const copy = localeCopy[locale];
  const canonical = `${siteUrl}${localizedPath(locale)}`;
  const title = copy.hubTitle;
  const description = copy.hubDescription;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: copy.hubCourseName,
    description,
    url: canonical,
    inLanguage: locale,
    provider: {
      '@type': 'Organization',
      name: 'TNC Sim',
      url: `${siteUrl}/`
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online'
    }
  };

  return `${head({ title, description, canonical, locale, alternatePath: '', type: 'website', structuredData })}
<body>
${siteHeader(locale)}
<main>
  <section class="hero">
    <p class="eyebrow">${copy.hubEyebrow}</p>
    <h1>${copy.hubHeading}</h1>
    <p class="lead">${copy.hubLead}</p>
    <div class="hero-actions">
      <a class="button" href="/?lang=${locale}&amp;learn=L01&amp;utm_source=learn_guide&amp;utm_medium=website&amp;utm_campaign=learn_pages">${copy.startLessonOne}</a>
      <a class="text-link" href="#lessons">${copy.browseLessons}</a>
    </div>
    <ul class="feature-row" aria-label="${copy.courseFeaturesLabel}">${copy.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>
  </section>

  <section class="course-intro">
    <div><p class="eyebrow">${copy.pathEyebrow}</p><h2>${copy.pathTitle}</h2></div>
    <p>${copy.pathText}</p>
  </section>

  <section id="lessons" class="lesson-list" aria-labelledby="lessons-heading">
    <div class="section-head"><div><p class="eyebrow">${copy.contentsEyebrow}</p><h2 id="lessons-heading">${copy.contentsTitle}</h2></div><p>${copy.contentsText}</p></div>
    <ol class="cards">
      ${courseLessons.map((lesson) => `<li><a href="${localizedPath(locale, `${lesson.slug}/`)}"><span class="lesson-number">${String(lesson.number).padStart(2, '0')}</span><div><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.description)}</p></div><span class="arrow" aria-hidden="true">→</span></a></li>`).join('')}
    </ol>
  </section>

  <aside class="safety-note"><strong>${copy.hubSafetyTitle}</strong> ${copy.hubSafetyText}</aside>
</main>
${siteFooter(locale)}
</body>
</html>
`;
}

async function write(relativePath, content) {
  const target = resolve(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

for (const locale of Object.keys(localeCopy)) {
  const courseLessons = localizedLessons(locale);
  const outputRoot = locale === 'en' ? 'learn' : 'de/learn';
  await write(`${outputRoot}/index.html`, hubPage(locale, courseLessons));
  for (const [index, lesson] of courseLessons.entries()) {
    await write(`${outputRoot}/${lesson.slug}/index.html`, lessonPage(locale, lesson, index, courseLessons));
  }
}

const sitemapUrls = [
  { loc: `${siteUrl}/`, priority: '1.0' },
  ...Object.keys(localeCopy).flatMap((locale) => [
    { loc: `${siteUrl}${localizedPath(locale)}`, priority: '0.9', alternatePath: '' },
    ...lessons.map((lesson) => ({
      loc: `${siteUrl}${localizedPath(locale, `${lesson.slug}/`)}`,
      priority: '0.8',
      alternatePath: `${lesson.slug}/`
    }))
  ])
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.map(({ loc, priority, alternatePath }) => `  <url>\n    <loc>${loc}</loc>${alternatePath === undefined ? '' : `\n    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${localizedPath('en', alternatePath)}"/>\n    <xhtml:link rel="alternate" hreflang="de" href="${siteUrl}${localizedPath('de', alternatePath)}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${localizedPath('en', alternatePath)}"/>`}\n    <lastmod>${generatedOn}</lastmod>\n    <priority>${priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
await write('sitemap.xml', sitemap);

console.log(`Generated English and German Learn hubs, ${lessons.length * 2} lesson pages and sitemap.xml.`);
