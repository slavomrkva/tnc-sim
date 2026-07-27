// Learn tutorial web reference; deliberate shared changes can be ported to Android after acceptance.

function learnSvgLearningLoop(){
  var cards = [
    {x:10,  n:'1', title:'READ TASK', c:'var(--accent)'},
    {x:125, n:'2', title:'EDIT CODE', c:'#f0a94a'},
    {x:240, n:'3', title:'CHECK',     c:'#5dcaa5'}
  ];
  var g = '';
  cards.forEach(function(c, i){
    g += '<rect x="'+c.x+'" y="16" width="90" height="54" rx="9" fill="rgba(74,158,255,.07)" stroke="'+c.c+'"/>'
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
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<path d="M60 110 L170 110 L230 80 L120 80 Z" fill="rgba(74,158,255,.10)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M60 110 L60 60 L120 30 L120 80 Z" fill="rgba(74,158,255,.05)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M60 60 L170 60 L230 30 L120 30 Z" fill="rgba(74,158,255,.16)" stroke="var(--accent)" stroke-width="1"/>'
    + '<path d="M170 110 L170 60 L230 30 L230 80 Z" fill="rgba(74,158,255,.08)" stroke="var(--accent)" stroke-width="1"/>'
    + '<circle cx="60" cy="110" r="4" fill="#f0a94a"/>'
    + '<text x="12" y="128" font-family="monospace" font-size="11" fill="#f0a94a">MIN 0.1 · X+0 Y+0 Z-'+dz+'</text>'
    + '<circle cx="230" cy="30" r="4" fill="#5dcaa5"/>'
    + '<text x="174" y="16" font-family="monospace" font-size="11" fill="#5dcaa5">MAX 0.2 · X+'+dx+' Y+'+dy+' Z+0</text>'
    + '<line x1="285" y1="122" x2="285" y2="76" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="291" y="82" font-family="monospace" font-size="10" fill="var(--text3)">Z+</text>'
    + '<line x1="285" y1="122" x2="331" y2="122" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="320" y="138" font-family="monospace" font-size="10" fill="var(--text3)">X+</text>'
    + '<line x1="285" y1="122" x2="265" y2="132" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="248" y="144" font-family="monospace" font-size="10" fill="var(--text3)">Y+</text>'
    + '<text x="145" y="143" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">'+dx+' x '+dy+' x '+dz+' mm</text>'
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
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'" role="img">'
    + '<rect x="'+SX(bx0)+'" y="'+SY(by1)+'" width="'+((bx1-bx0)*sc).toFixed(1)+'" height="'+((by1-by0)*sc).toFixed(1)+'" fill="rgba(74,158,255,.06)" stroke="var(--border)"/>'
    + segs
    + labels
    + '<circle cx="'+SX(st.x)+'" cy="'+SY(st.y)+'" r="3" fill="#f0a94a"/>'
    + '<text x="'+pad+'" y="12" font-family="monospace" font-size="9" fill="var(--text3)">top view &middot; dashed = FMAX &middot; teal = cutting &middot; orange = start</text>'
    + '</svg>';
}

function learnSvgChamfer(){
  var W=340, H=260;
  var scale=13;              // px per mm
  var d=2*scale;             // DL and DR magnitude (2 mm) — EQUAL lengths
  var Sy=104;                // workpiece surface y
  var Ex=150;                // original sharp edge x
  var ch=1*scale;            // 1 mm chamfer leg
  var s='';

  // ---- workpiece with the 1x45 chamfered corner ----
  s+='<path d="M24 '+Sy+' L'+(Ex-ch)+' '+Sy+' L'+Ex+' '+(Sy+ch)+' L'+Ex+' 190 L24 190 Z" fill="rgba(74,158,255,.12)" stroke="var(--border)"/>';
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
  s+='<text x="26" y="142" font-family="monospace" font-size="9" fill="#f0a94a">orange = contact point</text>';
  s+='<text x="26" y="161" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--accent)">finished chamfer</text>';
  s+='<text x="26" y="177" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--accent)">1 x 45°</text>';
  return '<svg class="learn-svg" viewBox="0 0 '+W+' '+H+'" role="img">'
    + s
    + '<text x="14" y="235" font-family="monospace" font-size="10" fill="var(--text3)">DR = horizontal; DL = vertical.</text>'
    + '<text x="14" y="251" font-family="monospace" font-size="10" fill="var(--text3)">Both: contact point to tool tip.</text>'
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
    + '<circle cx="170" cy="128" r="3" fill="#f0a94a"/><text x="196" y="127" font-family="monospace" font-size="9.5" fill="#f0a94a">tool datum</text>'
    + '<line x1="120" y1="18" x2="120" y2="128" stroke="#f0a94a" stroke-width="1"/>'
    + '<line x1="114" y1="18" x2="126" y2="18" stroke="#f0a94a"/><line x1="114" y1="128" x2="126" y2="128" stroke="#f0a94a"/>'
    + '<text x="72" y="78" font-family="monospace" font-size="11" fill="#f0a94a">L = total</text>'
    + '<line x1="155" y1="139" x2="185" y2="139" stroke="#5dcaa5" stroke-width="1"/>'
    + '<line x1="155" y1="134" x2="155" y2="144" stroke="#5dcaa5"/><line x1="185" y1="134" x2="185" y2="144" stroke="#5dcaa5"/>'
    + '<text x="194" y="143" font-family="monospace" font-size="11" fill="#5dcaa5">D = 2R</text>'
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
    + '<circle cx="150" cy="85" r="3.5" fill="#f0a94a"/><text x="58" y="92" font-family="monospace" font-size="10" fill="#f0a94a">datum-safe Z+2</text>'
    + '<text x="182" y="108" font-family="monospace" font-size="10" fill="var(--accent)">FEED below surface</text>'
    + '</svg>';
}

function learnSvgComp(){
  return '<svg class="learn-svg" viewBox="0 0 340 170" role="img">'
    + '<path d="M80 105 L80 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M76 35 L80 22 L84 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<text x="64" y="16" font-family="monospace" font-size="10" fill="var(--text)">motion</text>'
    + '<circle cx="55" cy="65" r="20" fill="rgba(20,184,166,.15)" stroke="var(--accent)" stroke-width="1.6"/>'
    + '<circle cx="55" cy="65" r="2" fill="var(--accent)"/>'
    + '<text x="55" y="130" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--accent)">RL · LEFT</text>'
    + '<path d="M230 105 L230 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M226 35 L230 22 L234 35" fill="none" stroke="var(--text)" stroke-width="2"/>'
    + '<circle cx="255" cy="65" r="20" fill="rgba(93,202,165,.15)" stroke="#5dcaa5" stroke-width="1.6"/>'
    + '<circle cx="255" cy="65" r="2" fill="#5dcaa5"/>'
    + '<text x="255" y="130" text-anchor="middle" font-family="monospace" font-size="12" fill="#5dcaa5">RIGHT · RR</text>'
    + '<text x="170" y="160" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="var(--text3)">LOOK ALONG THE DIRECTION OF MOTION</text>'
    + '</svg>';
}

function learnSvgCompPath(){
  return '<svg class="learn-svg" viewBox="0 0 340 230" role="img">'
    + '<defs><marker id="lpCompArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#f0a94a"/></marker></defs>'
    + '<rect x="172" y="30" width="138" height="170" fill="rgba(74,158,255,.10)" stroke="var(--border)"/>'
    + '<text x="238" y="52" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">material</text>'
    + '<line x1="172" y1="22" x2="172" y2="207" stroke="var(--text)" stroke-width="2" stroke-dasharray="5 4"/>'
    + '<text x="178" y="220" font-family="monospace" font-size="11" fill="var(--text)">programmed wall X+50</text>'
    + '<line x1="132" y1="190" x2="132" y2="42" stroke="#f0a94a" stroke-width="3" marker-end="url(#lpCompArrow)"/>'
    + '<text x="16" y="26" font-family="monospace" font-size="11" fill="#f0a94a">tool-centre path X+45</text>'
    + '<text x="16" y="42" font-family="monospace" font-size="10.5" fill="var(--text3)">RL for motion in Y+</text>'
    + '<circle cx="132" cy="165" r="40" fill="rgba(240,169,74,.08)" stroke="#f0a94a" stroke-width="1.5"/>'
    + '<circle cx="132" cy="165" r="3.5" fill="#f0a94a"/>'
    + '<circle cx="132" cy="90" r="40" fill="rgba(240,169,74,.04)" stroke="#f0a94a" stroke-width="1.2" stroke-dasharray="4 3"/>'
    + '<circle cx="132" cy="90" r="3" fill="#f0a94a"/>'
    + '<line x1="132" y1="165" x2="172" y2="165" stroke="var(--accent)" stroke-width="1.5"/>'
    + '<text x="145" y="158" font-family="monospace" font-size="11" fill="var(--accent)">R5</text>'
    + '<circle cx="172" cy="165" r="3.5" fill="var(--accent)"/>'
    + '<text x="180" y="181" font-family="monospace" font-size="10" fill="var(--accent)">contact stays at X+50</text>'
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
  return '<svg class="learn-svg" viewBox="0 0 340 245" role="img">'
    + '<defs><marker id="lpHelixArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#f0a94a"/></marker></defs>'
    + '<text x="14" y="18" font-family="monospace" font-size="11" fill="var(--text3)">SIDE VIEW</text>'
    + '<ellipse cx="150" cy="42" rx="108" ry="20" fill="rgba(74,158,255,.08)" stroke="var(--border)"/>'
    + '<path d="M42 42 L42 205 M258 42 L258 205" stroke="var(--border)" stroke-width="1.2"/>'
    + '<path d="M42 205 A108 20 0 0 0 258 205" fill="none" stroke="var(--border)" stroke-width="1.2"/>'
    + '<path d="'+path+'" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="198" cy="48" r="5" fill="#f0a94a"/>'
    + '<text x="120" y="18" font-family="monospace" font-size="10" font-weight="600" fill="var(--accent)">1 · HELICAL PLUNGE</text>'
    + '<text x="210" y="31" font-family="monospace" font-size="11" fill="#f0a94a">start at Q200 +2</text>'
    + '<line x1="274" y1="55" x2="274" y2="164" stroke="#f0a94a" stroke-width="1.5" marker-end="url(#lpHelixArrow)"/>'
    + '<text x="282" y="112" font-family="monospace" font-size="11" fill="#f0a94a">Q201 -8</text>'
    + '<line x1="92" y1="75" x2="72" y2="106" stroke="var(--accent)" stroke-width="1"/>'
    + '<text x="12" y="118" font-family="monospace" font-size="11" fill="var(--accent)">Q334 = 2 mm</text>'
    + '<text x="12" y="132" font-family="monospace" font-size="10.5" fill="var(--text3)">deeper each turn</text>'
    + '<ellipse cx="150" cy="174" rx="48" ry="11" fill="none" stroke="#5dcaa5" stroke-width="1.5"/>'
    + '<ellipse cx="150" cy="187" rx="75" ry="14" fill="none" stroke="#5dcaa5" stroke-width="1.7"/>'
    + '<ellipse cx="150" cy="202" rx="102" ry="18" fill="none" stroke="#5dcaa5" stroke-width="2.2"/>'
    + '<text x="202" y="170" font-family="monospace" font-size="10" font-weight="600" fill="#5dcaa5">2 · FINISH RINGS</text>'
    + '<text x="86" y="235" font-family="monospace" font-size="11" fill="#5dcaa5">finish rings widen to Q335 = Ø30</text>'
    + '</svg>';
}

function learnSvgSafeRetract(){
  return '<svg class="learn-svg" viewBox="0 0 340 220" role="img">'
    + '<rect x="25" y="110" width="290" height="85" fill="rgba(74,158,255,.10)" stroke="var(--border)"/>'
    + '<line x1="25" y1="110" x2="315" y2="110" stroke="var(--accent)" stroke-width="1.5"/>'
    + '<text x="264" y="104" font-family="monospace" font-size="11" fill="var(--text3)">surface Z0</text>'
    + '<path d="M55 25 L125 25 L125 92" fill="none" stroke="var(--text3)" stroke-width="2" stroke-dasharray="5 4"/>'
    + '<path d="M125 92 L125 140 L245 140" fill="none" stroke="var(--accent)" stroke-width="3"/>'
    + '<path d="M245 140 L245 25" fill="none" stroke="#f0a94a" stroke-width="3"/>'
    + '<path d="M239 36 L245 24 L251 36" fill="#f0a94a"/>'
    + '<circle cx="55" cy="25" r="4" fill="#f0a94a"/>'
    + '<text x="38" y="16" font-family="monospace" font-size="11" fill="var(--text3)">1  FMAX high</text>'
    + '<text x="132" y="82" font-family="monospace" font-size="11" fill="var(--text3)">2  FMAX to Z+2</text>'
    + '<text x="132" y="132" font-family="monospace" font-size="11" fill="var(--accent)">3  FEED to Z-3</text>'
    + '<text x="160" y="157" font-family="monospace" font-size="11" fill="var(--accent)">4  cut X+20 → X+80</text>'
    + '<text x="252" y="62" font-family="monospace" font-size="11" fill="#f0a94a">5  FMAX up</text>'
    + '<text x="252" y="77" font-family="monospace" font-size="10.5" fill="var(--text3)">known clear path</text>'
    + '</svg>';
}

function learnSvgSlotWidth(){
  return '<svg class="learn-svg" viewBox="0 0 340 190" role="img">'
    + '<rect x="25" y="28" width="290" height="132" fill="rgba(74,158,255,.07)" stroke="var(--border)"/>'
    + '<rect x="70" y="75" width="200" height="34" rx="17" fill="rgba(20,184,166,.20)" stroke="var(--accent)" stroke-width="2"/>'
    + '<line x1="70" y1="92" x2="270" y2="92" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<circle cx="270" cy="92" r="17" fill="rgba(240,169,74,.10)" stroke="#f0a94a" stroke-width="2"/>'
    + '<circle cx="270" cy="92" r="3" fill="#f0a94a"/>'
    + '<text x="74" y="68" font-family="monospace" font-size="11" fill="var(--accent)">swept slot</text>'
    + '<text x="197" y="87" font-family="monospace" font-size="10.5" fill="var(--text3)">centre-line</text>'
    + '<line x1="294" y1="75" x2="294" y2="109" stroke="#f0a94a"/>'
    + '<line x1="288" y1="75" x2="300" y2="75" stroke="#f0a94a"/>'
    + '<line x1="288" y1="109" x2="300" y2="109" stroke="#f0a94a"/>'
    + '<text x="305" y="96" font-family="monospace" font-size="11" fill="#f0a94a">10</text>'
    + '<text x="170" y="178" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">D10 cutter → 10 mm slot around centre-line</text>'
    + '</svg>';
}

function learnSvgArcCRCompare(){
  return '<svg class="learn-svg" viewBox="0 0 340 205" role="img">'
    + '<text x="80" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--accent)">R+  short arc ≤180°</text>'
    + '<path d="M28 115 A52 52 0 0 1 132 115" fill="none" stroke="var(--accent)" stroke-width="3"/>'
    + '<path d="M77 66 l10 3 l-7 7" fill="none" stroke="var(--accent)" stroke-width="1.8"/>'
    + '<circle cx="28" cy="115" r="4" fill="#f0a94a"/><circle cx="132" cy="115" r="4" fill="#5dcaa5"/>'
    + '<line x1="80" y1="115" x2="117" y2="78" stroke="#f0a94a" stroke-dasharray="4 3"/>'
    + '<text x="93" y="91" font-family="monospace" font-size="11" fill="#f0a94a">R+15</text>'
    + '<text x="250" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="#5dcaa5">R−  long arc &gt;180°</text>'
    + '<path d="M198 115 A52 52 0 1 0 302 115" fill="none" stroke="#5dcaa5" stroke-width="3"/>'
    + '<path d="M253 166 l-10 -3 l7 -7" fill="none" stroke="#5dcaa5" stroke-width="1.8"/>'
    + '<circle cx="198" cy="115" r="4" fill="#f0a94a"/><circle cx="302" cy="115" r="4" fill="#5dcaa5"/>'
    + '<text x="170" y="195" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">same start and end · radius sign chooses short or long way</text>'
    + '</svg>';
}

function learnSvgRndDetail(){
  return '<svg class="learn-svg" viewBox="0 0 340 180" role="img">'
    + '<path d="M35 135 L145 135 L145 25" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-dasharray="5 4"/>'
    + '<path d="M35 135 L115 135 A30 30 0 0 0 145 105 L145 25" fill="none" stroke="var(--accent)" stroke-width="3"/>'
    + '<circle cx="115" cy="135" r="4" fill="#f0a94a"/><circle cx="145" cy="105" r="4" fill="#f0a94a"/>'
    + '<circle cx="115" cy="105" r="3" fill="var(--text3)"/>'
    + '<line x1="115" y1="105" x2="136" y2="126" stroke="#f0a94a"/>'
    + '<text x="122" y="112" font-family="monospace" font-size="12" fill="#f0a94a">R10</text>'
    + '<text x="164" y="77" font-family="monospace" font-size="11" fill="var(--text3)">tangent point</text>'
    + '<line x1="160" y1="80" x2="148" y2="103" stroke="var(--text3)"/>'
    + '<text x="170" y="158" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">RND replaces the sharp corner</text>'
    + '<text x="170" y="173" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">between two straight moves</text>'
    + '</svg>';
}

function learnSvgChfDetail(){
  return '<svg class="learn-svg" viewBox="0 0 340 180" role="img">'
    + '<path d="M35 135 L145 135 L145 25" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-dasharray="5 4"/>'
    + '<path d="M35 135 L105 135 L145 95 L145 25" fill="none" stroke="#5dcaa5" stroke-width="3"/>'
    + '<circle cx="105" cy="135" r="4" fill="#f0a94a"/><circle cx="145" cy="95" r="4" fill="#f0a94a"/>'
    + '<line x1="105" y1="150" x2="145" y2="150" stroke="#f0a94a"/>'
    + '<line x1="105" y1="145" x2="105" y2="155" stroke="#f0a94a"/><line x1="145" y1="145" x2="145" y2="155" stroke="#f0a94a"/>'
    + '<text x="125" y="168" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0a94a">8</text>'
    + '<line x1="160" y1="95" x2="160" y2="135" stroke="#f0a94a"/>'
    + '<line x1="155" y1="95" x2="165" y2="95" stroke="#f0a94a"/><line x1="155" y1="135" x2="165" y2="135" stroke="#f0a94a"/>'
    + '<text x="168" y="119" font-family="monospace" font-size="11" fill="#f0a94a">8</text>'
    + '<text x="190" y="111" font-family="monospace" font-size="12" fill="#5dcaa5">CHF 8</text>'
    + '<text x="190" y="128" font-family="monospace" font-size="10.5" fill="var(--text3)">cuts 8 mm from</text>'
    + '<text x="190" y="142" font-family="monospace" font-size="10.5" fill="var(--text3)">each side</text>'
    + '</svg>';
}

function learnSvgPeckDrill(){
  return '<svg class="learn-svg" viewBox="0 0 340 235" role="img">'
    + '<rect x="35" y="82" width="270" height="130" fill="rgba(74,158,255,.10)" stroke="var(--border)"/>'
    + '<line x1="35" y1="82" x2="305" y2="82" stroke="var(--accent)"/>'
    + '<line x1="85" y1="28" x2="270" y2="28" stroke="var(--text3)" stroke-dasharray="5 4"/>'
    + '<text x="220" y="18" font-family="monospace" font-size="10.5" fill="var(--text3)">Q204 final retract</text>'
    + '<line x1="150" y1="55" x2="190" y2="55" stroke="#f0a94a"/>'
    + '<text x="198" y="59" font-family="monospace" font-size="11" fill="#f0a94a">Q200 +2</text>'
    + '<path d="M170 55 L170 112 L184 92 L184 143 L198 112 L198 174 L212 143 L212 202" fill="none" stroke="var(--accent)" stroke-width="3"/>'
    + '<path d="M207 192 L212 204 L217 192" fill="var(--accent)"/>'
    + '<line x1="132" y1="112" x2="170" y2="112" stroke="#f0a94a" stroke-dasharray="3 3"/>'
    + '<line x1="132" y1="143" x2="184" y2="143" stroke="#f0a94a" stroke-dasharray="3 3"/>'
    + '<line x1="132" y1="174" x2="198" y2="174" stroke="#f0a94a" stroke-dasharray="3 3"/>'
    + '<text x="47" y="146" font-family="monospace" font-size="11" fill="#f0a94a">Q202 pecks</text>'
    + '<text x="47" y="162" font-family="monospace" font-size="10.5" fill="var(--text3)">down → chip-clear</text>'
    + '<text x="47" y="176" font-family="monospace" font-size="10.5" fill="var(--text3)">retract → deeper</text>'
    + '<line x1="225" y1="82" x2="225" y2="202" stroke="var(--text)"/>'
    + '<text x="232" y="150" font-family="monospace" font-size="11" fill="var(--text)">Q201 total depth</text>'
    + '<text x="36" y="76" font-family="monospace" font-size="10.5" fill="var(--text3)">Q203 surface Z</text>'
    + '</svg>';
}

function learnSvgCounterboreClear(){
  return '<svg class="learn-svg" viewBox="0 0 340 225" role="img">'
    + '<defs><pattern id="lpHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--border)" stroke-width="2"/></pattern></defs>'
    + '<path d="M25 55 H132 V105 H154 V205 H25 Z M315 55 H208 V105 H186 V205 H315 Z" fill="url(#lpHatch)" stroke="var(--accent)" stroke-width="1.5"/>'
    + '<path d="M136 58 H204 V100 H190 V104 H150 V100 H136 Z" fill="rgba(139,147,161,.18)" stroke="var(--text3)" stroke-dasharray="4 3"/>'
    + '<text x="170" y="25" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--text)">counterbore for screw head</text>'
    + '<line x1="132" y1="42" x2="208" y2="42" stroke="#f0a94a"/>'
    + '<line x1="132" y1="36" x2="132" y2="48" stroke="#f0a94a"/><line x1="208" y1="36" x2="208" y2="48" stroke="#f0a94a"/>'
    + '<text x="170" y="37" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0a94a">Q335 = Ø11</text>'
    + '<line x1="224" y1="55" x2="224" y2="105" stroke="#f0a94a"/>'
    + '<line x1="218" y1="55" x2="230" y2="55" stroke="#f0a94a"/><line x1="218" y1="105" x2="230" y2="105" stroke="#f0a94a"/>'
    + '<text x="234" y="83" font-family="monospace" font-size="11" fill="#f0a94a">Q201 = −6</text>'
    + '<line x1="154" y1="216" x2="186" y2="216" stroke="var(--text)"/>'
    + '<line x1="154" y1="210" x2="154" y2="222" stroke="var(--text)"/><line x1="186" y1="210" x2="186" y2="222" stroke="var(--text)"/>'
    + '<text x="170" y="207" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text)">Q342 = Ø6.6 THRU</text>'
    + '<text x="35" y="72" font-family="monospace" font-size="10.5" fill="var(--text3)">material</text>'
    + '</svg>';
}

function learnSvgThreadCycle(){
  return '<svg class="learn-svg" viewBox="0 0 340 230" role="img">'
    + '<text x="78" y="18" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">PITCH SYNCHRONISATION</text>'
    + '<path d="M55 38 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9" fill="none" stroke="var(--accent)" stroke-width="2"/>'
    + '<path d="M101 38 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9 l-14 9 l14 9" fill="none" stroke="var(--accent)" stroke-width="2"/>'
    + '<line x1="119" y1="56" x2="119" y2="74" stroke="#f0a94a"/><line x1="113" y1="56" x2="125" y2="56" stroke="#f0a94a"/><line x1="113" y1="74" x2="125" y2="74" stroke="#f0a94a"/>'
    + '<text x="128" y="64" font-family="monospace" font-size="10.5" fill="#f0a94a">Q239</text>'
    + '<text x="128" y="78" font-family="monospace" font-size="10" fill="#f0a94a">pitch</text>'
    + '<text x="78" y="159" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">1 turn = 1 pitch deeper</text>'
    + '<line x1="170" y1="24" x2="170" y2="205" stroke="var(--border)"/>'
    + '<text x="255" y="18" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--text3)">CHIP BREAKING</text>'
    + '<path d="M220 40 L220 104 L236 96 L236 158 L252 150 L252 207" fill="none" stroke="#5dcaa5" stroke-width="3"/>'
    + '<path d="M247 197 L252 209 L257 197" fill="#5dcaa5"/>'
    + '<line x1="206" y1="40" x2="206" y2="104" stroke="#f0a94a"/>'
    + '<text x="174" y="72" font-family="monospace" font-size="9.5" fill="#f0a94a">Q257</text>'
    + '<text x="174" y="86" font-family="monospace" font-size="9.5" fill="var(--text3)">4 mm</text>'
    + '<line x1="236" y1="96" x2="267" y2="96" stroke="#f0a94a"/>'
    + '<text x="270" y="100" font-family="monospace" font-size="11" fill="#f0a94a">Q256</text>'
    + '<text x="270" y="114" font-family="monospace" font-size="10.5" fill="var(--text3)">0.5 back</text>'
    + '<text x="184" y="224" font-family="monospace" font-size="10.5" fill="var(--text3)">repeat until Q201 depth</text>'
    + '</svg>';
}

function learnSvgLblFlow(){
  return '<svg class="learn-svg" viewBox="0 0 340 190" role="img">'
    + '<rect x="20" y="28" width="138" height="105" rx="8" fill="rgba(20,184,166,.08)" stroke="var(--accent)"/>'
    + '<text x="89" y="48" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--accent)">LBL 1 … LBL 0</text>'
    + '<text x="34" y="70" font-family="monospace" font-size="10.5" fill="var(--text)">X30 Y30 M99</text>'
    + '<text x="34" y="88" font-family="monospace" font-size="10.5" fill="var(--text)">X70 Y30 M99</text>'
    + '<text x="34" y="116" font-family="monospace" font-size="10.5" fill="var(--text3)">1  runs where written</text>'
    + '<rect x="198" y="28" width="122" height="66" rx="8" fill="rgba(240,169,74,.08)" stroke="#f0a94a"/>'
    + '<text x="259" y="54" text-anchor="middle" font-family="monospace" font-size="12" fill="#f0a94a">CALL LBL 1</text>'
    + '<text x="259" y="76" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">2 · runs body again</text>'
    + '<path d="M259 96 C259 155 105 165 89 136" fill="none" stroke="#f0a94a" stroke-width="2"/>'
    + '<path d="M83 145 L89 133 L96 144" fill="#f0a94a"/>'
    + '<text x="170" y="181" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">active tool/cycle changes · stored XY stays</text>'
    + '</svg>';
}

function learnSvgPrecisionChain(){
  return '<svg class="learn-svg" viewBox="0 0 340 205" role="img">'
    + '<text x="55" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0a94a">1  SPOT T3</text>'
    + '<path d="M25 65 H85 L70 80 H40 Z" fill="rgba(74,158,255,.10)" stroke="var(--border)"/><path d="M48 65 L55 76 L62 65" fill="none" stroke="#f0a94a" stroke-width="2"/>'
    + '<text x="55" y="101" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">guides drill</text>'
    + '<text x="170" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="var(--accent)">2  DRILL T4</text>'
    + '<path d="M130 65 H210 V155 H130 Z" fill="rgba(74,158,255,.10)" stroke="var(--border)"/><rect x="154" y="65" width="32" height="90" fill="rgba(255,255,255,.04)" stroke="var(--accent)"/>'
    + '<text x="170" y="176" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Ø6.8 through</text>'
    + '<text x="285" y="20" text-anchor="middle" font-family="monospace" font-size="11" fill="#5dcaa5">3  REAM T6</text>'
    + '<path d="M245 65 H325 V155 H245 Z" fill="rgba(74,158,255,.10)" stroke="var(--border)"/><rect x="267" y="65" width="36" height="90" fill="rgba(255,255,255,.04)" stroke="#5dcaa5" stroke-width="2"/>'
    + '<path d="M267 65 H269 V155 H267 M301 65 H303 V155 H301" stroke="#f0a94a" stroke-width="2"/>'
    + '<text x="285" y="176" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">last 0.2 → Ø7 H7</text>'
    + '<path d="M92 112 H120 M218 112 H238" stroke="var(--text3)" stroke-width="2"/>'
    + '<path d="M111 106 l10 6 l-10 6 M229 106 l10 6 l-10 6" fill="none" stroke="var(--text3)" stroke-width="2"/>'
    + '<text x="170" y="199" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">same XY positions reused by LBL 1</text>'
    + '</svg>';
}

function learnSvgChamferMethods(){
  return '<svg class="learn-svg" viewBox="0 0 340 235" role="img">'
    + '<text x="82" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--accent)">SMALL HOLE</text>'
    + '<text x="82" y="36" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Cycle 200 · dip</text>'
    + '<path d="M20 105 H62 L72 115 V198 H20 Z M144 105 H102 L92 115 V198 H144 Z" fill="rgba(74,158,255,.10)" stroke="var(--border)"/>'
    + '<path d="M22 65 H142 L82 125 Z" fill="rgba(139,147,161,.12)" stroke="var(--text3)" stroke-width="1.3"/>'
    + '<path d="M62 105 L72 115 M102 105 L92 115" fill="none" stroke="var(--accent)" stroke-width="3"/>'
    + '<path d="M70 113 A17 17 0 0 1 94 113" fill="none" stroke="#f0a94a" stroke-width="1.4"/>'
    + '<text x="82" y="107" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="#f0a94a">90°</text>'
    + '<path d="M82 45 V94 M82 114 V125" stroke="var(--accent)" stroke-width="1.8"/>'
    + '<path d="M77 114 L82 126 L87 114" fill="var(--accent)"/>'
    + '<text x="82" y="222" text-anchor="middle" font-family="monospace" font-size="10" fill="var(--accent)">finished 1 x 45° edges</text>'
    + '<line x1="170" y1="15" x2="170" y2="225" stroke="var(--border)"/>'
    + '<text x="255" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="#5dcaa5">LARGE BORE</text>'
    + '<text x="255" y="36" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Cycle 208 · orbit rim</text>'
    + '<path d="M190 105 H220 L235 120 V198 H190 Z M320 105 H290 L275 120 V198 H320 Z" fill="rgba(74,158,255,.10)" stroke="var(--border)"/>'
    + '<path d="M220 105 L235 120 M290 105 L275 120" fill="none" stroke="#5dcaa5" stroke-width="3"/>'
    + '<ellipse cx="255" cy="101" rx="52" ry="18" fill="none" stroke="#5dcaa5" stroke-width="2.5"/>'
    + '<path d="M301 93 l8 4 l-7 5" fill="none" stroke="#5dcaa5" stroke-width="2"/>'
    + '<path d="M210 65 H330 L270 125 Z" fill="rgba(139,147,161,.12)" stroke="var(--text3)" stroke-width="1.3"/>'
    + '<path d="M290 105 L275 120" fill="none" stroke="#f0a94a" stroke-width="3.2" stroke-linecap="round"/>'
    + '<text x="270" y="99" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="600" fill="#f0a94a">90°</text>'
    + '<text x="255" y="222" text-anchor="middle" font-family="monospace" font-size="10" fill="#5dcaa5">same chamfer follows rim</text>'
    + '</svg>';
}

function learnSvgFinalPasses(){
  return '<svg class="learn-svg" viewBox="0 0 340 190" role="img">'
    + '<rect x="18" y="28" width="132" height="108" rx="8" fill="rgba(20,184,166,.08)" stroke="var(--accent)"/>'
    + '<text x="84" y="49" text-anchor="middle" font-family="monospace" font-size="12" fill="var(--accent)">PASS 1 · MILL</text>'
    + '<text x="32" y="72" font-family="monospace" font-size="11" fill="var(--text)">T1</text>'
    + '<text x="32" y="91" font-family="monospace" font-size="11" fill="var(--text)">Q1 = 0</text>'
    + '<text x="32" y="112" font-family="monospace" font-size="10.5" fill="var(--text3)">LBL body runs</text>'
    + '<text x="32" y="127" font-family="monospace" font-size="10.5" fill="var(--text3)">where defined</text>'
    + '<path d="M158 82 H182" stroke="#f0a94a" stroke-width="2"/>'
    + '<path d="M173 76 l10 6 l-10 6" fill="none" stroke="#f0a94a" stroke-width="2"/>'
    + '<rect x="190" y="28" width="132" height="108" rx="8" fill="rgba(240,169,74,.08)" stroke="#f0a94a"/>'
    + '<text x="256" y="49" text-anchor="middle" font-family="monospace" font-size="12" fill="#f0a94a">PASS 2 · CHAMFER</text>'
    + '<text x="204" y="72" font-family="monospace" font-size="11" fill="var(--text)">T5 DL−2 DR+2</text>'
    + '<text x="204" y="91" font-family="monospace" font-size="11" fill="var(--text)">Q1 = +4</text>'
    + '<text x="204" y="112" font-family="monospace" font-size="10.5" fill="var(--text3)">CALL LBL 1</text>'
    + '<text x="204" y="127" font-family="monospace" font-size="10.5" fill="var(--text3)">same XY profile</text>'
    + '<text x="170" y="160" text-anchor="middle" font-family="monospace" font-size="11" fill="#5dcaa5">one profile · two tools · one depth variable</text>'
    + '<text x="170" y="178" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--text3)">Q1 changes only the Z level</text>'
    + '</svg>';
}

function learnSvgCorner(){
  return '<svg class="learn-svg" viewBox="0 0 340 150" role="img">'
    + '<path d="M20 110 L85 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M115 80 L115 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M85 110 A30 30 0 0 0 115 80" stroke="var(--accent)" stroke-width="2.4" fill="none"/>'
    + '<circle cx="85" cy="110" r="3" fill="var(--accent)"/><circle cx="115" cy="80" r="3" fill="var(--accent)"/>'
    + '<path d="M85 110 L115 110 L115 80" stroke="var(--text3)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
    + '<line x1="115" y1="110" x2="94" y2="89" stroke="#f0a94a" stroke-width="1"/>'
    + '<text x="120" y="102" font-family="monospace" font-size="11" fill="#f0a94a">R</text>'
    + '<text x="30" y="135" font-family="monospace" font-size="12" fill="var(--accent)">RND R10</text>'
    + '<path d="M195 110 L252 110" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M280 82 L280 25" stroke="var(--text)" stroke-width="2"/>'
    + '<path d="M252 110 L280 82" stroke="#5dcaa5" stroke-width="2.4"/>'
    + '<circle cx="252" cy="110" r="3" fill="#5dcaa5"/><circle cx="280" cy="82" r="3" fill="#5dcaa5"/>'
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
  g += '<circle cx="'+X(0)+'" cy="'+Y(0)+'" r="3.5" fill="#f0a94a"/><text x="'+(X(0)-8)+'" y="'+(Y(0)-5)+'" text-anchor="end" font-family="monospace" font-size="9" fill="#f0a94a">datum 0,0</text>';
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
  g += '<text x="'+(X(5)+5)+'" y="'+(Y(5)-8)+'" font-family="monospace" font-size="9" fill="#f0a94a">X5 Y5</text>';
  g += '<text x="'+(X(95)-5)+'" y="'+(Y(95)+14)+'" text-anchor="end" font-family="monospace" font-size="9" fill="#f0a94a">X95 Y95</text>';
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
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="22" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+7)+'" y="25" font-family="monospace" font-size="10" fill="var(--text3)">Y+</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<path d="M '+(cx-3)+' '+(cy+4)+' l -6 1 l 2 5" fill="none" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="20" y="160" font-family="monospace" font-size="11" fill="var(--accent)">CC X+50 Y+40</text>'
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
    + '<line x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="22" stroke="var(--text3)" stroke-width="1"/>'
    + '<text x="'+(cx+7)+'" y="25" font-family="monospace" font-size="10" fill="var(--text3)">Y+</text>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="'+(cx-58)+'" y="'+(cy+30)+'" font-family="monospace" font-size="11" fill="var(--accent)">CC X+50 Y+40</text>';
  // radius lines to each hole; PR label on the first
  [[p0,'PA+0',10,20],[p120,'PA+120',-72,-10],[p240,'PA+240',-76,18]].forEach(function(h){
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
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img">'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--text3)" stroke-width="1" stroke-dasharray="5 4"/>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="var(--accent)"/>'
    + '<line x1="'+(cx-14)+'" y1="'+(cy+16)+'" x2="'+(cx-3)+'" y2="'+(cy+4)+'" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<path d="M '+(cx-3)+' '+(cy+4)+' l -6 1 l 2 5" fill="none" stroke="var(--accent)" stroke-width="1.2"/>'
    + '<text x="'+cx+'" y="'+(cy+46)+'" text-anchor="middle" font-family="monospace" font-size="10" fill="var(--accent)">CC X+35 Y+45 · centre, no move</text>'
    + '<path d="M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+'" fill="none" stroke="#5dcaa5" stroke-width="2.4" stroke-linecap="round"/>'
    + '<circle cx="'+(cx-R)+'" cy="'+cy+'" r="4" fill="#f0a94a"/>'
    + '<text x="'+(cx-R-28)+'" y="'+(cy-10)+'" font-family="monospace" font-size="10" fill="#f0a94a">start</text>'
    + '<circle cx="'+(cx+R)+'" cy="'+cy+'" r="4.5" fill="#5dcaa5"/>'
    + '<text x="'+(cx+R-38)+'" y="'+(cy+22)+'" font-family="monospace" font-size="11" fill="#5dcaa5">C X+50 Y+45</text>'
    + '<path d="M '+(cx+9)+' '+(cy-R+1)+' l 15 4 l -9 11" fill="none" stroke="#5dcaa5" stroke-width="2.5"/>'
    + '<text x="'+(cx-4)+'" y="'+(cy-R-8)+'" font-family="monospace" font-size="11" fill="#5dcaa5">DR- (clockwise)</text>'
    + '</svg>';
}

function learnSvgArcCR(){
  var cx=120, cy=120, R=60;
  return '<svg class="learn-svg" viewBox="0 0 340 200" role="img">'
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
   become a short marker followed by enough blank blocks for the official
   solution. A task that inserts at the first blank gap gets the same treatment.
   Direct replacement tasks keep their source intact and highlight the blocks
   that should be edited. */
function _learnStarterPlan(L, ti){
  var T = L.tasks[ti];
  var starter = T.starter || '';
  var count = _learnAnswerLineCount(T);
  var cue = _learnTaskComment(L, ti);
  var code = starter;
  var start = -1;
  var mode = 'edit';
  var caretColumn = 0;

  if(/^[ \t]*;[ \t]*>>>/m.test(starter)){
    code = starter.replace(/^[ \t]*;[ \t]*>>>.*$(?:\n[ \t]*)*/m,
      cue + '\n'.repeat(count + 1));
    start = _learnLineIndexAt(code, code.indexOf(cue)) + 1;
    mode = 'insert';
  } else if(T.sol !== undefined && /\n(?:[ \t]*\n)+/.test(starter)){
    code = starter.replace(/\n(?:[ \t]*\n)+/,
      '\n' + cue + '\n'.repeat(count + 1));
    start = _learnLineIndexAt(code, code.indexOf(cue)) + 1;
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
          code = starter.slice(0, lineAt) + cue + '\n'.repeat(count + 1)
            + starter.slice(lineAt);
          start = _learnLineIndexAt(code, code.indexOf(cue)) + 1;
        }
        mode = 'insert';
      } else {
        start = _learnLineIndexAt(starter, at);
        count = oldLines;
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
  return {
    start: LEARN.answerStartLine,
    end: LEARN.answerStartLine + Math.max(1, LEARN.answerLineCount || 1) - 1
  };
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
  LEARN.lesson = i; LEARN.slide = 0; LEARN.task = -1;
  LEARN.lastResults = null; LEARN.hint = 0; LEARN.live = null; LEARN.view = 'lesson';
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
  var code = _learnSolvedCode(LESSONS[LEARN.lesson], LEARN.task);
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
  // The intro lesson always replays the tour (it IS the tour); every other
  // lesson only shows it once, the very first time practice is ever opened.
  if(typeof learnCoachMaybeStart==='function') learnCoachMaybeStart(L.intro);
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

function learnExit(){
  _learnEndEditorInput();
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
  if(typeof FM!=='undefined' && FM.active) exitFieldMode(true);
  if(typeof BLK!=='undefined' && BLK.active) closeCtxPanel();
  if(typeof _qPopupLine!=='undefined' && _qPopupLine>=0) closeQPopup();
  if(typeof _cancelMobileFocus==='function') _cancelMobileFocus(true);
  try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}
}

/* Display number of a lesson in the list, skipping the intro card(s) so the
   real course still reads 1..N. Intro lessons return 0. */
function _learnNo(i){ var n=0; for(var k=0;k<=i;k++){ if(!LESSONS[k].intro) n++; } return LESSONS[i].intro ? 0 : n; }

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
      + (!ok && ch.hint ? '<span class="c-hint">&#128161; ' + ch.hint + '</span>' : '')
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
  var nHints = (T.hints && T.hints.length) || 0;
  var shown  = Math.min(LEARN.hint || 0, nHints);
  var marked = /^[ \t]*;[ \t]*>>>/m.test(T.starter || '');

  var body = '<div class="lp-task">'
    + '<div class="lp-task-top">'
    +   '<span class="lp-task-badge">' + _lt('learn.task', 'TASK') + ' ' + (LEARN.task + 1) + '/' + L.tasks.length + '</span>'
    + '</div>'
    + '<div class="lp-prompt" role="heading" aria-level="2">' + T.prompt + '</div>'
    + '<div class="lp-where"><span class="lp-where-arrow" aria-hidden="true">&#8594;</span><span>' + (marked
        ? _lt('learn.answerAtMark', 'Type directly below the marked <code>; &gt;&gt;&gt;</code> line in the highlighted editor.')
        : _lt('learn.answerWhole', 'Write your answer in the highlighted editor.')) + '</span></div>'
    + '</div>';

  body += _learnTheoryHtml(L);
  body += _learnResultsHtml(T);

  if(shown > 0){
    body += '<div class="lp-hints">' + T.hints.slice(0, shown).map(function(h, i){
      return '<div class="lp-hint-row"><span class="lp-hint-n">'
        + (i === nHints - 1 ? _lt('learn.answer', 'ANSWER') : _lt('learn.hint', 'HINT') + ' ' + (i + 1)) + '</span>'
        + '<div class="lp-hint-b">' + h + '</div></div>';
    }).join('') + '</div>';
  }
  if(allOk){
    body += '<div class="lp-success">&#127881;<span>' + _lt('learn.passed', 'All goals met \u2014 well done!')
      + (lastTask
          ? ' ' + _lt('learn.lessonDone', 'Lesson complete.') + '<br>&#9654; '
            + _lt('learn.pressRun', 'Press <b>Run</b> and watch your program in 3D.')
          : ' ' + _lt('learn.readyNext', 'Ready for the next task.')) + '</span></div>';
  }

  var foot = '<div class="lp-foot">'
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
            ? '<button class="lp-btn pri grow" onclick="learnFinishLesson()">' + _lt('learn.finish', 'Finish lesson') + ' &#10003;</button>'
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
      + _lt('learn.finalNote', 'Finish the final integrated project to complete the course. Then try changing dimensions or repairing a deliberate mistake without opening the answer.')
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
    if(typeof window !== 'undefined' && typeof window.learnHostUpdate === 'function'){
      window.learnHostUpdate();
    }
  } catch(e){}
}

/* Inline lesson diagrams need a usable text alternative even when their
   individual geometry is generated dynamically from the example program. */
function _learnLabelDiagrams(p, L){
  Array.prototype.forEach.call(p.querySelectorAll('.learn-svg'), function(svg, i){
    svg.setAttribute('role', 'img');
    if(!svg.hasAttribute('aria-label')) svg.setAttribute('aria-label', L.title + ' diagram ' + (i + 1));
  });
}
