// Learn tutorial web reference; deliberate shared changes can be ported to Android after acceptance.

function learnSvgLearningLoop(){
  var cards = [
    {x:10,  n:'1', title:'READ TASK', c:'var(--fig-b)'},
    {x:125, n:'2', title:'EDIT CODE', c:'var(--fig-a)'},
    {x:240, n:'3', title:'CHECK',     c:'var(--fig-c)'}
  ];
  var g = '';
  cards.forEach(function(c, i){
    g += '<rect x="'+c.x+'" y="16" width="90" height="54" rx="9" fill="var(--fig-fill)" fill-opacity=".07" stroke="'+c.c+'"/>'
      + '<text x="'+(c.x+45)+'" y="39" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="'+c.c+'">'+c.n+'</text>'
      + '<text x="'+(c.x+45)+'" y="58" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="700" fill="var(--text)">'+c.title+'</text>';
    if(i < cards.length-1){
      g += '<path d="M'+(c.x+94)+' 43 H'+(c.x+111)+'" stroke="var(--text3)" stroke-width="2"/>'
        + '<path d="M'+(c.x+105)+' 37 l7 6 l-7 6" fill="none" stroke="var(--text3)" stroke-width="2"/>';
    }
  });
  return '<svg class="learn-svg" viewBox="0 0 340 86" role="img" aria-label="Read the task, edit the code, then check">'+g+'</svg>';
}

function learnSvgBlank(dx, dy, dz){
  // Schematic oblique view. Corners: A front-bottom-left (MIN), D front-top-left (datum),
  // F back-top-right (MAX). Y+ runs away from the viewer, matching the MIN -> MAX direction.
  var T = 'font-family="monospace"';
  var dim = 'stroke="var(--text3)" stroke-width="1"';
  return '<svg class="learn-svg" viewBox="0 0 340 188" role="img" aria-label="Rectangular blank '+dx+' by '+dy+' by '+dz+' mm: BLK FORM 0.1 MIN at the bottom front left corner, 0.2 MAX at the top back right corner, datum X0 Y0 Z0 on the top face with the positive X, Y and Z directions">'
    // hidden edges
    + '<path d="M72 142 L118 116 M118 116 L118 80 M118 116 L268 116" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>'
    // visible faces: right, front, top
    + '<path d="M222 142 L268 116 L268 80 L222 106 Z" fill="var(--fig-fill)" fill-opacity=".06" stroke="var(--fig-line)" stroke-width="1.4" stroke-linejoin="round"/>'
    + '<path d="M72 142 L222 142 L222 106 L72 106 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)" stroke-width="1.4" stroke-linejoin="round"/>'
    + '<path d="M72 106 L222 106 L268 80 L118 80 Z" fill="var(--fig-fill)" fill-opacity=".18" stroke="var(--fig-line)" stroke-width="1.4" stroke-linejoin="round"/>'
    // dimensions: X below the front edge, Y along the right edge, Z beside the back-right edge
    + '<path d="M72 153 H222 M72 149 V157 M222 149 V157" fill="none" '+dim+'/>'
    + '<text x="147" y="167" text-anchor="middle" '+T+' font-size="10.5" fill="var(--text3)">'+dx+'</text>'
    + '<path d="M229 151 L275 125 M227 147.5 L231 154.5 M273 121.5 L277 128.5" fill="none" '+dim+'/>'
    + '<text x="258" y="151" '+T+' font-size="10.5" fill="var(--text3)">'+dy+'</text>'
    + '<path d="M281 80 V116 M277 80 H285 M277 116 H285" fill="none" '+dim+'/>'
    + '<text x="289" y="102" '+T+' font-size="10.5" fill="var(--text3)">'+dz+'</text>'
    // axes from the datum
    + '<path d="M72 106 V60 M72 106 H128 M72 106 L109.3 84.9" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"/>'
    + '<path d="M68 67 L72 56 L76 67 Z M121 102 L132 106 L121 110 Z M106.2 91.3 L113 82.8 L102.2 84.3 Z" fill="var(--text)"/>'
    + '<text x="64" y="64" text-anchor="end" '+T+' font-size="11" font-weight="700" fill="var(--text)">Z+</text>'
    + '<text x="94" y="76" text-anchor="middle" '+T+' font-size="11" font-weight="700" fill="var(--text)">Y+</text>'
    + '<text x="137" y="101" '+T+' font-size="11" font-weight="700" fill="var(--text)">X+</text>'
    + '<circle cx="72" cy="106" r="4" fill="var(--text)"/>'
    + '<text x="62" y="100" text-anchor="end" '+T+' font-size="10.5" fill="var(--text)">datum</text>'
    + '<text x="62" y="114" text-anchor="end" '+T+' font-size="10.5" fill="var(--text)">X0 Y0 Z0</text>'
    // MIN / MAX corners
    + '<line x1="72" y1="142" x2="52" y2="170" stroke="var(--fig-a)" stroke-width="1"/>'
    + '<circle cx="72" cy="142" r="4.5" fill="var(--fig-a)"/>'
    + '<text x="12" y="182" '+T+' font-size="11" font-weight="700" fill="var(--fig-a)">0.1 MIN · X+0 Y+0 Z-'+dz+'</text>'
    + '<line x1="268" y1="80" x2="268" y2="26" stroke="var(--fig-b)" stroke-width="1"/>'
    + '<circle cx="268" cy="80" r="4.5" fill="var(--fig-b)"/>'
    + '<text x="328" y="20" text-anchor="end" '+T+' font-size="11" font-weight="700" fill="var(--fig-b)">0.2 MAX · X+'+dx+' Y+'+dy+' Z+0</text>'
    + '</svg>';
}

function learnSnippet(code){
  var st = {v:false};
  var html = code.split('\n').map(function(l){ return _synHighlightLine(l, st) || '&nbsp;'; }).join('\n');
  return '<div class="learn-snippet">'+html+'</div>';
}

function learnSvgToolpath(code, labelIncr){
  var p = null;
  try { p = parseProgram(code); } catch(e){ return ''; }
  if(!p || !p.sub || !p.sub.length) return '';
  var bx0=p.blkMin.x, by0=p.blkMin.y, bx1=p.blkMax.x, by1=p.blkMax.y, top=p.blkMax.z;
  // Leading rapids only bring the tool from its home position: they are not
  // drawn, the start dot sits where they end, and the view covers the blank plus every drawn point (a start beside the
  // blank stays visible).
  var lead = 0;
  while(lead < p.sub.length - 1 && p.sub[lead].rapid) lead++;
  var skipped = p.sub.slice(0, lead);
  function isSkipped(s){ return skipped.indexOf(s) >= 0; }
  var ex0=bx0, ey0=by0, ex1=bx1, ey1=by1;
  p.sub.forEach(function(s){
    if(isSkipped(s)) return;
    [s.from, s.to].forEach(function(q){
      ex0=Math.min(ex0,q.x); ex1=Math.max(ex1,q.x); ey0=Math.min(ey0,q.y); ey1=Math.max(ey1,q.y);
    });
  });
  var W=340, pad=20;
  var sc=(W-2*pad)/((ex1-ex0)||1);
  var H=Math.round((ey1-ey0)*sc)+2*pad;
  function SX(v){ return (pad+(v-ex0)*sc).toFixed(1); }
  function SY(v){ return (H-pad-(v-ey0)*sc).toFixed(1); }
  var segs='', labels='';
  p.sub.forEach(function(s){
    if(isSkipped(s) || s.len<1e-6) return;
    if(Math.abs(s.to.x-s.from.x)<1e-6 && Math.abs(s.to.y-s.from.y)<1e-6){
      // pure Z move: mark plunges into material with a dot
      if(!s.rapid && s.to.z < top-1e-6) segs+='<circle cx="'+SX(s.to.x)+'" cy="'+SY(s.to.y)+'" r="3.4" fill="none" stroke="var(--fig-b)" stroke-width="1.6"/>';
      return;
    }
    var d='M'+SX(s.from.x)+' '+SY(s.from.y)+'L'+SX(s.to.x)+' '+SY(s.to.y);
    var below = Math.min(s.from.z, s.to.z) < top-1e-6;
    if(s.rapid)      segs+='<path d="'+d+'" stroke="var(--text3)" stroke-width="1" stroke-dasharray="4 3" fill="none"/>';
    else if(below)   segs+='<path d="'+d+'" stroke="var(--fig-b)" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    else             segs+='<path d="'+d+'" stroke="var(--fig-c)" stroke-width="1.3" fill="none"/>';
    // optional incremental-delta label on cutting segments
    if(labelIncr && !s.rapid && below){
      var dx=s.to.x-s.from.x, dy=s.to.y-s.from.y;
      var horiz=Math.abs(dx)>=Math.abs(dy);
      var lbl = horiz ? ('IX'+(dx>=0?'+':'')+Math.round(dx)) : ('IY'+(dy>=0?'+':'')+Math.round(dy));
      var mx=(s.from.x+s.to.x)/2, my=(s.from.y+s.to.y)/2;
      // offset label off the line: horizontal moves get label below, vertical to the right
      var tx = horiz ? SX(mx) : (parseFloat(SX(mx))-6).toFixed(1);
      var ty = horiz ? (parseFloat(SY(my))+13).toFixed(1) : SY(my);
      var anchor = horiz ? 'middle' : 'end';
      labels+='<text x="'+tx+'" y="'+ty+'" font-family="monospace" font-size="9.5" font-weight="600" fill="var(--fig-a)" text-anchor="'+anchor+'">'+lbl+'</text>';
    }
  });
  var st=lead ? skipped[lead-1].to : p.sub[0].from;
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Top view of the programmed toolpath: dashed rapid moves, teal cutting moves and orange start point">'
    + '<rect x="'+SX(bx0)+'" y="'+SY(by1)+'" width="'+((bx1-bx0)*sc).toFixed(1)+'" height="'+((by1-by0)*sc).toFixed(1)+'" fill="var(--fig-fill)" fill-opacity=".06" stroke="var(--fig-line)"/>'
    + segs
    + labels
    + '<circle cx="'+SX(st.x)+'" cy="'+SY(st.y)+'" r="3" fill="var(--fig-a)"/>'
    + '<text x="'+pad+'" y="12" font-family="monospace" font-size="9" fill="var(--text3)">top view · dashed = FMAX · dot = start</text>'
    + '</svg>';
}

function learnSvgChamfer(){
  // To scale: the contact point sits exactly DR (horizontal) and DL (vertical) away from the tool tip.
  var W=340, H=276, T='font-family="monospace"';
  var sc=24, d=2*sc, ch=sc, Sy=118, Ex=185;
  var cX=Ex-ch/2, cY=Sy+ch/2;            // contact = midpoint of the chamfer face
  var tX=cX+d, tY=cY+d;                  // tool tip on the 45 degree flank
  var fX=cX-d, fY=cY-d, rX=tX+(tX-fX);   // cone top corners
  var drY=tY+30, dlX=cX-63;
  var s='';
  // workpiece with the finished 1 x 45 chamfer, sharp corner dashed
  s+='<path d="M30 '+Sy+' L'+(Ex-ch)+' '+Sy+' L'+Ex+' '+(Sy+ch)+' L'+Ex+' 196 L30 196 Z" fill="var(--fig-fill)" fill-opacity=".12" stroke="var(--fig-line)" stroke-width="1.2"/>';
  s+='<path d="M'+(Ex-ch)+' '+Sy+' L'+Ex+' '+Sy+' L'+Ex+' '+(Sy+ch)+'" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>';
  s+='<text x="38" y="188" '+T+' font-size="10.5" fill="var(--text3)">workpiece</text>';
  // countersink
  s+='<path d="M'+tX+' '+tY+' L'+fX+' '+fY+' L'+rX+' '+fY+' Z" fill="rgba(139,147,161,.14)" stroke="var(--text3)" stroke-width="1.4" stroke-linejoin="round"/>';
  s+='<path d="M'+(fX+40)+' '+fY+' V'+(fY-24)+' M'+(rX-40)+' '+fY+' V'+(fY-24)+'" stroke="var(--text3)" stroke-width="1.4" fill="none"/>';
  s+='<text x="'+tX+'" y="'+(fY-32)+'" text-anchor="middle" '+T+' font-size="10.5" fill="var(--text3)">90° countersink (T5)</text>';
  s+='<path d="M'+(Ex-ch)+' '+Sy+' L'+Ex+' '+(Sy+ch)+'" stroke="var(--fig-b)" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
  // DR: horizontal distance contact -> tip, dimensioned below the tip
  s+='<path d="M'+cX+' '+cY+' V'+drY+' M'+tX+' '+tY+' V'+drY+'" stroke="var(--fig-c)" stroke-width="0.9" stroke-dasharray="3 3" fill="none"/>';
  s+='<path d="M'+cX+' '+drY+' H'+tX+' M'+cX+' '+(drY-5)+' V'+(drY+5)+' M'+tX+' '+(drY-5)+' V'+(drY+5)+'" stroke="var(--fig-c)" stroke-width="1.6" fill="none"/>';
  s+='<text x="'+((cX+tX)/2)+'" y="'+(drY+17)+'" text-anchor="middle" '+T+' font-size="12" font-weight="700" fill="var(--fig-c)">DR+2</text>';
  // DL: vertical distance contact -> tip, dimensioned left of the contact
  s+='<path d="M'+cX+' '+cY+' H'+dlX+' M'+tX+' '+tY+' H'+dlX+'" stroke="var(--fig-a)" stroke-width="0.9" stroke-dasharray="3 3" fill="none"/>';
  s+='<path d="M'+dlX+' '+cY+' V'+tY+' M'+(dlX-5)+' '+cY+' H'+(dlX+5)+' M'+(dlX-5)+' '+tY+' H'+(dlX+5)+'" stroke="var(--fig-a)" stroke-width="1.6" fill="none"/>';
  s+='<text x="'+(dlX-9)+'" y="'+((cY+tY)/2+4)+'" text-anchor="end" '+T+' font-size="12" font-weight="700" fill="var(--fig-a)">DL-2</text>';
  // markers on top
  s+='<circle cx="'+cX+'" cy="'+cY+'" r="4.5" fill="var(--text)"/>';
  s+='<circle cx="'+tX+'" cy="'+tY+'" r="3.5" fill="var(--text3)"/>';
  s+='<text x="'+(tX+9)+'" y="'+(tY+4)+'" '+T+' font-size="10.5" fill="var(--text3)">tool tip</text>';
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Ninety-degree countersink finishing a one-by-45-degree chamfer; DR is horizontal and DL is vertical from contact point to tool tip">'
    + s
    + '<text x="14" y="252" '+T+' font-size="10.5" fill="var(--text3)">DR = horizontal, DL = vertical:</text>'
    + '<text x="14" y="268" '+T+' font-size="10.5" fill="var(--text3)">from the contact point (dot) to the tool tip</text>'
    + '</svg>';
}

function learnSvgThread(){
  var x=150, top=20, teeth=7, pitch=16;
  var s='';
  s+='<line x1="'+(x-26)+'" y1="'+top+'" x2="'+(x-26)+'" y2="'+(top+teeth*pitch)+'" stroke="var(--text3)" stroke-width="1"/>';
  s+='<line x1="'+(x+26)+'" y1="'+top+'" x2="'+(x+26)+'" y2="'+(top+teeth*pitch)+'" stroke="var(--text3)" stroke-width="1"/>';
  var ld='', rd='';
  for(var i=0;i<teeth;i++){
    var y=top+i*pitch;
    ld+=(i?'L':'M')+(x-26)+' '+y+'L'+(x-14)+' '+(y+pitch/2);
    rd+=(i?'L':'M')+(x+26)+' '+y+'L'+(x+14)+' '+(y+pitch/2);
  }
  ld+='L'+(x-26)+' '+(top+teeth*pitch);
  rd+='L'+(x+26)+' '+(top+teeth*pitch);
  s+='<path d="'+ld+'" fill="none" stroke="var(--fig-b)" stroke-width="1.8"/>';
  s+='<path d="'+rd+'" fill="none" stroke="var(--fig-b)" stroke-width="1.8"/>';
  var py0=top+pitch+pitch/2, py1=top+2*pitch+pitch/2;
  s+='<line x1="'+(x+52)+'" y1="'+py0+'" x2="'+(x+52)+'" y2="'+py1+'" stroke="var(--fig-a)" stroke-width="1"/>';
  s+='<line x1="'+(x+40)+'" y1="'+py0+'" x2="'+(x+56)+'" y2="'+py0+'" stroke="var(--fig-a)" stroke-dasharray="2 2"/>';
  s+='<line x1="'+(x+40)+'" y1="'+py1+'" x2="'+(x+56)+'" y2="'+py1+'" stroke="var(--fig-a)" stroke-dasharray="2 2"/>';
  s+='<text x="'+(x+60)+'" y="'+(py0+pitch/2+4)+'" font-family="monospace" font-size="11" fill="var(--fig-a)">pitch</text>';
  var ay=top+teeth*pitch;
  s+='<line x1="'+(x-70)+'" y1="'+top+'" x2="'+(x-70)+'" y2="'+ay+'" stroke="var(--fig-b)" stroke-width="1.6"/>';
  s+='<path d="M'+(x-74)+' '+(ay-7)+' l4 7 l4 -7" fill="none" stroke="var(--fig-b)" stroke-width="1.6"/>';
  s+='<text x="4" y="'+((top+ay)/2)+'" font-family="monospace" font-size="9.5" fill="var(--fig-b)">feed =</text>';
  s+='<text x="4" y="'+((top+ay)/2+13)+'" font-family="monospace" font-size="9.5" fill="var(--fig-b)">pitch/turn</text>';
  return '<svg class="learn-svg" viewBox="0 0 340 '+(top+teeth*pitch+26)+'" role="img" aria-label="Thread pitch and synchronized tapping: one spindle revolution feeds the tap one pitch deeper">'
    + s
    + '<text x="14" y="'+(top+teeth*pitch+20)+'" font-family="monospace" font-size="8.5" fill="var(--text3)">rotation + downfeed locked: one revolution = one pitch deeper</text>'
    + '</svg>';
}

function learnSvgToolCall(){
  var T = 'font-family="monospace"';
  var CW = 7.2, FS = 12, Y = 121;                  // char width at 12px monospace, code baseline
  var toks = [
    {t:'TOOL CALL', c:'var(--text)'},
    {t:'2',      c:'var(--fig-a)', up:1, tier:0, anchor:'end',    l1:'tool number',   l2:'from tool table'},
    {t:'Z',      c:'var(--fig-a)', up:0, tier:0, anchor:'end',    l1:'spindle axis',  l2:'tool along Z'},
    {t:'S4000',  c:'var(--fig-b)', up:1, tier:1, anchor:'middle', l1:'spindle speed', l2:'rpm'},
    {t:'F400',   c:'var(--fig-b)', up:0, tier:1, anchor:'middle', l1:'feed rate',     l2:'mm/min'},
    {t:'DL+0.2', c:'var(--fig-c)', up:1, tier:0, anchor:'end',  l1:'delta length',  l2:'+0.2 mm longer'},
    {t:'DR-0.1', c:'var(--fig-c)', up:0, tier:0, anchor:'end',  l1:'delta radius',  l2:'0.1 mm smaller'}
  ];
  var chars = 0; toks.forEach(function(k){ chars += k.t.length; });
  var x = (340 - (chars + toks.length - 1) * CW) / 2, g = '', code = '';
  toks.forEach(function(k){
    var w = k.t.length * CW, cx = x + w / 2;
    code += '<text x="'+cx.toFixed(1)+'" y="'+Y+'" text-anchor="middle" '+T+' font-size="'+FS+'" font-weight="700" fill="'+k.c+'">'+k.t+'</text>';
    if(k.l1){
      // underline the token, then a leader with an arrowhead pointing at it
      var ty = k.up ? Y - 14 : Y + 6;             // token edge the arrow touches
      g += '<path d="M'+(x+1).toFixed(1)+' '+(k.up?Y-13:Y+5)+' H'+(x+w-1).toFixed(1)+'" stroke="'+k.c+'" stroke-width="1.2"/>';
      var ly = k.up ? (k.tier ? 20 : 60) : (k.tier ? 210 : 170);   // first label line
      var lx = k.anchor === 'end' ? (k.t.length > 1 ? x + w : cx + 4) : (k.anchor === 'start' ? cx - 4 : cx);
      var tip = k.up ? ty : ty, end = k.up ? ly + 19 : ly - 13;
      g += '<path d="M'+cx.toFixed(1)+' '+end+' V'+(k.up ? tip - 5 : tip + 5)+'" stroke="'+k.c+'" stroke-width="1"/>'
        + '<path d="M'+(cx-3.5).toFixed(1)+' '+(k.up ? tip-6 : tip+6)+' L'+cx.toFixed(1)+' '+tip+' L'+(cx+3.5).toFixed(1)+' '+(k.up ? tip-6 : tip+6)+' Z" fill="'+k.c+'"/>';
      var a = 'text-anchor="'+k.anchor+'" '+T+' font-size="10.5"';
      if(k.up){
        g += '<text x="'+lx.toFixed(1)+'" y="'+ly+'" '+a+' font-weight="700" fill="'+k.c+'">'+k.l1+'</text>'
          + '<text x="'+lx.toFixed(1)+'" y="'+(ly+13)+'" '+a+' fill="var(--text3)">'+k.l2+'</text>';
      } else {
        g += '<text x="'+lx.toFixed(1)+'" y="'+ly+'" '+a+' font-weight="700" fill="'+k.c+'">'+k.l1+'</text>'
          + '<text x="'+lx.toFixed(1)+'" y="'+(ly+13)+'" '+a+' fill="var(--text3)">'+k.l2+'</text>';
      }
    }
    x += w + CW;
  });
  return '<svg class="learn-svg" viewBox="0 0 340 232" role="img" aria-label="TOOL CALL 2 Z S4000 F400 DL+0.2 DR-0.1 with arrows: tool number, spindle axis, spindle speed in rpm, feed rate in mm/min, delta length and delta radius">'
    + '<rect x="14" y="99" width="312" height="32" rx="6" fill="var(--fig-fill)" fill-opacity=".08" stroke="var(--fig-line)" stroke-opacity=".6"/>'
    + code + g + '</svg>';
}

function learnSvgApproach(){
  return '<svg class="learn-svg" viewBox="0 0 340 160" role="img" aria-label="Safe tool approach: rapid movement above the blank, rapid to datum-safe Z plus 2, then feed below the surface">'
    + '<rect x="30" y="95" width="280" height="50" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<text x="270" y="126" font-family="monospace" font-size="10" fill="var(--text3)">blank</text>'
    + '<path d="M60 20 L170 20" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<path d="M170 20 L170 85" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<path d="M170 85 L170 120" stroke="var(--fig-b)" stroke-width="2.6" stroke-linecap="round"/>'
    + '<path d="M170 120 L250 120" stroke="var(--fig-b)" stroke-width="2.6" stroke-linecap="round"/>'
    + '<circle cx="60" cy="20" r="3" fill="var(--fig-a)"/>'
    + '<text x="182" y="24" font-family="monospace" font-size="10" fill="var(--text3)">FMAX high</text>'
    + '<line x1="150" y1="85" x2="150" y2="95" stroke="var(--fig-a)" stroke-width="1"/>'
    + '<circle cx="150" cy="85" r="3.5" fill="var(--fig-a)"/><text x="58" y="92" font-family="monospace" font-size="10" fill="var(--fig-a)">datum-safe Z+2</text>'
    + '<text x="182" y="108" font-family="monospace" font-size="10" fill="var(--fig-b)">FEED below surface</text>'
    + '</svg>';
}

function learnSvgComp(){
  return '<svg class="learn-svg" viewBox="0 0 340 170" role="img" aria-label="Radius compensation relative to motion direction: RL keeps the tool left and RR keeps it right">'
    + '<path d="M80 105 L80 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M76 35 L80 22 L84 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<text x="64" y="16" font-family="monospace" font-size="10" fill="var(--text)">motion</text>'
    + '<circle cx="55" cy="65" r="20" fill="var(--fig-b)" fill-opacity=".15" stroke="var(--fig-b)" stroke-width="1.6"/>'
    + '<circle cx="55" cy="65" r="2" fill="var(--fig-b)"/>'
    + '<text x="55" y="130" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-b)">RL · LEFT</text>'
    + '<path d="M230 105 L230 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M226 35 L230 22 L234 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<circle cx="255" cy="65" r="20" fill="var(--fig-c)" fill-opacity=".15" stroke="var(--fig-c)" stroke-width="1.6"/>'
    + '<circle cx="255" cy="65" r="2" fill="var(--fig-c)"/>'
    + '<text x="255" y="130" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-c)">RIGHT · RR</text>'
    + '<text x="170" y="160" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--text3)">LOOK ALONG THE DIRECTION OF MOTION</text>'
    + '</svg>';
}

function learnSvgCompPath(){
  var T = 'font-family="monospace"';
  return '<svg class="learn-svg" viewBox="0 0 340 274" role="img" aria-label="Programmed contour compared with compensated tool-centre paths for RL and RR">'
    + '<defs><marker id="lpCompArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="var(--fig-a)"/></marker></defs>'
    + '<rect x="172" y="34" width="138" height="212" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<text x="238" y="56" text-anchor="middle" '+T+' font-size="11" fill="var(--text3)">material</text>'
    + '<line x1="172" y1="26" x2="172" y2="254" stroke="var(--text)" stroke-width="2" stroke-dasharray="5 4"/>'
    + '<text x="178" y="268" '+T+' font-size="11" fill="var(--text)">programmed wall X+50</text>'
    + '<text x="16" y="12" '+T+' font-size="11" fill="var(--fig-a)">tool-centre path X+45</text>'
    + '<text x="16" y="26" '+T+' font-size="10.5" fill="var(--text3)">RL for motion in Y+</text>'
    + '<circle cx="132" cy="205" r="40" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)" stroke-width="1.5"/>'
    + '<circle cx="132" cy="105" r="40" fill="var(--fig-a)" fill-opacity=".04" stroke="var(--fig-a)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<line x1="132" y1="205" x2="132" y2="50" stroke="var(--fig-a)" stroke-width="3" marker-end="url(#lpCompArrow)"/>'
    + '<circle cx="132" cy="205" r="3.5" fill="var(--fig-a)"/>'
    + '<circle cx="132" cy="105" r="3" fill="var(--fig-a)"/>'
    + '<line x1="132" y1="205" x2="172" y2="205" stroke="var(--fig-b)" stroke-width="1.5"/>'
    + '<text x="145" y="198" '+T+' font-size="11" fill="var(--fig-b)">R5</text>'
    + '<circle cx="172" cy="205" r="3.5" fill="var(--fig-b)"/>'
    + '<text x="180" y="221" '+T+' font-size="10" fill="var(--fig-b)">contact stays at X+50</text>'
    + '</svg>';
}

function learnSvgCycle208(){
  var path = '', turns = 4, points = 128;
  for(var i=0; i<=points; i++){
    var t = i / points;
    var a = t * turns * Math.PI * 2;
    var x = 150 + Math.cos(a) * 48;
    var y = 48 + t * 118 + Math.sin(a) * 11;
    path += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return '<svg class="learn-svg" viewBox="0 0 340 245" role="img" aria-label="Cycle 208 bore milling path showing helical infeed, bore diameter and finishing depth">'
    + '<defs><marker id="lpHelixArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="var(--fig-a)"/></marker></defs>'
    + '<text x="14" y="14" font-family="monospace" font-size="11" fill="var(--text3)">SIDE VIEW</text>'
    + '<ellipse cx="150" cy="42" rx="108" ry="20" fill="var(--fig-fill)" fill-opacity=".08" stroke="var(--fig-line)"/>'
    + '<path d="M42 42 L42 205 M258 42 L258 205" stroke="var(--border)" stroke-width="1.2"/>'
    + '<path d="M42 205 A108 20 0 0 0 258 205" fill="none" stroke="var(--border)" stroke-width="1.2"/>'
    + '<path d="'+path+'" fill="none" stroke="var(--fig-b)" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="198" cy="48" r="5" fill="var(--fig-a)"/>'
    + '<text x="120" y="14" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--fig-b)">1 · HELICAL PLUNGE</text>'
    + '<path d="M204 46 L264 33" fill="none" stroke="var(--fig-a)" stroke-width="0.8"/><text x="268" y="27" font-family="monospace" font-size="11" fill="var(--fig-a)">start at</text><text x="268" y="40" font-family="monospace" font-size="11" fill="var(--fig-a)">Q200 +2</text>'
    + '<line x1="274" y1="55" x2="274" y2="164" stroke="var(--fig-a)" stroke-width="1.5" marker-end="url(#lpHelixArrow)"/>'
    + '<text x="282" y="112" font-family="monospace" font-size="11" fill="var(--fig-a)">Q201 -8</text>'
    + '<line x1="92" y1="75" x2="72" y2="106" stroke="var(--fig-b)" stroke-width="1"/>'
    + '<text x="12" y="118" font-family="monospace" font-size="11" fill="var(--fig-b)">Q334 = 2 mm</text>'
    + '<text x="12" y="132" font-family="monospace" font-size="10.5" fill="var(--text3)">per turn</text>'
    + '<ellipse cx="150" cy="174" rx="48" ry="11" fill="none" stroke="var(--fig-c)" stroke-width="1.5"/>'
    + '<ellipse cx="150" cy="187" rx="75" ry="14" fill="none" stroke="var(--fig-c)" stroke-width="1.7"/>'
    + '<ellipse cx="150" cy="202" rx="102" ry="18" fill="none" stroke="var(--fig-c)" stroke-width="2.2"/>'
    + '<text x="170" y="236" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--fig-c)">2 · FINISH RINGS widen to Q335 = Ø30</text>'
    + '</svg>';
}

function learnSvgSafeRetract(){
  return '<svg class="learn-svg" viewBox="0 0 340 220" role="img" aria-label="Safe retract sequence from machining depth to setup clearance and second setup clearance">'
    + '<rect x="25" y="110" width="290" height="85" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<line x1="25" y1="110" x2="315" y2="110" stroke="var(--fig-line)" stroke-width="1.5"/>'
    + '<text x="32" y="104" font-family="monospace" font-size="11" fill="var(--text3)">surface Z0</text>'
    + '<path d="M55 25 L125 25 L125 92" fill="none" stroke="var(--text3)" stroke-width="2" stroke-dasharray="5 4"/>'
    + '<path d="M125 92 L125 140 L245 140" fill="none" stroke="var(--fig-b)" stroke-width="3"/>'
    + '<path d="M245 140 L245 25" fill="none" stroke="var(--fig-a)" stroke-width="3"/>'
    + '<path d="M239 36 L245 24 L251 36" fill="var(--fig-a)"/>'
    + '<circle cx="55" cy="25" r="4" fill="var(--fig-a)"/>'
    + '<text x="38" y="16" font-family="monospace" font-size="11" fill="var(--text3)">1  FMAX high</text>'
    + '<text x="132" y="82" font-family="monospace" font-size="11" fill="var(--text3)">2  FMAX to Z+2</text>'
    + '<text x="132" y="132" font-family="monospace" font-size="11" fill="var(--fig-b)">3  FEED to Z-3</text>'
    + '<text x="160" y="157" font-family="monospace" font-size="11" fill="var(--fig-b)">4  cut X+20 → X+80</text>'
    + '<text x="252" y="62" font-family="monospace" font-size="11" fill="var(--fig-a)">5  FMAX up</text>'
    + '<text x="252" y="77" font-family="monospace" font-size="10.5" fill="var(--text3)">known clear</text><text x="252" y="91" font-family="monospace" font-size="10.5" fill="var(--text3)">path</text>'
    + '</svg>';
}

function learnSvgArcCRCompare(){
  return '<svg class="learn-svg" viewBox="0 0 340 184" role="img" aria-label="Two semicircular CR moves between the same endpoints, comparing DR minus and DR plus directions">'
    + '<rect x="5" y="6" width="162" height="172" rx="9" fill="var(--fig-c)" fill-opacity=".08" stroke="var(--fig-c)"/>'
    + '<text x="86" y="23" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-c)">R−15 · DR−</text>'
    + '<path d="M77.3 30.8 A50 50 0 0 1 94.7 30.8" fill="none" stroke="var(--fig-c)" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M0 -2.8 L6.5 0 L0 2.8 Z" transform="translate(94.7 30.8) rotate(10)" fill="var(--fig-c)"/>'
    + '<path d="M36 91 A50 50 0 0 1 136 91" fill="none" stroke="var(--fig-c)" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="36" cy="91" r="6" fill="var(--bg)" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<text x="36" y="94" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-a)">1</text>'
    + '<circle cx="136" cy="91" r="6" fill="var(--bg)" stroke="var(--fig-c)" stroke-width="2"/>'
    + '<text x="136" y="94" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-c)">2</text>'
    + '<rect x="13" y="113" width="146" height="27" rx="7" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)"/>'
    + '<text x="86" y="130" text-anchor="middle" font-family="monospace" font-size="8.4" font-weight="700" fill="var(--fig-a)">1 · L X+0 Y+0</text>'
    + '<rect x="13" y="147" width="146" height="27" rx="7" fill="var(--fig-c)" fill-opacity=".08" stroke="var(--fig-c)"/>'
    + '<text x="86" y="164" text-anchor="middle" font-family="monospace" font-size="7.4" font-weight="700" fill="var(--fig-c)">2 · CR X+30 Y+0 R-15 DR-</text>'
    + '<rect x="173" y="6" width="162" height="172" rx="9" fill="var(--fig-fill)" fill-opacity=".08" stroke="var(--fig-line)"/>'
    + '<text x="254" y="23" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-b)">R+15 · DR+</text>'
    + '<path d="M262.7 30.8 A50 50 0 0 0 245.3 30.8" fill="none" stroke="var(--fig-b)" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M0 -2.8 L6.5 0 L0 2.8 Z" transform="translate(245.3 30.8) rotate(170)" fill="var(--fig-b)"/>'
    + '<path d="M204 91 A50 50 0 0 1 304 91" fill="none" stroke="var(--fig-b)" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="204" cy="91" r="6" fill="var(--bg)" stroke="var(--fig-c)" stroke-width="2"/>'
    + '<text x="204" y="94" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-c)">2</text>'
    + '<circle cx="304" cy="91" r="6" fill="var(--bg)" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<text x="304" y="94" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-a)">1</text>'
    + '<rect x="181" y="113" width="146" height="27" rx="7" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)"/>'
    + '<text x="254" y="130" text-anchor="middle" font-family="monospace" font-size="8.4" font-weight="700" fill="var(--fig-a)">1 · L X+0 Y+0</text>'
    + '<rect x="181" y="147" width="146" height="27" rx="7" fill="var(--fig-c)" fill-opacity=".08" stroke="var(--fig-c)"/>'
    + '<text x="254" y="164" text-anchor="middle" font-family="monospace" font-size="7.4" font-weight="700" fill="var(--fig-c)">2 · CR X-30 Y+0 R+15 DR+</text>'
    + '</svg>';
}

function learnSvgRndDetail(){
  return '<svg class="learn-svg" viewBox="0 0 340 180" role="img" aria-label="RND corner rounding detail showing the original sharp corner, tangent points and programmed radius">'
    + '<path d="M35 135 L145 135 L145 25" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-dasharray="5 4"/>'
    + '<path d="M35 135 L115 135 A30 30 0 0 0 145 105 L145 25" fill="none" stroke="var(--fig-b)" stroke-width="3"/>'
    + '<circle cx="115" cy="135" r="4" fill="var(--fig-a)"/><circle cx="145" cy="105" r="4" fill="var(--fig-a)"/>'
    + '<circle cx="115" cy="105" r="3" fill="var(--text3)"/>'
    + '<line x1="115" y1="105" x2="136" y2="126" stroke="var(--fig-a)"/>'
    + '<text x="108" y="124" text-anchor="end" font-family="monospace" font-size="12" fill="var(--fig-a)">R10</text>'
    + '<text x="164" y="77" font-family="monospace" font-size="11" fill="var(--text3)">tangent point</text>'
    + '<line x1="160" y1="80" x2="148" y2="103" stroke="var(--text3)"/>'
    + '<text x="170" y="158" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">RND replaces the sharp corner</text>'
    + '<text x="170" y="173" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">between two straight moves</text>'
    + '</svg>';
}

function learnSvgChfDetail(){
  return '<svg class="learn-svg" viewBox="0 0 340 180" role="img" aria-label="CHF corner chamfer detail showing the original sharp corner and equal chamfer distances">'
    + '<path d="M35 135 L145 135 L145 25" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-dasharray="5 4"/>'
    + '<path d="M35 135 L105 135 L145 95 L145 25" fill="none" stroke="var(--fig-c)" stroke-width="3"/>'
    + '<circle cx="105" cy="135" r="4" fill="var(--fig-a)"/><circle cx="145" cy="95" r="4" fill="var(--fig-a)"/>'
    + '<line x1="105" y1="150" x2="145" y2="150" stroke="var(--fig-a)"/>'
    + '<line x1="105" y1="145" x2="105" y2="155" stroke="var(--fig-a)"/><line x1="145" y1="145" x2="145" y2="155" stroke="var(--fig-a)"/>'
    + '<text x="125" y="168" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-a)">8</text>'
    + '<line x1="160" y1="95" x2="160" y2="135" stroke="var(--fig-a)"/>'
    + '<line x1="155" y1="95" x2="165" y2="95" stroke="var(--fig-a)"/><line x1="155" y1="135" x2="165" y2="135" stroke="var(--fig-a)"/>'
    + '<text x="168" y="119" font-family="monospace" font-size="11" fill="var(--fig-a)">8</text>'
    + '<text x="190" y="111" font-family="monospace" font-size="12" fill="var(--fig-c)">CHF 8</text>'
    + '<text x="190" y="128" font-family="monospace" font-size="10.5" fill="var(--text3)">cuts 8 mm from</text>'
    + '<text x="190" y="142" font-family="monospace" font-size="10.5" fill="var(--text3)">each side</text>'
    + '</svg>';
}

function learnSvgPeckDrill(){
  return '<svg class="learn-svg" viewBox="0 0 340 235" role="img" aria-label="Peck drilling cycle showing setup clearance, repeated plunging depths and total drilling depth">'
    + '<rect x="35" y="82" width="270" height="130" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<line x1="35" y1="82" x2="305" y2="82" stroke="var(--fig-line)" stroke-width="1.5"/>'
    + '<line x1="85" y1="28" x2="270" y2="28" stroke="var(--text3)" stroke-dasharray="5 4"/>'
    + '<text x="220" y="18" font-family="monospace" font-size="10.5" fill="var(--text3)">Q204 final retract</text>'
    + '<line x1="150" y1="55" x2="190" y2="55" stroke="var(--fig-a)"/>'
    + '<text x="198" y="59" font-family="monospace" font-size="11" fill="var(--fig-a)">Q200 +2</text>'
    + '<path d="M170 55 L170 112 L184 92 L184 143 L198 112 L198 174 L212 143 L212 202" fill="none" stroke="var(--fig-b)" stroke-width="3"/>'
    + '<path d="M207 192 L212 204 L217 192" fill="var(--fig-b)"/>'
    + '<line x1="158" y1="112" x2="170" y2="112" stroke="var(--fig-a)" stroke-dasharray="3 3"/>'
    + '<line x1="158" y1="143" x2="184" y2="143" stroke="var(--fig-a)" stroke-dasharray="3 3"/>'
    + '<line x1="158" y1="174" x2="198" y2="174" stroke="var(--fig-a)" stroke-dasharray="3 3"/>'
    + '<text x="47" y="146" font-family="monospace" font-size="11" fill="var(--fig-a)">Q202 pecks</text>'
    + '<text x="47" y="162" font-family="monospace" font-size="10.5" fill="var(--text3)">down → chip-clear</text>'
    + '<text x="47" y="176" font-family="monospace" font-size="10.5" fill="var(--text3)">retract → deeper</text>'
    + '<line x1="225" y1="82" x2="225" y2="202" stroke="var(--text)"/>'
    + '<text x="232" y="150" font-family="monospace" font-size="11" fill="var(--text)">Q201 depth</text>'
    + '<text x="36" y="76" font-family="monospace" font-size="10.5" fill="var(--text3)">Q203 surface Z</text>'
    + '</svg>';
}

function learnSvgCounterboreClear(){
  return '<svg class="learn-svg" viewBox="0 0 340 246" role="img" aria-label="Counterbore cross-section showing head diameter Q335, depth Q201 and through-hole diameter Q342">'
    + '<defs><pattern id="lpHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--fig-line)" stroke-opacity=".3" stroke-width="2"/></pattern></defs>'
    + '<path d="M25 55 H132 V105 H154 V205 H25 Z M315 55 H208 V105 H186 V205 H315 Z" fill="url(#lpHatch)" stroke="var(--fig-line)" stroke-width="1.5"/>'
    + '<path d="M136 58 H204 V100 H190 V104 H150 V100 H136 Z" fill="rgba(139,147,161,.18)" stroke="var(--text3)" stroke-dasharray="4 3"/>'
    + '<text x="170" y="15" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--text)">counterbore for screw head</text>'
    + '<line x1="132" y1="42" x2="208" y2="42" stroke="var(--fig-a)"/>'
    + '<line x1="132" y1="36" x2="132" y2="48" stroke="var(--fig-a)"/><line x1="208" y1="36" x2="208" y2="48" stroke="var(--fig-a)"/>'
    + '<text x="170" y="37" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-a)">Q335 = Ø11</text>'
    + '<line x1="224" y1="55" x2="224" y2="105" stroke="var(--fig-a)"/>'
    + '<line x1="218" y1="55" x2="230" y2="55" stroke="var(--fig-a)"/><line x1="218" y1="105" x2="230" y2="105" stroke="var(--fig-a)"/>'
    + '<text x="234" y="83" font-family="monospace" font-size="11" fill="var(--fig-a)">Q201 = −6</text>'
    + '<line x1="154" y1="222" x2="186" y2="222" stroke="var(--text)"/>'
    + '<line x1="154" y1="216" x2="154" y2="228" stroke="var(--text)"/><line x1="186" y1="216" x2="186" y2="228" stroke="var(--text)"/>'
    + '<text x="170" y="242" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text)">Q342 = Ø6.6 THRU</text>'
    + '<text x="35" y="72" font-family="monospace" font-size="10.5" fill="var(--text3)">material</text>'
    + '</svg>';
}

function learnSvgThreadCycle(){
  return '<svg class="learn-svg" viewBox="0 0 340 230" role="img" aria-label="Cycle 209 tapping: Q239 synchronizes pitch, Q257 sets chip-break depth and Q256 sets retract as a factor of pitch">'
    + '<text x="78" y="18" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">PITCH SYNCHRONISATION</text>'
    + '<path d="M35 38 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9" fill="none" stroke="var(--fig-b)" stroke-width="2"/>'
    + '<path d="M81 38 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9" fill="none" stroke="var(--fig-b)" stroke-width="2"/>'
    + '<path d="M99 56 V74 M93 56 H105 M93 74 H105" fill="none" stroke="var(--fig-a)"/>'
    + '<text x="110" y="64" font-family="monospace" font-size="10.5" fill="var(--fig-a)">Q239</text>'
    + '<text x="110" y="78" font-family="monospace" font-size="10.5" fill="var(--fig-a)">pitch</text>'
    + '<text x="78" y="159" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">1 turn = 1 pitch deeper</text>'
    + '<line x1="158" y1="24" x2="158" y2="205" stroke="var(--border)"/>'
    + '<text x="250" y="18" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">CHIP BREAKING</text>'
    + '<path d="M206 40 L206 104 L222 96 L222 158 L238 150 L238 207" fill="none" stroke="var(--fig-c)" stroke-width="3"/>'
    + '<path d="M233 197 L238 209 L243 197" fill="var(--fig-c)"/>'
    + '<path d="M194 40 V104 M190 40 H198 M190 104 H198" fill="none" stroke="var(--fig-a)"/>'
    + '<text x="162" y="70" font-family="monospace" font-size="9.5" fill="var(--fig-a)">Q257</text>'
    + '<text x="162" y="84" font-family="monospace" font-size="9.5" fill="var(--text3)">4 mm</text>'
    + '<line x1="222" y1="96" x2="250" y2="96" stroke="var(--fig-a)"/>'
    + '<text x="254" y="100" font-family="monospace" font-size="11" fill="var(--fig-a)">Q256</text>'
    + '<text x="336" y="114" text-anchor="end" font-family="monospace" font-size="10.5" fill="var(--text3)">0.5 x pitch back</text>'
    + '<text x="176" y="224" font-family="monospace" font-size="10.5" fill="var(--text3)">repeat until Q201 depth</text>'
    + '</svg>';
}

function learnSvgLblFlow(){
  return '<svg class="learn-svg" viewBox="0 0 340 210" role="img" aria-label="LBL flow: the labeled body runs where written, then CALL LBL runs the same body again">'
    + '<rect x="12" y="20" width="194" height="132" rx="8" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)"/>'
    + '<text x="26" y="44" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-b)">LBL 1</text>'
    + '<text x="26" y="69" font-family="monospace" font-size="10.5" fill="var(--text)">L X+30 Y+30 FMAX M99</text>'
    + '<text x="26" y="92" font-family="monospace" font-size="10.5" fill="var(--text)">L X+70 Y+30 FMAX M99</text>'
    + '<text x="26" y="117" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-b)">LBL 0</text>'
    + '<text x="26" y="140" font-family="monospace" font-size="9.5" fill="var(--text3)">1 · runs where written</text>'
    + '<rect x="218" y="32" width="110" height="66" rx="8" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)"/>'
    + '<text x="273" y="58" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-a)">CALL LBL 1</text>'
    + '<text x="273" y="80" text-anchor="middle" font-family="monospace" font-size="8.5" fill="var(--text3)">2 · runs again</text>'
    + '<path d="M273 102 C273 169 124 183 113 157" fill="none" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<path d="M106 167 L113 154 L121 166" fill="var(--fig-a)"/>'
    + '<text x="170" y="202" text-anchor="middle" font-family="monospace" font-size="9.7" fill="var(--text3)">active tool/cycle changes · stored XY stays</text>'
    + '</svg>';
}

function learnSvgPrecisionChain(){
  return '<svg class="learn-svg" viewBox="0 0 340 205" role="img" aria-label="Precision hole sequence: spot drill, drill through, then ream the final allowance to diameter 7 H7">'
    + '<text x="55" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-a)">1  SPOT T3</text>'
    + '<path d="M25 65 H85 L70 80 H40 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/><path d="M48 65 L55 76 L62 65" fill="none" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<text x="55" y="101" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">guides drill</text>'
    + '<text x="170" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-b)">2  DRILL T4</text>'
    + '<path d="M130 65 H210 V155 H130 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/><rect x="156" y="65" width="28" height="90" fill="rgba(255,255,255,.04)" stroke="var(--fig-b)"/>'
    + '<text x="170" y="176" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Ø6.8 through</text>'
    + '<text x="285" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-c)">3  REAM T6</text>'
    + '<path d="M245 65 H325 V155 H245 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/><rect x="265" y="65" width="40" height="90" fill="rgba(255,255,255,.04)" stroke="none"/>'
    + '<path d="M265 65 H271 V155 H265 Z M299 65 H305 V155 H299 Z" fill="var(--fig-a)" fill-opacity=".45"/><path d="M271 65 V155 M299 65 V155" fill="none" stroke="var(--fig-b)" stroke-dasharray="3 3"/><path d="M265 65 V155 M305 65 V155" fill="none" stroke="var(--fig-a)" stroke-width="2.2"/>'
    + '<text x="285" y="176" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">last 0.2 → Ø7 H7</text>'
    + '<path d="M92 112 H120 M218 112 H238" stroke="var(--text3)" stroke-width="2"/>'
    + '<path d="M111 106 l10 6 l-10 6 M229 106 l10 6 l-10 6" fill="none" stroke="var(--text3)" stroke-width="2"/>'
    + '<text x="170" y="199" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">same XY positions reused by LBL 1</text>'
    + '</svg>';
}

function learnSvgChamferMethods(){
  return '<svg class="learn-svg" viewBox="0 0 340 235" role="img" aria-label="Two chamfer methods: dip a countersink with Cycle 200 for a small hole, or orbit the rim with Cycle 208 for a large bore">'
    + '<text x="82" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-b)">SMALL HOLE</text>'
    + '<text x="82" y="36" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Cycle 200 · dip</text>'
    + '<path d="M20 105 H62 L72 115 V198 H20 Z M144 105 H102 L92 115 V198 H144 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<path d="M22 65 H142 L82 125 Z" fill="rgba(139,147,161,.12)" stroke="var(--text3)" stroke-width="1.3"/>'
    + '<path d="M62 105 L72 115 M102 105 L92 115" fill="none" stroke="var(--fig-b)" stroke-width="3"/>'
    + '<path d="M70 113 A17 17 0 0 1 94 113" fill="none" stroke="var(--fig-a)" stroke-width="1.4"/>'
    + '<text x="82" y="107" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--fig-a)">90°</text>'
    + '<path d="M82 45 V94 M82 114 V125" stroke="var(--fig-b)" stroke-width="1.8"/>'
    + '<path d="M77 114 L82 126 L87 114" fill="var(--fig-b)"/>'
    + '<text x="82" y="222" text-anchor="middle" font-family="monospace" font-size="10" fill="var(--fig-b)">finished 1 x 45° edges</text>'
    + '<line x1="170" y1="15" x2="170" y2="225" stroke="var(--border)"/>'
    + '<text x="255" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-c)">LARGE BORE</text>'
    + '<text x="255" y="36" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Cycle 208 · orbit rim</text>'
    + '<path d="M190 105 H220 L235 120 V198 H190 Z M320 105 H290 L275 120 V198 H320 Z" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<path d="M220 105 L235 120 M290 105 L275 120" fill="none" stroke="var(--fig-c)" stroke-width="3"/>'
    + '<ellipse cx="255" cy="101" rx="52" ry="18" fill="none" stroke="var(--fig-c)" stroke-width="2.5"/>'
    + '<path d="M301 93 l8 4 l-7 5" fill="none" stroke="var(--fig-c)" stroke-width="2"/>'
    + '<path d="M210 65 H330 L270 125 Z" fill="rgba(139,147,161,.12)" stroke="var(--text3)" stroke-width="1.3"/>'
    + '<path d="M290 105 L275 120" fill="none" stroke="var(--fig-a)" stroke-width="3.2" stroke-linecap="round"/>'
    + '<text x="270" y="99" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--fig-a)">90°</text>'
    + '<text x="255" y="222" text-anchor="middle" font-family="monospace" font-size="10" fill="var(--fig-c)">same chamfer follows rim</text>'
    + '</svg>';
}

function learnSvgFinalPasses(){
  return '<svg class="learn-svg" viewBox="0 0 340 190" role="img" aria-label="One profile machined in two passes: milling at Q1 zero, then chamfering the same XY profile at Q1 plus 4">'
    + '<rect x="18" y="28" width="132" height="108" rx="8" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)"/>'
    + '<text x="84" y="49" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-b)">PASS 1 · MILL</text>'
    + '<text x="32" y="72" font-family="monospace" font-size="11" fill="var(--text)">T1</text>'
    + '<text x="32" y="91" font-family="monospace" font-size="11" fill="var(--text)">Q1 = 0</text>'
    + '<text x="32" y="112" font-family="monospace" font-size="10.5" fill="var(--text3)">LBL body runs</text>'
    + '<text x="32" y="127" font-family="monospace" font-size="10.5" fill="var(--text3)">where defined</text>'
    + '<path d="M158 82 H182" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<path d="M173 76 l10 6 l-10 6" fill="none" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<rect x="190" y="28" width="132" height="108" rx="8" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)"/>'
    + '<text x="256" y="49" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-a)">PASS 2 · CHAMFER</text>'
    + '<text x="204" y="72" font-family="monospace" font-size="11" fill="var(--text)">T5 DL−2 DR+2</text>'
    + '<text x="204" y="91" font-family="monospace" font-size="11" fill="var(--text)">Q1 = +4</text>'
    + '<text x="204" y="112" font-family="monospace" font-size="10.5" fill="var(--text3)">CALL LBL 1</text>'
    + '<text x="204" y="127" font-family="monospace" font-size="10.5" fill="var(--text3)">same XY profile</text>'
    + '<text x="170" y="160" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-c)">one profile · two tools · one depth variable</text>'
    + '<text x="170" y="178" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Q1 changes only the Z level</text>'
    + '</svg>';
}

function learnSvgCorner(){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img" aria-label="Corner comparison: RND replaces a sharp corner with a radius, while CHF replaces it with equal straight offsets">'
    + '<path d="M20 110 L85 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M115 80 L115 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M85 110 A30 30 0 0 0 115 80" stroke="var(--fig-b)" stroke-width="2.4" fill="none"/>'
    + '<circle cx="85" cy="110" r="3" fill="var(--fig-b)"/><circle cx="115" cy="80" r="3" fill="var(--fig-b)"/>'
    + '<path d="M85 110 L115 110 L115 80" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
    + '<circle cx="85" cy="80" r="2.5" fill="var(--text3)"/><line x1="85" y1="80" x2="106.2" y2="101.2" stroke="var(--fig-a)" stroke-width="1.2"/>'
    + '<text x="79" y="98" text-anchor="end" font-family="monospace" font-size="11" fill="var(--fig-a)">R10</text>'
    + '<text x="30" y="135" font-family="monospace" font-size="12" fill="var(--fig-b)">RND R10</text>'
    + '<path d="M195 110 L252 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M280 82 L280 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M252 110 L280 82" stroke="var(--fig-c)" stroke-width="2.4"/>'
    + '<circle cx="252" cy="110" r="3" fill="var(--fig-c)"/><circle cx="280" cy="82" r="3" fill="var(--fig-c)"/>'
    + '<path d="M252 110 L280 110 L280 82" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
    + '<text x="250" y="128" font-family="monospace" font-size="10" fill="var(--text3)">8</text>'
    + '<text x="286" y="100" font-family="monospace" font-size="10" fill="var(--text3)">8</text>'
    + '<text x="205" y="135" font-family="monospace" font-size="12" fill="var(--fig-c)">CHF 8</text>'
    + '<text x="20" y="16" font-family="monospace" font-size="9.5" fill="var(--text3)">dashed = the sharp corner that gets replaced</text>'
    + '</svg>';
}

function learnSvgDrawing(){
  function dim(x1,y1,x2,y2,txt,tx,ty){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+x1+'" y1="'+(y1-3)+'" x2="'+x1+'" y2="'+(y1+3)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+x2+'" y1="'+(y2-3)+'" x2="'+x2+'" y2="'+(y2+3)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<text x="'+tx+'" y="'+ty+'" font-family="monospace" font-size="9.5" fill="var(--fig-a)" text-anchor="middle">'+txt+'</text>';
  }
  var g = '';
  // blank 100x100 -> 220px, scale 2.2, origin (60,250)
  function X(v){ return 60 + v*2.2; }
  function Y(v){ return 264 - v*2.2; }
  g += '<rect x="'+X(0)+'" y="'+Y(100)+'" width="220" height="220" fill="none" stroke="var(--text3)" stroke-width="1.2"/>';
  // contour 80x80 R10
  g += '<rect x="'+X(10)+'" y="'+Y(90)+'" width="176" height="176" rx="22" fill="var(--fig-b)" fill-opacity=".06" stroke="var(--fig-b)" stroke-width="1.6"/>';
  // 4 holes at 25/75
  var hp = [[25,25],[75,25],[75,75],[25,75]];
  for(var i=0;i<hp.length;i++){
    g += '<circle cx="'+X(hp[i][0])+'" cy="'+Y(hp[i][1])+'" r="7.5" fill="none" stroke="var(--text)" stroke-width="1.3"/>'
      + '<line x1="'+(X(hp[i][0])-11)+'" y1="'+Y(hp[i][1])+'" x2="'+(X(hp[i][0])+11)+'" y2="'+Y(hp[i][1])+'" stroke="var(--text3)" stroke-width="0.6"/>'
      + '<line x1="'+X(hp[i][0])+'" y1="'+(Y(hp[i][1])-11)+'" x2="'+X(hp[i][0])+'" y2="'+(Y(hp[i][1])+11)+'" stroke="var(--text3)" stroke-width="0.6"/>';
  }
  // centre pocket D30
  g += '<circle cx="'+X(50)+'" cy="'+Y(50)+'" r="33" fill="var(--fig-c)" fill-opacity=".07" stroke="var(--fig-c)" stroke-width="1.6"/>'
    + '<line x1="'+(X(50)-40)+'" y1="'+Y(50)+'" x2="'+(X(50)+40)+'" y2="'+Y(50)+'" stroke="var(--text3)" stroke-width="0.6"/>'
    + '<line x1="'+X(50)+'" y1="'+(Y(50)-40)+'" x2="'+X(50)+'" y2="'+(Y(50)+40)+'" stroke="var(--text3)" stroke-width="0.6"/>';
  // dimensions
  g += dim(X(0), 306, X(100), 306, '100', (X(0)+X(100))/2, 319);
  g += dim(X(10), 284, X(90), 284, '80', (X(10)+X(90))/2, 297);
  g += dim(X(25), 33, X(75), 33, '50', (X(25)+X(75))/2, 27);
  g += '<line x1="'+X(25)+'" y1="33" x2="'+X(25)+'" y2="'+Y(75)+'" stroke="var(--fig-a)" stroke-width="0.5" stroke-dasharray="3 3"/>';
  g += '<line x1="'+X(75)+'" y1="33" x2="'+X(75)+'" y2="'+Y(75)+'" stroke="var(--fig-a)" stroke-width="0.5" stroke-dasharray="3 3"/>';
  // callouts
  g += '<line x1="'+(X(75)+8)+'" y1="'+(Y(75)-3)+'" x2="284" y2="'+(Y(75)-5)+'" stroke="var(--text3)" stroke-width="0.6"/>'
    + '<text x="287" y="'+(Y(75)-3)+'" font-family="monospace" font-size="9.5" fill="var(--text)">4x \u00d86.8</text>'
    + '<text x="287" y="'+(Y(75)+10)+'" font-family="monospace" font-size="9.5" fill="var(--text)">THRU</text>';
  g += '<text x="'+X(50)+'" y="'+(Y(50)+57)+'" font-family="monospace" font-size="9.5" fill="var(--fig-c)" text-anchor="middle">\u00d830 \u2193 8</text>';
  g += '<text x="'+X(50)+'" y="'+(Y(90)+18)+'" text-anchor="middle" font-family="monospace" font-size="9.5" fill="var(--fig-b)">R10 \u00b7 \u2193 3</text>';
  g += '<text x="'+X(0)+'" y="11" font-family="monospace" font-size="9" fill="var(--text3)">blank 100 x 100 x 25 \u00b7 top Z+0</text>';
  return '<svg class="learn-svg" viewBox="0 0 340 326" role="img" aria-label="Top drawing of a 100 by 100 blank with an 80 by 80 rounded contour, four through holes and a central pocket">'+g+'</svg>';
}

function learnSvgPartProfile(){
  function X(v){ return 70 + v*2.2; }
  function Y(v){ return 250 - v*2.2; }
  function dimH(x1,x2,y,txt,ty){
    return '<line x1="'+X(x1)+'" y1="'+y+'" x2="'+X(x2)+'" y2="'+y+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+X(x1)+'" y1="'+(y-3)+'" x2="'+X(x1)+'" y2="'+(y+3)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+X(x2)+'" y1="'+(y-3)+'" x2="'+X(x2)+'" y2="'+(y+3)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<text x="'+((X(x1)+X(x2))/2)+'" y="'+(ty)+'" font-family="monospace" font-size="9.5" fill="var(--fig-a)" text-anchor="middle">'+txt+'</text>';
  }
  function dimV(y1,y2,x,txt,tx){
    var my=(Y(y1)+Y(y2))/2+3;
    return '<line x1="'+x+'" y1="'+Y(y1)+'" x2="'+x+'" y2="'+Y(y2)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+(x-3)+'" y1="'+Y(y1)+'" x2="'+(x+3)+'" y2="'+Y(y1)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<line x1="'+(x-3)+'" y1="'+Y(y2)+'" x2="'+(x+3)+'" y2="'+Y(y2)+'" stroke="var(--fig-a)" stroke-width="0.8"/>'
      + '<text x="'+tx+'" y="'+my+'" font-family="monospace" font-size="9.5" fill="var(--fig-a)" text-anchor="middle" transform="rotate(-90 '+tx+' '+my+')">'+txt+'</text>';
  }
  var r = 15*2.2;
  var g = '';
  // blank 100x100 (dashed)
  g += '<rect x="'+X(0)+'" y="'+Y(100)+'" width="'+(100*2.2)+'" height="'+(100*2.2)+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="4 3"/>';
  g += '<circle cx="'+X(0)+'" cy="'+Y(0)+'" r="3.5" fill="var(--fig-a)"/><text x="'+(X(0)-8)+'" y="'+(Y(0)+13)+'" text-anchor="end" font-family="monospace" font-size="9" fill="var(--fig-a)">datum 0,0</text>';
  // profile 90x90: R15 top-left (convex, sweep=1), 15x45 chamfer bottom-right
  var p = 'M '+X(5)+' '+Y(5)
        + ' L '+X(5)+' '+Y(80)
        + ' A '+r+' '+r+' 0 0 1 '+X(20)+' '+Y(95)
        + ' L '+X(95)+' '+Y(95)
        + ' L '+X(95)+' '+Y(20)
        + ' L '+X(80)+' '+Y(5)
        + ' Z';
  g += '<path d="'+p+'" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)" stroke-width="1.8"/>';
  // dimensions
  g += dimH(5, 95, 268, '90', 264);
  g += dimV(5, 95, 38, '90', 30);
  g += dimH(0, 100, 286, '100 blank', 298);
  g += '<text x="'+(X(5)+5)+'" y="'+(Y(5)-8)+'" font-family="monospace" font-size="9" fill="var(--fig-a)">X5 Y5</text>';
  g += '<text x="'+(X(95)-5)+'" y="'+(Y(95)+14)+'" text-anchor="end" font-family="monospace" font-size="9" fill="var(--fig-a)">X95 Y95</text>';
  // R15 callout (inside, near the fillet)
  g += '<text x="'+(X(24))+'" y="'+(Y(84))+'" font-family="monospace" font-size="9.5" fill="var(--fig-b)">R15</text>';
  // chamfer callout with a leader line so it does not sit on the chamfer edge
  var cmx=(X(95)+X(80))/2, cmy=(Y(20)+Y(5))/2;
  g += '<line x1="'+cmx+'" y1="'+cmy+'" x2="'+X(102)+'" y2="'+(Y(12))+'" stroke="var(--fig-b)" stroke-width="0.5"/>';
  g += '<text x="'+X(103)+'" y="'+(Y(12)+3)+'" font-family="monospace" font-size="9.5" fill="var(--fig-b)">15x45\u00b0</text>';
  g += '<text x="'+X(50)+'" y="'+Y(50)+'" font-family="monospace" font-size="10" fill="var(--text2)" text-anchor="middle">profile</text>';
  g += '<text x="'+X(0)+'" y="'+(Y(100)-9)+'" font-family="monospace" font-size="9" fill="var(--text3)">blank 100 x 100 \u00b7 top Z+5 \u00b7 floor Z0</text>';
  return '<svg class="learn-svg" viewBox="0 0 350 300" role="img" aria-label="Lesson part profile on a 100 by 100 blank: datum at zero zero, 90 by 90 profile from X5 Y5 to X95 Y95, R15 corner and 15 by 45-degree chamfer">'+g+'</svg>';
}

function learnSvgPolar(){
  var cx=140, cy=100, R=64;
  var ang = 40*Math.PI/180;
  var px=(cx+R*Math.cos(ang)).toFixed(1), py=(cy-R*Math.sin(ang)).toFixed(1);
  var r2=32;
  var ax1=(cx+r2*Math.cos(ang)).toFixed(1), ay1=(cy-r2*Math.sin(ang)).toFixed(1);
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img" aria-label="Polar coordinates from CC: radius PR locates the point and angle PA is measured from positive X">'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R+34)+'" y2="'+cy+'" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+R+38)+'" y="'+(cy+4)+'" font-family="monospace" font-size="10" fill="var(--text3)">X+</text>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="22" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+7)+'" y="25" font-family="monospace" font-size="10" fill="var(--text3)">Y+</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--fig-b)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--fig-b)" stroke-width="1.2"/>'
    + '<path d="M '+(cx-3)+' '+(cy+4)+' l -6 1 l 2 5" fill="none" stroke="var(--fig-b)" stroke-width="1.2"/>'
    + '<text x="14" y="174" font-family="monospace" font-size="11" fill="var(--fig-b)">CC X+50 Y+40</text>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+px+'" y2="'+py+'" stroke="var(--fig-c)" stroke-width="2.2"/>'
    + '<circle cx="'+px+'" cy="'+py+'" r="4.5" fill="var(--fig-c)"/>'
    + '<text x="'+(parseFloat(px)+10)+'" y="'+(parseFloat(py)-8)+'" font-family="monospace" font-size="11" fill="var(--fig-c)">the hole</text>'
    + '<text x="'+(cx+29.1)+'" y="'+(cy-38.9)+'" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--fig-c)" transform="rotate(-40 '+(cx+29.1)+' '+(cy-24.4)+')">PR+25</text>'
    + '<path d="M '+(cx+r2)+' '+cy+' A '+r2+' '+r2+' 0 0 0 '+ax1+' '+ay1+'" fill="none" stroke="var(--fig-a)" stroke-width="1.6"/>'
    + '<path d="M '+ax1+' '+ay1+' l 8 0 l -5 6" fill="none" stroke="var(--fig-a)" stroke-width="1.6"/>'
    + '<text x="'+(cx+8)+'" y="'+(cy+20)+'" font-family="monospace" font-size="12" fill="var(--fig-a)">PA+40</text>'
    + '<text x="20" y="192" font-family="monospace" font-size="9.5" fill="var(--text3)">angle PA runs counter-clockwise from the X+ axis</text>'
    + '</svg>';
}

function learnSvgBoltCircle(){
  var cx=150, cy=100, R=64;
  function pt(a){ var r=a*Math.PI/180; return [(cx+R*Math.cos(r)).toFixed(1), (cy-R*Math.sin(r)).toFixed(1)]; }
  var p0=pt(0), p120=pt(120), p240=pt(240);
  var g = '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R+30)+'" y2="'+cy+'" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+R+34)+'" y="'+(cy+4)+'" font-family="monospace" font-size="10" fill="var(--text3)">X+</text>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="22" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+7)+'" y="25" font-family="monospace" font-size="10" fill="var(--text3)">Y+</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--fig-b)"/>'
    + '<line x1="'+cx+'" y1="'+(cy+4)+'" x2="'+cx+'" y2="178" stroke="var(--fig-b)" stroke-width="1.2"/>';
  // radius lines to each hole; PR label on the first
  [[p0,'PA+0','1',10,20],[p120,'PA+120','2',-72,-10],[p240,'PA+240','3',-76,18]].forEach(function(h){
    g += '<line x1="'+cx+'" y1="'+cy+'" x2="'+h[0][0]+'" y2="'+h[0][1]+'" stroke="var(--fig-c)" stroke-width="1.2" stroke-dasharray="2 3"/>'
      + '<circle cx="'+h[0][0]+'" cy="'+h[0][1]+'" r="6" fill="var(--bg)" stroke="var(--text)" stroke-width="1.6"/>'
      + '<text x="'+h[0][0]+'" y="'+(parseFloat(h[0][1])+3)+'" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--text)">'+h[2]+'</text>'
      + '<text x="'+(parseFloat(h[0][0])+h[3])+'" y="'+(parseFloat(h[0][1])+h[4])+'" font-family="monospace" font-size="10.5" fill="var(--fig-a)">'+h[1]+'</text>';
  });
  g += '<text x="'+(cx+14)+'" y="'+(cy-8)+'" font-family="monospace" font-size="11" fill="var(--fig-c)">PR+25</text>';
  return '<svg class="learn-svg" viewBox="0 0 340 222" role="img" aria-label="Bolt circle around CC X50 Y40 with three numbered points programmed by polar radius and angles">'+g
    + '<rect x="83" y="179" width="134" height="28" rx="7" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)"/>'
    + '<text x="150" y="197" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="700" fill="var(--fig-b)">CC X+50 Y+40</text>'
    + '<text x="170" y="218" text-anchor="middle" font-family="monospace" font-size="9.5" fill="var(--text3)">same Polar Radius · Polar Angle stepped by 120\u00b0</text>'
    + '</svg>';
}

function learnSvgCounterbore(){
  return '<svg class="learn-svg" viewBox="0 0 340 165" role="img" aria-label="Counterbore dimensions showing a larger shallow head recess above a smaller through hole">'
    // plate section, hole \u00d86.6 with counterbore \u00d811 x 6
    + '<path d="M40 50 L145 50 L145 77 L155 77 L155 140 L40 140 Z" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)" stroke-width="1.2"/>'
    + '<path d="M300 50 L195 50 L195 77 L185 77 L185 140 L300 140 Z" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)" stroke-width="1.2"/>'
    // screw head hint in the counterbore
    + '<rect x="148" y="53" width="44" height="21" rx="3" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3"/>'
    + '<line x1="163" y1="53" x2="163" y2="74" stroke="var(--text3)" stroke-width="0.7" stroke-dasharray="3 3"/>'
    + '<line x1="177" y1="53" x2="177" y2="74" stroke="var(--text3)" stroke-width="0.7" stroke-dasharray="3 3"/>'
    // dimensions
    + '<line x1="145" y1="40" x2="195" y2="40" stroke="var(--fig-a)" stroke-width="0.9"/>'
    + '<text x="170" y="34" font-family="monospace" font-size="10" fill="var(--fig-a)" text-anchor="middle">\u00d811 \u2193 6  (Q335 / Q201)</text>'
    + '<line x1="210" y1="77" x2="230" y2="77" stroke="var(--fig-a)" stroke-width="0.7" stroke-dasharray="3 3"/>'
    + '<line x1="155" y1="150" x2="185" y2="150" stroke="var(--text)" stroke-width="0.9"/>'
    + '<text x="170" y="162" font-family="monospace" font-size="10" fill="var(--text)" text-anchor="middle">\u00d86.6 THRU  (Q342)</text>'
    + '<text x="40" y="14" font-family="monospace" font-size="9" fill="var(--text3)">screw head sits flush</text>'
    + '</svg>';
}

function learnSvgArcCC(){
  var cx=170, cy=108, R=60;
  return '<svg class="learn-svg" viewBox="0 0 340 238" role="img" aria-label="CC arc construction showing centre point, start point, end point, radius and DR rotation direction">'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<path d="M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+'" fill="none" stroke="var(--fig-c)" stroke-width="2.4" stroke-linecap="round"/>'
    + '<path d="M159.6 38.9 A60 60 0 0 1 180.4 38.9" fill="none" stroke="var(--fig-c)" stroke-width="2.2" stroke-linecap="round"/>'
    + '<path d="M0 -3 L7 0 L0 3 Z" transform="translate(180.4 38.9) rotate(10)" fill="var(--fig-c)"/>'
    + '<text x="170" y="20" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="var(--fig-c)">DR− · CLOCKWISE</text>'
    + '<circle cx="110" cy="108" r="6" fill="var(--bg)" stroke="var(--fig-a)" stroke-width="2"/>'
    + '<text x="110" y="111" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-a)">1</text>'
    + '<rect x="2" y="83" width="100" height="42" rx="7" fill="var(--fig-a)" fill-opacity=".08" stroke="var(--fig-a)"/>'
    + '<text x="52" y="108" text-anchor="middle" font-family="monospace" font-size="8.3" font-weight="700" fill="var(--fig-a)">L X+20 Y+45 F300</text>'
    + '<path d="M102 105 H104" stroke="var(--fig-a)" stroke-width="1.2"/>'
    + '<circle cx="230" cy="108" r="6" fill="var(--bg)" stroke="var(--fig-c)" stroke-width="2"/>'
    + '<text x="230" y="111" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="var(--fig-c)">3</text>'
    + '<rect x="238" y="83" width="100" height="42" rx="7" fill="var(--fig-c)" fill-opacity=".08" stroke="var(--fig-c)"/>'
    + '<text x="288" y="108" text-anchor="middle" font-family="monospace" font-size="8.3" font-weight="700" fill="var(--fig-c)">C X+50 Y+45 DR-</text>'
    + '<path d="M236 105 H238" stroke="var(--fig-c)" stroke-width="1.2"/>'
    + '<circle cx="170" cy="108" r="5" fill="var(--fig-b)"/>'
    + '<text x="170" y="111" text-anchor="middle" font-family="monospace" font-size="7" font-weight="700" fill="var(--bg)">2</text>'
    + '<path d="M170 114 V180" stroke="var(--fig-b)" stroke-width="1.3"/>'
    + '<rect x="102" y="180" width="136" height="30" rx="7" fill="var(--fig-b)" fill-opacity=".08" stroke="var(--fig-b)"/>'
    + '<text x="170" y="199" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="var(--fig-b)">CC X+35 Y+45</text>'
    + '<text x="170" y="230" text-anchor="middle" font-family="monospace" font-size="9.5" fill="var(--text3)">CC defines the circle · C defines the destination</text>'
    + '</svg>';
}

function learnSvgArcCR(){
  var cx=120, cy=120, R=60;
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img" aria-label="CR arc construction showing start and end points, programmed radius and DR rotation direction">'
    + '<path d="M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+'" fill="none" stroke="var(--fig-c)" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*0.7071).toFixed(1)+'" y2="'+(cy-R*0.7071).toFixed(1)+'" stroke="var(--fig-a)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<text x="'+(cx+10)+'" y="'+(cy-30)+'" text-anchor="end" font-family="monospace" font-size="12" fill="var(--fig-a)">R+15</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="none" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+cx+'" y="'+(cy+46)+'" text-anchor="middle" font-family="monospace" font-size="10" fill="var(--text3)">no CC needed</text>'
    + '<circle cx="'+(cx-R)+'" cy="'+cy+'" r="4" fill="var(--fig-a)"/>'
    + '<text x="'+(cx-R-14)+'" y="'+(cy+20)+'" font-family="monospace" font-size="10" fill="var(--fig-a)">start</text>'
    + '<circle cx="'+(cx+R)+'" cy="'+cy+'" r="4.5" fill="var(--fig-c)"/>'
    + '<text x="'+(cx+R-48)+'" y="'+(cy+22)+'" font-family="monospace" font-size="11" fill="var(--fig-c)">CR X+80 Y+45</text>'
    + '<path d="M109.6 50.9 A70 70 0 0 1 130.4 50.9" fill="none" stroke="var(--fig-c)" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M0 -3 L7 0 L0 3 Z" transform="translate(130.4 50.9) rotate(10)" fill="var(--fig-c)"/>'
    + '<text x="'+cx+'" y="38" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--fig-c)">DR-</text>'
    + '</svg>';
}

function learnSvgDrill(){
  return '<svg class="learn-svg" viewBox="0 0 340 170" role="img" aria-label="Drilling cross-section showing surface coordinate, setup clearance, peck depth and total depth">'
    + '<rect x="40" y="60" width="260" height="95" fill="var(--fig-fill)" fill-opacity=".10" stroke="var(--fig-line)"/>'
    + '<line x1="40" y1="60" x2="300" y2="60" stroke="var(--fig-b)"/>'
    + '<text x="250" y="55" font-family="monospace" font-size="10" fill="var(--text3)">Q203 surface</text>'
    + '<path d="M150 15 L150 40" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<line x1="60" y1="15" x2="240" y2="15" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<text x="246" y="19" font-family="monospace" font-size="10" fill="var(--text3)">Q204 2nd clearance</text>'
    + '<line x1="130" y1="40" x2="170" y2="40" stroke="var(--fig-a)" stroke-width="1"/>'
    + '<text x="176" y="44" font-family="monospace" font-size="10" fill="var(--fig-a)">Q200 clearance</text>'
    + '<path d="M150 40 L150 100" stroke="var(--fig-b)" stroke-width="2.4"/>'
    + '<path d="M144 100 L150 112 L156 100 Z" fill="var(--fig-b)"/>'
    + '<line x1="130" y1="112" x2="170" y2="112" stroke="var(--fig-b)" stroke-width="1"/>'
    + '<text x="176" y="90" font-family="monospace" font-size="10" fill="var(--fig-b)">Q202 peck</text>'
    + '<path d="M150 112 L150 140" stroke="var(--fig-b)" stroke-width="2.4" stroke-dasharray="2 3"/>'
    + '<line x1="130" y1="140" x2="170" y2="140" stroke="var(--text)" stroke-width="1"/>'
    + '<text x="176" y="144" font-family="monospace" font-size="10" fill="var(--text)">Q201 depth (negative)</text>'
    + '</svg>';
}

/* Text checks grade executable Klartext only.  A student may explain an answer
   in a comment, but a commented-out TOOL CALL/CYCL DEF must never earn a tick. */
/* Optional UI string lookup. The web layer defines t(); Android does not, so
   every caller must survive with the English fallback. */
function _lt(key, fallback){
  try { return (typeof t === 'function') ? t(key, fallback) : fallback; }
  catch(e){ return fallback; }
}

/* Marked starters get a concise Klartext answer cue at the intended insertion
   point. `; >>>` is reserved and stripped before grading so the cue can never
   satisfy a check by itself. */
var LEARN_TASK_MARK = '; >>> ';
var _LEARN_MARK_RE  = /^[ \t]*;[ \t]*>>>.*$/gm;

function _learnStripTaskMarks(code){
  return String(code || '').replace(_LEARN_MARK_RE, '');
}

/* Keep the in-program cue short. The full assignment remains in the task card;
   the marker only answers "where do I type?" without turning the NC program
   into a second copy of the lesson text. */
function _learnTaskComment(L, ti){
  return LEARN_TASK_MARK + _lt('learn.answerMarker', 'YOUR ANSWER \u2014 TASK')
    + ' ' + (ti + 1) + '/' + L.tasks.length;
}

function _learnAnswerLineCount(T){
  if(T.sol !== undefined) return Math.max(1, String(T.sol).split('\n').length);
  if(T.solRepl){
    var oldN = String(T.solRepl[0]).split('\n').length;
    var newN = String(T.solRepl[1]).split('\n').length;
    return Math.max(1, newN > oldN ? newN - oldN : oldN);
  }
  return 1;
}

function _learnLineIndexAt(code, offset){
  return String(code || '').slice(0, Math.max(0, offset)).split('\n').length - 1;
}

function _learnLineOffset(code, line){
  var rows = String(code || '').split('\n');
  var offset = 0;
  for(var i = 0; i < line && i < rows.length; i++) offset += rows[i].length + 1;
  return Math.min(offset, String(code || '').length);
}

/* Build both the starter and its visual answer range. Existing `; >>>` cues
   become enough blank blocks for the official solution; the highlighted,
   locked answer range replaces any in-program marker. A task that inserts at
   the first blank gap gets the same treatment.
   Direct replacement tasks keep their source intact and highlight the blocks
   that should be edited. */
function _learnStarterPlan(L, ti){
  var T = L.tasks[ti];
  var starter = T.starter || '';
  var count = _learnAnswerLineCount(T);
  var code = starter;
  var start = -1;
  var mode = 'edit';
  var caretColumn = 0;

  var markRe = /^[ \t]*;[ \t]*>>>.*$(?:\n[ \t]*)*/m;
  var gapRe = /\n(?:[ \t]*\n)+/;
  if(markRe.test(starter)){
    var markAt = starter.search(markRe);
    code = starter.replace(markRe, '\n'.repeat(count));
    start = _learnLineIndexAt(starter, markAt);
    mode = 'insert';
  } else if(T.sol !== undefined && gapRe.test(starter)){
    var gapAt = starter.search(gapRe);
    code = starter.replace(gapRe, '\n'.repeat(count + 1));
    start = _learnLineIndexAt(starter, gapAt) + 1;
    mode = 'insert';
  } else if(T.solRepl){
    var oldText = String(T.solRepl[0]);
    var replacement = String(T.solRepl[1]);
    var at = starter.indexOf(oldText);
    if(at >= 0){
      var oldLines = oldText.split('\n').length;
      var newLines = replacement.split('\n').length;
      if(newLines > oldLines && replacement.slice(-oldText.length) === oldText){
        var lineAt = starter.lastIndexOf('\n', at - 1) + 1;
        if(T.answerPrefix !== undefined){
          var prefix = String(T.answerPrefix);
          code = starter.slice(0, lineAt) + prefix + '\n'.repeat(count)
            + starter.slice(lineAt);
          start = _learnLineIndexAt(code, lineAt);
          caretColumn = prefix.length;
        } else {
          code = starter.slice(0, lineAt) + '\n'.repeat(count)
            + starter.slice(lineAt);
          start = _learnLineIndexAt(code, lineAt);
        }
        mode = 'insert';
      } else {
        start = _learnLineIndexAt(starter, at);
        count = oldLines;
        // Blocks the answer adds around the highlighted ones (LBL 1 above,
        // LBL 0 below) get their own empty answer rows: the keypad inserts
        // after the caret row and could otherwise only reach the locked rows.
        var wrapAt = replacement.indexOf(oldText);
        if(newLines > oldLines && wrapAt >= 0){
          var before = replacement.slice(0, wrapAt).split('\n').length - 1;
          var after = replacement.slice(wrapAt + oldText.length).split('\n').length - 1;
          var lineStart = starter.lastIndexOf('\n', at - 1) + 1;
          var blockEnd = at + oldText.length;
          code = starter.slice(0, lineStart) + '\n'.repeat(before)
            + starter.slice(lineStart, blockEnd) + '\n'.repeat(after)
            + starter.slice(blockEnd);
          count = before + oldLines + after;
        }
      }
    }
  }

  return {code:code, start:start, count:count, mode:mode, caretColumn:caretColumn};
}

function _learnStarterFor(L, ti){
  return _learnStarterPlan(L, ti).code;
}

function learnAnswerLineRange(){
  if(typeof LEARN === 'undefined' || !LEARN || !LEARN.open
    || LEARN.lesson < 0 || LEARN.task < 0 || LEARN.answerStartLine < 0) return null;
  if(LEARN.lock && typeof codeEl !== 'undefined' && codeEl){
    var rows = String(codeEl.value).split('\n');
    return {
      start: LEARN.lock.prefix.length,
      end: Math.max(LEARN.lock.prefix.length, rows.length - LEARN.lock.suffix.length - 1)
    };
  }
  return {
    start: LEARN.answerStartLine,
    end: LEARN.answerStartLine + Math.max(1, LEARN.answerLineCount || 1) - 1
  };
}

/* -- Practice lock ---------------------------------------------------
   During a task only the answer lines are editable. The blocks before and
   after the answer are captured when the task starts; any edit that would
   change them is refused (native input) or rolled back (every other editor
   path ends in updateLineNums(), which calls learnEnforceLock()). The answer
   range therefore grows and shrinks with the learner's own lines. */
function _learnLockActive(){
  return !!(typeof LEARN !== 'undefined' && LEARN && LEARN.open
    && LEARN.lesson >= 0 && LEARN.task >= 0 && LEARN.lock);
}

function _learnLockCapture(code, start, count){
  if(start < 0){ LEARN.lock = null; return; }
  var rows = String(code).split('\n');
  LEARN.lock = {
    prefix: rows.slice(0, start),
    suffix: rows.slice(start + Math.max(1, count)),
    good: String(code)
  };
}

function _learnLockValid(code){
  var lock = LEARN.lock;
  var rows = String(code).split('\n');
  if(rows.length < lock.prefix.length + lock.suffix.length + 1) return false;
  for(var i = 0; i < lock.prefix.length; i++){ if(rows[i] !== lock.prefix[i]) return false; }
  var off = rows.length - lock.suffix.length;
  for(var j = 0; j < lock.suffix.length; j++){ if(rows[off + j] !== lock.suffix[j]) return false; }
  return true;
}

function learnLineLocked(idx){
  if(!_learnLockActive()) return false;
  var r = learnAnswerLineRange();
  return !r || idx < r.start || idx > r.end;
}

var _learnLockNoticeAt = 0;
function _learnLockNotice(){
  var now = Date.now();
  if(now - _learnLockNoticeAt < 2500) return;
  _learnLockNoticeAt = now;
  if(typeof _toast === 'function')
    _toast(_lt('learn.locked', 'In this task you only write in the highlighted lines.'));
}

/* Put the caret on the first empty answer line, or at the end of the answer. */
function _learnAnswerCaret(){
  var r = learnAnswerLineRange();
  var rows = String(codeEl.value).split('\n');
  var line = r.end;
  for(var i = r.start; i <= r.end; i++){ if(!String(rows[i] || '').trim()){ line = i; break; } }
  return _learnLineOffset(codeEl.value, line) + String(rows[line] || '').length;
}

function _learnSetCaret(pos){
  if(typeof syncEditorSelection === 'function') syncEditorSelection(pos, pos);
  else if(codeEl.setSelectionRange) codeEl.setSelectionRange(pos, pos);
  if(typeof saveLastSel === 'function') saveLastSel();
}

/* A programming key or a click on a locked block moves the caret into the
   answer, so whatever the learner inserts lands where it can be graded. */
/* Optional start/end check an explicit insertion target instead of the
   textarea selection: panels such as BLK FORM compute their own position
   (e.g. right after BEGIN PGM), which can sit in the locked prefix even while
   the caret is inside the answer. */
function learnLockCaret(start, end){
  if(!_learnLockActive()) return false;
  if(start === undefined || start === null) start = codeEl.selectionStart;
  if(end === undefined || end === null) end = start === codeEl.selectionStart ? codeEl.selectionEnd : start;
  var line = _learnLineIndexAt(codeEl.value, start);
  var endLine = _learnLineIndexAt(codeEl.value, end);
  if(!learnLineLocked(line) && !learnLineLocked(endLine)) return false;
  _learnSetCaret(_learnAnswerCaret());
  return true;
}

function learnEnforceLock(){
  if(!_learnLockActive() || typeof codeEl === 'undefined' || !codeEl) return true;
  if(_learnLockValid(codeEl.value)){ LEARN.lock.good = codeEl.value; return true; }
  codeEl.value = LEARN.lock.good;
  _learnSetCaret(_learnAnswerCaret());
  _learnLockNotice();
  return false;
}

/* Enter during a locked task always opens a new line inside the answer.
   At the very start of the first answer line it opens the line ABOVE (tasks
   that wrap the highlighted blocks in LBL 1 ... LBL 0 need that). Otherwise
   the normal editor rule is kept unless it would reuse or create a line in
   the locked program; then a blank line is opened below the caret line. */
function _learnOpenLineAt(pos, caret){
  if(typeof _undoPush === 'function') _undoPush();
  codeEl.value = codeEl.value.slice(0, pos) + '\n' + codeEl.value.slice(pos);
  _learnSetCaret(caret);
  if(typeof dirty !== 'undefined') dirty = true;
  if(typeof updateLineNums === 'function') updateLineNums();
  if(typeof runValidation === 'function') runValidation();
  return true;
}

function learnLockEnter(){
  if(!_learnLockActive()) return false;
  var r = learnAnswerLineRange();
  var v = codeEl.value, s = codeEl.selectionStart, e = codeEl.selectionEnd;
  var rows = v.split('\n');
  var line = _learnLineIndexAt(v, s);
  if(learnLineLocked(line) || learnLineLocked(_learnLineIndexAt(v, e))){
    learnLockCaret();
    return true;
  }
  var lineStart = _learnLineOffset(v, line);
  if(s === e && line === r.start && s === lineStart && String(rows[line] || '').trim())
    return _learnOpenLineAt(s, s);
  if(typeof planProgramBlockInsertion === 'function'){
    var plan = planProgramBlockInsertion(v, s, e, '', 'enter');
    var target = plan.changed ? plan.insertLine
      : (plan.reason === 'reuse-placeholder' ? _learnLineIndexAt(v, plan.caret) : -1);
    var maxLine = plan.changed ? r.end + 1 : r.end;
    if(target >= r.start && target <= maxLine) return false;
  }
  var lineEnd = lineStart + String(rows[line] || '').length;
  return _learnOpenLineAt(lineEnd, lineEnd + 1);
}

/* Keys the current task needs, derived from the official answer. The rest of
   the keypad stays in place but is dimmed and inactive during practice. */
function learnTaskKeys(T){
  var keys = {};
  if(!T) return keys;
  var text = T.sol !== undefined ? String(T.sol) : '';
  if(T.sol === undefined && T.solRepl){
    // A replacement task needs keys only for the blocks it adds; editing an
    // existing block (RR on L Y+0, a cycle value) is plain typing.
    var oldRows = String(T.solRepl[0]).split('\n');
    var newRows = String(T.solRepl[1]).split('\n');
    text = newRows.length > oldRows.length
      ? newRows.filter(function(r){ return oldRows.indexOf(r) < 0; }).join('\n') : '';
  }
  var inCycle = false;
  text.split('\n').forEach(function(raw){
    var l = raw.trim().toUpperCase();
    if(!l || l.charAt(0) === ';') return;
    if(/^CYCL DEF/.test(l)){ keys['CYCL DEF'] = 1; inCycle = true; return; }
    var q = /^Q(\d+)\s*=/.exec(l);
    if(q){ if(!inCycle && Number(q[1]) < 200) keys.Q = 1; return; }
    inCycle = false;
    if(/^LP\s/.test(l)) keys.P = 1;
    else if(/^L\s/.test(l)){ keys.L = 1; if(/\bI[XYZ][+-]/.test(l)) keys.I = 1; }
    else if(/^CC\s/.test(l)) keys.CC = 1;
    else if(/^CR\s/.test(l)) keys.CR = 1;
    else if(/^CT\s/.test(l)) keys.CT = 1;
    else if(/^C\s/.test(l)) keys.C = 1;
    else if(/^RND\b/.test(l)) keys.RND = 1;
    else if(/^CHF\b/.test(l)) keys.CHF = 1;
    else if(/^(APPR|DEP)\b/.test(l)) keys['APPR/DEP'] = 1;
    else if(/^BLK FORM/.test(l)) keys['BLK FORM'] = 1;
    else if(/^CYCL CALL/.test(l)) keys['CYCL CALL'] = 1;
    else if(/^TOOL CALL/.test(l)) keys['TOOL CALL'] = 1;
    else if(/^TOOL DEF/.test(l)) keys['TOOL DEF'] = 1;
    else if(/^CALL LBL/.test(l)) keys['LBL CALL'] = 1;
    else if(/^LBL\b/.test(l)) keys['LBL SET'] = 1;
    else if(/^M\d/.test(l)) keys.M = 1;
  });
  return keys;
}

function _learnApplyKeypad(){
  var pad = document.getElementById('keypad');
  if(!pad || typeof ALL_KEYS === 'undefined' || !pad.querySelectorAll) return;
  var active = _learnLockActive();
  var need = learnTaskKeys(active ? LESSONS[LEARN.lesson].tasks[LEARN.task] : null);
  var keysEls = pad.querySelectorAll('.key');
  for(var i = 0; i < keysEls.length; i++){
    var obj = ALL_KEYS[parseInt(keysEls[i].getAttribute('data-idx'), 10)];
    var off = active && !need[obj ? obj.key : ''];
    keysEls[i].classList.toggle('learn-off', off);
    if(off) keysEls[i].setAttribute('aria-disabled', 'true');
    else keysEls[i].removeAttribute('aria-disabled');
  }
}

/* One line under the question: how much to write and where. */
function learnAnswerHint(){
  var FL = (typeof LEARN !== 'undefined' && LEARN && LEARN.lesson >= 0 && LEARN.task >= 0)
    ? LESSONS[LEARN.lesson] : null;
  if(FL && FL.free) return _lt('learn.freeWrite', 'Write your answer in the program yourself.');
  if(!_learnLockActive()) return '';
  // Count the lines the learner really writes: comment lines in the official
  // answer (e.g. a "; ...drilling here..." placeholder) are not required.
  var T = FL.tasks[LEARN.task];
  var n = LEARN.answerLineCount || 1;
  if(T.sol !== undefined){
    n = String(T.sol).split('\n').filter(function(l){
      l = l.trim(); return l && l.charAt(0) !== ';';
    }).length || n;
  }
  if(LEARN.answerMode === 'edit' && T.solRepl){
    var added = String(T.solRepl[1]).split('\n').length - String(T.solRepl[0]).split('\n').length;
    if(added > 0)
      return _lt('learn.addAround', 'Write {n} lines in the empty highlighted lines.').replace('{n}', added);
  }
  if(LEARN.answerMode === 'edit')
    return n === 1 ? _lt('learn.editOne', 'Change the highlighted line.')
      : _lt('learn.editMany', 'Change the highlighted lines.');
  return n === 1 ? _lt('learn.writeOne', 'Write 1 line in the highlighted area.')
    : _lt('learn.writeMany', 'Write {n} lines in the highlighted area.').replace('{n}', n);
}

function _learnSolvedCode(L, ti){
  var T = L.tasks[ti];
  var plan = _learnStarterPlan(L, ti);
  var code = plan.code;
  if(T.sol !== undefined && plan.start >= 0){
    var lines = code.split('\n');
    lines.splice.apply(lines, [plan.start, plan.count].concat(String(T.sol).split('\n')));
    return lines.join('\n');
  }
  if(T.solRepl && plan.mode === 'edit' && plan.start >= 0){
    var rows = code.split('\n');
    rows.splice.apply(rows, [plan.start, plan.count].concat(String(T.solRepl[1]).split('\n')));
    return rows.join('\n');
  }
  if(T.solRepl) return code.replace(T.solRepl[0], T.solRepl[1]);
  if(T.sol !== undefined) return code.replace('\n\n', '\n' + T.sol + '\n');
  return code;
}

function _learnExecutableCode(code){
  return String(code || '').split('\n').map(function(line){
    var semi = line.indexOf(';');
    return semi >= 0 ? line.slice(0, semi) : line;
  }).join('\n');
}

function _learnCycleBlocks(code, num, after){
  var startAt = 0;
  if(after){
    var am = after.exec(code);
    after.lastIndex = 0;
    if(!am) return [];
    startAt = am.index + am[0].length;
  }
  var tail = code.slice(startAt), lines = tail.split('\n'), out = [];
  for(var i=0; i<lines.length; i++){
    if(!(new RegExp('^\\s*CYCL\\s+DEF\\s+' + num + '\\b', 'i')).test(lines[i])) continue;
    var block = lines[i];
    for(var j=i+1; j<lines.length; j++){
      if(/^\s*Q\d+\s*=/.test(lines[j])) block += '\n' + lines[j];
      else if(/^\s*$/.test(lines[j])) continue;
      else break;
    }
    out.push(block);
  }
  return out;
}

/* Set by every learnEvalChecks() run. Live grading uses it to leave the last
   good state on screen while the program is momentarily unparseable. */
var _learnParseOk = true;

function learnEvalChecks(code, task){
  var execCode = _learnExecutableCode(code);
  var parsed = null, parseErr = null;
  try { parsed = parseProgram(code); } catch(e){ parseErr = e; }
  _learnParseOk = !parseErr;
  return task.checks.map(function(ch){
    var ok = false;
    try {
      if(ch.t === 'begin_end'){
        var mB = execCode.match(/BEGIN\s+PGM\s+([A-Z0-9_.-]+)\s+MM/i);
        var mE = execCode.match(/END\s+PGM\s+([A-Z0-9_.-]+)\s+MM/i);
        ok = !!(mB && mE && mB[1].toUpperCase() === mE[1].toUpperCase()
                && (!ch.name || mB[1].toUpperCase() === ch.name));
      }
      else if(ch.t === 'blk'){
        if(parsed && parsed.blkMin && parsed.blkMax){
          var eq = function(a,b){ return Math.abs(a-b) < 1e-6; };
          ok = eq(parsed.blkMax.x - parsed.blkMin.x, ch.dx)
            && eq(parsed.blkMax.y - parsed.blkMin.y, ch.dy)
            && eq(parsed.blkMax.z - parsed.blkMin.z, ch.dz)
            && eq(parsed.blkMax.z, (ch.top !== undefined ? ch.top : 0));
        }
      }
      else if(ch.t === 'toolcall'){
        var reTc = new RegExp('TOOL\\s+CALL\\s+' + ch.T + '\\s+Z([^\\n]*)', 'i');
        var mTc = execCode.match(reTc);
        if(mTc){
          ok = true;
          if(ch.S !== undefined){ var mS = mTc[1].match(/\bS(\d+[.,]?\d*)/i); ok = ok && !!mS && Math.abs(parseFloat(mS[1].replace(',','.')) - ch.S) < 0.5; }
          if(ch.F !== undefined){ var mF = mTc[1].match(/\bF(\d+[.,]?\d*)/i); ok = ok && !!mF && Math.abs(parseFloat(mF[1].replace(',','.')) - ch.F) < 0.5; }
        }
      }
      else if(ch.t === 'uses'){
        ok = ch.re.test(execCode);
        ch.re.lastIndex = 0;
      }
      else if(ch.t === 'order'){
        // b must occur somewhere AFTER the first occurrence of a
        var ia = execCode.search(ch.a);
        ok = ia >= 0 && ch.b.test(execCode.slice(ia + 1));
        ch.a.lastIndex = 0; ch.b.lastIndex = 0;
      }
      else if(ch.t === 'sequence'){
        var rest = execCode;
        ok = ch.items.every(function(re){
          var sm = re.exec(rest); re.lastIndex = 0;
          if(!sm) return false;
          rest = rest.slice(sm.index + sm[0].length);
          return true;
        });
      }
      else if(ch.t === 'cycle_def'){
        ok = _learnCycleBlocks(execCode, ch.num, ch.after).length > 0;
      }
      else if(ch.t === 'cycle_param'){
        ok = _learnCycleBlocks(execCode, ch.num, ch.after).some(function(block){
          var pm = (new RegExp('\\b' + ch.q + '\\s*=\\s*([+-]?\\d+(?:[.,]\\d+)?)\\b', 'i')).exec(block);
          return !!pm && Math.abs(parseFloat(pm[1].replace(',','.')) - ch.value) <= (ch.tol || 1e-6);
        });
      }
      else if(ch.t === 'reach'){
        // the path passes within tol of the given point (distance from point
        // to SEGMENT, not just endpoints — a long compensated wall is one
        // segment, and arc tessellation points rarely land exactly on the
        // requested spot). cut:true = feed moves only, rapid:true = rapids
        // only; omit an axis to ignore that dimension.
        if(parsed && parsed.sub){
          var tolR = ch.tol || 0.5;
          var dims = [];
          if(ch.x !== undefined) dims.push(['x', ch.x]);
          if(ch.y !== undefined) dims.push(['y', ch.y]);
          if(ch.z !== undefined) dims.push(['z', ch.z]);
          ok = parsed.sub.some(function(sg){
            if(ch.cut && sg.rapid) return false;
            if(ch.rapid && !sg.rapid) return false;
            var ab2 = 0, at = 0, k;
            for(k = 0; k < dims.length; k++){
              var d0 = dims[k][0];
              var ab = sg.to[d0] - sg.from[d0];
              ab2 += ab * ab;
              at  += (dims[k][1] - sg.from[d0]) * ab;
            }
            var tt = ab2 > 1e-12 ? Math.max(0, Math.min(1, at / ab2)) : 0;
            var d2 = 0;
            for(k = 0; k < dims.length; k++){
              var d1 = dims[k][0];
              var dd = (sg.from[d1] + (sg.to[d1] - sg.from[d1]) * tt) - dims[k][1];
              d2 += dd * dd;
            }
            return Math.sqrt(d2) <= tolR;
          });
        }
      }
      else if(ch.t === 'no_rapid_below_top'){
        // rapids may retract UP out of the material, but never descend below
        // the surface or travel in XY while below it
        ok = true;
        if(parsed && parsed.sub && parsed.blkMax){
          var topZ = parsed.blkMax.z;
          parsed.sub.forEach(function(sg){
            if(!sg.rapid) return;
            var xyMove = Math.abs(sg.to.x - sg.from.x) > 1e-6 || Math.abs(sg.to.y - sg.from.y) > 1e-6;
            var descending = sg.to.z < sg.from.z - 1e-9;
            if(sg.to.z < topZ - 1e-6 && descending) ok = false;
            if(xyMove && Math.min(sg.from.z, sg.to.z) < topZ - 1e-6) ok = false;
          });
        }
      }
      else if(ch.t === 'min_z'){
        // deepest cutting point must equal ch.z
        if(parsed && parsed.sub){
          var mz = 1e9;
          parsed.sub.forEach(function(sg){ if(!sg.rapid) mz = Math.min(mz, sg.to.z); });
          ok = mz < 1e8 && Math.abs(mz - ch.z) <= (ch.tol || 0.3);
        }
      }
      else if(ch.t === 'has_comment'){
        // any line containing ';' followed by some real text — the injected
        // assignment marker is not the student's own comment. Horizontal
        // whitespace only: an empty `; ` line must not borrow text from the
        // next NC block across a newline.
        ok = /;[ \t]*\S/.test(_learnStripTaskMarks(code));
      }
      else if(ch.t === 'blk_axis'){
        ok = /BLK\s+FORM\s+0\.1\s+Z\b/i.test(code);
      }
    } catch(e){ ok = false; }
    if(parseErr) ok = false;
    return {ok:ok, label:ch.label, hint:ch.hint};
  });
}

function learnProgress(){
  try { return JSON.parse(localStorage.getItem('tnc_learn') || '{}'); } catch(e){ return {}; }
}

function learnSaveProgress(p){ try { localStorage.setItem('tnc_learn', JSON.stringify(p)); } catch(e){} }

function learnTaskDone(lid, ti){
  var p = learnProgress(); p[lid] = Math.max(p[lid]||0, ti+1); learnSaveProgress(p);
}

function _lpEl(){ return document.getElementById('learnPanel'); }

function learnUpdateBlank(){
  var inLearn = (typeof LEARN!=='undefined') && LEARN.open;
  var hasBlk = /BLK\s+FORM\s+0\.1/i.test(codeEl.value) && /BLK\s+FORM\s+0\.2/i.test(codeEl.value);
  var want = !inLearn || hasBlk;
  if(_learnBlankShown === want) return;   // act only on transitions — never
  // fight the running simulation, which manages blockMesh visibility itself
  if(typeof mode!=='undefined' && mode==='running'){ return; }
  if(want){
    // rebuild from the current program so freshly typed dimensions show up
    if(_learnBlankShown === false && typeof onReset==='function'){ try{ onReset(); }catch(e){} }
    if(typeof blockMesh!=='undefined' && blockMesh) blockMesh.visible = true;
    if(typeof blockEdges!=='undefined' && blockEdges) blockEdges.visible = true;
  } else {
    if(typeof blockMesh!=='undefined' && blockMesh) blockMesh.visible = false;
    if(typeof blockEdges!=='undefined' && blockEdges) blockEdges.visible = false;
  }
  _learnBlankShown = want;
  if(typeof applyStockVisibility==='function') applyStockVisibility();
}

function openLearn(){
  _learnEndEditorInput();
  _learnBindLive();
  if(typeof programAutosaveSuspendForLearn === 'function') programAutosaveSuspendForLearn();
  LEARN.open = true;
  // Stash the user's own program right away and start with an EMPTY editor —
  // the whole point of Learn mode is writing every line yourself, and the 3D
  // blank stays hidden until a valid BLK FORM is written (see learnUpdateBlank).
  if(LEARN.savedCode === null){
    LEARN.savedCode = codeEl.value;
    codeEl.value = '';
    if(typeof syncEditorSelection==='function') syncEditorSelection(0,0);
    dirty = true;
    updateLineNums(); runValidation();
    if(typeof renderIdlePanel==='function') renderIdlePanel();
    if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  }
  if(!LEARN.view) LEARN.view = (LEARN.task >= 0) ? 'task' : 'list';
  learnRender();
  _lpEl().style.display = 'flex';
  if(_isMTab()) mtabSwitch('learn');
  learnUpdateBlank();
}

function closeLearn(){
  LEARN.open = false;
  learnExit(); // always restore the user's own program (stashed on open)
  LEARN.view = 'list'; LEARN.lesson = -1;
  _lpEl().style.display = 'none';
  var _mb = document.getElementById('learnMobileBar');
  if(_mb){ _mb.classList.remove('on'); _mb.innerHTML=''; document.body.classList.remove('practice-on'); }
  if(_isMTab()) mtabSwitch('editor');
  runValidation(); // validator back on
  _learnNotifyHost();
}

function learnOpenLesson(i){
  LEARN.lock = null;
  LEARN.lesson = i; LEARN.slide = 0; LEARN.task = -1;
  LEARN.lastResults = null; LEARN.hint = 0; LEARN.live = null; LEARN.view = 'lesson';
  learnRender();
}

function learnNav(d){
  var L = LESSONS[LEARN.lesson];
  LEARN.slide = Math.max(0, Math.min(L.slides.length - 1, LEARN.slide + d));
  learnRender();
}

function learnBackToList(){ LEARN.lock = null; LEARN.view = 'list'; LEARN.lesson = -1; learnRender(); }

function learnSolve(){
  var pw = prompt('Password:');
  if(pw !== '1234') return;
  var code = _learnSolvedCode(LESSONS[LEARN.lesson], LEARN.task);
  LEARN.lock = null;
  codeEl.value = code;
  if(typeof syncEditorSelection==='function') syncEditorSelection(0,0);
  dirty = true; updateLineNums();
  if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  if(typeof renderIdlePanel==='function') renderIdlePanel();
  // mark this lesson as password-assisted -> its tick renders ORANGE in the list
  var pp = learnProgress(); pp[LESSONS[LEARN.lesson].id + '#solved'] = 1; learnSaveProgress(pp);
  learnCheck();
}

function learnResetProgress(){
  if(!confirm('Reset all lesson progress?')) return;
  try { localStorage.removeItem('tnc_learn'); } catch(e){}
  try { localStorage.removeItem('tnc_learn_coach'); } catch(e){}
  learnRender();
}

function learnStartTask(ti){
  // Moving to another task should NOT pop the on-screen keyboard back up. If the
  // code textarea is still the focused element (the phone keyboard was only
  // dismissed, not blurred), then changing its value below and resizing it in
  // _growCode makes mobile browsers re-open the keyboard. Blur first so the user
  // lands on the new task able to read it, and taps in themselves when ready.
  _learnEndEditorInput();
  var L = LESSONS[LEARN.lesson];
  if(LEARN.savedCode === null) LEARN.savedCode = codeEl.value; // stash user's work once
  LEARN.task = ti; LEARN.lastResults = null; LEARN.view = 'lesson';
  LEARN.hint = 0;                        // progressive hints start closed
  LEARN.live = null; LEARN.theoryOpen = false;
  var plan = _learnStarterPlan(L, ti);
  codeEl.value = plan.code;
  LEARN.answerStartLine = plan.start;
  LEARN.answerLineCount = plan.count;
  LEARN.answerMode = plan.mode;
  // A free-practice lesson (the final one) has no highlighted range, no lock
  // and no hints: the learner writes the program like on the control.
  if(L.free) LEARN.answerStartLine = -1;
  _learnLockCapture(plan.code, L.free ? -1 : plan.start, plan.count);
  // Undo must never step back into the previous task's program.
  if(typeof _undoStack !== 'undefined' && _undoStack) _undoStack.length = 0;
  if(typeof _redoStack !== 'undefined' && _redoStack) _redoStack.length = 0;
  var caretAt = plan.start >= 0
    ? _learnLineOffset(codeEl.value, plan.start) + (plan.caretColumn || 0)
    : 0;
  if(typeof syncEditorSelection==='function') syncEditorSelection(caretAt, caretAt);
  else if(codeEl.setSelectionRange) codeEl.setSelectionRange(caretAt, caretAt);
  dirty = true; if(typeof _undoPush==='function') _undoPush();
  updateLineNums(); runValidation();
  if(typeof renderIdlePanel==='function') renderIdlePanel();
  if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  learnRender();
  if(_isMTab()) mtabSwitch('editor');
}

/* Progressive hints: one more level per press (nudge -> structure -> answer).
   A hint is never punished — it only nudges the counter shown in the footer. */
function learnHint(){
  var T = LESSONS[LEARN.lesson].tasks[LEARN.task];
  var n = (T.hints && T.hints.length) || 0;
  LEARN.hint = Math.min(n, (LEARN.hint||0) + 1);
  learnRender();
  // Desktop only: learnRender() creates a new .lp-body at scrollTop 0. Keep the
  // whole left Learn panel pinned to its true bottom after revealing a hint.
  if(!_isMTab()){
    var p = _lpEl();
    var body = p ? p.querySelector('.lp-body') : null;
    if(body) body.scrollTop = body.scrollHeight;
  }
}

function learnCheck(){
  var L = LESSONS[LEARN.lesson];
  runValidation(); // refresh problem gutter (lesson-specific mutes applied)
  LEARN.lastResults = learnEvalChecks(codeEl.value, L.tasks[LEARN.task]);
  LEARN.live = LEARN.lastResults;
  LEARN.theoryOpen = false; // bring the verdict and any failed-goal hints back into view
  if(LEARN.lastResults.every(function(r){ return r.ok; })) learnTaskDone(L.id, LEARN.task);
  learnRender();
}

/* Editing after Check clears and hides the verdict so the action returns to
   Check. Requirements are never shown as a live checklist before grading. */
var _learnLiveTimer = null;

function learnCodeChanged(){
  if(!LEARN.open || LEARN.task < 0) return;
  if(_learnLiveTimer) clearTimeout(_learnLiveTimer);
  _learnLiveTimer = setTimeout(function(){
    _learnLiveTimer = null;
    if(LEARN.lastResults){
      LEARN.lastResults = null;
      LEARN.live = null;
      learnRender();
    }
  }, 400);
}

/* codeEl is created by the host app after this module loads, so bind lazily on
   the first Learn open rather than at parse time. */
var _learnLiveBound = false;
function _learnBindLive(){
  if(_learnLiveBound) return;
  if(typeof codeEl === 'undefined' || !codeEl || !codeEl.addEventListener) return;
  codeEl.addEventListener('input', learnCodeChanged);
  _learnLiveBound = true;
}

function learnFinishLesson(){
  _learnEndEditorInput();
  LEARN.lock = null;
  // Keep LEARN.savedCode until Learn closes. The completed exercise may stay
  // visible inside Learn, but it must never replace the autosaved main program.
  LEARN.task = -1; LEARN.lastResults = null; LEARN.hint = 0; LEARN.live = null;
  LEARN.view = 'list'; LEARN.lesson = -1;
  runValidation();
  learnRender();
  learnUpdateBlank();
  // Land back on the lesson list, not the editor. Mobile stays on whatever tab
  // learnStartTask switched to (the editor), so make the list visible again.
  if(_isMTab()) mtabSwitch('learn');
}

/* The last task's Check already stores the lesson as complete. The footer then
   leads straight into the next lesson instead of back to the list. */
function _learnNextLessonIndex(i){
  for(var k = i + 1; k < LESSONS.length; k++){ if(!LESSONS[k].intro) return k; }
  return -1;
}

function learnNextLesson(){
  var next = _learnNextLessonIndex(LEARN.lesson);
  learnFinishLesson();
  if(next >= 0) learnOpenLesson(next);
}

function learnExit(){
  _learnEndEditorInput();
  LEARN.lock = null;
  if(LEARN.savedCode !== null){
    codeEl.value = LEARN.savedCode; LEARN.savedCode = null;
    if(typeof syncEditorSelection==='function') syncEditorSelection(0,0);
    dirty = true; updateLineNums(); runValidation();
    if(typeof renderIdlePanel==='function') renderIdlePanel();
    if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  }
  LEARN.task = -1; LEARN.lastResults = null; LEARN.hint = 0; LEARN.live = null;
  if(LEARN.open){ LEARN.view = 'list'; LEARN.lesson = -1; learnRender(); }
  learnUpdateBlank();
  // Mobile: hide the pinned practice strip and restore the normal editor idle
  // panel (undo/redo etc.) now that practice is over.
  var mb = document.getElementById('learnMobileBar');
  if(mb){ mb.classList.remove('on'); mb.innerHTML=''; }
  document.body.classList.remove('practice-on');
  if(typeof renderIdlePanel==='function') renderIdlePanel();
  if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
  if(!LEARN.open && typeof programAutosaveResumeAfterLearn === 'function') programAutosaveResumeAfterLearn();
}

function _learnEndEditorInput(){
  // A Learn transition may replace the entire program. Never leave a field/Q/
  // BLK editor alive with offsets that point into the previous code, and never
  // leave a pending hidden-input focus able to reopen the keyboard afterwards.
  if(typeof window!=='undefined' && typeof window._endAllEditorInput==='function'){
    window._endAllEditorInput();
    return;
  }
  if(typeof FM!=='undefined' && FM.active) exitFieldMode(true);
  if(typeof BLK!=='undefined' && BLK.active) closeCtxPanel();
  if(typeof _qPopupLine!=='undefined' && _qPopupLine>=0) closeQPopup();
  if(typeof _cancelMobileFocus==='function') _cancelMobileFocus(true);
  try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}
}

/* Display number of a lesson in the list, skipping the intro card(s) so the
   real course still reads 1..N. Intro lessons return 0. */
function _learnNo(i){ var n=0; for(var k=0;k<=i;k++){ if(!LESSONS[k].intro) n++; } return LESSONS[i].intro ? 0 : n; }

/* ── Reference card (prototype) ──────────────────────────────────────
   A lesson with `card` shows one scrollable reference page instead of the
   slide carousel: block format, drawing, rules, common mistakes and links to
   the exact pages of the official manual. Only the links need a connection;
   the page number is always printed so a local copy of the manual works too.
   The manuals are linked, never quoted: their text and figures are HEIDENHAIN's. */
var LEARN_MANUALS = {
  klartext: {
    title:'Klartext Programming', edition:'TNC 640 · 10/2023', pages:691,
    url:'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-18/bhb/892903-2C.pdf'
  },
  cycles: {
    title:'Programming of Machining Cycles', edition:'TNC 640 · 10/2023', pages:797,
    url:'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-18/zyklen_bearbeitung/1303406-23.pdf'
  }
};

/* German editions of the same manuals. Their page numbers differ from the
   English ones, so a German card (LESSONS_DE, web overlay) carries its own
   refs and is marked with lang:'de'. */
var LEARN_MANUALS_DE = {
  klartext: {
    title:'Klartextprogrammierung', edition:'TNC 640 \u00b7 10/2023', pages:714,
    url:'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-18/bhb/892903-1C.pdf'
  },
  cycles: {
    title:'Bearbeitungszyklen programmieren', edition:'TNC 640 \u00b7 10/2023', pages:809,
    url:'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-18/zyklen_bearbeitung/1303406-13.pdf'
  }
};

function _learnLang(){
  try { if(typeof I18N !== 'undefined' && I18N) return I18N.getLang(); } catch(e){}
  return 'en';
}

function _learnManual(doc, lang){
  return (lang === 'de' ? LEARN_MANUALS_DE : LEARN_MANUALS)[doc];
}

/* A card is shown only in the language it was written and page-checked for.
   Any other language keeps the slides. */
function _learnCard(L){
  if(!L || !L.card) return null;
  return (L.card.lang || 'en') === _learnLang() ? L.card : null;
}

function learnManualUrl(ref, lang){
  var m = _learnManual(ref.doc, lang);
  return m ? m.url + '#page=' + ref.page : '';
}

/* A card shows exactly the figures of the lesson's slides, reused through
   learnFigFrom(): same drawing, card frame. No figure is drawn only for a card. */
function learnFigFrom(svg){
  return String(svg).replace('class="learn-svg"', 'class="learn-svg lc-fig"');
}

var LEARN_BOOK_ICON = '<svg class="lc-book" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.7 3.9-.5 5.5.6v9.4c-1.6-1.1-3.5-1.3-5.5-.6zM13.5 3.2c-2-.7-3.9-.5-5.5.6v9.4c1.6-1.1 3.5-1.3 5.5-.6z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

/* The official-manual links are their own block: part of the full card while
   reading, and still visible on their own when practice collapses the card. */
function _learnCardManualHtml(c, compact){
  if(!c.refs || !c.refs.length) return '';
  return '<section class="lc-sec lc-manual"><h3 class="lc-h">' + _lt('learn.cardManual', 'Official manual') + '</h3>'
    + '<ul class="lc-refs">'
    + c.refs.map(function(r){
        var m = _learnManual(r.doc, c.lang);
        if(!m) return '';
        return '<li><a href="' + learnManualUrl(r, c.lang) + '" target="_blank" rel="noopener noreferrer">'
          + LEARN_BOOK_ICON
          + '<span class="lc-ref-t">' + r.label + '</span>'
          + '<span class="lc-ref-p">' + m.title + ' · ' + _lt('learn.cardPage', 'p.') + ' ' + r.page + ' ↗</span></a></li>';
      }).join('') + '</ul>'
    + (compact ? '' : '<p class="lc-note">' + _lt('learn.cardManualNote',
        'Opens the HEIDENHAIN PDF and needs a connection. Page numbers refer to the 10/2023 edition, so they also work in your own copy.')
      + '</p>')
    + '</section>';
}

function _learnCardHtml(L, withoutManual){
  var c = L.card;
  function sec(title, inner){
    return '<section class="lc-sec"><h3 class="lc-h">' + title + '</h3>' + inner + '</section>';
  }
  // Each item is wrapped so the CSS marker and the text form two grid columns.
  function list(items, cls){
    return '<ul class="lc-list' + (cls ? ' ' + cls : '') + '">'
      + items.map(function(it){ return '<li><span>' + it + '</span></li>'; }).join('') + '</ul>';
  }
  var html = '<div class="lc">';
  if(c.lead) html += '<p class="lc-lead">' + c.lead + '</p>';
  if(c.syntax && c.syntax.length){
    html += sec(_lt('learn.cardSyntax', 'Block format'), '<dl class="lc-syntax">'
      + c.syntax.map(function(s){
          return '<dt>' + s.code + '</dt><dd>' + s.text + (s.figure ? s.figure() : '') + '</dd>';
        }).join('') + '</dl>');
  }
  if(c.example) html += sec(_lt('learn.cardExample', 'Example'), learnSnippet(c.example));
  if(c.rules && c.rules.length) html += sec(_lt('learn.cardRules', 'Rules'), list(c.rules));
  if(c.mistakes && c.mistakes.length) html += sec(_lt('learn.cardMistakes', 'Common mistakes'), list(c.mistakes, 'lc-x'));
  if(!withoutManual) html += _learnCardManualHtml(c, false);
  return html + '</div>';
}

function _learnStartFoot(L){
  var doneN = learnProgress()[L.id] || 0;
  return '<div class="lp-foot"><button class="lp-btn chk grow" onclick="learnStartTask('
    + (doneN < L.tasks.length ? doneN : 0) + ')">'
    + (doneN > 0 && doneN < L.tasks.length
        ? _lt('learn.continuePractice', 'Continue practice') + ' (' + doneN + '/' + L.tasks.length + ') →'
        : _lt('learn.startPractice', 'Start practice') + ' →')
    + '</button></div>';
}

/* ── Rendering ───────────────────────────────────────────────────────
   One renderer for both layouts. The desktop panel and the mobile strip get
   the SAME practice markup; only the surrounding chrome differs. Anything that
   re-composes this HTML from outside will drift, so it is built once here. */

function _learnHead(L){
  var title = L ? (L.intro ? L.title : (_lt('learn.lesson', 'Lesson') + ' ' + _learnNo(LEARN.lesson) + ' \u00b7 ' + L.title))
                : _lt('learn.title', 'Learn \u2014 Heidenhain basics');
  var back = L
    ? '<button class="lp-btn lp-back" onclick="learnBackToList()" title="' + _lt('learn.allLessons', 'All lessons')
      + '" aria-label="' + _lt('learn.allLessons', 'All lessons') + '">&#8249;</button>'
    : '<span class="lp-cap" aria-hidden="true">&#127891;</span>';
  return '<div class="lp-head">' + back
    + '<span class="lp-title">' + title + '</span>'
    + '<button class="lp-x" onclick="closeLearn()" title="' + _lt('learn.close', 'Close Learn')
    + '" aria-label="' + _lt('learn.close', 'Close Learn') + '">&#10005;</button></div>';
}

/* Requirements stay out of the way until Check. The resulting checklist is a
   verdict, not a live task preview: green confirms a met requirement and red
   explains what is still missing. Editing hides it again. */
function _learnResultsHtml(T){
  var res = LEARN.lastResults;
  if(!res || !T.checks.length) return '';
  var done = 0;
  var rows = T.checks.map(function(ch, i){
    var r = res[i];
    var ok = !!(r && r.ok);
    if(ok) done++;
    return '<div class="lp-check ' + (ok ? 'ok' : 'bad') + '">'
      + '<span class="c-ic">' + (ok ? '&#10003;' : '&#10007;') + '</span>'
      + '<span class="c-lb">' + ch.label
      + (!ok && ch.hint && !(LESSONS[LEARN.lesson] && LESSONS[LEARN.lesson].free) ? '<span class="c-hint">&#128161; ' + ch.hint + '</span>' : '')
      + '</span></div>';
  }).join('');
  return '<div class="lp-results' + (done === T.checks.length ? ' all-ok' : '') + '">'
    + '<div class="lp-results-cap">' + _lt('learn.doneWhen', 'DONE WHEN')
    + '<span class="lp-results-n">' + done + '/' + T.checks.length + '</span></div>'
    + rows + '</div>';
}

/* Theory stays available during practice, but keeps its slide structure. This
   avoids one long reference wall and lets the learner return to the exact
   explanation or diagram they need. */
function _learnTheoryHtml(L){
  if(_learnCard(L)){
    return '<details class="lp-theory"' + (LEARN.theoryOpen ? ' open' : '')
      + ' ontoggle="LEARN.theoryOpen=this.open;">'
      + '<summary class="lp-theory-sum">'
      + '<span class="lp-theory-sum-copy"><span class="lp-theory-sum-title">'
      + _lt('learn.reference', 'REFERENCE') + '</span><span class="lp-theory-sum-sub">'
      + _lt('learn.reviewReference', 'Block format, rules and manual pages') + '</span></span>'
      + '</summary><div class="lp-theory-body">' + _learnCardHtml(L, true) + '</div></details>';
  }
  var dots = L.slides.map(function(_, i){
    return '<button type="button" class="' + (i === LEARN.slide ? 'on' : '') + '"'
      + ' onclick="LEARN.slide=' + i + ';LEARN.theoryOpen=true;learnRender();"'
      + ' aria-label="' + _lt('learn.slide', 'Slide') + ' ' + (i + 1) + '/' + L.slides.length + '"'
      + ' aria-current="' + (i === LEARN.slide ? 'step' : 'false') + '"></button>';
  }).join('');
  var slides = '<div class="lp-slides lp-theory-slides">'
    + '<div class="lp-slides-nav">'
    + '<button class="lp-btn lp-slide-arrow lp-slide-prev" onclick="LEARN.theoryOpen=true;learnNav(-1)" aria-label="' + _lt('learn.prevSlide', 'Previous slide') + '"'
    + (LEARN.slide === 0 ? ' disabled' : '') + '>&#8249;</button>'
    + '<div class="learn-prog">' + dots + '</div>'
    + '<button class="lp-btn lp-slide-arrow lp-slide-next" onclick="LEARN.theoryOpen=true;learnNav(1)" aria-label="' + _lt('learn.nextSlide', 'Next slide') + '"'
    + (LEARN.slide === L.slides.length - 1 ? ' disabled' : '') + '>&#8250;</button>'
    + '<span class="lp-slide-n">' + (LEARN.slide + 1) + '/' + L.slides.length + '</span>'
    + '</div><div class="lp-slide-view">' + L.slides[LEARN.slide].html() + '</div></div>';
  return '<details class="lp-theory"' + (LEARN.theoryOpen ? ' open' : '')
    + ' ontoggle="LEARN.theoryOpen=this.open;">'
    + '<summary class="lp-theory-sum">'
    + '<span class="lp-theory-sum-copy"><span class="lp-theory-sum-title">'
    + _lt('learn.infoSlides', 'INFO SLIDES') + '</span><span class="lp-theory-sum-sub">'
    + _lt('learn.reviewTheory', 'Review the lesson theory at any time') + '</span></span>'
    + '<span class="lp-theory-sum-meta">' + _lt('learn.slide', 'Slide') + ' '
    + (LEARN.slide + 1) + '/' + L.slides.length + '</span></summary>'
    + '<div class="lp-theory-body">' + slides + '</div></details>';
}

/* The practice block, returned as body + footer so both layouts can mount the
   footer where it belongs (pinned on desktop, inline on the mobile strip). */
function _learnPracticeHtml(L){
  var T = L.tasks[LEARN.task];
  var res = LEARN.lastResults;
  var allOk = res && res.every(function(r){ return r.ok; });
  var lastTask = LEARN.task === L.tasks.length - 1;
  var nHints = L.free ? 0 : ((T.hints && T.hints.length) || 0);
  var shown  = Math.min(LEARN.hint || 0, nHints);
  var marked = /^[ \t]*;[ \t]*>>>/m.test(T.starter || '');

  var body = '<div class="lp-task">'
    + '<div class="lp-task-top">'
    +   '<span class="lp-task-badge">' + _lt('learn.task', 'TASK') + ' ' + (LEARN.task + 1) + '/' + L.tasks.length + '</span>'
    + '</div>'
    + '<div class="lp-prompt" role="heading" aria-level="2">' + T.prompt + '</div>'
    + '<div class="lp-where"><span class="lp-where-arrow" aria-hidden="true">&#8594;</span><span>' + (learnAnswerHint()
        || (marked
          ? _lt('learn.answerAtMark', 'Type directly below the marked <code>; &gt;&gt;&gt;</code> line in the highlighted editor.')
          : _lt('learn.answerWhole', 'Write your answer in the highlighted editor.'))) + '</span></div>'
    + '</div>';

  body += _learnTheoryHtml(L);
  body += _learnResultsHtml(T);

  // Revealed hints belong to the footer, directly above the Hint button that
  // produced them, in both the desktop panel and the mobile strip.
  var hintsHtml = '';
  if(shown > 0){
    hintsHtml = '<div class="lp-hints lp-hints-dock">' + T.hints.slice(0, shown).map(function(h, i){
      return '<div class="lp-hint-row"><span class="lp-hint-n">'
        + (i === nHints - 1 ? _lt('learn.answer', 'ANSWER') : _lt('learn.hint', 'HINT') + ' ' + (i + 1)) + '</span>'
        + '<div class="lp-hint-b">' + h + '</div></div>';
    }).join('') + '</div>';
  }
  if(allOk){
    body += '<div class="lp-success">&#127881;<span>' + _lt('learn.passed', 'All goals met \u2014 well done!')
      + (lastTask
          ? ' ' + _lt('learn.lessonDone', 'Lesson complete.')
            + '<br><button type="button" class="lp-btn lp-success-run" onclick="onRun()">&#9654; '
            + _lt('learn.runNow', 'Run in 3D') + '</button>'
          : ' ' + _lt('learn.readyNext', 'Ready for the next task.')) + '</span></div>';
  }
  // The reference collapses during practice, but the official manual pages
  // stay one click away below the task feedback.
  if(_learnCard(L)) body += '<div class="lc lc-practice-refs">' + _learnCardManualHtml(L.card, true) + '</div>';

  var foot = hintsHtml + '<div class="lp-foot">'
    + (L.intro ? '' : '<button class="lp-btn lp-solve" onclick="learnSolve()" aria-label="Reveal solution" title="">&#8943;</button>')
    + '<button class="lp-btn" onclick="learnStartTask(' + LEARN.task + ')" title="'
    +   _lt('learn.resetTask', 'Reload the starter program') + '">' + _lt('learn.reset', 'Reset') + '</button>'
    + (!allOk && nHints
        ? '<button class="lp-btn hint' + (shown >= nHints ? ' spent' : '') + '" onclick="learnHint()"'
          + (shown >= nHints ? ' disabled' : '') + ' title="' + _lt('learn.hintMore', 'Reveal one more hint') + '">&#128161; '
          + (shown === nHints - 1 ? _lt('learn.showAnswer', 'Show answer') : _lt('learn.hintBtn', 'Hint'))
          + (shown ? ' ' + shown + '/' + nHints : '') + '</button>'
        : '')
    + (allOk
        ? (lastTask
            ? (_learnNextLessonIndex(LEARN.lesson) >= 0
                ? '<button class="lp-btn pri grow" onclick="learnNextLesson()">' + _lt('learn.nextLesson', 'Next lesson') + ' &#8594;</button>'
                : '<button class="lp-btn pri grow" onclick="learnFinishLesson()">' + _lt('learn.finish', 'Finish lesson') + ' &#10003;</button>')
            : '<button class="lp-btn pri grow" onclick="learnStartTask(' + (LEARN.task + 1) + ')">' + _lt('learn.next', 'Next') + ' &#8594;</button>')
        : '<button class="lp-btn chk grow" onclick="learnCheck()">' + _lt('learn.check', 'Check') + '</button>')
    + '</div>';

  return { body: body, foot: foot };
}

function learnRender(){
  var p = _lpEl();
  if(!p) return;
  var L = LEARN.lesson >= 0 ? LESSONS[LEARN.lesson] : null;
  var head = _learnHead(L);
  var mb = document.getElementById('learnMobileBar');

  function clearMobileBar(){
    if(!mb) return;
    mb.classList.remove('on'); mb.innerHTML = '';
    document.body.classList.remove('practice-on');
  }

  /* ── lesson list ── */
  if(LEARN.view === 'list' || !L){
    var prog = learnProgress();
    var num = 0;
    var rows = LESSONS.map(function(Ls, i){
      var done = (prog[Ls.id] || 0) >= Ls.tasks.length;
      var started = (prog[Ls.id] || 0) > 0;
      var assisted = !!prog[Ls.id + '#solved'];
      var stCls = 'li-st' + (done ? (assisted ? ' assisted' : ' done') : (started ? ' part' : ''));
      var st = done ? '<span class="' + stCls + '"' + (assisted ? ' title="Solved with assistance"' : '') + '>&#10003;</span>'
             : started ? '<span class="' + stCls + '">' + prog[Ls.id] + '/' + Ls.tasks.length + '</span>'
             : '<span class="' + stCls + '">&#9675;</span>';
      if(Ls.intro){
        return '<button type="button" class="learn-li intro" onclick="learnOpenLesson(' + i + ')">'
          + '<span class="li-num intro">&#9658;</span>'
          + '<span class="li-t"><span class="li-eyebrow">' + _lt('learn.startHere', 'START HERE') + '</span>' + Ls.title + '</span>' + st + '</button>';
      }
      num++;
      return '<button type="button" class="learn-li" onclick="learnOpenLesson(' + i + ')">'
        + '<span class="li-num">' + num + '</span><span class="li-t">' + Ls.title + '</span>' + st + '</button>';
    }).join('');
    var realLessons = LESSONS.filter(function(x){ return !x.intro; });
    var completeLessons = realLessons.filter(function(x){ return (prog[x.id] || 0) >= x.tasks.length; }).length;
    var more = '<div class="learn-li lock"><span class="li-num">&#127942;</span><span class="li-t">'
      + _lt('learn.finalNote', 'Finished the last lesson? Reopen any lesson, change a dimension and predict the result before you press Run.')
      + '</span><span class="li-st"></span></div>';
    var body = '<p>' + _lt('learn.intro', 'Short lessons with small practice exercises solved in the <b>real editor</b> \u2014 the simulator checks your code. Progress is saved.') + '</p>'
      + '<div class="learn-summary" aria-live="polite"><b>' + completeLessons + '/' + realLessons.length + '</b> '
      + _lt('learn.complete', 'lessons complete') + '</div>'
      + '<div class="learn-list">' + rows + more + '</div>'
      + '<div class="learn-reset-row"><button class="lp-btn lp-quiet" onclick="learnResetProgress()">&#8634; '
      + _lt('learn.resetProgress', 'Reset progress') + '</button></div>';
    p.innerHTML = head + '<div class="lp-body">' + body + '</div>';
    clearMobileBar();
    _learnNotifyHost();
    return;
  }

  /* ── active practice ── */
  if(LEARN.task >= 0){
    var pr = _learnPracticeHtml(L);
    p.innerHTML = head + '<div class="lp-body">' + pr.body + '</div>' + pr.foot;
    if(mb){
      mb.innerHTML = pr.body + pr.foot;
      mb.classList.add('on');
      document.body.classList.add('practice-on');
      if(typeof window._growCode === 'function') requestAnimationFrame(window._growCode);
    }
    _learnLabelDiagrams(p, L);
    _learnNotifyHost();
    return;
  }

  /* ── reading mode, reference card: one page, practice always available ── */
  if(_learnCard(L)){
    p.innerHTML = head + '<div class="lp-body">' + _learnCardHtml(L) + '</div>' + _learnStartFoot(L);
    clearMobileBar();
    _learnLabelDiagrams(p, L);
    _learnNotifyHost();
    return;
  }

  /* ── reading mode: slide-by-slide, practice unlocks on the final slide ── */
  var dots = L.slides.map(function(_, i){
    return '<button type="button" class="' + (i === LEARN.slide ? 'on' : '') + '" onclick="LEARN.slide=' + i + ';learnRender();"'
      + ' aria-label="' + _lt('learn.slide', 'Slide') + ' ' + (i + 1) + '/' + L.slides.length + '"'
      + ' aria-current="' + (i === LEARN.slide ? 'step' : 'false') + '"></button>';
  }).join('');
  var read = '<div class="lp-slides">'
    + '<div class="lp-slides-nav">'
    + '<button class="lp-btn lp-slide-arrow lp-slide-prev" onclick="learnNav(-1)" aria-label="' + _lt('learn.prevSlide', 'Previous slide') + '"' + (LEARN.slide === 0 ? ' disabled' : '') + '>&#8249;</button>'
    + '<div class="learn-prog">' + dots + '</div>'
    + '<button class="lp-btn lp-slide-arrow lp-slide-next" onclick="learnNav(1)" aria-label="' + _lt('learn.nextSlide', 'Next slide') + '"' + (LEARN.slide === L.slides.length - 1 ? ' disabled' : '') + '>&#8250;</button>'
    + '<span class="lp-slide-n">' + (LEARN.slide + 1) + '/' + L.slides.length + '</span>'
    + '</div>'
    + '<div class="lp-slide-view">' + L.slides[LEARN.slide].html() + '</div>'
    + '</div>';

  var doneN = learnProgress()[L.id] || 0;
  var onLastSlide = LEARN.slide === L.slides.length - 1;
  var startFoot = onLastSlide
    ? '<div class="lp-foot"><button class="lp-btn chk grow" onclick="learnStartTask('
      + (doneN < L.tasks.length ? doneN : 0) + ')">'
      + (doneN > 0 && doneN < L.tasks.length
          ? _lt('learn.continuePractice', 'Continue practice') + ' (' + doneN + '/' + L.tasks.length + ') \u2192'
          : _lt('learn.startPractice', 'Start practice') + ' \u2192')
      + '</button></div>'
    : '<div class="lp-foot lp-practice-locked"><span>&#128274; '
      + _lt('learn.practiceUnlock', 'Practice unlocks on the last info slide') + '</span></div>';

  p.innerHTML = head + '<div class="lp-body">' + read + '</div>' + startFoot;
  clearMobileBar();
  _learnLabelDiagrams(p, L);
  _learnNotifyHost();
}

/* Optional host chrome (the web editor's YOUR ANSWER band) is synchronized
   after core has finished rendering. Android has no hook and remains untouched. */
function _learnNotifyHost(){
  try {
    if(typeof document !== 'undefined' && document.body)
      document.body.classList.toggle('learn-practice', !!(LEARN.open && LEARN.lesson >= 0 && LEARN.task >= 0));
    if(typeof document !== 'undefined' && document.body)
      document.body.classList.toggle('learn-locked', _learnLockActive());
    _learnApplyKeypad();
  } catch(e){}
  try {
    if(typeof window !== 'undefined' && typeof window.learnHostUpdate === 'function'){
      window.learnHostUpdate();
    }
  } catch(e){}
}

/* Every diagram normally provides a concise semantic label at its source.
   For future dynamic diagrams, derive a useful fallback from visible SVG
   annotations instead of exposing only "diagram 1" to assistive technology. */
function _learnLabelDiagrams(p, L){
  Array.prototype.forEach.call(p.querySelectorAll('.learn-svg'), function(svg, i){
    svg.setAttribute('role', 'img');
    if(!svg.hasAttribute('aria-label')){
      var parts = [];
      Array.prototype.forEach.call(svg.querySelectorAll('text'), function(node){
        var text = (node.textContent||'').replace(/\s+/g, ' ').trim();
        if(text && parts.indexOf(text)<0) parts.push(text);
      });
      svg.setAttribute('aria-label', parts.length
        ? L.title + ': ' + parts.join('; ')
        : L.title + ' instructional diagram ' + (i + 1));
    }
  });
}
