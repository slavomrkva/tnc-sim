// Extra demo programs shared byte-for-byte between web and Android.

var EXTRA_DEMO_PROGRAMS = [
  { name: 'Chamfering', code: `BEGIN PGM PROGRAM MM
; Chamfering - break the top edge all around, 1mm x 45deg
; Blank: 50 x 50 x 20 mm. T5 countersink 90deg, DL-1 DR+1 = tip offset for
; a 1mm edge chamfer (see core/tool-table.js: DL=-DR/tan(T-ANGLE/2), and
; T-ANGLE=90 => tan(45)=1 => DL=-DR).
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
TOOL CALL 5 Z S18000 F1000 DL-1 DR+1 ; T5 countersink 90deg
M3 ; Spindle ON — clockwise
M8 ; Coolant ON — flood
L X+0 Y+55 Z+50 FMAX R0
L X+0 Y+55 Z+19 F1000
L Y+35 RL ; activate left radius comp
CC X+0 Y+30 ; circle center for tangential entry arc
C X+0 Y+25 DR+ ; sweeps tangentially onto the top edge
L X+25
L Y-25
L X-25
L Y+25
L X+10
CC X+10 Y+30 ; circle center for tangential exit arc
C X+10 Y+35 DR+ ; sweeps tangentially off the edge
L Z+50 FMAX R0
M5 ; Spindle OFF
M9 ; Coolant OFF
END PGM PROGRAM MM` },

  { name: 'Rough & Finish', code: `BEGIN PGM PROGRAM MM
; Rough & Finish Milling - square contour, two passes with the same tool
; Blank: 50 x 50 x 20 mm. T1 end mill clears the profile in two passes:
; rough leaves a 44 x 44 mm square (3mm stock removed per side), finish
; takes it down to the final 42 x 42 mm square with CHF 1 corners.
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
TOOL CALL 1 Z S10000 F1500 ; T1 end mill D10
M3 ; Spindle ON — clockwise
M8 ; Coolant ON — flood
;
;--------------------------------------------------
; Rough pass - down to 44 x 44 (removes 3mm per side)
;--------------------------------------------------
L X+0 Y+50 Z+50 FMAX R0
L X+0 Y+50 Z+0 F1500
L Y+42 RL ; activate left radius comp
CC X+0 Y+32 ; circle center for tangential entry arc
C X+0 Y+22 DR+ ; sweeps tangentially onto the 44x44 contour
L X+22
CHF 1
L Y-22
CHF 1
L X-22
CHF 1
L Y+22
CHF 1
L X+10
CC X+10 Y+32 ; circle center for tangential exit arc
C X+10 Y+42 DR+ ; sweeps tangentially off the contour
L Z+50 FMAX R0
;
;--------------------------------------------------
; Finish pass - down to 42 x 42 (removes the last 1mm per side)
;--------------------------------------------------
L X+0 Y+49 Z+50 FMAX R0
L X+0 Y+49 Z+0 F800
L Y+41 RL ; activate left radius comp
CC X+0 Y+31 ; circle center for tangential entry arc
C X+0 Y+21 DR+ ; sweeps tangentially onto the 42x42 contour
L X+21
CHF 1
L Y-21
CHF 1
L X-21
CHF 1
L Y+21
CHF 1
L X+10
CC X+10 Y+31 ; circle center for tangential exit arc
C X+10 Y+41 DR+ ; sweeps tangentially off the contour
L Z+50 FMAX R0
M5 ; Spindle OFF
M9 ; Coolant OFF
END PGM PROGRAM MM` },

  { name: 'Thread Hole', code: `BEGIN PGM PROGRAM MM
; Thread Hole - drill, deburr, tap M8
; Blank: 50 x 50 x 20 mm, one hole at center (X0 Y0)
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
;--------------------------------------------------
; T4 - Drill D6.8 (tap-drill size for M8x1.25, through)
;--------------------------------------------------
TOOL CALL 4 Z S14000 F300
TOOL DEF 5 ; Pre-load tool in magazine for next TOOL CALL
M3 ; Spindle ON — clockwise
M8 ; Coolant ON — flood
CYCL DEF 200 ;Drilling
Q200=+2 ;Safety clearance [mm]
Q201=-24 ;Depth [mm]
Q206 FAUTO ;Feed rate - plunge [mm/min]
Q202=+11.5 ;Plunging depth [mm]
Q210=+0 ;Dwell time at top [s]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q211=+0 ;Dwell time at depth [s]
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T5 - Chamfer / countersink 90deg D8 (deburr before tapping)
; DL-2 DR+2 = tip offset for edge chamfer
;--------------------------------------------------
TOOL CALL 5 Z S18000 F1000 DL-2 DR+2
TOOL DEF 7 ; Pre-load tool in magazine for next TOOL CALL
M3
M8
CYCL DEF 208 ;Circular Pocket Milling
Q200=+2 ;Safety clearance [mm]
Q201=-1 ;Depth [mm]
Q206=+150 ;Feed rate - plunge [mm/min]
Q334=+0 ;Infeed per pass [mm]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q335=+8 ;Nominal diameter [mm]
Q342=+7.999 ;Pre-drilled dia. [mm]
Q351=+1 ;Milling mode
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T7 - Tap M8 (thread tapping with chip breaking)
;--------------------------------------------------
TOOL CALL 7 Z S350
M3
M8
CYCL DEF 209 ;Tapping with Chip Breaking
Q200=+2 ;Safety clearance [mm]
Q201=-22 ;Thread depth [mm]
Q239=+1.25 ;Thread pitch [mm]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q257=+11 ;Infeed depth for chip breaking [mm]
Q256=+0 ;Retract for chip breaking (0 = full retract) [mm]
Q336=+0 ;Spindle angle [deg]
L X+0 Y+0 FMAX M99
M5
M9
END PGM PROGRAM MM` },

  { name: 'Precise Hole', code: `BEGIN PGM PROGRAM MM
; Precise Hole - center-drill, drill, deburr, ream to 7H7
; Blank: 50 x 50 x 20 mm, one hole at center (X0 Y0)
BLK FORM 0.1 Z X-25 Y-25 Z+0
BLK FORM 0.2 X+25 Y+25 Z+20
;
;--------------------------------------------------
; T3 - Center drill D6 (spot the hole so T4 does not wander)
;--------------------------------------------------
TOOL CALL 3 Z S18000 F300
TOOL DEF 4 ; Pre-load tool in magazine for next TOOL CALL
M3 ; Spindle ON — clockwise
M8 ; Coolant ON — flood
CYCL DEF 200 ;Drilling
Q200=+2 ;Safety clearance [mm]
Q201=-1 ;Depth [mm]
Q206=+150 ;Feed rate - plunge [mm/min]
Q202=+1 ;Plunging depth [mm]
Q210=+0 ;Dwell time at top [s]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q211=+0 ;Dwell time at depth [s]
L X+0 Y+0 FMAX M99
M5 ; Spindle OFF
M9 ; Coolant OFF
;
;--------------------------------------------------
; T4 - Drill D6.8 (through, with breakthrough clearance)
;--------------------------------------------------
TOOL CALL 4 Z S14000 F300
TOOL DEF 5 ; Pre-load tool in magazine for next TOOL CALL
M3
M8
CYCL DEF 200 ;Drilling
Q200=+2 ;Safety clearance [mm]
Q201=-24 ;Depth [mm]
Q206 FAUTO ;Feed rate - plunge [mm/min]
Q202=+11.5 ;Plunging depth [mm]
Q210=+0 ;Dwell time at top [s]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q211=+0 ;Dwell time at depth [s]
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T5 - Chamfer / countersink 90deg D8 (deburr before reaming)
; DL-2 DR+2 = tip offset for edge chamfer
;--------------------------------------------------
TOOL CALL 5 Z S18000 F1000 DL-2 DR+2
TOOL DEF 6 ; Pre-load tool in magazine for next TOOL CALL
M3
M8
CYCL DEF 208 ;Circular Pocket Milling
Q200=+2 ;Safety clearance [mm]
Q201=-1 ;Depth [mm]
Q206=+150 ;Feed rate - plunge [mm/min]
Q334=+0 ;Infeed per pass [mm]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
Q335=+7 ;Nominal diameter [mm]
Q342=+6.999 ;Pre-drilled dia. [mm]
Q351=+1 ;Milling mode
L X+0 Y+0 FMAX M99
M5
M9
;
;--------------------------------------------------
; T6 - Reamer D7 H7 (precision ream to final size)
;--------------------------------------------------
TOOL CALL 6 Z S12200 F300
M3
M8
CYCL DEF 201 ;Reaming
Q200=+2 ;Safety clearance [mm]
Q201=-22 ;Depth [mm]
Q206 FAUTO ;Feed rate - reaming [mm/min]
Q211=+0 ;Dwell time at depth [s]
Q208=+0 ;Retraction feed rate [mm/min]
Q203=+20 ;Surface coordinate [mm]
Q204=+50 ;2nd safety clearance [mm]
L X+0 Y+0 FMAX M99
M5
M9
END PGM PROGRAM MM` }
];
