// data-tables -- verified byte-for-byte identical between web and android repos.

var CYCLES = [
  {
    num: 200,
    name: 'Drilling',
    desc: 'Drills a hole with peck drilling support and dwell times.',
    params: [
      {q:'Q200', def:'+2',    name:'Safety clearance',     unit:'mm',      desc:'Incremental distance above surface for rapid approach'},
      {q:'Q201', def:'-20',   name:'Depth',                unit:'mm',      desc:'Machining depth — negative (e.g. -20)'},
      {q:'Q206', def:'+150',  name:'Feed rate — plunge',   unit:'mm/min',  desc:'Feed rate for drilling (FAUTO = last defined feed)'},
      {q:'Q202', def:'+5',    name:'Plunging depth',       unit:'mm',      desc:'Infeed per peck — 0 or >= |Q201| = single pass'},
      {q:'Q210', def:'+0',    name:'Dwell time at top',    unit:'s',       desc:'Seconds to dwell at clearance after each peck retract'},
      {q:'Q203', def:'+0',    name:'Surface coordinate',   unit:'mm',      desc:'Absolute Z coordinate of workpiece surface'},
      {q:'Q204', def:'+50',   name:'2nd safety clearance', unit:'mm',      desc:'Incremental Z height for final retract after cycle'},
      {q:'Q211', def:'+0',    name:'Dwell time at depth',  unit:'s',       desc:'Seconds to dwell at bottom of hole'},
    ]
  },
  {
    num: 201,
    name: 'Reaming',
    desc: 'Reams a pre-drilled hole to exact diameter in one pass.',
    params: [
      {q:'Q200', def:'+2',    name:'Safety clearance',     unit:'mm',      desc:'Incremental distance above surface for rapid approach'},
      {q:'Q201', def:'-20',   name:'Depth',                unit:'mm',      desc:'Reaming depth — negative (e.g. -20)'},
      {q:'Q206', def:'+80',   name:'Feed rate — reaming',  unit:'mm/min',  desc:'Feed rate for reaming pass (FAUTO = last defined feed)'},
      {q:'Q211', def:'+0',    name:'Dwell time at depth',  unit:'s',       desc:'Seconds to dwell at bottom of hole'},
      {q:'Q208', def:'+0',    name:'Retraction feed rate', unit:'mm/min',  desc:'Feed rate for retract — 0 = same as Q206'},
      {q:'Q203', def:'+0',    name:'Surface coordinate',   unit:'mm',      desc:'Absolute Z coordinate of workpiece surface'},
      {q:'Q204', def:'+50',   name:'2nd safety clearance', unit:'mm',      desc:'Incremental Z height for final retract after cycle'},
    ]
  },
  {
    num: 209,
    name: 'Tapping with Chip Breaking',
    desc: 'Taps a thread with periodic chip breaking retract. Feed = pitch × RPM.',
    params: [
      {q:'Q200', def:'+2',    name:'Safety clearance',     unit:'mm',      desc:'Incremental distance above surface for rapid approach'},
      {q:'Q201', def:'-15',   name:'Thread depth',         unit:'mm',      desc:'Thread depth — negative (e.g. -15)'},
      {q:'Q239', def:'+1.25', name:'Thread pitch',         unit:'mm',      desc:'Pitch of thread — positive = right-hand, negative = left-hand'},
      {q:'Q203', def:'+0',    name:'Surface coordinate',   unit:'mm',      desc:'Absolute Z coordinate of workpiece surface'},
      {q:'Q204', def:'+50',   name:'2nd safety clearance', unit:'mm',      desc:'Incremental Z height for final retract after cycle'},
      {q:'Q257', def:'+5',    name:'Depth per chip break', unit:'mm',      desc:'Infeed between each chip-breaking retract — 0 = single pass'},
      {q:'Q256', def:'+0.2',  name:'Chip break retract',   unit:'mm',      desc:'Distance to retract for chip breaking (stays in hole)'},
      {q:'Q336', def:'+0',    name:'Spindle angle',        unit:'deg',     desc:'Spindle orientation angle at positioning (0 = ignored)'},
    ]
  },
  {
    num: 208,
    name: 'Circular Pocket Milling',
    desc: 'Mills a circular pocket to depth with helical infeed.',
    params: [
      {q:'Q200', def:'+2',    name:'Safety clearance',    unit:'mm',      desc:'Distance above surface for rapid approach'},
      {q:'Q201', def:'-20',   name:'Depth',               unit:'mm',      desc:'Machining depth — negative value (e.g. -20)'},
      {q:'Q206', def:'+150',  name:'Feed rate — plunge',  unit:'mm/min',  desc:'Feed rate for downward cutting'},
      {q:'Q334', def:'+0',    name:'Infeed per pass',     unit:'mm',      desc:'Depth per pass — 0 = single full depth pass'},
      {q:'Q203', def:'+0',    name:'Surface coordinate',  unit:'mm',      desc:'Z coordinate of workpiece surface'},
      {q:'Q204', def:'+50',   name:'2nd safety clearance',unit:'mm',      desc:'Z height for final retract'},
      {q:'Q335', def:'+10',   name:'Nominal diameter',    unit:'mm',      desc:'Target bore diameter'},
      {q:'Q342', def:'+0',    name:'Pre-drilled dia.',    unit:'mm',      desc:'Existing hole diameter — 0 if solid material'},
      {q:'Q351', def:'+1',    name:'Milling mode',         unit:'',        desc:'Climb milling (+1 fixed)'},
    ]
  }
];

var Q_FEED_PARAMS = []; // no FMAX on any cycle feed param

var Q_FAUTO_PARAMS = ['Q206','Q207','Q208','Q209','Q212','Q213']; // all cycle feed params — FAUTO only

var TOOL_CUT_COLORS = [
  [0.95, 0.55, 0.20], // tool 1: orange
  [0.25, 0.75, 0.45], // tool 2: green
  [0.25, 0.55, 0.95], // tool 3: blue
  [0.90, 0.25, 0.30], // tool 4: red
  [0.70, 0.25, 0.90], // tool 5: purple
  [0.15, 0.80, 0.80], // tool 6: cyan
  [0.90, 0.80, 0.10], // tool 7: yellow
  [0.90, 0.35, 0.70], // tool 8: pink
];

var LESSONS = [
{
  id:'L01', title:'Program skeleton & BLK FORM (the blank)',
  muteProbs:[/No TOOL CALL/i, /no (cutting|tool) (moves?|movement)/i],
  slides:[
    { html:function(){ return ''
      + '<p>A program is plain text, one <b>block</b> per line. It always opens and closes with the same name; <code>MM</code> = millimetres:</p>'
      + learnSnippet('BEGIN PGM PLATE MM\n;  ...your blocks go here...\nEND PGM PLATE MM')
      + '<p>The control writes these two lines <b>automatically</b> when you create a program — you never type them yourself. Everything after <code>;</code> is a <b>comment</b> — the control ignores it.</p>'; } },
    { html:function(){ return ''
      + '<p><b>BLK FORM</b> = the raw blank, given by two corners: <code>0.1</code> MIN (bottom), <code>0.2</code> MAX (top). Top face at <code>Z+0</code>, depth in <b>negative Z</b>:</p>'
      + learnSvgBlank(100, 80, 20)
      + learnSnippet('BLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0')
      + '<p>The <code>Z</code> after <code>0.1</code> is the <b>spindle axis</b>. Zero can also sit at the <b>bottom</b>: <code>0.1 \u2026 Z+0</code>, <code>0.2 \u2026 Z+20</code>.</p>'; } },
    { html:function(){ return ''
      + '<p>The complete skeleton — the smallest valid program:</p>'
      + learnSnippet('BEGIN PGM PLATE MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\n; tool + moves come next lesson\nEND PGM PLATE MM')
      + '<p>Now write it yourself \u2014 start the <b>practice</b> below. Your blank appears in 3D as you type.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Add a comment to the program \u2014 e.g. describe the blank',
      solRepl:['BLK FORM 0.1','; blank 100 x 80 x 20\nBLK FORM 0.1'],
      starter:'BEGIN PGM FIRST MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\n\nEND PGM FIRST MM',
      checks:[
        {t:'has_comment', label:'Program contains a comment (text after ;)',
         hint:'Everything after a semicolon is a comment. Add a line like:  ; blank 100 x 80 x 20'},
        {t:'begin_end', label:'Program skeleton still valid',
         hint:'Keep BEGIN PGM / END PGM and both BLK FORM lines untouched.'},
        {t:'blk', dx:100, dy:80, dz:20, label:'Blank unchanged (100 \u00d7 80 \u00d7 20 mm)',
         hint:'Only add a comment line \u2014 the BLK FORM lines stay as they are.'}
      ]
    },
    {
      prompt:'Add BLK FORM for a 90 \u00d7 40 \u00d7 15 mm blank (top face at Z+0)',
      sol:'BLK FORM 0.1 Z X+0 Y+0 Z-15\nBLK FORM 0.2 X+90 Y+40 Z+0',
      starter:'BEGIN PGM PLATE MM\n; add the two BLK FORM lines here\n\nEND PGM PLATE MM',
      checks:[
        {t:'begin_end', name:'PLATE', label:'Program skeleton intact (BEGIN/END)',
         hint:'Don\u2019t delete or change the BEGIN PGM / END PGM lines \u2014 the control generates them for you.'},
        {t:'blk', dx:90, dy:40, dz:15, label:'Blank is 90 \u00d7 40 mm, 15 mm deep (Z-15 \u2192 Z+0)',
         hint:'Two BLK FORM lines: 0.1 Z X+0 Y+0 Z-15 and 0.2 X+90 Y+40 Z+0.'},
        {t:'blk_axis', label:'Spindle axis Z declared in BLK FORM 0.1',
         hint:'The axis letter goes right after 0.1: BLK FORM 0.1 Z \u2026'}
      ]
    },
    {
      prompt:'Add BLK FORM with Z+0 at the BOTTOM of the blank: 100 \u00d7 100 \u00d7 20 mm, top face at Z+20',
      sol:'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+100 Y+100 Z+20',
      starter:'BEGIN PGM BOTTOM MM\n; blank 100 x 100 x 20, zero at the bottom face\n\nEND PGM BOTTOM MM',
      checks:[
        {t:'begin_end', label:'Program skeleton valid',
         hint:'Keep BEGIN PGM BOTTOM MM \u2026 END PGM BOTTOM MM.'},
        {t:'blk', dx:100, dy:100, dz:20, top:20, label:'Blank 100 \u00d7 100 \u00d7 20 with Z+0 at the bottom (Z+0 \u2192 Z+20)',
         hint:'Corner 0.1 sits at Z+0, corner 0.2 at Z+20 \u2014 the whole blank lives in positive Z.'},
        {t:'blk_axis', label:'Spindle axis Z declared in BLK FORM 0.1',
         hint:'BLK FORM 0.1 Z X+0 Y+0 Z+0'}
      ]
    }
  ]
},
{
  id:'L02', title:'Tool & spindle \u2014 TOOL CALL, S, F, M3/M8',
  slides:[
    { html:function(){ return ''
      + '<p><b>TOOL CALL</b> loads a tool from the tool table: tool number, spindle axis <code>Z</code>, spindle speed <code>S</code> in rpm and default feed <code>F</code> in mm/min:</p>'
      + learnSnippet('TOOL CALL 1 Z S3000 F500')
      + '<p>Tool <code>1</code> is the D10 end mill \u2014 see the <b>Tools</b> tab.</p>'; } },
    { html:function(){ return ''
      + learnSvgTool()
      + '<p>The table stores what the control cannot guess: <b>L</b> so the programmed Z lands true, <b>R</b> for radius compensation, <b>LCUTS</b> = usable flute length.</p>'; } },
    { html:function(){ return ''
      + '<p><b>M functions</b> switch machine states:</p>'
      + learnSnippet('M3  ; spindle ON (clockwise)\nM8  ; coolant ON\n;   ...machining...\nM5  ; spindle OFF\nM9  ; coolant OFF')
      + '<p>Typical order: <b>TOOL CALL \u2192 M3 M8 \u2192 machining \u2192 M5 M9</b>. Cutting with the spindle off breaks tools.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Call tool 1 (D10 end mill) with spindle 3000 rpm and feed 500',
      sol:'TOOL CALL 1 Z S3000 F500',
      starter:'BEGIN PGM TOOLS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\n; call the tool here\n\nEND PGM TOOLS MM',
      checks:[
        {t:'toolcall', T:1, S:3000, F:500, label:'TOOL CALL 1 Z with S3000 and F500',
         hint:'One line: TOOL CALL 1 Z S3000 F500'}
      ]
    },
    {
      prompt:'Switch the spindle and the coolant ON, after the tool call',
      sol:'M3\nM8',
      starter:'BEGIN PGM TOOLS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\n; >>> write here\n\nEND PGM TOOLS MM',
      checks:[
        {t:'uses', re:/\bM3\b/, label:'Spindle ON \u2014 M3', hint:'Add a block with just M3.'},
        {t:'uses', re:/\bM8\b/, label:'Coolant ON \u2014 M8', hint:'Add a block with just M8.'},
        {t:'order', a:/TOOL\s+CALL/i, b:/\bM3\b/, label:'M3 comes after the TOOL CALL',
         hint:'First load the tool, then start the spindle.'}
      ]
    },
    {
      prompt:'Prepare the D6.8 drill (tool 4): tool call with S2500 F150, spindle and coolant ON, and both OFF at the end',
      sol:'TOOL CALL 4 Z S2500 F150\nM3\nM8\n; ...drilling here...\nM5\nM9',
      starter:'BEGIN PGM TOOLS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\n; >>> write here\n\nEND PGM TOOLS MM',
      checks:[
        {t:'toolcall', T:4, S:2500, F:150, label:'TOOL CALL 4 Z with S2500 and F150',
         hint:'TOOL CALL 4 Z S2500 F150'},
        {t:'uses', re:/\bM3\b/, label:'M3 \u2014 spindle ON', hint:'Start the spindle after the tool call.'},
        {t:'uses', re:/\bM8\b/, label:'M8 \u2014 coolant ON', hint:'Coolant on before drilling.'},
        {t:'order', a:/\bM3\b/, b:/\bM5\b/, label:'M5 \u2014 spindle OFF at the end',
         hint:'After the work is done: M5 (and M9).'},
        {t:'order', a:/\bM8\b/, b:/\bM9\b/, label:'M9 \u2014 coolant OFF at the end',
         hint:'Switch the coolant off with M9 after M5.'}
      ]
    }
  ]
},
{
  id:'L03', title:'First moves \u2014 L blocks, FMAX & safe approach',
  slides:[
    { html:function(){ return ''
      + '<p>An <b>L</b> block moves in a straight line to the target. <code>FMAX</code> = rapid \u2014 positioning only, <b>never cutting</b>. <code>F</code> = feed for cutting:</p>'
      + learnSnippet('L X+50 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200')
      + '<p>Coordinates are <b>modal</b> \u2014 write only what changes.</p>'; } },
    { html:function(){ return ''
      + learnSvgApproach()
      + '<p>The safe pattern: rapid <b>high above</b> the part \u2192 rapid down to <b>+2 mm</b> above the surface \u2192 <b>feed</b> into the material. Never descend below the surface with FMAX.</p>'; } },
    { html:function(){ return ''
      + '<p>Retracting straight <b>up</b> with FMAX is fine \u2014 the path above you is already cut:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200\nL X+80 F300\nL Z+50 FMAX\nEND PGM D MM')
      + learnSnippet('L X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200\nL X+80 F300\nL Z+50 FMAX'); } }
  ],
  tasks:[
    {
      prompt:'Move rapid to X+20 Y+40 at safe height Z+50',
      sol:'L X+20 Y+40 Z+50 FMAX',
      starter:'BEGIN PGM MOVES MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\n; >>> write here\n\nM5\nM9\nEND PGM MOVES MM',
      checks:[
        {t:'reach', rapid:true, x:20, y:40, z:50, label:'Rapid move ends at X+20 Y+40 Z+50',
         hint:'L X+20 Y+40 Z+50 FMAX'}
      ]
    },
    {
      prompt:'Descend rapid to Z+2, then plunge with feed F200 to Z-3',
      sol:'L Z+2 FMAX\nL Z-3 F200',
      starter:'BEGIN PGM MOVES MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\n; >>> write here\n\nM5\nM9\nEND PGM MOVES MM',
      checks:[
        {t:'reach', rapid:true, x:20, y:40, z:2, label:'Rapid stops at Z+2 above the surface',
         hint:'L Z+2 FMAX \u2014 X and Y are modal, no need to repeat them.'},
        {t:'reach', cut:true, x:20, y:40, z:-3, label:'Feed plunge reaches Z-3',
         hint:'L Z-3 F200 \u2014 below the surface always with F, never FMAX.'},
        {t:'no_rapid_below_top', label:'No rapid move below the surface',
         hint:'The move below Z+0 must use F200, not FMAX.'}
      ]
    },
    {
      prompt:'Cut with feed F300 to X+80 (stay at Z-3), then retract FMAX to Z+50',
      sol:'L X+80 F300\nL Z+50 FMAX',
      starter:'BEGIN PGM MOVES MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-3 F200\n; >>> write here\n\nM5\nM9\nEND PGM MOVES MM',
      checks:[
        {t:'reach', cut:true, x:80, y:40, z:-3, label:'Cut reaches X+80 at Z-3',
         hint:'L X+80 F300 \u2014 Z stays where it is.'},
        {t:'reach', rapid:true, x:80, y:40, z:50, label:'Retract to Z+50 with FMAX',
         hint:'L Z+50 FMAX \u2014 straight up out of the slot is safe.'},
        {t:'no_rapid_below_top', label:'No rapid descending below the surface',
         hint:'Only the retract (upward) may be FMAX.'}
      ]
    }
  ]
},
{
  id:'L04', title:'First slot \u2014 depth & incremental IX/IY',
  slides:[
    { html:function(){ return ''
      + '<p>A feed move below the surface <b>cuts</b>. The D10 tool leaves a 10 mm wide slot along the path centre-line:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+80 F300\nEND PGM D MM')
      + learnSnippet('L Z-2 F150\nL X+80 F300'); } },
    { html:function(){ return ''
      + '<p><b>Incremental</b> coordinates <code>IX/IY/IZ</code> move <b>relative to the current position</b> \u2014 ideal for steps and patterns:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL IX+20 F300\nL IY+15\nL IX+20\nL IY+15\nL IX+20\nEND PGM D MM', true)
      + learnSnippet('L IX+20 F300\nL IY+15\nL IX+20'); } },
    { html:function(){ return ''
      + '<p>Deeper slots are cut in <b>passes</b>: run the path, step down, run it back:</p>'
      + learnSnippet('L Z-2 F150\nL X+80 F300\nL Z-4 F150\nL X+20 F300')
      + '<p>Each pass takes 2 mm \u2014 gentler on the tool than one 4 mm cut.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Plunge to Z-2 with F150 and mill a straight slot to X+80 with F300',
      sol:'L Z-2 F150\nL X+80 F300',
      starter:'BEGIN PGM SLOT MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\n; >>> write here\n\nM5\nM9\nEND PGM SLOT MM',
      checks:[
        {t:'reach', cut:true, x:80, y:40, z:-2, label:'Slot cut to X+80 at Z-2',
         hint:'L Z-2 F150, then L X+80 F300.'},
        {t:'no_rapid_below_top', label:'No rapid below the surface',
         hint:'Both moves below Z+0 need a feed.'},
        {t:'min_z', z:-2, label:'Depth is exactly 2 mm',
         hint:'Check the sign and value: Z-2.'}
      ]
    },
    {
      prompt:'Continue with incremental moves: IY+20, then IX-30 (still at Z-2)',
      sol:'L IY+20 F300\nL IX-30',
      starter:'BEGIN PGM SLOT MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+80 F300\n; >>> write here\n\nM5\nM9\nEND PGM SLOT MM',
      checks:[
        {t:'uses', re:/\bIY\+20\b/, label:'Incremental IY+20 used',
         hint:'L IY+20 \u2014 the I prefix makes it relative.'},
        {t:'uses', re:/\bIX-30\b/, label:'Incremental IX-30 used',
         hint:'L IX-30 \u2014 negative increment moves back in X.'},
        {t:'reach', cut:true, x:80, y:60, z:-2, label:'First step ends at X+80 Y+60',
         hint:'From (80,40), IY+20 lands at (80,60).'},
        {t:'reach', cut:true, x:50, y:60, z:-2, label:'Second step ends at X+50 Y+60',
         hint:'From (80,60), IX-30 lands at (50,60).'}
      ]
    },
    {
      prompt:'Cut a second, deeper pass of the first slot at Z-4',
      sol:'L Z-4 F150\nL X+20 F300',
      starter:'BEGIN PGM SLOT MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+80 F300\n; >>> write here\n\nM5\nM9\nEND PGM SLOT MM',
      checks:[
        {t:'min_z', z:-4, label:'Deepest point is Z-4',
         hint:'Step down: L Z-4 F150.'},
        {t:'reach', cut:true, x:20, y:40, z:-4, label:'Slot milled back to X+20 at Z-4',
         hint:'After stepping down, mill back: L X+20 F300.'},
        {t:'no_rapid_below_top', label:'No rapid below the surface',
         hint:'The step from Z-2 to Z-4 needs a feed.'}
      ]
    }
  ]
},
{
  id:'L05', title:'Arcs \u2014 CC + C and CR',
  slides:[
    { html:function(){ return ''
      + '<p><b>CC</b> sets the circle centre; <b>C</b> then cuts along that circle to the end point. Direction: <code>DR+</code> = counter-clockwise, <code>DR-</code> = clockwise:</p>'
      + learnSvgArcCC()
      + learnSnippet('CC X+35 Y+45\nC X+50 Y+45 DR-')
      + '<p>Here <code>DR-</code> (clockwise) goes over the top of the circle.</p>'; } },
    { html:function(){ return ''
      + '<p><b>CR</b> needs no centre \u2014 just the end point and the radius. The sign of R picks the arc: <code>R+</code> \u2264 180\u00b0, <code>R-</code> &gt; 180\u00b0:</p>'
      + learnSvgArcCR()
      + learnSnippet('CR X+80 Y+45 R+15 DR-'); } },
    { html:function(){ return ''
      + '<p>Arc blocks chain freely with straight blocks. In the practice you will mill a small closed shape from two arcs and two lines \u2014 follow the three steps and <b>run the simulation at the end</b> to see what you made.</p>'
      + learnSnippet('L ...        ; line\nCC ... / C ... ; arc by centre\nCR ...       ; arc by radius\nL ...        ; line')
      + '<p>Direction reminder: <code>DR+</code> counter-clockwise, <code>DR-</code> clockwise.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Below the last L block add CC X+35 Y+45 (circle centre), then a C block to X+50 Y+45 with clockwise direction DR-',
      sol:'CC X+35 Y+45\nC X+50 Y+45 DR-',
      starter:'BEGIN PGM ARCS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y+10 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+20 Y+45 F300\n; write the arc below (keep the lines above!)\n\nM5\nM9\nEND PGM ARCS MM',
      checks:[
        {t:'uses', re:/CC\s+X\+35\s+Y\+45/, label:'Centre set: CC X+35 Y+45',
         hint:'CC only sets the centre \u2014 it does not move the tool.'},
        {t:'reach', cut:true, x:35, y:60, tol:1, label:'Arc goes over the top (through X+35 Y+60)',
         hint:'C X+50 Y+45 DR- \u2014 DR- is clockwise, over the top of the circle.'},
        {t:'reach', cut:true, x:50, y:45, z:-2, label:'Arc ends at X+50 Y+45',
         hint:'The end point goes on the C block.'}
      ]
    },
    {
      prompt:'Continue with CR: radius 15 to X+80 Y+45, again over the top (DR-)',
      sol:'CR X+80 Y+45 R+15 DR-',
      starter:'BEGIN PGM ARCS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y+10 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+20 Y+45 F300\nCC X+35 Y+45\nC X+50 Y+45 DR-\n; >>> write here\n\nM5\nM9\nEND PGM ARCS MM',
      checks:[
        {t:'uses', re:/\bCR\b/, label:'CR block used (radius arc, no centre)',
         hint:'CR X+80 Y+45 R+15 DR-'},
        {t:'reach', cut:true, x:65, y:60, tol:1, label:'Arc goes over the top (through X+65 Y+60)',
         hint:'DR- makes the arc pass over the top; DR+ would dip below.'},
        {t:'reach', cut:true, x:80, y:45, z:-2, label:'Arc ends at X+80 Y+45',
         hint:'End point and radius both go on the CR block.'}
      ]
    },
    {
      prompt:'Close the shape: cut a straight line back to X+50 Y+10, retract with FMAX to Z+50 \u2014 then press Run and look at what you milled',
      sol:'L X+50 Y+10\nL Z+50 FMAX',
      starter:'BEGIN PGM ARCS MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y+10 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+20 Y+45 F300\nCC X+35 Y+45\nC X+50 Y+45 DR-\nCR X+80 Y+45 R+15 DR-\n; >>> write here\n\nM5\nM9\nEND PGM ARCS MM',
      checks:[
        {t:'reach', cut:true, x:50, y:10, z:-2, label:'Shape closed at X+50 Y+10',
         hint:'L X+50 Y+10 \u2014 a plain straight block.'},
        {t:'reach', rapid:true, x:50, y:10, z:50, label:'Retract with FMAX to Z+50',
         hint:'L Z+50 FMAX \u2014 straight up.'},
        {t:'no_rapid_below_top', label:'No rapid descending below the surface',
         hint:'Only the upward retract may be FMAX.'}
      ]
    }
  ]
},
{
  id:'L06', title:'Corners \u2014 RND rounding & CHF chamfer',
  slides:[
    { html:function(){ return ''
      + learnSvgCorner()
      + '<p><b>RND</b> replaces a sharp corner with an arc of radius R; <b>CHF</b> cuts it off with a straight 45\u00b0-style chamfer. Both go on their <b>own block between two straight moves</b>.</p>'; } },
    { html:function(){ return ''
      + '<p>The rounding block just names the radius \u2014 the control computes the tangent arc itself:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+70 F300\nRND R10\nL Y+60\nEND PGM D MM')
      + learnSnippet('L X+70 F300\nRND R10\nL Y+60'); } },
    { html:function(){ return ''
      + '<p><b>CHF</b> works the same way \u2014 the number is the chamfer side length in mm:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+70 F300\nCHF 8\nL Y+60\nEND PGM D MM')
      + learnSnippet('L X+70 F300\nCHF 8\nL Y+60'); } }
  ],
  tasks:[
    {
      prompt:'Round the corner: insert RND R10 between the two straight moves',
      sol:'RND R10',
      starter:'BEGIN PGM CORNER MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+70 F300\n; >>> write here\n\nL Y+60\nM5\nM9\nEND PGM CORNER MM',
      checks:[
        {t:'uses', re:/RND\s+R10\b/, label:'RND R10 on its own block',
         hint:'Write RND R10 on the empty line between L X+70 and L Y+60.'},
        {t:'reach', cut:true, x:67.07, y:22.93, tol:1, label:'Corner replaced by an arc',
         hint:'The arc is tangent to both lines \u2014 no code change needed on them.'},
        {t:'reach', cut:true, x:70, y:60, z:-2, label:'Path still ends at X+70 Y+60',
         hint:'Keep the L Y+60 block as it is.'}
      ]
    },
    {
      prompt:'Now cut the same corner with a chamfer instead: insert CHF 8',
      sol:'CHF 8',
      starter:'BEGIN PGM CORNER MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\nL X+70 F300\n; >>> write here\n\nL Y+60\nM5\nM9\nEND PGM CORNER MM',
      checks:[
        {t:'uses', re:/CHF\s+8\b/, label:'CHF 8 on its own block',
         hint:'CHF 8 between the two straight moves.'},
        {t:'reach', cut:true, x:66, y:24, tol:1, label:'Corner cut by a straight chamfer',
         hint:'The chamfer runs from X+62 Y+20 to X+70 Y+28.'},
        {t:'reach', cut:true, x:70, y:60, z:-2, label:'Path still ends at X+70 Y+60',
         hint:'Keep the L Y+60 block as it is.'}
      ]
    },
    {
      prompt:'Mill an L-shaped path with BOTH: X+70 (RND R10), up to Y+60 (CHF 8), then left to X+20',
      sol:'L X+70 F300\nRND R10\nL Y+60\nCHF 8\nL X+20',
      starter:'BEGIN PGM CORNER MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+20 Z+50 FMAX\nL Z+2 FMAX\nL Z-2 F150\n; >>> write here\n\nM5\nM9\nEND PGM CORNER MM',
      checks:[
        {t:'uses', re:/RND\s+R10\b/, label:'First corner rounded with RND R10',
         hint:'L X+70 F300, then RND R10, then L Y+60.'},
        {t:'uses', re:/CHF\s+8\b/, label:'Second corner chamfered with CHF 8',
         hint:'After L Y+60: CHF 8, then L X+20.'},
        {t:'reach', cut:true, x:66, y:56, tol:1, label:'Chamfer cut at the second corner',
         hint:'The chamfer runs from X+70 Y+52 to X+62 Y+60.'},
        {t:'reach', cut:true, x:20, y:60, z:-2, label:'Path ends at X+20 Y+60',
         hint:'Last block: L X+20.'}
      ]
    }
  ]
},
{
  id:'L07', title:'Radius compensation \u2014 RL / RR / R0',
  slides:[
    { html:function(){ return ''
      + learnSvgComp()
      + '<p>Without compensation you program the tool <b>centre</b> \u2014 half the cutter eats into your wall. With <b>RL/RR</b> you program the <b>contour</b> and the control shifts the path by the tool radius from the table.</p>'; } },
    { html:function(){ return ''
      + '<p>Activate compensation on the first contour block, approaching from <b>outside</b> the material; cancel with <b>R0</b> after leaving:</p>'
      + learnSnippet('L X+50 Y-10 Z-2 FMAX R0\nL Y+0 RL F300\nL Y+80\nL Y+90 R0')
      + '<p><code>RL</code> = tool <b>left</b> of the path, <code>RR</code> = right \u2014 looking along the direction of motion.</p>'; } },
    { html:function(){ return ''
      + '<p>Watch the offset: the tool centre (orange) runs 5 mm beside the programmed wall X+50 (T1 = D10, R5):</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nL X+50 Y-10 Z+50 FMAX R0\nL Z-2 FMAX\nL Y+0 RL F300\nL Y+80\nL Y+90 R0\nEND PGM D MM')
      + '<p>The wall X+50 comes out exactly on size \u2014 the control did the offset maths.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Press Run and watch the cutter bite 5 mm into the part \u2014 then add RR to the L Y+0 block and Run again: now it skims just 1 mm off the edge',
      starter:'BEGIN PGM COMP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+51 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y-10 Z+50 FMAX R0\nL Z-2 FMAX\nL Y+0 F300\nL Y+90\nL Z+50 FMAX\nM5\nM9\nEND PGM COMP MM',
      solRepl:['L Y+0 F300','L Y+0 RR F300'],
      checks:[
        {t:'uses', re:/Y\+0[^\n]*\bRR\b/, label:'RR added to the L Y+0 block',
         hint:'Just add one word: L Y+0 RR F300'},
        {t:'reach', cut:true, x:55, y:40, tol:1, label:'Tool centre at X+55 \u2014 only the 1 mm lip beyond X+50 is removed',
         hint:'RR puts the tool to the RIGHT of the +Y motion; without it the centre sat ON the line and ate 5 mm of the part.'}
      ]
    },
    {
      prompt:'Cancel the compensation: add a block L Y+90 R0 after the contour',
      starter:'BEGIN PGM COMP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+51 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y-10 Z+50 FMAX R0\nL Z-2 FMAX\nL Y+0 RR F300\nL Y+80\n; >>> write here\n\nL Z+50 FMAX\nM5\nM9\nEND PGM COMP MM',
      sol:'L Y+90 R0',
      checks:[
        {t:'order', a:/\bRR\b/, b:/Y\+90[^\n]*\bR0\b|\bR0\b[^\n]*Y\+90/, label:'R0 on the Y+90 block, after RR',
         hint:'L Y+90 R0 \u2014 the tool ramps back onto the programmed line.'},
        {t:'reach', x:50, y:90, tol:1, label:'Tool returns to the programmed line at Y+90',
         hint:'With R0 the target is no longer offset.'}
      ]
    },
    {
      prompt:'Add the contour blocks: L Y+0 RL F300 (activates left compensation), then L Y+80, and cancel with L Y+90 R0 \u2014 the tool now works on the other side of the wall',
      starter:'BEGIN PGM COMP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+50 Y-10 Z+50 FMAX R0\nL Z-2 FMAX\n; >>> write here\n\nM5\nM9\nEND PGM COMP MM',
      sol:'L Y+0 RL F300\nL Y+80\nL Y+90 R0',
      checks:[
        {t:'uses', re:/\bRL\b/, label:'Left compensation RL activated',
         hint:'L Y+0 RL F300 \u2014 contour blocks, then cancel with R0.'},
        {t:'reach', cut:true, x:45, y:40, tol:1, label:'Tool centre runs at X+45 \u2014 left of the +Y motion',
         hint:'RL = tool on the LEFT of the motion, so at X+45 for the wall X+50.'}
      ]
    }
  ]
},
{
  id:'L08', title:'Drilling \u2014 CYCL DEF 200 + M99',
  slides:[
    { html:function(){ return ''
      + learnSvgDrill()
      + '<p>A <b>cycle</b> is a canned routine driven by Q parameters. Cycle <b>200</b> drills with pecking \u2014 define it once, call it at each hole.</p>'; } },
    { html:function(){ return ''
      + '<p>Depth <code>Q201</code> is <b>negative</b>, measured from the surface <code>Q203</code>:</p>'
      + learnSnippet('CYCL DEF 200\n  Q200=+2   ;clearance\n  Q201=-10  ;depth\n  Q206=+150 ;plunge feed\n  Q202=+5   ;peck depth\n  Q210=+0 ;dwell at top\n  Q203=+0   ;surface Z\n  Q204=+30  ;2nd clearance\n  Q211=+0')
      + '<p><code>Q200</code> is the small approach gap above the hole. <code>Q204</code> (<b>2nd set-up clearance</b>) is how high the tool retracts <b>after</b> the hole \u2014 high enough to travel safely over clamps and fixtures to the next position.</p>'; } },
    { html:function(){ return ''
      + '<p>The cycle runs where you <b>call</b> it: <code>M99</code> on a positioning block drills at that XY. One block per hole:</p>'
      + learnSnippet('L X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nL X+70 Y+50 FMAX M99')
      + '<p>(<code>M89</code> would call it after <b>every</b> block until cancelled by M99.)</p>'; } }
  ],
  tasks:[
    {
      prompt:'Define cycle 200: depth 10 mm, peck 5 mm, clearance 2 mm, surface at Z+0',
      sol:'CYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0',
      starter:'BEGIN PGM DRILL MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\n; define the cycle here\n\nM5\nM9\nEND PGM DRILL MM',
      checks:[
        {t:'uses', re:/CYCL\s+DEF\s+200\b/, label:'CYCL DEF 200 defined',
         hint:'Start with the line: CYCL DEF 200'},
        {t:'uses', re:/Q201\s*=\s*-10\b/, label:'Depth Q201 = -10',
         hint:'Depth is negative: Q201=-10.'},
        {t:'uses', re:/Q202\s*=\s*\+?5\b/, label:'Peck Q202 = +5',
         hint:'Q202=+5 \u2014 the drill retracts after every 5 mm.'},
        {t:'uses', re:/Q200\s*=\s*\+?2\b/, label:'Clearance Q200 = +2',
         hint:'Q200=+2 above the surface.'}
      ]
    },
    {
      prompt:'Drill one hole at X+30 Y+30 by calling the cycle with M99',
      sol:'L X+30 Y+30 FMAX M99',
      starter:'BEGIN PGM DRILL MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; >>> write here\n\nM5\nM9\nEND PGM DRILL MM',
      checks:[
        {t:'uses', re:/\bM99\b/, label:'Cycle called with M99',
         hint:'M99 goes on the positioning block itself.'},
        {t:'reach', cut:true, x:30, y:30, z:-10, tol:0.4, label:'Hole bottom at X+30 Y+30 Z-10',
         hint:'L X+30 Y+30 FMAX M99'}
      ]
    },
    {
      prompt:'Add three more holes: X+70 Y+30, X+70 Y+50 and X+30 Y+50',
      sol:'L X+70 Y+30 FMAX M99\nL X+70 Y+50 FMAX M99\nL X+30 Y+50 FMAX M99',
      starter:'BEGIN PGM DRILL MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nL X+30 Y+30 FMAX M99\n; >>> write here\n\nM5\nM9\nEND PGM DRILL MM',
      checks:[
        {t:'reach', cut:true, x:70, y:30, z:-10, tol:0.4, label:'Hole at X+70 Y+30 drilled',
         hint:'L X+70 Y+30 FMAX M99'},
        {t:'reach', cut:true, x:70, y:50, z:-10, tol:0.4, label:'Hole at X+70 Y+50 drilled',
         hint:'One positioning block with M99 per hole.'},
        {t:'reach', cut:true, x:30, y:50, z:-10, tol:0.4, label:'Hole at X+30 Y+50 drilled',
         hint:'L X+30 Y+50 FMAX M99'}
      ]
    }
  ]
},
{
  id:'L09', title:'Subprograms & a first variable \u2014 LBL + Q',
  slides:[
    { html:function(){ return ''
      + '<p>A <b>subprogram</b> is a named block of code: <code>LBL 1</code> opens it, <code>LBL 0</code> closes it. Everything between is the body:</p>'
      + learnSnippet('LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0')
      + '<p>Here the body drills two holes \u2014 a reusable pattern.</p>'; } },
    { html:function(){ return ''
      + '<p><b>CALL LBL 1</b> runs the body again from anywhere \u2014 typically after changing the tool or the cycle. Same positions, no copy-pasting:</p>'
      + learnSnippet('CYCL DEF 200      ; spot drill, shallow\n...\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\n\nCYCL DEF 200      ; drill, deep\n...\nCALL LBL 1        ; same holes again')
      + '<p>Change a hole position once \u2014 every call uses the new one.</p>'; } },
    { html:function(){ return ''
      + '<p>A <b>Q variable</b> stores a number you can reuse. Define it, then write it instead of the value:</p>'
      + learnSnippet('Q1 = -6           ; slot depth\n...\nL Z+Q1 F150       ; plunge to Q1 = -6\nL X+80 F300')
      + '<p>One edit at the top changes the whole program \u2014 the start of parametric programming.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Wrap the two drilling blocks into a subprogram: put LBL 1 above them and LBL 0 below them',
      starter:'BEGIN PGM SUB MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-5 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; wrap the two blocks below into LBL 1 ... LBL 0\n\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\n\nM5\nM9\nEND PGM SUB MM',
      solRepl:['L X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99','LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0'],
      checks:[
        {t:'uses', re:/^\s*LBL\s+1\s*$/m, label:'LBL 1 opens the subprogram',
         hint:'LBL 1 goes on its own block, just above the first hole.'},
        {t:'order', a:/\bLBL\s+1\b/, b:/\bLBL\s+0\b/, label:'LBL 0 closes it after the holes',
         hint:'LBL 0 on its own block, just below the second hole.'},
        {t:'reach', cut:true, x:30, y:30, z:-5, tol:0.4, label:'Both holes still drilled',
         hint:'Wrapping must not change the blocks themselves.'}
      ]
    },
    {
      prompt:'A deeper drilling cycle is already defined below \u2014 drill the same two holes again with CALL LBL 1',
      starter:'BEGIN PGM SUB MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-5 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-15 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; >>> write here\n\nM5\nM9\nEND PGM SUB MM',
      sol:'CALL LBL 1',
      checks:[
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'Subprogram called with CALL LBL 1',
         hint:'One block: CALL LBL 1 \u2014 after the second cycle definition.'},
        {t:'reach', cut:true, x:30, y:30, z:-15, tol:0.4, label:'Hole X+30 drilled to the new depth Z-15',
         hint:'The call runs the same positions with the deeper cycle.'},
        {t:'reach', cut:true, x:70, y:30, z:-15, tol:0.4, label:'Hole X+70 drilled to the new depth Z-15',
         hint:'Both holes come from the one CALL.'}
      ]
    },
    {
      prompt:'Define a variable Q1 = -6 and use it as the slot depth: plunge with L Z+Q1 F150, then mill to X+80 with F300',
      starter:'BEGIN PGM QVAR MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nL X+20 Y+40 Z+50 FMAX\nL Z+2 FMAX\n; >>> write here\n\nM5\nM9\nEND PGM QVAR MM',
      sol:'Q1 = -6\nL Z+Q1 F150\nL X+80 F300',
      checks:[
        {t:'uses', re:/Q1\s*=\s*-6\b/, label:'Variable defined: Q1 = -6',
         hint:'One block: Q1 = -6 (before it is used).'},
        {t:'uses', re:/Z\+?Q1\b/, label:'Depth written as Z+Q1, not as a number',
         hint:'L Z+Q1 F150 \u2014 the control substitutes -6.'},
        {t:'reach', cut:true, x:80, y:40, z:-6, label:'Slot milled at depth 6 mm',
         hint:'After the plunge: L X+80 F300.'},
        {t:'min_z', z:-6, label:'Deepest point is exactly Q1 = -6',
         hint:'Check the sign: Q1 = -6, used as Z+Q1.'}
      ]
    }
  ]
},
{
  id:'L10', title:'Polar coordinates \u2014 CC pole + LP',
  slides:[
    { html:function(){ return ''
      + '<p>Some patterns are round by nature. <b>CC</b> (<i>Circle Centre</i>) sets the pole; <b>LP</b> (<i>Line Polar</i>) then moves by <b>PR</b> (<i>Polar Radius</i>) and <b>PA</b> (<i>Polar Angle</i>):</p>'
      + learnSnippet('CC X+50 Y+40      ; the pole\nLP PR+25 PA+0     ; 25 mm from pole, angle 0\u00b0')
      + '<p><code>PA</code> is measured from the X+ axis, counter-clockwise. <code>PA+0</code> = to the right, <code>PA+90</code> = straight up.</p>'; } },
    { html:function(){ return ''
      + learnSvgPolar()
      + '<p>The same picture written as code \u2014 first the Circle Centre, then the point by Polar Radius and Polar Angle:</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+25 PA+40')
      + '<p>On the machine keyboard: type <b>L</b>, then press <b>P</b> \u2014 the block switches to polar input.</p>'; } },
    { html:function(){ return ''
      + learnSvgBoltCircle()
      + '<p>A <b>bolt circle</b> is then just one line per hole \u2014 same Polar Radius, angles stepped by 120\u00b0:</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+25 PA+0 FMAX M99\nLP PR+25 PA+120 FMAX M99\nLP PR+25 PA+240 FMAX M99'); } },
    { html:function(){ return ''
      + '<p>The pole stays active until you set a new <code>CC</code>. PR and PA are modal too \u2014 you can repeat just the part that changes.</p>'
      + learnSnippet('CC X+50 Y+40\nLP PR+12 PA+60 FMAX M99\nLP PA+180 FMAX M99   ; PR stays 12\nLP PA+300 FMAX M99')
      + '<p>No triangle maths, no calculator \u2014 the control does the trigonometry.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Set the pole CC X+50 Y+40 and drill one hole at PR+25 PA+0 (call the cycle with M99)',
      starter:'BEGIN PGM POLAR MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; >>> write here\n\nM5\nM9\nEND PGM POLAR MM',
      sol:'CC X+50 Y+40\nLP PR+25 PA+0 FMAX M99',
      checks:[
        {t:'uses', re:/CC\s+X\+50\s+Y\+40/, label:'Pole set: CC X+50 Y+40',
         hint:'CC on its own block \u2014 it only defines the pole.'},
        {t:'reach', cut:true, x:75, y:40, z:-10, tol:0.5, label:'Hole at PR+25 PA+0 \u2192 X+75 Y+40',
         hint:'LP PR+25 PA+0 FMAX M99 \u2014 angle 0\u00b0 points along X+.'}
      ]
    },
    {
      prompt:'Add two more holes on the same circle: PA+120 and PA+240 (PR stays +25)',
      starter:'BEGIN PGM POLAR MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nCC X+50 Y+40\nLP PR+25 PA+0 FMAX M99\n; >>> write here\n\nM5\nM9\nEND PGM POLAR MM',
      sol:'LP PR+25 PA+120 FMAX M99\nLP PR+25 PA+240 FMAX M99',
      checks:[
        {t:'reach', cut:true, x:37.5, y:61.65, z:-10, tol:0.5, label:'Hole at PA+120 drilled',
         hint:'LP PR+25 PA+120 FMAX M99'},
        {t:'reach', cut:true, x:37.5, y:18.35, z:-10, tol:0.5, label:'Hole at PA+240 drilled',
         hint:'LP PR+25 PA+240 FMAX M99'}
      ]
    },
    {
      prompt:'Drill a second, smaller circle: three holes at PR+12, angles PA+60, PA+180 and PA+300',
      starter:'BEGIN PGM POLAR MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-10 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+5 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nCC X+50 Y+40\nLP PR+25 PA+0 FMAX M99\nLP PR+25 PA+120 FMAX M99\nLP PR+25 PA+240 FMAX M99\n; >>> write here\n\nM5\nM9\nEND PGM POLAR MM',
      sol:'LP PR+12 PA+60 FMAX M99\nLP PR+12 PA+180 FMAX M99\nLP PR+12 PA+300 FMAX M99',
      checks:[
        {t:'reach', cut:true, x:56, y:50.39, z:-10, tol:0.5, label:'Hole at PR+12 PA+60 drilled',
         hint:'LP PR+12 PA+60 FMAX M99'},
        {t:'reach', cut:true, x:38, y:40, z:-10, tol:0.5, label:'Hole at PR+12 PA+180 drilled',
         hint:'PA+180 points along X\u2212 from the pole.'},
        {t:'reach', cut:true, x:56, y:29.61, z:-10, tol:0.5, label:'Hole at PR+12 PA+300 drilled',
         hint:'LP PR+12 PA+300 FMAX M99'}
      ]
    }
  ]
},
{
  id:'L11', title:'Circular pocket \u2014 CYCL DEF 208',
  slides:[
    { html:function(){ return ''
      + '<p>Cycle <b>208</b> mills a round hole <b>bigger than the tool</b>: it spirals down helically, then widens in rings to the target diameter <code>Q335</code>:</p>'
      + learnSvgToolpath('BEGIN PGM D MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nCYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-8 ;depth\n  Q206=+150 ;plunge feed rate\n  Q334=+2 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+30 ;nominal DIAMETER\n  Q342=+0 ;pre-drilled diameter\n  Q351=+1 ;milling mode (+1 climb)\nL X+50 Y+40 FMAX M99\nEND PGM D MM')
      + '<p>One D10 tool \u2014 any diameter from D10 up.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Q335</b> — target pocket <b>diameter</b><br><b>Q334</b> — depth per helix <b>turn</b><br><b>Q342</b> — <b>pre-drilled</b> hole diameter (0 = solid)<br><b>Q351</b> — +1 climb, -1 conventional</p>'
      + learnSnippet('CYCL DEF 208\n  Q200=+2   ;clearance\n  Q201=-8   ;depth\n  Q206=+150 ;plunge feed\n  Q334=+2   ;infeed per helix turn\n  Q203=+0   ;surface Z\n  Q204=+30  ;2nd clearance\n  Q335=+30  ;pocket DIAMETER\n  Q342=+0   ;pre-drilled dia (0 = solid)\n  Q351=+1   ;+1 climb milling'); } },
    { html:function(){ return ''
      + '<p>Typical use: a <b>counterbore</b> for a screw head in an existing \u00d86.6 hole \u2014 the head sinks flush:</p>'
      + learnSvgCounterbore()
      + learnSnippet('CYCL DEF 208\n  Q200=+2   ;clearance\n  Q201=-6   ;head depth\n  Q206=+150\n  Q334=+2\n  Q203=+0\n  Q204=+30\n  Q335=+11  ;head diameter\n  Q342=+6.6 ;the drilled hole\n  Q351=+1\nL X+50 Y+40 FMAX M99')
      + '<p>Called with <code>M99</code> at the hole centre, like every cycle.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Define cycle 208 for a round pocket: diameter 30 mm, 8 mm deep, 2 mm per helix turn, clearance 2 mm, surface at Z+0, climb milling',
      starter:'BEGIN PGM POCKET MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\n; define the cycle here\n\nM5\nM9\nEND PGM POCKET MM',
      sol:'CYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-8 ;depth\n  Q206=+150 ;plunge feed rate\n  Q334=+2 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+30 ;nominal DIAMETER\n  Q342=+0 ;pre-drilled diameter\n  Q351=+1',
      checks:[
        {t:'uses', re:/CYCL\s+DEF\s+208\b/, label:'CYCL DEF 208 defined',
         hint:'Start with the line: CYCL DEF 208'},
        {t:'uses', re:/Q335\s*=\s*\+?30\b/, label:'Pocket diameter Q335 = +30',
         hint:'Q335 is the DIAMETER, not the radius.'},
        {t:'uses', re:/Q201\s*=\s*-8\b/, label:'Depth Q201 = -8',
         hint:'Depth is negative: Q201=-8.'},
        {t:'uses', re:/Q334\s*=\s*\+?2\b/, label:'Helix infeed Q334 = +2',
         hint:'Q334=+2 \u2014 2 mm deeper per turn.'}
      ]
    },
    {
      prompt:'Mill the pocket: position to the centre X+50 Y+40 and call the cycle with M99',
      starter:'BEGIN PGM POCKET MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nCYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-8 ;depth\n  Q206=+150 ;plunge feed rate\n  Q334=+2 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+30 ;nominal DIAMETER\n  Q342=+0 ;pre-drilled diameter\n  Q351=+1 ;milling mode (+1 climb)\n; >>> write here\n\nM5\nM9\nEND PGM POCKET MM',
      sol:'L X+50 Y+40 FMAX M99',
      checks:[
        {t:'uses', re:/\bM99\b/, label:'Cycle called with M99',
         hint:'L X+50 Y+40 FMAX M99'},
        {t:'reach', cut:true, x:60, y:40, tol:0.8, label:'Tool reaches the D30 wall (centre path at R10)',
         hint:'With a D10 tool the centre circles at R15\u22125 = 10 mm from the middle.'},
        {t:'min_z', z:-8, label:'Pocket floor at Z-8',
         hint:'The depth comes from Q201.'}
      ]
    },
    {
      prompt:'Enlarge the pocket to D40 by changing ONE parameter, then check the new wall',
      starter:'BEGIN PGM POCKET MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nCYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-8 ;depth\n  Q206=+150 ;plunge feed rate\n  Q334=+2 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+30 ;nominal DIAMETER\n  Q342=+0 ;pre-drilled diameter\n  Q351=+1 ;milling mode (+1 climb)\nL X+50 Y+40 FMAX M99\nM5\nM9\nEND PGM POCKET MM',
      solRepl:['Q335=+30','Q335=+40'],
      checks:[
        {t:'uses', re:/Q335\s*=\s*\+?40\b/, label:'Diameter changed: Q335 = +40',
         hint:'Only Q335 changes \u2014 that is the point of cycles.'},
        {t:'reach', cut:true, x:65, y:40, tol:0.8, label:'Tool reaches the new D40 wall (centre path at R15)',
         hint:'R20 wall \u2212 R5 tool = centre circles at 15 mm.'}
      ]
    }
  ]
},
{
  id:'L20', title:'Precision hole \u2014 spot, drill, ream (cycle 201)',
  slides:[
    { html:function(){ return ''
      + '<p>A drill on a flat face <b>wanders</b> \u2014 a precise hole (like \u00d87 H7) starts with a <b>centre drill</b> making a small dimple, then the drill, then a <b>reamer</b> for the final size:</p>'
      + learnSnippet('T3 CENTER_D6   ; spot ~2 mm\nT4 DRILL_D6_8  ; drill through\nT6 REAMER_7H7  ; ream to size')
      + '<p>The drill is 6.8 \u2014 the reamer removes the last 0.2 mm and guarantees H7.</p>'; } },
    { html:function(){ return ''
      + '<p>All three tools visit the <b>same positions</b> \u2014 exactly what LBL is for. One label, three calls:</p>'
      + learnSnippet('LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\n; ...tool change + new cycle...\nCALL LBL 1')
      + '<p>Tip from real programs: <code>TOOL DEF 4</code> after a tool call pre-stages the NEXT tool in the magazine, so the change is instant.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Cycle 201</b> (reaming) moves gently: feed in, optional dwell, and \u2014 crucially \u2014 feeds <b>out</b> too (<code>Q208</code>), never rapid, so the reamer does not scratch the finished bore:</p>'
      + learnSnippet('CYCL DEF 201\n  Q200=+2   ;clearance\n  Q201=-21  ;depth\n  Q206=+80  ;feed in\n  Q211=+0   ;dwell\n  Q208=+500 ;feed OUT\n  Q203=+0   ;surface\n  Q204=+30  ;2nd clearance'); } }
  ],
  tasks:[
    {
      prompt:'Spot-drill both positions: write LBL 1 with L X+30 Y+30 FMAX M99 and L X+70 Y+30 FMAX M99, closed by LBL 0',
      starter:'BEGIN PGM HOLE7 MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 3 Z S3000 F120\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-2 ;depth\n  Q206=+120 ;plunge feed rate\n  Q202=+2 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; >>> write here\n\nM5\nM9\nEND PGM HOLE7 MM',
      sol:'LBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0',
      checks:[
        {t:'uses', re:/^\s*LBL\s+1\s*$/m, label:'Positions live in LBL 1 \u2026 LBL 0',
         hint:'The other tools will reuse this label.'},
        {t:'reach', cut:true, x:30, y:30, z:-2, tol:0.4, label:'Spot at X+30 Y+30, 2 mm deep',
         hint:'The shallow cycle 200 above does the spotting.'},
        {t:'reach', cut:true, x:70, y:30, z:-2, tol:0.4, label:'Spot at X+70 Y+30, 2 mm deep',
         hint:'One M99 block per position.'}
      ]
    },
    {
      prompt:'Drill through with T4: the tool change and the deep cycle are ready \u2014 run the positions again with CALL LBL 1',
      starter:'BEGIN PGM HOLE7 MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 3 Z S3000 F120\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-2 ;depth\n  Q206=+120 ;plunge feed rate\n  Q202=+2 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nTOOL CALL 4 Z S2500 F150\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-24 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\n; >>> write here\n\nM5\nM9\nEND PGM HOLE7 MM',
      sol:'CALL LBL 1',
      checks:[
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'Positions reused with CALL LBL 1',
         hint:'One block \u2014 no copying of the coordinates.'},
        {t:'reach', cut:true, x:30, y:30, z:-24, tol:0.5, label:'Hole X+30 drilled through (Z-24)',
         hint:'Depth -24 breaks through the 20 mm plate.'},
        {t:'reach', cut:true, x:70, y:30, z:-24, tol:0.5, label:'Hole X+70 drilled through (Z-24)',
         hint:'Both holes come from the one CALL.'}
      ]
    },
    {
      prompt:'Ream to 7H7 with T6: define cycle 201 \u2014 depth 21 mm, feed in 80, feed OUT 500, clearance 2 mm, surface at Z+0, no dwell \u2014 and run the positions with CALL LBL 1',
      starter:'BEGIN PGM HOLE7 MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 3 Z S3000 F120\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-2 ;depth\n  Q206=+120 ;plunge feed rate\n  Q202=+2 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nTOOL CALL 4 Z S2500 F150\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-24 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nCALL LBL 1\nTOOL CALL 6 Z S500 F80\n; >>> write here\n\nM5\nM9\nEND PGM HOLE7 MM',
      sol:'CYCL DEF 201\n  Q200=+2 ;set-up clearance\n  Q201=-21 ;depth\n  Q206=+80 ;plunge feed rate\n  Q211=+0 ;dwell at bottom\n  Q208=+500 ;retraction feed rate\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\nCALL LBL 1',
      checks:[
        {t:'uses', re:/CYCL\s+DEF\s+201\b/, label:'Reaming cycle 201 defined',
         hint:'Start with: CYCL DEF 201'},
        {t:'uses', re:/Q208\s*=\s*\+?500\b/, label:'Retract feed Q208 = +500 (feed out, never rapid)',
         hint:'Q208 protects the finished bore on the way out.'},
        {t:'reach', cut:true, x:30, y:30, z:-21, tol:0.5, label:'Bore X+30 reamed to Z-21',
         hint:'CALL LBL 1 after the cycle definition.'},
        {t:'reach', cut:true, x:70, y:30, z:-21, tol:0.5, label:'Bore X+70 reamed to Z-21',
         hint:'Same label, third time \u2014 that is the chain.'}
      ]
    }
  ]
},
{
  id:'L21', title:'Tapping \u2014 CYCL DEF 209',
  slides:[
    { html:function(){ return ''
      + '<p><b>Tapping</b> cuts a thread: the spindle and the feed are locked together by the <b>pitch</b> \u2014 one revolution = exactly one pitch deeper. Cycle <b>209</b> also breaks chips by backing off:</p>'
      + learnSvgThread()
      + learnSnippet('CYCL DEF 209 TAPPING\n  Q200=+2    ;set-up clearance\n  Q201=-15   ;thread depth\n  Q239=+1.25 ;PITCH (M8 = 1.25)\n  Q203=+0    ;surface coordinate\n  Q204=+30   ;2nd set-up clearance\n  Q257=+4    ;depth for chip breaking\n  Q256=+0.5  ;retract for chip breaking')
      + '<p><code>Q257</code>: back off every 4 mm; <code>Q256</code>: by 0.5 mm.</p>'; } },
    { html:function(){ return ''
      + '<p>Before tapping you must <b>pre-drill</b> the core hole. Rule of thumb: <b>drill \u00d8 = thread size \u2212 pitch</b>.</p>'
      + '<p>So an <b>M8</b> thread (pitch 1.25) needs a <b>\u00d86.8</b> core hole (8 \u2212 1.25 \u2248 6.75, rounded to the standard 6.8 drill) \u2014 exactly the holes from the last lesson. Tap = T7:</p>'
      + learnSnippet('TOOL CALL 7 Z S200 F250\n; core hole \u00d8 = 8 \u2212 1.25 \u2248 6.8 mm\n; feed = S \u00d7 pitch = 200 \u00d7 1.25')
      + '<p>The control synchronises spindle and feed for you \u2014 but the numbers must make sense.</p>'; } },
    { html:function(){ return ''
      + '<p>Called like every cycle \u2014 <code>M99</code> at the position, or the label you already have:</p>'
      + learnSnippet('CALL LBL 1   ; taps every position in the label'); } }
  ],
  tasks:[
    {
      prompt:'Define the tapping cycle: CYCL DEF 209 with depth per chip break = +4, retract for chip breaking = +0.5, then set-up clearance = +2, thread depth = -15, thread pitch = +1.25, surface coordinate = +0, 2nd set-up clearance = +30',
      starter:'BEGIN PGM TAP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-18 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nTOOL CALL 7 Z S200 F250\n; define cycle 209 here\n\nM5\nM9\nEND PGM TAP MM',
      sol:'CYCL DEF 209 Q257=+4 Q256=+0.5\n  Q200=+2 ;set-up clearance\n  Q201=-15 ;depth\n  Q239=+1.25 ;thread pitch\n  Q203=+0 ;surface coordinate\n  Q204=+30',
      checks:[
        {t:'uses', re:/CYCL\s+DEF\s+209\b/, label:'Tapping cycle 209 defined',
         hint:'First line: CYCL DEF 209 Q257=+4 Q256=+0.5'},
        {t:'uses', re:/Q239\s*=\s*\+?1\.25\b/, label:'Pitch Q239 = +1.25 (M8)',
         hint:'The pitch of M8 is 1.25 mm.'},
        {t:'uses', re:/Q201\s*=\s*-15\b/, label:'Thread depth Q201 = -15',
         hint:'Depth is negative, like every cycle.'}
      ]
    },
    {
      prompt:'Tap the first hole: position to X+30 Y+30 and call the cycle with M99',
      starter:'BEGIN PGM TAP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-18 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nTOOL CALL 7 Z S200 F250\nCYCL DEF 209 Q257=+4 Q256=+0.5\n  Q200=+2 ;set-up clearance\n  Q201=-15 ;depth\n  Q239=+1.25 ;thread pitch\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n; >>> write here\n\nM5\nM9\nEND PGM TAP MM',
      sol:'L X+30 Y+30 FMAX M99',
      checks:[
        {t:'uses', re:/\bM99\b/, label:'Cycle called with M99',
         hint:'L X+30 Y+30 FMAX M99'},
        {t:'reach', cut:true, x:30, y:30, z:-15, tol:0.5, label:'Thread cut to Z-15 at X+30 Y+30',
         hint:'The cycle pecks down with chip-breaking on the way.'}
      ]
    },
    {
      prompt:'Tap both holes in one go instead: replace the single call with CALL LBL 1',
      starter:'BEGIN PGM TAP MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-18 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\nTOOL CALL 7 Z S200 F250\nCYCL DEF 209 Q257=+4 Q256=+0.5\n  Q200=+2 ;set-up clearance\n  Q201=-15 ;depth\n  Q239=+1.25 ;thread pitch\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n; >>> write here\n\nM5\nM9\nEND PGM TAP MM',
      sol:'CALL LBL 1',
      checks:[
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'Label reused for tapping',
         hint:'CALL LBL 1 \u2014 the same positions, fourth tool.'},
        {t:'reach', cut:true, x:30, y:30, z:-15, tol:0.5, label:'Thread at X+30 Y+30',
         hint:'Both threads come from the one call.'},
        {t:'reach', cut:true, x:70, y:30, z:-15, tol:0.5, label:'Thread at X+70 Y+30',
         hint:'CALL LBL 1 runs every block in the label.'}
      ]
    }
  ]
},
{
  id:'L22', title:'Chamfering \u2014 countersink & the DL/DR trick',
  slides:[
    { html:function(){ return ''
      + '<p>The <b>90\u00b0 countersink</b> (T5) breaks sharp edges. Its reference point is the <b>tip</b>, so in the table R \u2248 0. The trick to a 1 \u00d7 45\u00b0 chamfer:</p>'
      + learnSvgChamfer()
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2')
      + '<p><code>DR+2</code> shifts the <b>path</b> 2 mm away from the edge, <code>DL-2</code> drops the tip 2 mm \u2014 the 90\u00b0 cone then meets the edge at exactly 1 mm. Change both to 1 \u2192 0.5 mm chamfer.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Hole edges \u2014 two ways.</b> The fast way: let the 90\u00b0 countersink <b>dip in like a drill</b> with a plain <code>CYCL DEF 200</code>. Only works if the hole is <b>smaller than the countersink diameter</b>, so the cone reaches the rim:</p>'
      + learnSnippet('TOOL CALL 5 Z S2000 F2000 DL-2 DR+2\nCYCL DEF 200\n  Q201=-4   ;dip 4 mm from the tip\n  Q203=+2   ;surface +2 cancels DL-2\n  ...\nCALL LBL 1')
      + '<p><code>DL-2</code> drops the tip 2 mm and <code>Q203=+2</code> raises the surface by the same 2 mm \u2014 they cancel, so the 4 mm dip starts at the real top. The cone width at that depth sets the chamfer.</p>'
      + '<p>For a <b>bigger hole</b> the cone can no longer reach the rim by dipping \u2014 then mill the edge with <code>CYCL DEF 208</code> and <code>Q342</code> = the existing hole diameter, so the cycle only rides the rim and never touches solid material:</p>'
      + learnSnippet('CYCL DEF 208\n  Q201=-1   ;just the edge\n  Q335=+7   ;target\n  Q342=+6.8 ;pre-drilled!\n  ...')
      + '<p>Drilling is quicker; milling is the choice once the bore is wider than the tool.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Contour edges</b>: simply run the contour once more with T5 \u2014 same blocks, same RL, just 1 mm below the top:</p>'
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nL X+50 Y-10 Z-1 FMAX R0\nL Y+0 RL F500\nL Y+80\nL Y+90 R0')
      + '<p>The compensation offsets the cone by DR, the edge gets a clean 1 \u00d7 45\u00b0.</p>'; } }
  ],
  tasks:[
    {
      prompt:'Deburr the drilled hole with the countersink: call T5 with DL-2 DR+2 (any feed/speed, e.g. S2000 F2000), then a drilling CYCL DEF 200 that dips 4 mm from the tip \u2014 set Q203=+2 so the +2 surface cancels the DL-2, and CALL LBL 1',
      starter:'BEGIN PGM CHAMF MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-24 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+8 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nLBL 1\nL X+30 Y+30 FMAX M99\nL X+70 Y+30 FMAX M99\nLBL 0\n; chamfer tool call + drilling cycle go below\n\n\nM5\nM9\nEND PGM CHAMF MM',
      sol:'TOOL CALL 5 Z S2000 F2000 DL-2 DR+2\nCYCL DEF 200\n  Q200=+2 ;set-up clearance\n  Q201=-4 ;depth\n  Q206=+150 ;plunge feed rate\n  Q202=+4 ;plunging depth\n  Q210=+0 ;dwell at top\n  Q203=+2 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q211=+0 ;dwell at bottom\nCALL LBL 1',
      checks:[
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DL-2\b/, label:'T5 called with DL-2',
         hint:'TOOL CALL 5 Z S2000 F2000 DL-2 DR+2 \u2014 any feed/speed is fine.'},
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DR\+2\b/, label:'\u2026and DR+2 \u2014 the pair makes the 1 mm chamfer',
         hint:'Both deltas on the same TOOL CALL block.'},
        {t:'uses', re:/CYCL\s+DEF\s+200\b/, label:'Drilling cycle 200 defined for the countersink',
         hint:'The countersink just dips into the hole like a drill.'},
        {t:'uses', re:/Q203\s*=\s*\+?2\b/, label:'Q203=+2 cancels the DL-2 (surface raised 2 mm)',
         hint:'Surface +2 and DL-2 cancel \u2014 the 4 mm depth then starts from the real top.'},
        {t:'uses', re:/Q201\s*=\s*[+-]?4\b/, label:'Q201=-4 \u2014 4 mm dip from the tip',
         hint:'That 4 mm dip is what makes the chamfer with a 90\u00b0 cone.'},
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'CALL LBL 1 runs the chamfer at both holes',
         hint:'Reuse the same label as the drilling pass.'}
      ]
    },
    {
      prompt:'Deburr the milled hole (bigger than the tool): call T5 with DL-2 DR+2 (any feed/speed, e.g. S15000 F500), then write CYCL DEF 208 for the edge-break \u2014 Q201=-1 for a 1 mm chamfer and Q342 = the milled hole diameter \u2014 and CALL LBL 1',
      starter:'BEGIN PGM CHAMF MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nTOOL CALL 4 Z S2500 F150\nM3\nM8\nCYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-15 ;depth\n  Q206=+150 ;plunge feed rate\n  Q334=+4 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+10 ;hole diameter\n  Q342=+0 ;pre-drilled diameter\n  Q351=+1 ;milling mode (+1 climb)\nLBL 1\nL X+50 Y+40 FMAX M99\nLBL 0\n; chamfer tool call + cycle go below\n\n\nM5\nM9\nEND PGM CHAMF MM',
      sol:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nCYCL DEF 208\n  Q200=+2 ;set-up clearance\n  Q201=-1 ;depth\n  Q206=+300 ;plunge feed rate\n  Q334=+1 ;infeed per helix turn\n  Q203=+0 ;surface coordinate\n  Q204=+30 ;2nd set-up clearance\n  Q335=+10 ;nominal diameter\n  Q342=+10 ;milled hole diameter\n  Q351=+1 ;milling mode (+1 climb)\nCALL LBL 1',
      checks:[
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DL-2\b/, label:'T5 called with DL-2',
         hint:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2 \u2014 any feed/speed is fine.'},
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DR\+2\b/, label:'\u2026and DR+2 \u2014 the pair makes the 1 mm chamfer',
         hint:'Both deltas on the same TOOL CALL block.'},
        {t:'uses', re:/CYCL\s+DEF\s+208\b/, label:'Deburring cycle 208 defined',
         hint:'A second CYCL DEF 208, this time just for the edge break.'},
        {t:'uses', re:/Q201\s*=\s*[+-]?1\b/, label:'Q201=-1 \u2014 the edge break is 1 mm deep',
         hint:'Just the rim, not the full hole \u2014 Q201=-1.'},
        {t:'uses', re:/Q342\s*=\s*\+?9\.9{1,3}\b|\bQ342\s*=\s*\+?10\b/, label:'Q342 = milled hole diameter (10 or 9.999)',
         hint:'Q342 must match the diameter the hole was milled to — use +10 or +9.999.'},
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'CALL LBL 1 runs the chamfer at the hole position',
         hint:'Reuse the same label as the milling pass.'}
      ]
    },
    {
      prompt:'Chamfer the whole outside contour with T5 (any feed/speed): approach clear of the blank at R0, plunge to Z-1, keep DL-2 DR+2 on the tool call, then run the four walls of the 50\u00d750 block with RL and cancel R0 leaving the part',
      starter:'BEGIN PGM CHAMF MM\nBLK FORM 0.1 Z X+15 Y+15 Z-20\nBLK FORM 0.2 X+65 Y+65 Z+0\n; the raw part is the 50\u00d750 block itself \u2014 chamfer its top edge\nTOOL CALL 5 Z S15000 F500 DL-2 DR+2\nM3\nM8\n; approach OUTSIDE the blank at R0, then plunge to Z-1\nL X+0 Y+15 Z+50 FMAX R0\nL Z-1 FMAX\n; >>> run the contour here\n\n\nL Z+50 FMAX R0\nM5\nM9\nEND PGM CHAMF MM',
      sol:'L X+15 RL F500\nL Y+65\nL X+65\nL Y+15\nL X+10\nL X+0 R0',
      checks:[
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DL-2\b[^\n]*DR\+2\b/, label:'T5 with DL-2 DR+2 for the 1 mm chamfer',
         hint:'Already in the starter \u2014 keep DL-2 DR+2 on the tool call.'},
        {t:'uses', re:/\bRL\b/, label:'Contour cut with RL compensation',
         hint:'Activate RL on the first wall block: L X+15 RL F500.'},
        {t:'reach', cut:true, x:13, y:40, z:-1, tol:0.7, label:'Left edge chamfered (tip path 2 mm off the X+15 wall)',
         hint:'DR+2 offsets the cone path outward \u2014 the 90\u00b0 edge meets the material corner at 1 mm.'},
        {t:'reach', cut:true, x:40, y:67, z:-1, tol:0.7, label:'Top edge chamfered (Y+65 corner reached)',
         hint:'L Y+65 then L X+65 walks the full block edge.'},
        {t:'order', a:/\bRL\b/, b:/R0\b/, label:'Compensation cancelled with R0 after leaving the part',
         hint:'Finish with L X+0 R0 clear of the block.'}
      ]
    }
  ]
},
{
  id:'L23', title:'Parametric contour \u2014 one profile, milled then chamfered',
  slides:[
    { html:function(){ return ''
      + '<p>Here is the part from the <b>drawing</b>: a 90\u00d790 profile with one <b>R15</b> rounded corner and a <b>15\u00d745\u00b0</b> chamfer. The blank is 100\u00d7100 with <b>5 mm of stock</b> \u2014 top at Z+5, floor at Z0:</p>'
      + learnSvgPartProfile(); } },
    { html:function(){ return ''
      + '<p><b>The idea:</b> write the profile <b>once</b> in a subprogram and let a single variable <code>Q1</code> set the depth. Same path, milled deep then chamfered shallow:</p>'
      + learnSnippet('LBL 1\nL X+10 Y-10 Z+50 FMAX R0  ; approach outside\nL Z+Q1 FMAX          ; plunge to Q1\nL X+5 RL F500        ; comp on\nL Y+95               ; up\nRND R15              ; round corner\nL X+95               ; across\nL Y+5                ; down\nCHF 15               ; chamfer corner\nL X-5                ; bottom wall out past the start (overlap)\nL Z+50 FMAX R0       ; retract + comp off\nLBL 0')
      + '<p>Change the tool and one number \u2014 that is the whole job.</p>'; } },
    { html:function(){ return ''
      + '<p><b>Milling pass:</b> call the mill, set the floor depth, and place the profile in <code>LBL 1</code> right after it. The label <b>runs where it is written</b>, so the mill cuts it once \u2014 Q1=0 shaves off all 5 mm:</p>'
      + learnSnippet('TOOL CALL 1 Z S3000 F500\nQ1 = +0\nLBL 1\n  ... profile ...\nLBL 0')
      + '<p><b>Chamfer pass:</b> below it, swap to the 90\u00b0 countersink with <code>DL-2 DR+2</code>, and this time <b>CALL</b> the same label. The top of the part is at Z+5, so <code>Q1=+4</code> dips the cone 1 mm below the surface \u2014 a clean edge break with no need to rewrite the profile:</p>'
      + learnSnippet('TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nQ1 = +4        ; 1 mm below the Z+5 top\nCALL LBL 1'); } }
  ],
  tasks:[
    {
      prompt:'Write the profile yourself \u2014 the mill T1 is already called. Set Q1 = +0, then place the profile in LBL 1 \u2026 LBL 0 (it runs where you write it, so no CALL is needed here). Steps: approach X+10 Y-10 R0 \u00b7 plunge Z+Q1 \u00b7 X+5 RL \u00b7 Y+95 \u00b7 RND R15 \u00b7 X+95 \u00b7 Y+5 \u00b7 CHF 15 \u00b7 X-5 \u00b7 Z+50 R0.',
      starter:'BEGIN PGM PART MM\nBLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+100 Y+100 Z+5\nTOOL CALL 1 Z S3000 F500\nM3\nM8\n\nM5\nM9\nEND PGM PART MM',
      sol:'Q1 = +0\nLBL 1\nL X+10 Y-10 Z+50 FMAX R0\nL Z+Q1 FMAX\nL X+5 F500 RL\nL Y+95\nRND R15\nL X+95\nL Y+5\nCHF 15\nL X-5\nL Z+50 FMAX R0\nLBL 0',
      checks:[
        {t:'uses', re:/Q1\s*=\s*\+?0\b/, label:'Depth variable set: Q1 = +0',
         hint:'Q1 = +0 before the profile.'},
        {t:'uses', re:/LBL\s+1\b[\s\S]*LBL\s+0\b/, label:'Profile wrapped in LBL 1 \u2026 LBL 0',
         hint:'LBL 1 opens the subprogram, LBL 0 closes it.'},
        {t:'uses', re:/Y-10[^\n]*\bR0\b/, label:'Approach outside the blank at R0',
         hint:'L X+10 Y-10 Z+50 FMAX R0.'},
        {t:'uses', re:/L\s+Z\+Q1\b/, label:'Plunge to the variable depth Z+Q1',
         hint:'L Z+Q1 FMAX.'},
        {t:'uses', re:/\bRL\b/, label:'Profile cut with RL compensation',
         hint:'L X+5 RL F500 turns comp on.'},
        {t:'uses', re:/RND\s+R15\b/, label:'R15 rounded corner',
         hint:'RND R15 after L Y+95.'},
        {t:'uses', re:/CHF\s+15\b/, label:'15\u00d745\u00b0 chamfer',
         hint:'CHF 15 between L Y+5 and L X+5.'},
        {t:'uses', re:/Z\+50[^\n]*\bR0\b/, label:'Comp cancelled on the retract (Z+50 R0)',
         hint:'L Z+50 FMAX R0 \u2014 keep comp on until the tool is clear, cancel on the retract.'},
        {t:'reach', cut:true, x:0, y:50, z:0, tol:0.9, label:'Left wall cut to the floor (tool centre X+0)',
         hint:'The D10 tool runs 5 mm outside the X+5 wall.'}
      ]
    },
    {
      prompt:'Milling pass: the profile is already in LBL 1 below. Call the end mill (T1) and set Q1 to the floor depth +0 \u2014 the profile runs straight after (it sits right below, so no CALL is needed). Blank top Z+5 \u2192 cutting to Z0 shaves off all 5 mm of stock.',
      starter:'BEGIN PGM PART MM\nBLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+100 Y+100 Z+5\n; >>> call the mill and set the depth:\n\nLBL 1\nL X+10 Y-10 Z+50 FMAX R0\nL Z+Q1 FMAX\nL X+5 F500 RL\nL Y+95\nRND R15\nL X+95\nL Y+5\nCHF 15\nL X-5\nL Z+50 FMAX R0\nLBL 0\nM5\nM9\nEND PGM PART MM',
      sol:'TOOL CALL 1 Z S3000 F500\nM3\nM8\nQ1 = +0',
      checks:[
        {t:'toolcall', T:1, S:3000, F:500, label:'End mill T1 called (S3000 F500)',
         hint:'TOOL CALL 1 Z S3000 F500'},
        {t:'uses', re:/Q1\s*=\s*\+?0\b/, label:'Q1 = 0 \u2014 depth set to the floor',
         hint:'Q1 = +0 before the profile runs.'},
        {t:'reach', cut:true, x:0, y:50, z:0, tol:0.9, label:'Wall milled to the Z0 floor (5 mm stock removed)',
         hint:'With Q1=0 the plunge reaches Z0 and clears the 5 mm above it.'},
        {t:'reach', cut:true, x:100, y:50, z:0, tol:0.9, label:'Right wall milled through as well',
         hint:'The single profile walks all four sides.'}
      ]
    },
    {
      prompt:'Chamfer pass: the mill already runs the profile once (it is defined in LBL 1 right after the mill). Below it, call the 90\u00b0 countersink (T5) with DL-2 DR+2, set Q1 to +4 \u2014 the top of the part is at Z+5, so +4 dips the cone 1 mm below the surface for the edge break \u2014 and CALL LBL 1 to reuse the same profile',
      starter:'BEGIN PGM PART MM\nBLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+100 Y+100 Z+5\nTOOL CALL 1 Z S3000 F500\nM3\nM8\nQ1 = +0\nLBL 1\nL X+10 Y-10 Z+50 FMAX R0\nL Z+Q1 FMAX\nL X+5 F500 RL\nL Y+95\nRND R15\nL X+95\nL Y+5\nCHF 15\nL X-5\nL Z+50 FMAX R0\nLBL 0\n; >>> add the chamfer pass here:\n\nM5\nM9\nEND PGM PART MM',
      sol:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2\nM3\nM8\nQ1 = +4\nCALL LBL 1',
      checks:[
        {t:'uses', re:/TOOL\s+CALL\s+5\s+Z[^\n]*DL-2\b[^\n]*DR\+2\b/, label:'Countersink T5 with DL-2 DR+2',
         hint:'TOOL CALL 5 Z S15000 F500 DL-2 DR+2 \u2014 any feed/speed is fine.'},
        {t:'uses', re:/Q1\s*=\s*\+?4\b/, label:'Q1 = +4 \u2014 1 mm below the Z+5 top surface',
         hint:'Top is Z+5, so +4 gives a 1 mm edge break.'},
        {t:'uses', re:/CALL\s+LBL\s+1\b/, label:'Same profile reused with CALL LBL 1',
         hint:'The very same label \u2014 only the tool and depth changed.'},
        {t:'reach', cut:true, x:3, y:50, z:4, tol:0.9, label:'Left edge chamfered at Z+4 (cone offset ~2 mm)',
         hint:'DR+2 offsets the cone; the 90\u00b0 edge breaks the top corner.'},
        {t:'reach', cut:true, x:97, y:50, z:4, tol:0.9, label:'Right edge chamfered too \u2014 full profile reused',
         hint:'CALL LBL 1 runs the whole contour with the countersink.'}
      ]
    }
  ]
},
];
