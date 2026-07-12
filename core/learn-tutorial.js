// learn-tutorial -- verified byte-for-byte identical between web and android repos.

function learnSvgBlank(dx, dy, dz){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<path d="M60 110 L170 110 L230 80 L120 80 Z" fill="rgba(74,158,255,.10)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M60 110 L60 60 L120 30 L120 80 Z" fill="rgba(74,158,255,.05)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M60 60 L170 60 L230 30 L120 30 Z" fill="rgba(74,158,255,.16)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M170 110 L170 60 L230 30 L230 80 Z" fill="rgba(74,158,255,.08)" stroke="var(--accent)" stroke-width="1"/>'
    + '<circle cx="60" cy="110" r="4" fill="#f0a94a"/>'
    + '<text x="12" y="128" font-family="monospace" font-size="11" fill="#f0a94a">0.1  X+0 Y+0 Z-'+dz+'</text>'
    + '<circle cx="230" cy="30" r="4" fill="#5dcaa5"/>'
    + '<text x="188" y="16" font-family="monospace" font-size="11" fill="#5dcaa5">0.2  X+'+dx+' Y+'+dy+' Z+0</text>'
    + '<line x1="285" y1="122" x2="285" y2="76" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="291" y="82" font-family="monospace" font-size="10" fill="var(--text3)">Z+</text>'
    + '<line x1="285" y1="122" x2="331" y2="122" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="320" y="138" font-family="monospace" font-size="10" fill="var(--text3)">X+</text>'
    + '<text x="100" y="100" font-family="monospace" font-size="10" fill="var(--text3)">'+dx+' x '+dy+' x '+dz+' mm</text>'
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
  var W=340, pad=20;
  var sc=(W-2*pad)/((bx1-bx0)||1);
  var H=Math.round((by1-by0)*sc)+2*pad;
  function SX(v){ return (pad+(v-bx0)*sc).toFixed(1); }
  function SY(v){ return (H-pad-(v-by0)*sc).toFixed(1); }
  var segs='', labels='';
  p.sub.forEach(function(s){
    if(s.len<1e-6) return;
    if(Math.abs(s.to.x-s.from.x)<1e-6 && Math.abs(s.to.y-s.from.y)<1e-6){
      // pure Z move: mark plunges into material with a dot
      if(!s.rapid && s.to.z < top-1e-6) segs+='<circle cx="'+SX(s.to.x)+'" cy="'+SY(s.to.y)+'" r="3.4" fill="none" stroke="var(--accent)" stroke-width="1.6"/>';
      return;
    }
    var d='M'+SX(s.from.x)+' '+SY(s.from.y)+'L'+SX(s.to.x)+' '+SY(s.to.y);
    var below = Math.min(s.from.z, s.to.z) < top-1e-6;
    if(s.rapid)      segs+='<path d="'+d+'" stroke="var(--text3)" stroke-width="1" stroke-dasharray="4 3" fill="none"/>';
    else if(below)   segs+='<path d="'+d+'" stroke="var(--accent)" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    else             segs+='<path d="'+d+'" stroke="#5dcaa5" stroke-width="1.3" fill="none"/>';
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
      labels+='<text x="'+tx+'" y="'+ty+'" font-family="monospace" font-size="9.5" font-weight="600" fill="#f0a94a" text-anchor="'+anchor+'">'+lbl+'</text>';
    }
  });
  var st=p.sub[0].from;
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'">'
    + '<rect x="'+SX(bx0)+'" y="'+SY(by1)+'" width="'+((bx1-bx0)*sc).toFixed(1)+'" height="'+((by1-by0)*sc).toFixed(1)+'" fill="rgba(74,158,255,.06)" stroke="var(--border)"/>'
    + segs
    + labels
    + '<circle cx="'+SX(st.x)+'" cy="'+SY(st.y)+'" r="3" fill="#f0a94a"/>'
    + '<text x="'+pad+'" y="12" font-family="monospace" font-size="9" fill="var(--text3)">top view &middot; dashed = FMAX &middot; orange = cutting</text>'
    + '</svg>';
}

function learnSvgChamfer(){
  var W=340, H=225;
  var scale=13;              // px per mm
  var d=2*scale;             // DL and DR magnitude (2 mm) — EQUAL lengths
  var Sy=104;                // workpiece surface y
  var Ex=150;                // original sharp edge x
  var ch=1*scale;            // 1 mm chamfer leg
  var s='';

  // ---- workpiece with the 1x45 chamfered corner ----
  s+='<path d="M24 '+Sy+' L'+(Ex-ch)+' '+Sy+' L'+Ex+' '+(Sy+ch)+' L'+Ex+' '+(H-18)+' L24 '+(H-18)+' Z" fill="rgba(74,158,255,.12)" stroke="var(--border)"/>';
  s+='<path d="M'+(Ex-ch)+' '+Sy+' L'+Ex+' '+Sy+' L'+Ex+' '+(Sy+ch)+'" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>';
  s+='<path d="M'+(Ex-ch)+' '+Sy+' L'+Ex+' '+(Sy+ch)+'" stroke="var(--accent)" stroke-width="3" fill="none" stroke-linecap="round"/>';

  // contact point = midpoint of the workpiece chamfer face
  var contactX=Ex-ch/2, contactY=Sy+ch/2;

  // ---- countersink cone: tip is DL below the surface, on the 45deg flank ----
  var tipY=Sy+d;
  var tipX=contactX + (tipY-contactY);     // 45deg left flank through contact
  var faceTopX=contactX-(tipX-contactX);
  var faceTopY=contactY-(tipY-contactY);
  var rightTopX=tipX+(tipX-faceTopX);
  var coneTopY=faceTopY;
  // cone body + shank
  s+='<path d="M'+tipX+' '+tipY+' L'+faceTopX+' '+faceTopY+' L'+rightTopX+' '+coneTopY+' Z" fill="rgba(139,147,161,.14)" stroke="var(--text3)" stroke-width="1.4"/>';
  s+='<path d="M'+faceTopX+' '+faceTopY+' L'+faceTopX+' '+(faceTopY-24)+' M'+rightTopX+' '+coneTopY+' L'+rightTopX+' '+(coneTopY-24)+'" stroke="var(--text3)" stroke-width="1.4" fill="none"/>';
  // BLUE cutting face (tip -> faceTop); contact is its midpoint
  s+='<path d="M'+tipX+' '+tipY+' L'+faceTopX+' '+faceTopY+'" stroke="var(--accent)" stroke-width="2.6" fill="none"/>';
  s+='<text x="'+(rightTopX+6)+'" y="'+(coneTopY+2)+'" font-family="monospace" font-size="10" fill="var(--text3)">90 countersink</text>';
  s+='<text x="'+(rightTopX+6)+'" y="'+(coneTopY+15)+'" font-family="monospace" font-size="10" fill="var(--text3)">(T5)</text>';

  // ==== DL and DR are the two components of the SAME vector: contact -> tip ====
  // Drawn OFFSET from the tool itself (with thin leader lines) for clarity.
  var off=26; // how far the dimension is pulled away from the tool
  // DR: horizontal component, offset ABOVE the contact/tip corner
  var drY=contactY-off;
  s+='<line x1="'+contactX+'" y1="'+contactY+'" x2="'+contactX+'" y2="'+drY+'" stroke="#5dcaa5" stroke-width="0.8" stroke-dasharray="3 3"/>';
  s+='<line x1="'+tipX+'" y1="'+contactY+'" x2="'+tipX+'" y2="'+drY+'" stroke="#5dcaa5" stroke-width="0.8" stroke-dasharray="3 3"/>';
  s+='<line x1="'+contactX+'" y1="'+drY+'" x2="'+tipX+'" y2="'+drY+'" stroke="#5dcaa5" stroke-width="1.6"/>';
  s+='<line x1="'+contactX+'" y1="'+(drY-6)+'" x2="'+contactX+'" y2="'+(drY+6)+'" stroke="#5dcaa5"/>';
  s+='<line x1="'+tipX+'" y1="'+(drY-6)+'" x2="'+tipX+'" y2="'+(drY+6)+'" stroke="#5dcaa5"/>';
  s+='<text x="'+((contactX+tipX)/2)+'" y="'+(drY-8)+'" font-family="monospace" font-size="11" fill="#5dcaa5" text-anchor="middle">DR+2</text>';
  // DL: vertical component, offset to the RIGHT of the tip corner
  var dlX=tipX+off;
  s+='<line x1="'+tipX+'" y1="'+contactY+'" x2="'+dlX+'" y2="'+contactY+'" stroke="#f0a94a" stroke-width="0.8" stroke-dasharray="3 3"/>';
  s+='<line x1="'+tipX+'" y1="'+tipY+'" x2="'+dlX+'" y2="'+tipY+'" stroke="#f0a94a" stroke-width="0.8" stroke-dasharray="3 3"/>';
  s+='<line x1="'+dlX+'" y1="'+contactY+'" x2="'+dlX+'" y2="'+tipY+'" stroke="#f0a94a" stroke-width="1.6"/>';
  s+='<line x1="'+(dlX-6)+'" y1="'+contactY+'" x2="'+(dlX+6)+'" y2="'+contactY+'" stroke="#f0a94a"/>';
  s+='<line x1="'+(dlX-6)+'" y1="'+tipY+'" x2="'+(dlX+6)+'" y2="'+tipY+'" stroke="#f0a94a"/>';
  s+='<text x="'+(dlX+10)+'" y="'+((contactY+tipY)/2+4)+'" font-family="monospace" font-size="11" fill="#f0a94a">DL-2</text>';

  // markers on top so they read clearly
  s+='<circle cx="'+contactX+'" cy="'+contactY+'" r="3.6" fill="#f0a94a"/>';
  s+='<circle cx="'+tipX+'" cy="'+tipY+'" r="3" fill="var(--text3)"/>';

  // labels clear of lines
  s+='<text x="26" y="'+(Sy-9)+'" font-family="monospace" font-size="9" fill="var(--text3)">workpiece surface</text>';
  s+='<text x="26" y="'+(contactY+30)+'" font-family="monospace" font-size="9" fill="#f0a94a">contact point</text>';
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'" role="img">'
    + s
    + '<text x="14" y="'+(H-3)+'" font-family="monospace" font-size="8.5" fill="var(--text3)">DR (horizontal) and DL (vertical) both run from the contact point to the tool tip</text>'
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
  s+='<path d="'+ld+'" fill="none" stroke="var(--accent)" stroke-width="1.8"/>';
  s+='<path d="'+rd+'" fill="none" stroke="var(--accent)" stroke-width="1.8"/>';
  var py0=top+pitch+pitch/2, py1=top+2*pitch+pitch/2;
  s+='<line x1="'+(x+52)+'" y1="'+py0+'" x2="'+(x+52)+'" y2="'+py1+'" stroke="#f0a94a" stroke-width="1"/>';
  s+='<line x1="'+(x+40)+'" y1="'+py0+'" x2="'+(x+56)+'" y2="'+py0+'" stroke="#f0a94a" stroke-dasharray="2 2"/>';
  s+='<line x1="'+(x+40)+'" y1="'+py1+'" x2="'+(x+56)+'" y2="'+py1+'" stroke="#f0a94a" stroke-dasharray="2 2"/>';
  s+='<text x="'+(x+60)+'" y="'+(py0+pitch/2+4)+'" font-family="monospace" font-size="11" fill="#f0a94a">pitch</text>';
  var ay=top+teeth*pitch;
  s+='<line x1="'+(x-70)+'" y1="'+top+'" x2="'+(x-70)+'" y2="'+ay+'" stroke="var(--accent)" stroke-width="1.6"/>';
  s+='<path d="M'+(x-74)+' '+(ay-7)+' l4 7 l4 -7" fill="none" stroke="var(--accent)" stroke-width="1.6"/>';
  s+='<text x="4" y="'+((top+ay)/2)+'" font-family="monospace" font-size="9.5" fill="var(--accent)">feed =</text>';
  s+='<text x="4" y="'+((top+ay)/2+13)+'" font-family="monospace" font-size="9.5" fill="var(--accent)">pitch/turn</text>';
  return '<svg class="learn-svg" viewBox="0 0 340 '+(top+teeth*pitch+26)+'" role="img">'
    + s
    + '<text x="14" y="'+(top+teeth*pitch+20)+'" font-family="monospace" font-size="8.5" fill="var(--text3)">rotation + downfeed locked: one revolution = one pitch deeper</text>'
    + '</svg>';
}

function learnSvgTool(){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<rect x="150" y="18" width="40" height="52" rx="3" fill="rgba(139,147,161,.25)" stroke="var(--text3)"/>'
    + '<rect x="155" y="70" width="30" height="52" fill="rgba(74,158,255,.18)" stroke="var(--accent)"/>'
    + '<path d="M155 122 L160 128 L165 122 L170 128 L175 122 L180 128 L185 122" stroke="var(--accent)" fill="none" stroke-width="1.4"/>'
    + '<line x1="120" y1="18" x2="120" y2="128" stroke="#f0a94a" stroke-width="1"/>'
    + '<line x1="114" y1="18" x2="126" y2="18" stroke="#f0a94a"/><line x1="114" y1="128" x2="126" y2="128" stroke="#f0a94a"/>'
    + '<text x="96" y="78" font-family="monospace" font-size="12" fill="#f0a94a">L</text>'
    + '<line x1="170" y1="138" x2="185" y2="138" stroke="#5dcaa5" stroke-width="1"/>'
    + '<line x1="170" y1="133" x2="170" y2="143" stroke="#5dcaa5"/><line x1="185" y1="133" x2="185" y2="143" stroke="#5dcaa5"/>'
    + '<text x="192" y="142" font-family="monospace" font-size="12" fill="#5dcaa5">R</text>'
    + '<text x="215" y="45" font-family="monospace" font-size="10" fill="var(--text3)">shank</text>'
    + '<text x="215" y="96" font-family="monospace" font-size="10" fill="var(--text3)">flutes (LCUTS)</text>'
    + '</svg>';
}

function learnSvgApproach(){
  return '<svg class="learn-svg" viewBox="0 0 340 160" role="img">'
    + '<rect x="30" y="95" width="280" height="50" fill="rgba(74,158,255,.10)" stroke="var(--accent)"/>'
    + '<text x="270" y="126" font-family="monospace" font-size="10" fill="var(--text3)">blank</text>'
    + '<path d="M60 20 L170 20" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<path d="M170 20 L170 85" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<path d="M170 85 L170 120" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/>'
    + '<path d="M170 120 L250 120" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/>'
    + '<circle cx="60" cy="20" r="3" fill="#f0a94a"/>'
    + '<text x="182" y="24" font-family="monospace" font-size="10" fill="var(--text3)">FMAX high</text>'
    + '<line x1="150" y1="85" x2="150" y2="95" stroke="#f0a94a" stroke-width="1"/>'
    + '<text x="60" y="92" font-family="monospace" font-size="10" fill="#f0a94a">FMAX to +2 mm</text>'
    + '<text x="182" y="108" font-family="monospace" font-size="10" fill="var(--accent)">FEED below surface</text>'
    + '</svg>';
}

function learnSvgComp(){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<path d="M80 130 L80 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M76 35 L80 22 L84 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<text x="64" y="16" font-family="monospace" font-size="10" fill="var(--text)">motion</text>'
    + '<circle cx="55" cy="75" r="20" fill="rgba(20,184,166,.15)" stroke="var(--accent)" stroke-width="1.6"/>'
    + '<circle cx="55" cy="75" r="2" fill="var(--accent)"/>'
    + '<text x="38" y="115" font-family="monospace" font-size="12" fill="var(--accent)">RL</text>'
    + '<path d="M230 130 L230 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M226 35 L230 22 L234 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<circle cx="255" cy="75" r="20" fill="rgba(93,202,165,.15)" stroke="#5dcaa5" stroke-width="1.6"/>'
    + '<circle cx="255" cy="75" r="2" fill="#5dcaa5"/>'
    + '<text x="266" y="115" font-family="monospace" font-size="12" fill="#5dcaa5">RR</text>'
    + '<text x="20" y="145" font-family="monospace" font-size="9.5" fill="var(--text3)">looking along the motion: RL = tool left, RR = tool right</text>'
    + '</svg>';
}

function learnSvgCorner(){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<path d="M20 110 L85 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M115 80 L115 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M85 110 A30 30 0 0 0 115 80" stroke="var(--accent)" stroke-width="2.4" fill="none"/>'
    + '<path d="M85 110 L115 110 L115 80" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
    + '<line x1="115" y1="110" x2="94" y2="89" stroke="#f0a94a" stroke-width="1"/>'
    + '<text x="120" y="102" font-family="monospace" font-size="11" fill="#f0a94a">R</text>'
    + '<text x="30" y="135" font-family="monospace" font-size="12" fill="var(--accent)">RND R10</text>'
    + '<path d="M195 110 L252 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M280 82 L280 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M252 110 L280 82" stroke="#5dcaa5" stroke-width="2.4"/>'
    + '<path d="M252 110 L280 110 L280 82" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
    + '<text x="250" y="128" font-family="monospace" font-size="10" fill="var(--text3)">8</text>'
    + '<text x="286" y="100" font-family="monospace" font-size="10" fill="var(--text3)">8</text>'
    + '<text x="205" y="135" font-family="monospace" font-size="12" fill="#5dcaa5">CHF 8</text>'
    + '<text x="20" y="16" font-family="monospace" font-size="9.5" fill="var(--text3)">dashed = the sharp corner that gets replaced</text>'
    + '</svg>';
}

function learnSvgDrawing(){
  function dim(x1,y1,x2,y2,txt,tx,ty){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+x1+'" y1="'+(y1-3)+'" x2="'+x1+'" y2="'+(y1+3)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+x2+'" y1="'+(y2-3)+'" x2="'+x2+'" y2="'+(y2+3)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<text x="'+tx+'" y="'+ty+'" font-family="monospace" font-size="9.5" fill="#f0a94a" text-anchor="middle">'+txt+'</text>';
  }
  var g = '';
  // blank 100x100 -> 220px, scale 2.2, origin (60,250)
  function X(v){ return 60 + v*2.2; }
  function Y(v){ return 250 - v*2.2; }
  g += '<rect x="'+X(0)+'" y="'+Y(100)+'" width="220" height="220" fill="none" stroke="var(--text3)" stroke-width="1.2"/>';
  // contour 80x80 R10
  g += '<rect x="'+X(10)+'" y="'+Y(90)+'" width="176" height="176" rx="22" fill="rgba(20,184,166,.06)" stroke="var(--accent)" stroke-width="1.6"/>';
  // 4 holes at 25/75
  var hp = [[25,25],[75,25],[75,75],[25,75]];
  for(var i=0;i<hp.length;i++){
    g += '<circle cx="'+X(hp[i][0])+'" cy="'+Y(hp[i][1])+'" r="7.5" fill="none" stroke="var(--text)" stroke-width="1.3"/>'
      + '<line x1="'+(X(hp[i][0])-11)+'" y1="'+Y(hp[i][1])+'" x2="'+(X(hp[i][0])+11)+'" y2="'+Y(hp[i][1])+'" stroke="var(--text3)" stroke-width="0.6"/>'
      + '<line x1="'+X(hp[i][0])+'" y1="'+(Y(hp[i][1])-11)+'" x2="'+X(hp[i][0])+'" y2="'+(Y(hp[i][1])+11)+'" stroke="var(--text3)" stroke-width="0.6"/>';
  }
  // centre pocket D30
  g += '<circle cx="'+X(50)+'" cy="'+Y(50)+'" r="33" fill="rgba(38,194,129,.07)" stroke="#5dcaa5" stroke-width="1.6"/>'
    + '<line x1="'+(X(50)-40)+'" y1="'+Y(50)+'" x2="'+(X(50)+40)+'" y2="'+Y(50)+'" stroke="var(--text3)" stroke-width="0.6"/>'
    + '<line x1="'+X(50)+'" y1="'+(Y(50)-40)+'" x2="'+X(50)+'" y2="'+(Y(50)+40)+'" stroke="var(--text3)" stroke-width="0.6"/>';
  // dimensions
  g += dim(X(0), 288, X(100), 288, '100', (X(0)+X(100))/2, 300);
  g += dim(X(10), 272, X(90), 272, '80', (X(10)+X(90))/2, 268);
  g += dim(X(25), 40, X(75), 40, '50', (X(25)+X(75))/2, 36);
  g += '<line x1="'+X(25)+'" y1="40" x2="'+X(25)+'" y2="'+Y(75)+'" stroke="#f0a94a" stroke-width="0.5" stroke-dasharray="3 3"/>';
  g += '<line x1="'+X(75)+'" y1="40" x2="'+X(75)+'" y2="'+Y(75)+'" stroke="#f0a94a" stroke-width="0.5" stroke-dasharray="3 3"/>';
  // callouts
  g += '<text x="'+(X(75)+16)+'" y="'+(Y(75)-14)+'" font-family="monospace" font-size="9.5" fill="var(--text)">4x \u00d86.8 THRU</text>';
  g += '<text x="'+X(50)+'" y="'+(Y(50)+48)+'" font-family="monospace" font-size="9.5" fill="#5dcaa5" text-anchor="middle">\u00d830 \u2193 8</text>';
  g += '<text x="'+(X(10)+8)+'" y="'+(Y(90)+16)+'" font-family="monospace" font-size="9.5" fill="var(--accent)">R10 \u00b7 \u2193 3</text>';
  g += '<text x="'+X(0)+'" y="'+(Y(100)-8)+'" font-family="monospace" font-size="9" fill="var(--text3)">blank 100 x 100 x 25 \u00b7 top Z+0</text>';
  return '<svg class="learn-svg" viewBox="0 0 340 310" role="img">'+g+'</svg>';
}

function learnSvgPartProfile(){
  function X(v){ return 55 + v*2.2; }
  function Y(v){ return 250 - v*2.2; }
  function dimH(x1,x2,y,txt,ty){
    return '<line x1="'+X(x1)+'" y1="'+y+'" x2="'+X(x2)+'" y2="'+y+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+X(x1)+'" y1="'+(y-3)+'" x2="'+X(x1)+'" y2="'+(y+3)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+X(x2)+'" y1="'+(y-3)+'" x2="'+X(x2)+'" y2="'+(y+3)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<text x="'+((X(x1)+X(x2))/2)+'" y="'+(ty)+'" font-family="monospace" font-size="9.5" fill="#f0a94a" text-anchor="middle">'+txt+'</text>';
  }
  function dimV(y1,y2,x,txt,tx){
    var my=(Y(y1)+Y(y2))/2+3;
    return '<line x1="'+x+'" y1="'+Y(y1)+'" x2="'+x+'" y2="'+Y(y2)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+(x-3)+'" y1="'+Y(y1)+'" x2="'+(x+3)+'" y2="'+Y(y1)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<line x1="'+(x-3)+'" y1="'+Y(y2)+'" x2="'+(x+3)+'" y2="'+Y(y2)+'" stroke="#f0a94a" stroke-width="0.8"/>'
      + '<text x="'+tx+'" y="'+my+'" font-family="monospace" font-size="9.5" fill="#f0a94a" text-anchor="middle" transform="rotate(-90 '+tx+' '+my+')">'+txt+'</text>';
  }
  var r = 15*2.2;
  var g = '';
  // blank 100x100 (dashed)
  g += '<rect x="'+X(0)+'" y="'+Y(100)+'" width="'+(100*2.2)+'" height="'+(100*2.2)+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="4 3"/>';
  // profile 90x90: R15 top-left (convex, sweep=1), 15x45 chamfer bottom-right
  var p = 'M '+X(5)+' '+Y(5)
        + ' L '+X(5)+' '+Y(80)
        + ' A '+r+' '+r+' 0 0 1 '+X(20)+' '+Y(95)
        + ' L '+X(95)+' '+Y(95)
        + ' L '+X(95)+' '+Y(20)
        + ' L '+X(80)+' '+Y(5)
        + ' Z';
  g += '<path d="'+p+'" fill="rgba(20,184,166,.08)" stroke="var(--accent)" stroke-width="1.8"/>';
  // dimensions
  g += dimH(5, 95, 268, '90', 264);
  g += dimV(5, 95, 38, '90', 30);
  g += dimH(0, 100, 286, '100 blank', 298);
  // R15 callout (inside, near the fillet)
  g += '<text x="'+(X(24))+'" y="'+(Y(84))+'" font-family="monospace" font-size="9.5" fill="var(--accent)">R15</text>';
  // chamfer callout with a leader line so it does not sit on the chamfer edge
  var cmx=(X(95)+X(80))/2, cmy=(Y(20)+Y(5))/2;
  g += '<line x1="'+cmx+'" y1="'+cmy+'" x2="'+X(102)+'" y2="'+(Y(12))+'" stroke="var(--accent)" stroke-width="0.5"/>';
  g += '<text x="'+X(103)+'" y="'+(Y(12)+3)+'" font-family="monospace" font-size="9.5" fill="var(--accent)">15x45\u00b0</text>';
  g += '<text x="'+X(50)+'" y="'+Y(50)+'" font-family="monospace" font-size="10" fill="var(--text2)" text-anchor="middle">profile</text>';
  g += '<text x="'+X(0)+'" y="'+(Y(100)-9)+'" font-family="monospace" font-size="9" fill="var(--text3)">blank 100 x 100 \u00b7 top Z+5 \u00b7 floor Z0</text>';
  return '<svg class="learn-svg" viewBox="0 0 350 300" role="img">'+g+'</svg>';
}

function learnSvgPolar(){
  var cx=140, cy=100, R=64;
  var ang = 40*Math.PI/180;
  var px=(cx+R*Math.cos(ang)).toFixed(1), py=(cy-R*Math.sin(ang)).toFixed(1);
  var r2=32;
  var ax1=(cx+r2*Math.cos(ang)).toFixed(1), ay1=(cy-r2*Math.sin(ang)).toFixed(1);
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img">'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R+34)+'" y2="'+cy+'" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+R+38)+'" y="'+(cy+4)+'" font-family="monospace" font-size="10" fill="var(--text3)">X+</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<path d="M '+(cx-3)+' '+(cy+4)+' l -6 1 l 2 5" fill="none" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="'+(cx-58)+'" y="'+(cy+30)+'" font-family="monospace" font-size="11" fill="var(--accent)">CC X+50 Y+40</text>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+px+'" y2="'+py+'" stroke="#5dcaa5" stroke-width="2.2"/>'
    + '<circle cx="'+px+'" cy="'+py+'" r="4.5" fill="#5dcaa5"/>'
    + '<text x="'+(parseFloat(px)+10)+'" y="'+(parseFloat(py)-8)+'" font-family="monospace" font-size="11" fill="#5dcaa5">the hole</text>'
    + '<text x="'+(cx+8)+'" y="'+(cy-44)+'" font-family="monospace" font-size="12" fill="#5dcaa5" transform="rotate(-40 '+(cx+30)+' '+(cy-30)+')">PR+25</text>'
    + '<path d="M '+(cx+r2)+' '+cy+' A '+r2+' '+r2+' 0 0 0 '+ax1+' '+ay1+'" fill="none" stroke="#f0a94a" stroke-width="1.6"/>'
    + '<path d="M '+ax1+' '+ay1+' l 8 0 l -5 6" fill="none" stroke="#f0a94a" stroke-width="1.6"/>'
    + '<text x="'+(cx+40)+'" y="'+(cy-8)+'" font-family="monospace" font-size="12" fill="#f0a94a">PA+40</text>'
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
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="'+(cx-58)+'" y="'+(cy+30)+'" font-family="monospace" font-size="11" fill="var(--accent)">CC X+50 Y+40</text>';
  // radius lines to each hole; PR label on the first
  [[p0,'PA+0',8,4],[p120,'PA+120',-66,-8],[p240,'PA+240',-72,14]].forEach(function(h){
    g += '<line x1="'+cx+'" y1="'+cy+'" x2="'+h[0][0]+'" y2="'+h[0][1]+'" stroke="#5dcaa5" stroke-width="1.2" stroke-dasharray="2 3"/>'
      + '<circle cx="'+h[0][0]+'" cy="'+h[0][1]+'" r="5" fill="none" stroke="var(--text)" stroke-width="1.6"/>'
      + '<text x="'+(parseFloat(h[0][0])+h[2])+'" y="'+(parseFloat(h[0][1])+h[3])+'" font-family="monospace" font-size="10.5" fill="#f0a94a">'+h[1]+'</text>';
  });
  g += '<text x="'+(cx+16)+'" y="'+(cy-10)+'" font-family="monospace" font-size="11" fill="#5dcaa5" transform="rotate(0)">PR+25</text>';
  g = g.replace('<text x="'+(cx+16)+'" y="'+(cy-10)+'"', '<text x="'+(cx+14)+'" y="'+(cy-8)+'"');
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img">'+g
    + '<text x="20" y="192" font-family="monospace" font-size="9.5" fill="var(--text3)">same Polar Radius, Polar Angle stepped by 120\u00b0</text>'
    + '</svg>';
}

function learnSvgCounterbore(){
  return '<svg class="learn-svg" viewBox="0 0 340 165" role="img">'
    // plate section, hole \u00d86.6 with counterbore \u00d811 x 6
    + '<path d="M40 50 L145 50 L145 77 L155 77 L155 140 L40 140 Z" fill="rgba(20,184,166,.08)" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<path d="M300 50 L195 50 L195 77 L185 77 L185 140 L300 140 Z" fill="rgba(20,184,166,.08)" stroke="var(--accent)" stroke-width="1.2"/>'
    // screw head hint in the counterbore
    + '<rect x="148" y="53" width="44" height="21" rx="3" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3"/>'
    + '<line x1="163" y1="53" x2="163" y2="74" stroke="var(--text3)" stroke-width="0.7" stroke-dasharray="3 3"/>'
    + '<line x1="177" y1="53" x2="177" y2="74" stroke="var(--text3)" stroke-width="0.7" stroke-dasharray="3 3"/>'
    // dimensions
    + '<line x1="145" y1="40" x2="195" y2="40" stroke="#f0a94a" stroke-width="0.9"/>'
    + '<text x="170" y="34" font-family="monospace" font-size="10" fill="#f0a94a" text-anchor="middle">\u00d811 \u2193 6  (Q335 / Q201)</text>'
    + '<line x1="210" y1="77" x2="230" y2="77" stroke="#f0a94a" stroke-width="0.7" stroke-dasharray="3 3"/>'
    + '<line x1="155" y1="150" x2="185" y2="150" stroke="var(--text)" stroke-width="0.9"/>'
    + '<text x="170" y="162" font-family="monospace" font-size="10" fill="var(--text)" text-anchor="middle">\u00d86.6 THRU  (Q342)</text>'
    + '<text x="44" y="66" font-family="monospace" font-size="9" fill="var(--text3)">screw head sits flush</text>'
    + '</svg>';
}

function learnSvgArcCC(){
  var cx=120, cy=120, R=60;
  return '<svg class="learn-svg" viewBox="0 0 340 175" role="img">'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<path d="M '+(cx-3)+' '+(cy+4)+' l -6 1 l 2 5" fill="none" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="'+(cx-58)+'" y="'+(cy+30)+'" font-family="monospace" font-size="11" fill="var(--accent)">CC X+35 Y+45</text>'
    + '<path d="M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+'" fill="none" stroke="#5dcaa5" stroke-width="2.4" stroke-linecap="round"/>'
    + '<circle cx="'+(cx-R)+'" cy="'+cy+'" r="4" fill="#f0a94a"/>'
    + '<text x="'+(cx-R-14)+'" y="'+(cy+20)+'" font-family="monospace" font-size="10" fill="#f0a94a">start</text>'
    + '<circle cx="'+(cx+R)+'" cy="'+cy+'" r="4.5" fill="#5dcaa5"/>'
    + '<text x="'+(cx+R-38)+'" y="'+(cy+22)+'" font-family="monospace" font-size="11" fill="#5dcaa5">C X+50 Y+45</text>'
    + '<path d="M '+(cx+14)+' '+(cy-R+2)+' l 10 3 l -6 7" fill="none" stroke="#5dcaa5" stroke-width="1.6"/>'
    + '<text x="'+(cx-4)+'" y="'+(cy-R-8)+'" font-family="monospace" font-size="11" fill="#5dcaa5">DR- (clockwise)</text>'
    + '</svg>';
}

function learnSvgArcCR(){
  var cx=120, cy=120, R=60;
  return '<svg class="learn-svg" viewBox="0 0 340 175" role="img">'
    + '<path d="M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+'" fill="none" stroke="#5dcaa5" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*0.7071).toFixed(1)+'" y2="'+(cy-R*0.7071).toFixed(1)+'" stroke="#f0a94a" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<text x="'+(cx+18)+'" y="'+(cy-26)+'" font-family="monospace" font-size="12" fill="#f0a94a">R+15</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="none" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx-52)+'" y="'+(cy+30)+'" font-family="monospace" font-size="10" fill="var(--text3)">no CC needed</text>'
    + '<circle cx="'+(cx-R)+'" cy="'+cy+'" r="4" fill="#f0a94a"/>'
    + '<text x="'+(cx-R-14)+'" y="'+(cy+20)+'" font-family="monospace" font-size="10" fill="#f0a94a">start</text>'
    + '<circle cx="'+(cx+R)+'" cy="'+cy+'" r="4.5" fill="#5dcaa5"/>'
    + '<text x="'+(cx+R-48)+'" y="'+(cy+22)+'" font-family="monospace" font-size="11" fill="#5dcaa5">CR X+80 Y+45</text>'
    + '<path d="M '+(cx+14)+' '+(cy-R+2)+' l 10 3 l -6 7" fill="none" stroke="#5dcaa5" stroke-width="1.6"/>'
    + '<text x="'+(cx-4)+'" y="'+(cy-R-8)+'" font-family="monospace" font-size="11" fill="#5dcaa5">DR-</text>'
    + '</svg>';
}

function learnSvgDrill(){
  return '<svg class="learn-svg" viewBox="0 0 340 170" role="img">'
    + '<rect x="40" y="60" width="260" height="95" fill="rgba(74,158,255,.10)" stroke="var(--accent)"/>'
    + '<line x1="40" y1="60" x2="300" y2="60" stroke="var(--accent)"/>'
    + '<text x="250" y="55" font-family="monospace" font-size="10" fill="var(--text3)">Q203 surface</text>'
    + '<path d="M150 15 L150 40" stroke="var(--text3)" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<line x1="60" y1="15" x2="240" y2="15" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<text x="246" y="19" font-family="monospace" font-size="10" fill="var(--text3)">Q204 2nd clearance</text>'
    + '<line x1="130" y1="40" x2="170" y2="40" stroke="#f0a94a" stroke-width="1"/>'
    + '<text x="176" y="44" font-family="monospace" font-size="10" fill="#f0a94a">Q200 clearance</text>'
    + '<path d="M150 40 L150 100" stroke="var(--accent)" stroke-width="2.4"/>'
    + '<path d="M144 100 L150 112 L156 100 Z" fill="var(--accent)"/>'
    + '<line x1="130" y1="112" x2="170" y2="112" stroke="var(--accent)" stroke-width="1"/>'
    + '<text x="176" y="90" font-family="monospace" font-size="10" fill="var(--accent)">Q202 peck</text>'
    + '<path d="M150 112 L150 140" stroke="var(--accent)" stroke-width="2.4" stroke-dasharray="2 3"/>'
    + '<line x1="130" y1="140" x2="170" y2="140" stroke="var(--text)" stroke-width="1"/>'
    + '<text x="176" y="144" font-family="monospace" font-size="10" fill="var(--text)">Q201 depth (negative)</text>'
    + '</svg>';
}

function learnEvalChecks(code, task){
  var parsed = null, parseErr = null;
  try { parsed = parseProgram(code); } catch(e){ parseErr = e; }
  return task.checks.map(function(ch){
    var ok = false;
    try {
      if(ch.t === 'begin_end'){
        var mB = code.match(/BEGIN\s+PGM\s+([A-Z0-9_.-]+)\s+MM/i);
        var mE = code.match(/END\s+PGM\s+([A-Z0-9_.-]+)\s+MM/i);
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
        var mTc = code.match(reTc);
        if(mTc){
          ok = true;
          if(ch.S !== undefined){ var mS = mTc[1].match(/\bS(\d+[.,]?\d*)/i); ok = ok && !!mS && Math.abs(parseFloat(mS[1].replace(',','.')) - ch.S) < 0.5; }
          if(ch.F !== undefined){ var mF = mTc[1].match(/\bF(\d+[.,]?\d*)/i); ok = ok && !!mF && Math.abs(parseFloat(mF[1].replace(',','.')) - ch.F) < 0.5; }
        }
      }
      else if(ch.t === 'uses'){
        ok = ch.re.test(code);
      }
      else if(ch.t === 'order'){
        // b must occur somewhere AFTER the first occurrence of a
        var ia = code.search(ch.a);
        ok = ia >= 0 && ch.b.test(code.slice(ia + 1));
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
        // any line containing ';' followed by some real text
        ok = /;\s*\S/.test(code);
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
}

function openLearn(){
  LEARN.open = true;
  // Stash the user's own program right away and start with an EMPTY editor —
  // the whole point of Learn mode is writing every line yourself, and the 3D
  // blank stays hidden until a valid BLK FORM is written (see learnUpdateBlank).
  if(LEARN.savedCode === null){
    LEARN.savedCode = codeEl.value;
    codeEl.value = '';
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
}

function learnOpenLesson(i){
  LEARN.lesson = i; LEARN.slide = 0; LEARN.view = 'lesson';
  learnRender();
}

function learnNav(d){
  var L = LESSONS[LEARN.lesson];
  LEARN.slide = Math.max(0, Math.min(L.slides.length - 1, LEARN.slide + d));
  learnRender();
}

function learnBackToList(){ LEARN.view = 'list'; LEARN.lesson = -1; learnRender(); }

function learnSolve(){
  var pw = prompt('Password:');
  if(pw !== '1234') return;
  var T = LESSONS[LEARN.lesson].tasks[LEARN.task];
  var code = T.starter;
  if(T.solRepl) code = code.replace(T.solRepl[0], T.solRepl[1]);
  else if(T.sol !== undefined) code = code.replace('\n\n', '\n' + T.sol + '\n');
  codeEl.value = code;
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
  learnRender();
}

function learnStartTask(ti){
  // Moving to another task should NOT pop the on-screen keyboard back up. If the
  // code textarea is still the focused element (the phone keyboard was only
  // dismissed, not blurred), then changing its value below and resizing it in
  // _growCode makes mobile browsers re-open the keyboard. Blur first so the user
  // lands on the new task able to read it, and taps in themselves when ready.
  try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}
  var L = LESSONS[LEARN.lesson];
  if(LEARN.savedCode === null) LEARN.savedCode = codeEl.value; // stash user's work once
  LEARN.task = ti; LEARN.lastResults = null; LEARN.view = 'lesson';
  codeEl.value = L.tasks[ti].starter;
  dirty = true; if(typeof _undoPush==='function') _undoPush();
  updateLineNums(); runValidation();
  if(typeof renderIdlePanel==='function') renderIdlePanel();
  if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  learnRender();
  if(_isMTab()) mtabSwitch('editor');
}

function learnCheck(){
  var L = LESSONS[LEARN.lesson];
  runValidation(); // refresh problem gutter (lesson-specific mutes applied)
  LEARN.lastResults = learnEvalChecks(codeEl.value, L.tasks[LEARN.task]);
  if(LEARN.lastResults.every(function(r){ return r.ok; })) learnTaskDone(L.id, LEARN.task);
  learnRender();
}

function learnFinishLesson(){
  // Keep what the user wrote in the editor — finishing a lesson shouldn't
  // wipe their result and bring back the previously stashed program.
  LEARN.savedCode = null;           // drop the stash (kept code wins)
  LEARN.task = -1; LEARN.lastResults = null;
  LEARN.view = 'list'; LEARN.lesson = -1;
  runValidation();
  learnRender();
  learnUpdateBlank();
}

function learnExit(){
  if(LEARN.savedCode !== null){
    codeEl.value = LEARN.savedCode; LEARN.savedCode = null;
    dirty = true; updateLineNums(); runValidation();
    if(typeof renderIdlePanel==='function') renderIdlePanel();
    if(typeof updateHighlightOverlay==='function') updateHighlightOverlay();
  }
  LEARN.task = -1; LEARN.lastResults = null;
  if(LEARN.open){ LEARN.view = 'list'; LEARN.lesson = -1; learnRender(); }
  learnUpdateBlank();
  // Mobile: hide the pinned practice strip and restore the normal editor idle
  // panel (undo/redo etc.) now that practice is over.
  var mb = document.getElementById('learnMobileBar');
  if(mb){ mb.classList.remove('on'); mb.innerHTML=''; }
  document.body.classList.remove('practice-on');
  if(typeof renderIdlePanel==='function') renderIdlePanel();
  if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
}

function learnRender(){
  var p = _lpEl();
  if(!p) return;
  var L = LEARN.lesson >= 0 ? LESSONS[LEARN.lesson] : null;
  var title = L ? ('Lesson ' + (LEARN.lesson+1) + ' \u00b7 ' + L.title) : 'Learn \u2014 Heidenhain basics';
  var head = '<div class="lp-head"><span style="font-size:15px;">&#127891;</span>'
    + '<span class="lp-title">' + title + '</span>'
    + '<button class="lp-x" onclick="closeLearn()" title="Close Learn">&#10005;</button></div>';
  var body = '';

  if(LEARN.view === 'list' || !L){
    var prog = learnProgress();
    var rows = LESSONS.map(function(Ls, i){
      var done = (prog[Ls.id]||0) >= Ls.tasks.length;
      var started = (prog[Ls.id]||0) > 0;
      var assisted = !!prog[Ls.id + '#solved'];   // finished with the password button
      var tickCol = assisted ? '#f0a94a' : '#5dcaa5';
      var st = done ? '<span class="li-st" style="color:'+tickCol+';"'+(assisted?' title="Solved with assistance"':'')+'>&#10003;</span>'
             : started ? '<span class="li-st" style="color:'+(assisted?'#f0a94a':'var(--accent)')+';">'+prog[Ls.id]+'/'+Ls.tasks.length+'</span>'
             : '<span class="li-st" style="color:var(--text3);">&#9675;</span>';
      return '<div class="learn-li" onclick="learnOpenLesson('+i+')">'
        + '<span class="li-num">'+(i+1)+'</span><span class="li-t">'+Ls.title+'</span>'+st+'</div>';
    }).join('');
    var more = '<div class="learn-li lock" style="cursor:default;"><span class="li-num">&#127942;</span><span class="li-t">That\u2019s the full course \u2014 pass the exam and you can write real programs. Ideas? Report a Bug / Suggestion below.</span><span class="li-st"></span></div>';
    body = '<p>Short lessons with small practice exercises solved in the <b>real editor</b> \u2014 the simulator checks your code. Progress is saved.</p>'
      + '<div class="learn-list">' + rows + more + '</div>'
      + '<div style="text-align:center;margin-top:14px;"><button class="lp-btn" style="font-size:11px;color:var(--text3);" onclick="learnResetProgress()">&#8634; Reset progress</button></div>';
    p.innerHTML = head + '<div class="lp-body">'+body+'</div>';
    var _mb0 = document.getElementById('learnMobileBar');
    if(_mb0){ _mb0.classList.remove('on'); _mb0.innerHTML=''; document.body.classList.remove('practice-on'); }
    return;
  }

  /* \u2500\u2500 combined lesson view: slides pinned on top, practice below \u2500\u2500 */
  var dots = L.slides.map(function(_, i){
    return '<i class="'+(i===LEARN.slide?'on':'')+'" onclick="LEARN.slide='+i+';learnRender();" style="cursor:pointer;"></i>';
  }).join('');
  var slides = '<div class="lp-slides">'
    + '<div class="lp-sec-cap">&#128214; THEORY</div>'
    + '<div class="lp-slides-nav">'
    + '<button class="lp-btn" onclick="learnBackToList()" title="All lessons">&#9776;</button>'
    + '<button class="lp-btn" onclick="learnNav(-1)"'+(LEARN.slide===0?' disabled':'')+'>&#8249;</button>'
    + '<div class="learn-prog" style="flex:1;margin:0;">'+dots+'</div>'
    + '<button class="lp-btn" onclick="learnNav(1)"'+(LEARN.slide===L.slides.length-1?' disabled':'')+'>&#8250;</button>'
    + '<span style="font-family:var(--mono);font-size:11px;color:var(--text3);">'+(LEARN.slide+1)+'/'+L.slides.length+'</span>'
    + '</div>'
    + '<div class="lp-slide-view">' + L.slides[LEARN.slide].html() + '</div>'
    + '</div>';

  var practice = '<div class="lp-divider"><span>PRACTICE</span></div>';
  if(LEARN.task < 0){
    if(LEARN.slide === L.slides.length - 1){
      var prog2 = learnProgress();
      var doneN = prog2[L.id]||0;
      practice += '<button class="lp-btn chk" style="width:100%;text-align:center;padding:11px;font-size:13.5px;" onclick="learnStartTask('+(doneN < L.tasks.length ? doneN : 0)+')">'
        + (doneN>0 && doneN<L.tasks.length ? 'Continue practice ('+doneN+'/'+L.tasks.length+' done) \u2192' : 'Start practice \u2192') + '</button>';
    } else {
      practice += '<div style="font-family:var(--mono);font-size:11.5px;color:var(--text3);text-align:center;padding:4px 0 2px;">&#128274; Read through the slides \u2014 practice unlocks on the last one</div>';
    }
  } else {
    var T = L.tasks[LEARN.task];
    var res = LEARN.lastResults;
    var allOk = res && res.every(function(r){ return r.ok; });
    var lastTask = LEARN.task === L.tasks.length - 1;
    practice += '<span class="lp-task-badge">PRACTICE '+(LEARN.task+1)+' / '+L.tasks.length+'</span>'
      + '<div class="lp-prompt">'+T.prompt+'</div>';
    // criteria stay hidden until the first Check — the assignment is ONE sentence
    if(res){
      practice += '<div class="lp-checks">' + res.map(function(r){
        return '<div class="lp-check" style="color:'+(r.ok?'#5dcaa5':'var(--text2)')+';">'
          + '<span class="c-ic" style="color:'+(r.ok?'#5dcaa5':'#e24b4a')+';">'+(r.ok?'&#10003;':'&#10007;')+'</span>'
          + '<span>'+r.label + (!r.ok && r.hint ? '<div class="c-hint">&#128161; '+r.hint+'</div>' : '') + '</span></div>';
      }).join('') + '</div>';
    }
    if(allOk){
      practice += '<div class="lp-success">&#127881;<span>All checks passed \u2014 well done!'
        + (lastTask
            ? ' Lesson complete.<br>&#9654; Press <b>Run</b> and watch what your program does in 3D.'
            : ' Ready for the next task.') + '</span></div>';
    }
    practice += '<div class="lp-practice-btns">'
      + '<button class="lp-btn" style="padding:8px 10px;" onclick="learnExit()" title="Exit practice \u2014 back to editor">&#10005;</button>'
      + '<button class="lp-btn" style="opacity:.25;padding:8px 8px;border-color:transparent;" onclick="learnSolve()" title="">&#8943;</button>'
      + '<button class="lp-btn" onclick="learnStartTask('+LEARN.task+')" title="Reload starter code">Reset</button>'
      + (allOk
          ? (lastTask
              ? '<button class="lp-btn pri grow" onclick="learnFinishLesson()">Finish lesson &#10003;</button>'
              : '<button class="lp-btn pri grow" onclick="learnStartTask('+(LEARN.task+1)+')">Next \u2192</button>')
          : '<button class="lp-btn chk grow" onclick="learnCheck()">Check</button>')
      + '</div>';
  }

  p.innerHTML = head + '<div class="lp-body">' + slides + practice + '</div>';

  // Mobile: pin the ACTIVE practice above the editor (Editor tab), so the
  // assignment is visible while typing. Slides stay on the Learn tab.
  var mb = document.getElementById('learnMobileBar');
  if(mb){
    if(LEARN.task >= 0){
      var core = practice.replace('<div class="lp-divider"><span>PRACTICE</span></div>', '');
      mb.innerHTML = core;
      mb.classList.add('on');
      document.body.classList.add('practice-on');
    } else {
      mb.classList.remove('on'); mb.innerHTML='';
      document.body.classList.remove('practice-on');
    }
    if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
  }
}
