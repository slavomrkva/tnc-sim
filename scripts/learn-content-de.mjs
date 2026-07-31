// German copy for the indexable Learn pages. NC syntax intentionally stays
// unchanged; terminology follows the German interactive lessons.
export const lessonsDe = {
  L01: {
    title: 'Programmgerüst & BLK FORM (das Rohteil)',
    seoTitle: 'Heidenhain BLK FORM und Programmaufbau | TNC Sim',
    description: 'Lerne BEGIN PGM, END PGM und BLK FORM kennen, mit denen ein Heidenhain-Klartextprogramm und sein 3D-Rohteil definiert werden.',
    intro: 'Beginne mit einem gültigen Programmgerüst und beschreibe anschließend das Rohteil, das TNC Sim in 3D darstellt und bearbeitet.',
    points: [
      'Öffne und schließe das Programm mit zusammengehörigen BEGIN-PGM- und END-PGM-Sätzen.',
      'Verwende BLK FORM 0.1 für die MIN-Ecke und BLK FORM 0.2 für die MAX-Ecke.',
      'Prüfe, dass jede maximale Koordinate größer als die zugehörige minimale Koordinate ist.'
    ],
    explanation: [
      'Programmname und Einheit stehen in beiden Gerüstsätzen. MM wählt Millimeter. Die beiden BLK-FORM-Sätze definieren gegenüberliegende Ecken eines quaderförmigen Rohteils in X, Y und Z.',
      'BLK FORM beschreibt die Rohteilgeometrie und bewegt kein Werkzeug. Sobald beide Ecken gültig sind, kann TNC Sim das Rohteil für die interaktive 3D-Ansicht erzeugen.'
    ]
  },
  L02: {
    title: 'Werkzeug & Spindel — TOOL CALL, S, F, M3/M8',
    seoTitle: 'Heidenhain TOOL CALL, Drehzahl und Vorschub | TNC Sim',
    description: 'Lerne, wie TOOL CALL Werkzeug, Spindelachse, Drehzahl und Vorschub in einem Heidenhain-Klartextprogramm festlegt.',
    intro: 'Bereite die erste Bearbeitung vor, indem du ein definiertes Werkzeug aufrufst und Spindeldrehzahl sowie Vorschub einstellst.',
    points: [
      'Rufe ein Werkzeug über seine Nummer auf und wähle die Spindelachse.',
      'Lege mit S die Spindeldrehzahl und mit F den Vorschub fest.',
      'Verwende im Simulator M3 für Rechtslauf und M8 für Kühlmittel.'
    ],
    explanation: [
      'Das Werkzeug muss vor dem Aufruf in TOOL DEF oder in der Werkzeugtabelle vorhanden sein. In TOOL CALL 1 Z S10000 F2000 ist 1 die Werkzeugnummer, Z die Spindelachse, S die Drehzahl und F der Vorschub.',
      'TOOL CALL stellt Werkzeugdaten bereit, während M-Funktionen Maschinenzustände schalten. TNC Sim bildet die unterstützten Spindel- und Kühlmittelfunktionen in der Simulation ab.'
    ]
  },
  L03: {
    title: 'Erste Bewegungen — L-Sätze, FMAX & sicheres Anfahren',
    seoTitle: 'Heidenhain L-Sätze, FMAX und sicheres Anfahren | TNC Sim',
    description: 'Lerne, wie Heidenhain-L-Sätze das Werkzeug mit FMAX im Eilgang und mit programmiertem Vorschub sicher positionieren.',
    intro: 'Baue eine sichere Anfahrfolge mit schnellen Freifahrbewegungen über dem Rohteil und einer kontrollierten Bewegung nahe am Material.',
    points: [
      'Programmiere geradlinige Werkzeugbewegungen mit L-Sätzen.',
      'Verwende FMAX nur zum schnellen Positionieren außerhalb des Materials.',
      'Wechsle vor einer Bearbeitungsbewegung auf einen programmierten Vorschub.'
    ],
    explanation: [
      'Ein L-Satz bewegt das Werkzeug geradlinig zum programmierten Endpunkt. Nicht angegebene Koordinaten bleiben unverändert; eine reine Z-Bewegung behält daher die aktuelle X- und Y-Position.',
      'Der Eilgang ist für Freifahrbewegungen und nicht zum Zerspanen vorgesehen. Fahre das Rohteil aus einer bekannten sicheren Höhe an und tauche mit kontrolliertem Vorschub ein.'
    ]
  },
  L04: {
    title: 'Erste Nut — Tiefe & inkremental IX/IY',
    seoTitle: 'Heidenhain inkrementale Koordinaten IX und IY | TNC Sim',
    description: 'Lerne, wie IX und IY inkrementale Klartextbewegungen beim Fräsen einer einfachen Nut in der 3D-Simulation programmieren.',
    intro: 'Verbinde einen absoluten Startpunkt mit inkrementalen Bewegungen, die von der aktuellen Werkzeugposition aus gemessen werden.',
    points: [
      'Unterscheide absolute von inkrementalen Koordinaten.',
      'Verwende IX und IY für Strecken relativ zur aktuellen Position.',
      'Programmiere Tiefe, Bearbeitungsvorschub und Rückzug ausdrücklich.'
    ],
    explanation: [
      'Ein absoluter X- oder Y-Wert bezeichnet eine Koordinate im aktiven Bezugssystem. Ein inkrementaler IX- oder IY-Wert addiert dagegen eine vorzeichenbehaftete Strecke zur aktuellen Position.',
      'Inkrementale Bewegungen eignen sich für lokale Geometrien, ihr Ergebnis hängt jedoch immer von der vorher erreichten Position ab. Die Simulation macht diese Abhängigkeit sichtbar.'
    ]
  },
  L05: {
    title: 'Kreisbögen — CC + C und CR',
    seoTitle: 'Heidenhain Kreisbögen mit CC, C und CR | TNC Sim',
    description: 'Lerne, wie CC einen Kreismittelpunkt festlegt und wie C und CR Kreisbögen in der Heidenhain-Klartextprogrammierung erzeugen.',
    intro: 'Programmiere Kreisbahnen entweder über einen definierten Kreismittelpunkt oder direkt über einen Radius und prüfe die Bahn in 3D und XY.',
    points: [
      'Definiere mit CC einen Kreismittelpunkt, ohne das Werkzeug zu bewegen.',
      'Verwende C für einen Bogen um den aktiven CC-Mittelpunkt.',
      'Verwende CR, wenn der Bogen durch Radius und Drehrichtung bestimmt ist.'
    ],
    explanation: [
      'Vor einem C-Satz speichert CC die Mittelpunktkoordinaten in der aktiven Ebene. Die letzte Werkzeugposition ist der Startpunkt, C enthält den Endpunkt und DR bestimmt die Drehrichtung.',
      'CR beschreibt einen Bogen über Endpunkt, Radius und Drehrichtung. Das ist praktisch, wenn der Radius direkt bekannt ist und kein wiederverwendbarer Mittelpunkt benötigt wird.'
    ]
  },
  L06: {
    title: 'Ecken — RND-Rundung & CHF-Fase',
    seoTitle: 'Heidenhain RND-Rundung und CHF-Fase | TNC Sim',
    description: 'Lerne, wie RND eine tangentiale Eckenrundung und CHF eine Fase zwischen geraden Klartext-Kontursätzen einfügt.',
    intro: 'Ersetze scharfe Konturecken durch einen programmierten Radius oder eine gerade Fase und halte die angrenzende Bahn verbunden.',
    points: [
      'Füge RND zwischen Kontursätzen ein und lege den Rundungsradius fest.',
      'Füge CHF zwischen zwei Geraden ein und lege die Fasenlänge fest.',
      'Lasse auf beiden angrenzenden Konturelementen genügend Länge für den Übergang.'
    ],
    explanation: [
      'RND erzeugt einen Kreisbogen, der die Konturelemente davor und danach tangential verbindet. CHF kürzt zwei Geraden und verbindet sie mit einer geraden Fase.',
      'Beide Funktionen hängen von der benachbarten Konturgeometrie ab. TNC Sim prüft den Übergang und zeigt die resultierende Werkzeugbahn vor der Bearbeitung.'
    ]
  },
  L07: {
    title: 'Radiuskorrektur — RL / RR / R0',
    seoTitle: 'Heidenhain Radiuskorrektur mit RL, RR und R0 | TNC Sim',
    description: 'Lerne, wie RL und RR die Werkzeugmitte zur Klartextkontur versetzen und wie R0 die Radiuskorrektur wieder aufhebt.',
    intro: 'Programmiere die Fertigteilkontur, während die Steuerung die Werkzeugmittelpunktbahn um den aktiven Fräserradius versetzt.',
    points: [
      'Wähle RL oder RR aus der Bewegungsrichtung entlang der programmierten Kontur.',
      'Fahre die korrigierte Kontur mit genügend Platz für den Versatz an.',
      'Hebe die Korrektur mit R0 auf einer geeigneten Wegfahrbewegung auf.'
    ],
    explanation: [
      'RL führt das Werkzeug in Bewegungsrichtung links von der programmierten Kontur, RR entsprechend rechts. Der Werkzeugradius stammt aus den aktiven Werkzeugdaten.',
      'Die Korrektur verändert die Werkzeugmittelpunktbahn und nicht die programmierte Fertigteilkontur. TNC Sim erhält die Linien- und Kreisgeometrie und zeigt die versetzte Bahn zur Kontrolle.'
    ]
  },
  L08: {
    title: 'Bohren — CYCL DEF 200 + M99',
    seoTitle: 'Heidenhain Bohrzyklus CYCL DEF 200 | TNC Sim',
    description: 'Lerne die wichtigen Q-Parameter von Heidenhain CYCL DEF 200 und rufe den Bohrzyklus an programmierten Positionen auf.',
    intro: 'Definiere eine Bohrbearbeitung einmal über Zyklusparameter und verwende sie anschließend an einer oder mehreren XY-Positionen.',
    points: [
      'Lege Sicherheitsabstand, Tiefe, Vorschub und Zustelltiefe fest.',
      'Definiere Werkstückoberkante und zweiten Sicherheitsabstand.',
      'Rufe den aktiven Zyklus an einer Position mit M99 auf.'
    ],
    explanation: [
      'CYCL DEF 200 speichert einen Bohrzyklus. Seine Q-Parameter beschreiben die Z-Bewegung und das Vorschubverhalten, während ein späterer Positioniersatz die Bohrungskoordinaten liefert.',
      'M99 ruft den aktiven Zyklus an der programmierten Position auf. Dadurch bleiben wiederverwendbare Prozessdaten von der Liste der Bohrungspositionen getrennt.'
    ]
  },
  L09: {
    title: 'Unterprogramme & eine erste Variable — LBL + Q',
    seoTitle: 'Heidenhain LBL-Unterprogramme und Q-Parameter | TNC Sim',
    description: 'Lerne, wie LBL einen wiederverwendbaren Klartextabschnitt definiert, CALL LBL ihn aufruft und Q-Parameter Werte speichern.',
    intro: 'Verwende eine programmierte Folge mehrfach, statt Sätze zu kopieren, und speichere einen veränderbaren Zahlenwert in einem Q-Parameter.',
    points: [
      'Kennzeichne einen Programmabschnitt mit LBL und beende das Unterprogramm mit LBL 0.',
      'Rufe den Abschnitt mit CALL LBL auf.',
      'Weise einem Q-Parameter einen Zahlenwert zu und verwende ihn in Programmsätzen.'
    ],
    explanation: [
      'Labels kennzeichnen eine Stelle im Programm. Ein Unterprogramm beginnt am Label und kehrt bei LBL 0 zurück; CALL LBL übergibt die Ausführung an den gekennzeichneten Abschnitt.',
      'Q-Parameter speichern Zahlenwerte für spätere Ausdrücke oder Koordinaten. Damit lassen sich Maße und wiederholte Bearbeitungen einheitlich anpassen.'
    ]
  },
  L10: {
    title: 'Polarkoordinaten — CC-Pol + LP',
    seoTitle: 'Heidenhain Polarkoordinaten mit CC und LP | TNC Sim',
    description: 'Lerne, wie CC den Pol und LP mit Polarradius PR und Polarwinkel PA Positionen in Klartext festlegt.',
    intro: 'Positioniere wiederholte oder rotationssymmetrische Geometrien um einen Pol, indem du jeden Punkt mit Radius und Winkel beschreibst.',
    points: [
      'Definiere den Pol in der aktiven Ebene mit CC.',
      'Verwende LP mit PR für den Polarradius und PA für den Polarwinkel.',
      'Setze vorzeichenbehaftete Winkel und inkrementale Polarwerte bewusst ein.'
    ],
    explanation: [
      'Beim Programmieren mit Polarkoordinaten definiert CC den Pol. LP positioniert das Werkzeug dann über PR, den Abstand zum Pol, und PA, die Winkelposition um den Pol.',
      'Polarkoordinaten eignen sich besonders für Lochkreise und Rotationsmuster, weil der Radius gleich bleiben kann und sich nur der Winkel ändert.'
    ]
  },
  L11: {
    title: 'Runde Tasche — CYCL DEF 208 (Bohrfräsen)',
    seoTitle: 'Heidenhain Kreistasche mit CYCL DEF 208 | TNC Sim',
    description: 'Lerne die wichtigsten Q-Parameter für das Bohrfräsen einer runden Tasche mit Heidenhain CYCL DEF 208.',
    intro: 'Definiere eine runde Tasche mit Durchmesser, Tiefe, Zustellung und Überlappung und rufe den Zyklus am Taschenmittelpunkt auf.',
    points: [
      'Lege Sicherheitsabstände, Tiefe, Vorschub und Zustellung pro Schnitt fest.',
      'Definiere Soll-Durchmesser, Vorbohr-Durchmesser und Fräsart.',
      'Steuere die Bahnüberlappung mit Q370 und rufe den Zyklus mit M99 auf.'
    ],
    explanation: [
      'Zyklus 208 fräst eine runde Tasche oder Bohrung um den programmierten Mittelpunkt. Seine Parameter steuern Anfahren, helikale Zustellung und radiale Bearbeitung.',
      'Aktives Werkzeug und Taschenmaße müssen eine gültige Bearbeitung ergeben. TNC Sim prüft die unterstützten Parameter und stellt jede erzeugte Bahn dar.'
    ]
  },
  L20: {
    title: 'Präzisionsbohrung — zentrieren, bohren, reiben (Zyklus 201)',
    seoTitle: 'Heidenhain Reibzyklus 201 für Präzisionsbohrungen | TNC Sim',
    description: 'Lerne eine Folge aus Zentrieren, Bohren und Reiben mit Heidenhain CYCL DEF 201 für eine Präzisionsbohrung.',
    intro: 'Baue eine realistische Mehrwerkzeug-Bearbeitung auf: zentrieren, unter Maß bohren und die Bohrung mit einer Reibahle fertigstellen.',
    points: [
      'Zentriere vor dem Bohren auf volle Tiefe.',
      'Lasse ein geeignetes Aufmaß für die Reibahle stehen.',
      'Definiere Reibtiefe, Vorschub und Rückzug mit Zyklus 201.'
    ],
    explanation: [
      'Eine geriebene Präzisionsbohrung entsteht üblicherweise in mehreren Stufen. Zentrieren sichert die Lage, Bohren erzeugt die Untermaßbohrung und Reiben fertigt Durchmesser und Oberfläche.',
      'Zyklus 201 speichert die unterstützten Bewegungs- und Vorschubparameter zum Reiben. Dieselben Bohrungspositionen können über die Werkzeugwechsel hinweg wiederverwendet werden.'
    ]
  },
  L21: {
    title: 'Gewindebohren — CYCL DEF 209',
    seoTitle: 'Heidenhain Gewindebohrzyklus CYCL DEF 209 | TNC Sim',
    description: 'Lerne, wie Heidenhain CYCL DEF 209 Gewindetiefe, Steigung und Spanbruchparameter zum Gewindebohren verwendet.',
    intro: 'Programmiere nach dem passenden Kernloch einen Gewindebohrvorgang mit Steigung und Tiefe für den gewählten Gewindebohrer.',
    points: [
      'Lege Gewindetiefe und Steigung für das gewünschte Gewinde fest.',
      'Steuere Spanbruchzustellung und Rückzugsfaktor.',
      'Rufe den Zyklus nur an vorbereiteten Bohrungspositionen auf.'
    ],
    explanation: [
      'Zyklus 209 synchronisiert die Bewegung beim Gewindebohren mit der programmierten Gewindesteigung. Das Kernloch muss bereits den richtigen Durchmesser und genügend Tiefe besitzen.',
      'Q257 steuert die Zustelltiefe für den Spanbruch. Q256 ist ein Rückzugsfaktor in Gewindesteigungen; null fordert im Simulator einen vollständigen Rückzug.'
    ]
  },
  L22: {
    title: 'Anfasen — Senker & der DL/DR-Trick',
    seoTitle: 'Heidenhain Anfasen mit DL- und DR-Korrektur | TNC Sim',
    description: 'Lerne, wie die Delta-Korrekturen DL und DR in TOOL CALL einen Senker zum programmierten Anfasen von Kanten positionieren.',
    intro: 'Verwende temporäre Delta-Werte für Werkzeuglänge und Werkzeugradius, damit die Schneide eines Senkers der Bohrungs- oder Konturkante folgt.',
    points: [
      'Verstehe DL als Delta zur Werkzeuglänge und DR als Delta zum Werkzeugradius.',
      'Wende die Korrekturen nur für die Bearbeitung an, die sie benötigt.',
      'Prüfe wirksame Werkzeuggeometrie und resultierende Fase in der Simulation.'
    ],
    explanation: [
      'DL und DR ergänzen die aktiven Werkzeugdaten in einem TOOL-CALL-Satz. Sie können den programmierten Bezugspunkt verschieben, damit ein bestimmter Bereich eines Formwerkzeugs der Zielkante folgt.',
      'Die erforderlichen Werte hängen von der realen Werkzeuggeometrie und Aufspannung ab. Die Lektion zeigt den Simulatorablauf; Produktionswerte müssen immer unabhängig geprüft werden.'
    ]
  },
  L23: {
    title: 'Parametrische Kontur — ein Profil, gefräst und dann gefast',
    seoTitle: 'Heidenhain parametrische Konturen mit Q-Parametern | TNC Sim',
    description: 'Lerne, wie Q-Parameter ein wiederverwendbares Klartextprofil für einen Fräs- und einen anschließenden Fasenlauf steuern.',
    intro: 'Sammle wichtige Maße in Q-Parametern und verwende dasselbe programmierte Profil für mehrere Bearbeitungsdurchgänge.',
    points: [
      'Weise wichtigen Maßen am Programmanfang Q-Parameter zu.',
      'Verwende die Parameter in Konturkoordinaten und Prozesswerten.',
      'Nutze das Profil mit anderen Werkzeugen, Tiefen oder Korrekturen erneut.'
    ],
    explanation: [
      'Eine parametrische Kontur trennt Konstruktionswerte von den Sätzen, die sie verwenden. Wird ein Parameter geändert, können alle abhängigen Koordinaten oder Tiefen einheitlich folgen.',
      'Die letzte TNC-Sim-Lektion verbindet frühere Themen: Werkzeugaufrufe, sicheres Positionieren, Konturfunktionen, Radiuskorrektur, Labels und einen zweiten Durchgang zum Anfasen.'
    ]
  }
};
