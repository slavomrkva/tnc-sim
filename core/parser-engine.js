// parser-engine -- verified byte-for-byte identical between web and android repos.

function expandLblLines(lines){
  var lblDefs={};
  var lblStack=null;
  var lblStackLine=-1;
  for(var li=0;li<lines.length;li++){
    var lu2=lines[li].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(/^LBL\s+0/.test(lu2)){ lblStack=null; lblStackLine=-1; }
    else if(/^LBL\s+\d+/.test(lu2)){
      var lm=lu2.match(/^LBL\s+(\d+)/);
      if(lm){ lblStack=lm[1]; lblStackLine=li; lblDefs[lblStack]=[]; }
    } else if(lblStack!==null){
      lblDefs[lblStack].push({text:lines[li], srcLine:li});
    }
  }
  var expandedLines=[];
  for(var li=0;li<lines.length;li++){
    var lu3=lines[li].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(/^LBL\s/.test(lu3)||/^CALL LBL/.test(lu3)){
      if(/^CALL LBL/.test(lu3)){
        var cm2=lu3.match(/CALL LBL\s+(\d+)(?:\s+REP\s+(\d+))?/);
        if(cm2){
          var lnum=cm2[1], reps=cm2[2]?parseInt(cm2[2]):1;
          var lbody=lblDefs[lnum]||[];
          // expanded lines use the CALL LBL line number as srcLine
          for(var ri=0;ri<reps;ri++){
            for(var bi=0;bi<lbody.length;bi++)
              expandedLines.push({text:lbody[bi].text, srcLine:li});
          }
        }
      }
      continue;
    }
    expandedLines.push({text:lines[li], srcLine:li});
  }
  return expandedLines;
}

function evalQExpr(expr, qVars){
  if(!expr) return 0;
  // Replace Q references with their values
  var resolved = expr.replace(/Q(\d+)/gi, function(m, n){
    return (qVars[parseInt(n)] !== undefined ? qVars[parseInt(n)] : 0);
  });
  // Replace math functions
  resolved = resolved
    .replace(/SQRT\s*\(/gi, 'Math.sqrt(')
    .replace(/SIN\s*\(/gi,  'Math.sin(')
    .replace(/COS\s*\(/gi,  'Math.cos(')
    .replace(/TAN\s*\(/gi,  'Math.tan(')
    .replace(/ASIN\s*\(/gi, 'Math.asin(')
    .replace(/ACOS\s*\(/gi, 'Math.acos(')
    .replace(/ATAN\s*\(/gi, 'Math.atan(')
    .replace(/ABS\s*\(/gi,  'Math.abs(')
    .replace(/INT\s*\(/gi,  'Math.trunc(')
    .replace(/FRAC\s*\(([^)]+)\)/gi, function(m,v){ return '('+v+'-Math.trunc('+v+'))'; });
  // Heidenhain trig is in degrees
  resolved = resolved.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, function(m,fn,arg){
    return 'Math.'+fn+'(('+arg+')*Math.PI/180)';
  });
  resolved = resolved.replace(/Math\.a(sin|cos|tan)\(([^)]+)\)/g, function(m,fn,arg){
    return '(Math.a'+fn+'('+arg+')*180/Math.PI)';
  });
  try { return parseFloat(Function('"use strict"; return ('+resolved+');')()); }
  catch(e){ return 0; }
}

function resolveQLine(line, qVars){
  // Don't resolve the LHS of a Q assignment (Q1 = ...)
  var assignMatch = line.match(/^(Q\d+\s*=\s*)(.*)/i);
  if(assignMatch){
    // Only resolve RHS
    return assignMatch[1] + resolveQLineExpr(assignMatch[2], qVars);
  }
  return resolveQLineExpr(line, qVars);
}

function resolveQLineExpr(line, qVars){
  return line.replace(/([+-]?)Q(\d+)/gi, function(m, sign, n){
    var v = qVars[parseInt(n)];
    if(v === undefined) return m;
    var num = parseFloat(v);
    if(sign === '+' || sign === ''){
      return (num >= 0 ? '+' : '') + num;
    } else {
      return ((-num) >= 0 ? '+' : '') + (-num);
    }
  });
}

function checkRadiusVsTool(r, lineIdx, lines){
  if(r < TOOL_R){
    var _li = lineIdx;
    return {line:lineIdx, sev:'err',
      msg:'Radius '+r+'mm < tool radius '+TOOL_R+'mm (\u00d8'+(TOOL_R*2)+'mm) \u2014 cannot be machined',
      fix:function(lines){
        lines[_li] = lines[_li].replace(/R[+\-]?(\d+\.?\d*)/, function(){ return 'R+'+TOOL_R.toFixed(1); });
        return _li;
      }
    };
  }
  return null;
}

function validateProgram(code){
  // Real Heidenhain .H files (as exported by the control) prefix every block
  // with its block number, e.g. "12 TOOL CALL 5 Z S2000". Strip it so all the
  // startsWith-style keyword checks below (BEGIN PGM, LBL, CYCL DEF, ...) work
  // the same whether the program was typed fresh or imported from a machine.
  code = code.replace(/^[ \t]*\d+[ \t]+/gm, '');
  var lines = code.split('\n');
  var probs = [];
  if(lines.length > 2000)
    probs.push({line:2000,sev:'err',msg:'Program exceeds 2000 lines ('+lines.length+' lines) \u2014 simulator limit'});

  var hasBegin=false, hasEnd=false, hasBlk1=false, hasBlk2=false;
  var beginName='', endName='';
  var blkMin1={x:null,y:null,z:null};
  var _cylPending=false, _cylZ0_val=0; // cylinder blank size check state
  var lastCC=false, ccLine=-1;
  var valRcState='';
  var valRcLine=-1;
  var lastRcWasArc=false;
  var hasToolCall=false;
  var toolCallLine=-1;
  var firstMoveLine=-1;
  var valToolNum=0;
  var valZ=null;
  var valSurfZ=null;
  var valLastX=null, valLastY=null; // tracks XY position for the zero-displacement RL/RR check below
  var valSpindleOn=false;
  var valToolCallPendingSpindle=false;
  var qVarsVal={};
  var valCycleQ={};
  var valCycleLine=-1;
  var valInCycle=false;
  var blk1Line=-1;
  var activeCycleDef=false;
  var lastCycleLine=-1;
  var hasCycleDef=false;
  var pendingCC=true;

  // Collect defined LBL numbers
  var definedLbls={}, duplicateLbls={};
  for(var _li2=0;_li2<lines.length;_li2++){
    var _lu=lines[_li2].trim().toUpperCase().replace(/;.*$/,'').trim();
    var _lm=_lu.match(/^LBL\s+(\d+)/);
    if(_lm && _lm[1]!=='0'){
      if(definedLbls[_lm[1]]) duplicateLbls[_lm[1]]=_li2;
      definedLbls[_lm[1]]=_li2+1;
    }
  }

  var expandedVal = expandLblLines(lines);

  for(var i=0;i<expandedVal.length;i++){
    var raw=expandedVal[i].text.trim();
    var srcI=expandedVal[i].srcLine;
    if(!raw || raw.charAt(0)===';') continue;
    var u = raw.toUpperCase().replace(/^[ \t]*\d+[ \t]+(?=[A-Z;*])/,'').split(';')[0].trim();
    if(!u) continue;

    // Strip FN 0–4 prefix (FN 0 assign, FN 1 add, FN 2 sub, FN 3 mult, FN 4 div)
    if(/^FN\s*[0-4]\s*:/i.test(u)) u = u.replace(/^FN\s*[0-4]\s*:/i,'').trim();

    // Q100-199 read-only check
    var _qValAssign = u.match(/^(Q\d+)\s*=\s*(.+)/);
    if(_qValAssign && !valInCycle){
      var _qNum2=parseInt(_qValAssign[1].slice(1));
      if(_qNum2>=100&&_qNum2<=199) probs.push({line:srcI,sev:'warn',msg:_qValAssign[1]+' is in the reserved range Q100\u2013Q199 (measurement results \u2014 read-only)'});
      var _qNum = parseInt(_qValAssign[1].slice(1));
      qVarsVal[_qNum] = evalQExpr(_qValAssign[2], qVarsVal);
      continue;
    }
    if(Object.keys(qVarsVal).length > 0) u = resolveQLine(u, qVarsVal);

    // Undefined Q parameter in a movement line — coordinate would be silently ignored
    if(/^(L|C|CC|RND|CR|CT|LP|CP)\b/.test(u) && /[XYZIJKRP][+-]?Q\d+/.test(u)){
      var _undefQ = u.match(/[XYZIJKRP][+-]?(Q\d+)/);
      probs.push({line:srcI,sev:'err',msg:_undefQ[1]+' has no value assigned \u2014 coordinate will be ignored'});
    }

    var toks=u.split(/\s+/);

    // Cycle Q block exit — validate collected params
    if(valInCycle && !/^Q\d+/.test(u) && u.indexOf('CYCL')<0){
      valInCycle=false;
      var _cQ200=valCycleQ['Q200'],_cQ201=valCycleQ['Q201'],_cQ204=valCycleQ['Q204'],_cQ202=valCycleQ['Q202'];
      if(_cQ200!==undefined&&typeof _cQ200==='number'&&_cQ200<0) probs.push({line:valCycleLine,sev:'warn',msg:'Q200 safety clearance must be >= 0 (got '+_cQ200+')'});
      if(_cQ201!==undefined&&typeof _cQ201==='number'&&_cQ201===0) probs.push({line:valCycleLine,sev:'warn',msg:'Q201 = 0: cycle will not execute'});
      if(_cQ201!==undefined&&typeof _cQ201==='number'&&_cQ201>0) probs.push({line:valCycleLine,sev:'warn',msg:'Q201 should be negative (depth below surface), got +'+_cQ201});
      if(_cQ204!==undefined&&_cQ200!==undefined&&typeof _cQ204==='number'&&typeof _cQ200==='number'&&_cQ204<_cQ200) probs.push({line:valCycleLine,sev:'warn',msg:'Q204 ('+_cQ204+') should be \u2265 Q200 ('+_cQ200+')'});
      // Note: Q202 > |Q201| is OK — means single pass (no pecking)
    }

    // ── BEGIN PGM ──
    if(u.indexOf('BEGIN PGM')===0){
      hasBegin=true;
      if(!/^BEGIN PGM \S+ (MM|INCH)$/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: BEGIN PGM <name> MM'});
      else beginName=toks[2];

    // ── END PGM ──
    } else if(u.indexOf('END PGM')===0){
      hasEnd=true;
      if(!/^END PGM \S+ (MM|INCH)$/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: END PGM <name> MM'});
      else {
        endName=toks[2];
        if(beginName && endName && beginName!==endName)
          probs.push({line:srcI,sev:'err',msg:'PGM name mismatch: END PGM "'+endName+'" \u2260 BEGIN PGM "'+beginName+'"'});
      }
      if(valRcState==='RL'||valRcState==='RR')
        probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' still active \u2014 program R0 before END PGM'});

    // ── BLK FORM 0.1 ──
    } else if(u.indexOf('BLK FORM 0.1')===0){
      hasBlk1=true; blk1Line=srcI;
      if(!/X[+-]?\d/.test(u)||!/Y[+-]?\d/.test(u)||!/Z[+-]?\d/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'BLK FORM 0.1 incomplete \u2014 define X, Y and Z'});
      var _b1x=u.match(/X([+-]?[\d.]+)/),_b1y=u.match(/Y([+-]?[\d.]+)/),_b1z=u.match(/Z([+-]?[\d.]+)/);
      if(_b1x) blkMin1.x=parseFloat(_b1x[1]); if(_b1y) blkMin1.y=parseFloat(_b1y[1]); if(_b1z) blkMin1.z=parseFloat(_b1z[1]);

    // ── BLK FORM 0.2 ──
    } else if(u.indexOf('BLK FORM 0.2')===0){
      hasBlk2=true;
      var _bzm=u.match(/Z([+-]?\d+\.?\d*)/); if(_bzm) valSurfZ=parseFloat(_bzm[1]);
      if(_cylPending){
        // This 0.2 line is the cylinder's radius (X) and top Z — check diameter & height, not box sides.
        var _crl=u.match(/X([+-]?\d+\.?\d*)/), _cz1l=u.match(/Z([+-]?\d+\.?\d*)/);
        if(_crl){ var _dia=Math.abs(parseFloat(_crl[1]))*2; if(_dia>500) probs.push({line:srcI,sev:'err',msg:'BLK FORM: cylinder diameter ('+_dia.toFixed(0)+' mm) exceeds the 500 mm limit'}); }
        if(_cz1l){ var _ch=Math.abs(parseFloat(_cz1l[1])-_cylZ0_val); if(_ch>500) probs.push({line:srcI,sev:'err',msg:'BLK FORM: cylinder height ('+_ch.toFixed(0)+' mm) exceeds the 500 mm limit'}); }
        _cylPending=false;
      }
      else if(!/X[+-]?\d/.test(u)||!/Y[+-]?\d/.test(u)||!/Z[+-]?\d/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'BLK FORM 0.2 incomplete \u2014 define X, Y and Z'});
      else {
        var _bx=u.match(/X([+-]?\d+\.?\d*)/),_by=u.match(/Y([+-]?\d+\.?\d*)/),_bz=u.match(/Z([+-]?\d+\.?\d*)/);
        // Side length = max corner (0.2) - min corner (0.1). Limit each side to 500 mm.
        var MAX_SIDE = 500;
        if(_bx&&blkMin1.x!==null){ var _sx=Math.abs(parseFloat(_bx[1])-blkMin1.x); if(_sx>MAX_SIDE) probs.push({line:srcI,sev:'err',msg:'BLK FORM: X side ('+_sx.toFixed(0)+' mm) exceeds the '+MAX_SIDE+' mm limit'}); }
        if(_by&&blkMin1.y!==null){ var _sy=Math.abs(parseFloat(_by[1])-blkMin1.y); if(_sy>MAX_SIDE) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Y side ('+_sy.toFixed(0)+' mm) exceeds the '+MAX_SIDE+' mm limit'}); }
        if(_bz&&blkMin1.z!==null){ var _sz=Math.abs(parseFloat(_bz[1])-blkMin1.z); if(_sz>MAX_SIDE) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Z side ('+_sz.toFixed(0)+' mm) exceeds the '+MAX_SIDE+' mm limit'}); }
        if(blkMin1.x!==null&&_bx&&parseFloat(_bx[1])<=blkMin1.x) probs.push({line:srcI,sev:'err',msg:'BLK FORM: X max ('+_bx[1]+') must be > X min ('+blkMin1.x+')'});
        if(blkMin1.y!==null&&_by&&parseFloat(_by[1])<=blkMin1.y) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Y max ('+_by[1]+') must be > Y min ('+blkMin1.y+')'});
        if(blkMin1.z!==null&&_bz&&parseFloat(_bz[1])<=blkMin1.z) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Z max ('+_bz[1]+') must be > Z min ('+blkMin1.z+')'});
      }

    } else if(u.indexOf('BLK FORM CYLINDER')===0){
      // Cylinder header: 0.1-style line holds center + Z0. Radius/height checked on the next 0.2 line.
      var _czl=u.match(/Z([+-]?\d+\.?\d*)/); _cylZ0_val = _czl?parseFloat(_czl[1]):0; _cylPending=true;

    } else if(u.indexOf('BLK FORM')===0){
      // other BLK FORM variants — no size check needed

    // ── TOOL CALL ──
    } else if(u.indexOf('TOOL CALL')===0){
      if(!/^TOOL CALL \d+/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: TOOL CALL <no.> Z S<rpm>'});
      if(valRcState==='RL'||valRcState==='RR')
        probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' active \u2014 program R0 before TOOL CALL'});
      if(!/\bS\d+/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'Spindle speed S missing in TOOL CALL'});
      hasToolCall=true; toolCallLine=srcI;
      valToolCallPendingSpindle=true;
      var _tm=u.match(/TOOL CALL (\d+)/); if(_tm) valToolNum=parseInt(_tm[1]);

    // ── TOOL DEF ──
    } else if(u.indexOf('TOOL DEF')===0){
      if(!/^TOOL DEF \d+/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: TOOL DEF <no.>'});

    // ── CC ──
    } else if(toks[0]==='CC'){
      if(!/X[+-]?\d/.test(u)&&!/Y[+-]?\d/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'CC block without coordinates'});
      lastCC=true; ccLine=srcI; pendingCC=true;

    // ── C arc ──
    } else if(/^C(\s|$)/.test(u)){
      if(!lastCC) probs.push({line:srcI,sev:'err',msg:'Circle center undefined \u2014 program CC first'});
      if(u.indexOf('DR+')<0&&u.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(/\bRL\b/.test(u)||/\bRR\b/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      pendingCC=false; lastRcWasArc=true;
      var _crm=u.match(/(?:^|\s)R([+-]?\d+\.?\d*)/);
      if(_crm&&valRcState&&valRcState!==''&&valRcState!=='R0'){ var _rChk=checkRadiusVsTool(Math.abs(parseFloat(_crm[1])),srcI,lines); if(_rChk) probs.push(_rChk); }
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── CR ──
    } else if(toks[0]==='CR'){
      if(!/(?:^|\s)R[+-]?\d/.test(u)) probs.push({line:srcI,sev:'err',msg:'Circle radius R missing'});
      if(u.indexOf('DR+')<0&&u.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(/\bRL\b/.test(u)||/\bRR\b/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      var _crRm=u.match(/(?:^|\s)R[+-]?(\d+\.?\d*)/);
      if(_crRm){ var _crChk=checkRadiusVsTool(parseFloat(_crRm[1]),srcI,lines); if(_crChk) probs.push(_crChk); }
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── CT ──
    } else if(toks[0]==='CT'){
      if(!/X[+-]?\d/.test(u)&&!/Y[+-]?\d/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'CT block without end point'});
      if(/\bRL\b/.test(u)||/\bRR\b/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── LP / CP ──
    } else if(toks[0]==='LP'){
      if(!/PR[+-]?\d/.test(u)) probs.push({line:srcI,sev:'err',msg:'Polar radius PR missing'});
      if(!/PA[+-]?\d/.test(u)) probs.push({line:srcI,sev:'err',msg:'Polar angle PA missing'});
      if(firstMoveLine<0) firstMoveLine=srcI;
    } else if(toks[0]==='CP'){
      if(!/PA[+-]?\d/.test(u)) probs.push({line:srcI,sev:'err',msg:'Polar angle PA missing'});
      if(u.indexOf('DR+')<0&&u.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(/\bRL\b/.test(u)||/\bRR\b/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. not permitted on a CP block'});
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── L ──
    } else if(toks[0]==='L'){
      var hasAxis=/I?[XYZABC][+-]?\d/.test(u);
      var hasF=/\bF/.test(u);
      var _li=srcI;
      // Z depth vs LCUTS check
      var _zm2=u.match(/\bZ([+-]?\d+\.?\d*)/);
      if(_zm2){ var _nz=parseFloat(_zm2[1]); if(valSurfZ!==null && _nz<valSurfZ) valZ=_nz; }
      if(!hasAxis&&!hasF)
        probs.push({line:srcI,sev:'warn',msg:'Empty L block \u2014 program X, Y, Z or F'});
      if(/\bFMAX\b/.test(u)&&(valRcState==='RL'||valRcState==='RR')&&!/\bR0\b/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'FMAX with active radius comp. \u2014 program a feed rate for cutting'});
      // Coordinate sign check (X0 instead of X+0)
      if(/[XYZ]\d/.test(u)&&!/[XYZ][+-]/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'Sign missing \u2014 write X+0, not X0 (TNC format)'});
      // Check for spindle on before first move
      if(!valSpindleOn&&hasAxis&&hasToolCall&&firstMoveLine<0)
        probs.push({line:srcI,sev:'warn',msg:'Spindle? \u2014 M3/M4 not programmed before first cutting move'});
      if(!hasToolCall)
        probs.push({line:srcI,sev:'warn',msg:'No tool active \u2014 TOOL CALL missing before this move'});
      // RL/RR tracking
      if(/\bRL\b/.test(u)){
        if(valRcState==='RR') probs.push({line:srcI,sev:'err',msg:'Change of radius comp. RR \u2192 RL \u2014 cancel with R0 first'});
        valRcState='RL'; valRcLine=srcI; lastRcWasArc=false;
      } else if(/\bRR\b/.test(u)){
        if(valRcState==='RL') probs.push({line:srcI,sev:'err',msg:'Change of radius comp. RL \u2192 RR \u2014 cancel with R0 first'});
        valRcState='RR'; valRcLine=srcI; lastRcWasArc=false;
      } else if(/\bR0\b/.test(u)){
        valRcState=''; valRcLine=-1;
      }
      // Zero-XY-displacement check while comp is active — a pure Z (plunge) move
      // under RL/RR has no lateral edge to offset against. This used to freeze
      // the simulator (infinite loop in applyRadiusComp/offsetRun); that's now
      // fixed defensively, but it's still not valid Heidenhain practice, so flag it.
      var _isIX4=/(?:^|\s)IX/.test(u), _isIY4=/(?:^|\s)IY/.test(u);
      var _xm4=u.match(/(?:^|\s)I?X([+-]?\d+\.?\d*)/), _ym4=u.match(/(?:^|\s)I?Y([+-]?\d+\.?\d*)/);
      var _oldVX4=valLastX, _oldVY4=valLastY;
      var _newVX4 = _xm4 ? (_isIX4 && valLastX!==null ? valLastX+parseFloat(_xm4[1]) : parseFloat(_xm4[1])) : valLastX;
      var _newVY4 = _ym4 ? (_isIY4 && valLastY!==null ? valLastY+parseFloat(_ym4[1]) : parseFloat(_ym4[1])) : valLastY;
      if((valRcState==='RL'||valRcState==='RR') && _oldVX4!==null && _oldVY4!==null && _newVX4!==null && _newVY4!==null){
        if(Math.abs(_newVX4-_oldVX4)<1e-6 && Math.abs(_newVY4-_oldVY4)<1e-6)
          probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' on a pure Z move \u2014 comp needs XY motion'});
      }
      valLastX=_newVX4; valLastY=_newVY4;
      if(!isNaN(parseFloat((u.match(/\bF\+?(\d+\.?\d*)/)||[])[1]))) {
        var _fv=parseFloat((u.match(/\bF\+?(\d+\.?\d*)/)||[0,0])[1]);
        if(_fv>100000) probs.push({line:srcI,sev:'warn',msg:'Feed rate F'+_fv+' exceeds 100000 mm/min'});
      }
      var _coords=(u.matchAll?Array.from(u.matchAll(/[XYZ]([+-]?\d+\.?\d*)/g)):(function(){var r=[],m,re=/[XYZ]([+-]?\d+\.?\d*)/g;while((m=re.exec(u)))r.push(m);return r;})());
      _coords.forEach(function(mc){var v=parseFloat(mc[1]);if(Math.abs(v)>10000) probs.push({line:srcI,sev:'warn',msg:'Coordinate '+mc[0]+' exceeds \xb110000 mm limit'});});
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── RND ──
    } else if(toks[0]==='RND'){
      if(!/R\d/.test(u)) probs.push({line:srcI,sev:'warn',msg:'Rounding radius R missing'});
      else{
        var _rndRm=u.match(/R[+-]?(\d+\.?\d*)/);
        if(_rndRm){
          if(valRcState==='RL'||valRcState==='RR'){ var _rndChk=checkRadiusVsTool(parseFloat(_rndRm[1]),srcI,lines); if(_rndChk) probs.push(_rndChk); }
          if(parseFloat(_rndRm[1])<=0) probs.push({line:srcI,sev:'err',msg:'Rounding radius must be greater than 0'});
        }
      }

    // ── CHF ──
    } else if(toks[0]==='CHF'){
      var _chfm=u.match(/(\d+\.?\d*)/);
      if(!_chfm||parseFloat(_chfm[1])<=0) probs.push({line:srcI,sev:'warn',msg:'Chamfer length must be greater than 0'});

    // ── CYCL DEF ──
    } else if(u.indexOf('CYCL DEF')===0){
      var _cnum=u.match(/CYCL\s+DEF\s+(\d+)/);
      if(_cnum && ['200','201','208','209'].indexOf(_cnum[1])<0) probs.push({line:srcI,sev:'warn',msg:'CYCL DEF '+_cnum[1]+' is not supported by the simulator and will be ignored (supported: 200, 201, 208, 209)'});
      var _qd=u.match(/Q200\s*=\s*([+-]?[\d.]+)/); if(_qd&&parseFloat(_qd[1])<0) probs.push({line:srcI,sev:'warn',msg:'Q200 (safety clearance) must be >= 0'});
      var _qd2=u.match(/Q201\s*=\s*([+-]?[\d.]+)/); if(_qd2&&parseFloat(_qd2[1])>0) probs.push({line:srcI,sev:'warn',msg:'Q201 (depth) should be negative (below surface)'});
      var _qd3=u.match(/Q335\s*=\s*([+-]?[\d.]+)/); if(_qd3&&parseFloat(_qd3[1])<TOOL_R*2) probs.push({line:srcI,sev:'err',msg:'Q335 bore diameter ('+_qd3[1]+'mm) is smaller than tool diameter ('+(TOOL_R*2)+'mm)'});
      var _qd4=u.match(/Q206\s*=\s*(\d+)/); if(_qd4&&parseFloat(_qd4[1])===0) probs.push({line:srcI,sev:'err',msg:'Q206 feed rate may not be 0'});
      hasCycleDef=true; lastCycleLine=srcI; activeCycleDef=true;
      valCycleQ={}; valCycleLine=srcI; valInCycle=true;

    // ── Q inside CYCL DEF ──
    } else if(/^\s*Q\d+/.test(u) && valInCycle){
      var qpm=u.match(/Q(\d+)\s*=?\s*([+-]?[\d.]+|FAUTO|FMAX)/i);
      if(qpm){ valCycleQ['Q'+qpm[1]]=/FAUTO/i.test(qpm[2])?'FAUTO':parseFloat(qpm[2]); }

    // ── CYCL CALL ──
    } else if(u.indexOf('CYCL CALL')===0){
      if(!hasCycleDef) probs.push({line:srcI,sev:'err',msg:'No cycle defined \u2014 CYCL DEF missing before CYCL CALL'});
      if(valRcState==='RL'||valRcState==='RR')
        probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' active \u2014 program R0 before CYCL CALL'});

    // ── M functions ──
    } else if(/^M\d+/.test(u)){
      var mnum=parseInt(u.match(/^M(\d+)/)[1]);
      if(mnum===99&&!hasCycleDef) probs.push({line:srcI,sev:'err',msg:'M99 without a defined cycle \u2014 CYCL DEF missing'});
      if(mnum===3||mnum===4||mnum===13||mnum===14) valSpindleOn=true;
      if(mnum===5) valSpindleOn=false;

    // ── LBL / CALL LBL ──
    } else if(toks[0]==='LBL'||u.indexOf('CALL LBL')===0){
      if(u.indexOf('CALL LBL')===0){
        var _cm=u.match(/CALL LBL\s+(\d+)/);
        if(_cm && !definedLbls[_cm[1]]) probs.push({line:srcI,sev:'err',msg:'Label number not allocated \u2014 LBL '+_cm[1]+' missing'});
        var _rep=u.match(/REP\s+(\d+)/);
        if(_rep&&parseInt(_rep[1])<1) probs.push({line:srcI,sev:'err',msg:'REP must be at least 1'});
      } else {
        var _ln=u.match(/^LBL\s+(\d+)/);
        if(_ln&&_ln[1]!=='0'&&duplicateLbls[_ln[1]]) probs.push({line:srcI,sev:'err',msg:'Label number allocated twice \u2014 LBL '+_ln[1]});
      }
    }
  }

  // Final checks
  if(!hasBegin) probs.push({line:0,sev:'err',msg:'BEGIN PGM missing'});
  if(!hasEnd)   probs.push({line:lines.length-1,sev:'err',msg:'END PGM missing'});
  if(!hasToolCall&&hasBegin) probs.push({line:firstMoveLine>0?firstMoveLine:1,sev:'warn',msg:'No TOOL CALL programmed'});
  if(!hasBlk1||!hasBlk2) probs.push({line:0,sev:'warn',msg:'BLK FORM incomplete \u2014 default workpiece used'});
  if(valRcState==='RL'||valRcState==='RR') probs.push({line:valRcLine,sev:'err',msg:'Radius comp. '+valRcState+' still active at END PGM \u2014 cancel with R0'});

  return probs;
}

function parseProgram(code){
  // Normalize: replace commas with dots in decimal numbers (0,5 → 0.5)
  code = code.replace(/(\d),(\d)/g, '$1.$2');
  // Strip leading block numbers from real exported .H files (see validateProgram).
  code = code.replace(/^[ \t]*\d+[ \t]+/gm, '');
  
  toolCallList = []; // reset TOOL CALL list for GOTO dropdown
  var lines = code.split('\n');
  var blkMin = {x:0,y:0,z:0};
  var blkMax = {x:100,y:80,z:40};
  var blkCyl = null; // {cx, cy, r, zMin, zMax} if cylindrical blank
  var ccx=null, ccy=null;
  var feed = DEFAULT_FEED;
  lastDefinedFeed = DEFAULT_FEED;
  var rcState = '';
  // Programmed deltas from the CURRENT TOOL CALL block (Heidenhain semantics:
  // these are ADDED to the tool-table deltas and affect only the tool PATH /
  // length compensation, never the physical cutting shape). Captured per-segment
  // so repeated TOOL CALLs of the same tool with different DL/DR each keep
  // their own values instead of "last call wins retroactively".
  var curDLpgm = 0, curDRpgm = 0;
  // M89 = MODAL cycle call: the active cycle runs after EVERY positioning block
  // until cancelled by M99 (which itself calls the cycle one last time).
  var modalCycleCall = false;
  var toolNum = 1;
  var spindleS = 0; // spindle speed from TOOL CALL S...
  var spindleOn = false;  // M3/M4 = true, M5 = false
  var coolantOn = false;  // M7/M8 = true, M9 = false
  var qVars = {};         // Q parameter values {1:50, 2:30, ...}
  var pendingDefTool = 0; // tool number from TOOL DEF
  var activeCycle = null; // current radius compensation: '', 'RL', 'RR', 'R0'
  // True only while still inside a CYCL DEF's own multi-line Q-parameter
  // continuation block (the Q200=.../Q201=... lines right after CYCL DEF).
  // Without this, activeCycle (which is never reset to null after the cycle
  // is defined) would keep redirecting EVERY later "Qnn = ..." assignment
  // anywhere in the rest of the program into the stale cycle object instead
  // of qVars — silently breaking any Q-parameter reused after a cycle.
  var inCycleParamBlock = false;
  // start above the (default) stock; adjusted after we know blkMax
  var pos = {x:0,y:0,z:0};
  var sub = [];
  var blockIndex = 0;
  var startSet = false;

  // first pass for BLK FORM so start Z is correct
  for(var p=0;p<lines.length;p++){
    var lu = lines[p].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(lu.indexOf('BLK FORM CYLINDER')===0){
      // CYL: 0.1 has center X Y and Z min; 0.2 has radius (X=Y=R) and Z max
      var cx=lu.match(/X([+-]?\d+\.?\d*)/),cy=lu.match(/Y([+-]?\d+\.?\d*)/),cz=lu.match(/Z([+-]?\d+\.?\d*)/);
      if(cx&&cy&&cz){
        var r=0; // radius comes from 0.2 line, read below
        blkMin.x=parseFloat(cx[1]); blkMin.y=parseFloat(cy[1]); blkMin.z=parseFloat(cz[1]);
      }
    } else if(lu.indexOf('BLK FORM 0.1')===0){
      var x1=lu.match(/X([+-]?\d+\.?\d*)/),y1=lu.match(/Y([+-]?\d+\.?\d*)/),z1=lu.match(/Z([+-]?\d+\.?\d*)/);
      if(x1)blkMin.x=parseFloat(x1[1]); if(y1)blkMin.y=parseFloat(y1[1]); if(z1)blkMin.z=parseFloat(z1[1]);
    } else if(lu.indexOf('BLK FORM 0.2')===0){
      var x2=lu.match(/X([+-]?\d+\.?\d*)/),y2=lu.match(/Y([+-]?\d+\.?\d*)/),z2=lu.match(/Z([+-]?\d+\.?\d*)/);
      if(x2)blkMax.x=parseFloat(x2[1]); if(y2)blkMax.y=parseFloat(y2[1]); if(z2)blkMax.z=parseFloat(z2[1]);
      _WORKPIECE_TOP_Z = blkMax.z;
    }
  }
  // For CYLINDER: reconstruct bounding box from center+radius
  for(var p=0;p<lines.length;p++){
    var lu2 = lines[p].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(lu2.indexOf('BLK FORM CYLINDER')===0){
      var cxm=lu2.match(/X([+-]?\d+\.?\d*)/),cym=lu2.match(/Y([+-]?\d+\.?\d*)/),czm=lu2.match(/Z([+-]?\d+\.?\d*)/);
      var cylCx=cxm?parseFloat(cxm[1]):50, cylCy=cym?parseFloat(cym[1]):50, cylZ0=czm?parseFloat(czm[1]):0;
      for(var p2=p+1;p2<lines.length&&p2<p+3;p2++){
        var lu3=lines[p2].trim().replace(/;.*$/,'').trim().toUpperCase();
        if(lu3.indexOf('BLK FORM 0.2')===0){
          var rx=lu3.match(/X([+-]?\d+\.?\d*)/),rz=lu3.match(/Z([+-]?\d+\.?\d*)/);
          var rad=rx?Math.abs(parseFloat(rx[1])):50;
          var cylZ1=rz?parseFloat(rz[1]):20;
          blkCyl={cx:cylCx, cy:cylCy, r:rad, zMin:cylZ0, zMax:cylZ1};
          blkMin.x=cylCx-rad; blkMax.x=cylCx+rad;
          blkMin.y=cylCy-rad; blkMax.y=cylCy+rad;
          blkMin.z=cylZ0;     blkMax.z=cylZ1;
          break;
        }
      }
      break;
    }
  }
  pos = {x:blkMin.x, y:blkMax.y, z:blkMax.z + 50}; // home: back-left corner, above block
  // push initial home position as virtual start
  sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:pos.x,y:pos.y,z:pos.z}, rapid:true, feed:DEFAULT_FEED, len:0.001, blockIndex:0, srcLine:0, rc:''});

  function pushSeg(to, rapid, srcLine, rc, safeRetract){
    var from = {x:pos.x,y:pos.y,z:pos.z};
    var dx=to.x-from.x, dy=to.y-from.y, dz=to.z-from.z;
    var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(len > 1e-6){
      sub.push({from:from, to:{x:to.x,y:to.y,z:to.z}, rapid:rapid, feed:feed, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, len:len, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', toolNum:toolNum, pendingDef:pendingDefTool, safeRetract:!!safeRetract, dlPgm:curDLpgm, drPgm:curDRpgm});
    }
    pos = {x:to.x,y:to.y,z:to.z};
  }

  // --- expand LBL/CALL LBL (shared helper) ---
  var expandedProg = expandLblLines(lines);
  // --- end LBL expansion ---

  var pendingMoves=[];

  function executeCycle(cy, srcLine, rc){
    if(cy.type===200){
      /*
       * CYCL DEF 200 — Drilling (Heidenhain)
       * Q200 = safety clearance (incremental above Q203)
       * Q201 = depth (negative, incremental below Q203)
       * Q206 = feed rate for plunging (mm/min or FAUTO)
       * Q202 = plunging depth per peck (0 = full depth in one pass)
       * Q210 = dwell time at top after each peck retract (s — simulated as small pause)
       * Q203 = Z coordinate of workpiece surface (absolute)
       * Q204 = 2nd safety clearance (incremental above Q203 — final retract)
       * Q211 = dwell time at bottom of hole (s)
       */
      var surfZ  = cy.Q203 !== undefined ? cy.Q203 : 0;
      var safeZ  = surfZ + Math.abs(cy.Q200 || 2);
      var safe2Z = surfZ + Math.abs(cy.Q204 || 50);
      var depth  = cy.Q201 !== undefined ? cy.Q201 : -20;
      if(depth > 0) depth = -depth;
      var depthZ = surfZ + depth;
      var pFeed  = (cy.Q206==='FAUTO') ? lastDefinedFeed : (cy.Q206 !== undefined ? cy.Q206 : 150);
      var peck   = (cy.Q202 !== undefined && cy.Q202 > 0) ? cy.Q202 : Math.abs(depth);
      if(peck >= Math.abs(depth)) peck = Math.abs(depth); // single pass

      var oldFeed = feed;
      var cx2 = pos.x, cy2a = pos.y;

      // 1. Rapid to safeZ above hole
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2a,z:safeZ}, rapid:true, feed:9999, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, toolNum:toolNum, len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2a-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', safeRetract:true});
      pos={x:cx2,y:cy2a,z:safeZ};

      // 2. Peck drilling loop
      feed = pFeed;
      var curZ = safeZ;
      var pecked = 0;
      while(pecked < Math.abs(depth) - 1e-6){
        var nextPeck = Math.min(Math.abs(depth), pecked + peck);
        var targetZ = surfZ - nextPeck;

        // Drill down to next peck depth
        pushSeg({x:cx2, y:cy2a, z:targetZ}, false, srcLine, rc);
        pecked = nextPeck;

        if(pecked < Math.abs(depth) - 1e-6){
          // Not final depth — retract to safeZ for chip removal
          feed = 9999;
          pushSeg({x:cx2, y:cy2a, z:safeZ}, true, srcLine, rc, true);
          // Rapid back down into the pre-drilled hole to 0.2mm above the last
          // peck depth (Heidenhain advanced stop distance), NOT above the surface
          pushSeg({x:cx2, y:cy2a, z:surfZ - pecked + 0.2}, true, srcLine, rc, true);
          feed = pFeed;
        }
      }

      // 3. Retract to safeZ (rapid)
      feed = 9999;
      pushSeg({x:cx2, y:cy2a, z:safeZ}, true, srcLine, rc, true);

      // 4. Retract to 2nd safety clearance (rapid)
      pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);

      feed = oldFeed;
    }
    else if(cy.type===208){
      /*
       * CYCL DEF 208 — Bore Milling (Heidenhain)
       *
       * Real Heidenhain strategy:
       * 1. Rapid to safeZ above center
       * 2. For each radial ring (innermost to outermost):
       *    a. Move to ring start position
       *    b. Helical descent: each revolution descends Q334 in Z
       *       (Q334=0 → full depth in one helical revolution)
       *    c. Finishing circle at full depth
       * 3. The radial rings step by TOOL_R (50% overlap) from center to mR
       *    so the entire bore area is covered — no material left at center
       * 4. Retract
       */
      var surfZ  = cy.Q203 !== undefined ? cy.Q203 : 0;
      var safeZ  = surfZ + Math.abs(cy.Q200 || 0);
      var depth  = cy.Q201 || -10;
      if(depth > 0) depth = -Math.abs(depth);
      var depthZ = surfZ + depth;
      var pFeed  = (cy.Q206==='FAUTO') ? lastDefinedFeed : (cy.Q206 || 150);
      var rFeed  = 9999;
      var zStep  = cy.Q334 > 0 ? cy.Q334 : Math.abs(depth); // Z descent per revolution (Q334)
      var boreDia = cy.Q335 || TOOL_R * 4;
      var preDia  = cy.Q342 || 0;
      var dir     = (cy.Q351 === -1) ? -1 : 1; // +1=CCW (climb), -1=CW (conventional)
      var cx2 = pos.x, cy2 = pos.y;
      var N_arc = 32; // segments per revolution
      var oldFeed = feed;

      // mR = tool center radius at bore wall.
      // Real TNC doesn't know the tool shape — the cycle ALWAYS uses R+DR for the path.
      // For countersinks (tip-reference R≈0), the operator programs DR/DL in TOOL CALL
      // (e.g. DR+2 DL-2 for a 90° cone) so the cycle math works out — same as real machine.
      var _ct208 = getToolByNum(toolNum);
      // Compensation radius for the helix path: R + DR(table) + DR(TOOL CALL),
      // additive per Heidenhain. The cone/tool SHAPE in vxCut stays table-only.
      var _cycleR = _ct208 ? (_ct208.R + (_ct208.DR||0) + curDRpgm) : TOOL_R;
      _cycleR = Math.max(0.001, _cycleR);
      // Stepover radius = PHYSICAL tool radius (R + table DR only). TOOL CALL DR
      // is a path allowance — it shifts the final wall path but does NOT make the
      // tool cover more material per ring. A tiny tool (R≈0.001, e.g. a chamfer
      // tool without matching pre-drill) therefore needs a huge number of rings —
      // exactly like the real machine.
      var _stepR = _ct208 ? Math.max(0.001, _ct208.R + (_ct208.DR||0)) : Math.max(0.001, TOOL_R);
      var mR = Math.max(0.001, boreDia/2 - _cycleR);
      // sR = tool center radius at pre-drilled edge (0 if solid or tool covers it)
      var sR = preDia > 0 ? Math.max(0, preDia/2 - _cycleR) : 0;

      // Build list of radial rings from inside out, step = _stepR (physical tool).
      // All rings are clamped to mR — the path must never exceed the target wall.
      // NOTE: with a tiny tool radius this generates MANY rings and the simulation
      // runs correspondingly long — same as the real machine would.
      var radii = [];
      if(preDia <= 0){
        // solid — handle separately below
      } else {
        // Pre-drilled: start where material begins (or at the innermost ring the
        // tool can ride), never beyond mR. If the tool covers the pre-drilled
        // hole entirely (sR=0), a single pass at mR finishes the bore.
        var rStart = Math.min(Math.max(sR, _stepR), mR);
        var _ringCount = Math.max(0, Math.ceil((mR - rStart) / _stepR));
        if(_ringCount > 5000){
          // Absurd config (e.g. R=0.001 with no DR): cap to keep the browser alive,
          // but warn — real machine would run for hours or refuse.
          if(typeof probs !== 'undefined') probs.push({line:srcLine, sev:'warn', msg:'CYCL 208: tool radius '+_stepR.toFixed(3)+'mm needs '+_ringCount+' passes for D'+boreDia+' (pre-drilled D'+preDia+') — capped at 5000. Real machine would run extremely long. Check R/DR.'});
          _ringCount = 5000;
        }
        for(var ri0 = 0; ri0 < _ringCount; ri0++){
          radii.push(Math.min(rStart + ri0 * _stepR, mR));
        }
        if(radii.length===0 || radii[radii.length-1] < mR - 0.0005) radii.push(mR);
      }

      // ── 1. Rapid to safeZ above center ─────────────────────────────
      feed = rFeed;
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2,z:safeZ},
        rapid:true, feed:rFeed, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn,
        len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001,
        blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', toolNum:toolNum, safeRetract:true});
      pos={x:cx2, y:cy2, z:safeZ};

      feed = pFeed;
      var totalZ = Math.abs(depth);

      if(preDia <= 0){
        // ── Q342=0: Solid material ──────────────────────────────────────
        // Each ring from center outward does a FULL helical descent safeZ→depthZ.
        // Ring r=0: ramp outward while descending (no straight plunge).
        // Rings r=_stepR, 2*_stepR, ..., mR: helical descent then finishing circle.
        // This ensures all material is removed at ALL Z levels, not just at depthZ.
        // The center ramp and every ring are clamped to mR — never beyond the wall.
        var _rampR = Math.min(_stepR, mR); // center ramp target

        // Build ring list: start from 2*_stepR (center ramp covers 0.._stepR)
        var solidRings = [];
        solidRings.push(0); // r=0: center expanding ramp
        var _solidCount = Math.ceil(mR / _stepR);
        if(_solidCount > 5000){
          if(typeof probs !== 'undefined') probs.push({line:srcLine, sev:'warn', msg:'CYCL 208: tool radius '+_stepR.toFixed(3)+'mm needs '+_solidCount+' passes for solid D'+boreDia+' — capped at 5000. Real machine would run extremely long. Check R/DR.'});
          _solidCount = 5000;
        }
        for(var ri0b = 2; ri0b <= _solidCount; ri0b++){
          var _r3 = Math.min(ri0b * _stepR, mR);
          solidRings.push(_r3);
          if(_r3 >= mR) break;
        }
        // Ensure mR is always the last ring
        if(solidRings.length===0 || solidRings[solidRings.length-1] < mR - 0.001) solidRings.push(mR);

        for(var ri3=0; ri3<solidRings.length; ri3++){
          var curR3 = solidRings[ri3];

          if(curR3 <= 0){
            // Center: ramp from r=0 to _rampR while descending safeZ→depthZ
            var numRevs3 = Math.max(1, Math.ceil(totalZ / zStep));
            var nRamp = numRevs3 * N_arc;
            for(var si=1; si<=nRamp; si++){
              var frac3 = si / nRamp;
              var rAt3 = _rampR * frac3;
              var zAt3 = safeZ + (depthZ - safeZ) * frac3;
              var a3 = dir * 2*Math.PI * si/N_arc;
              pushSeg({x:cx2+rAt3*Math.cos(a3), y:cy2+rAt3*Math.sin(a3), z:zAt3}, false, srcLine, rc);
            }
            // Finishing circle at _rampR, depthZ
            for(var k=1; k<=N_arc; k++){
              var a3 = dir*2*Math.PI*k/N_arc;
              pushSeg({x:cx2+_rampR*Math.cos(a3), y:cy2+_rampR*Math.sin(a3), z:depthZ}, false, srcLine, rc);
            }
          } else {
            // Normal ring: rapid to start, helical descent, finishing circle
            pushSeg({x:cx2+curR3, y:cy2, z:safeZ}, true, srcLine, rc);
            var numRevs3 = Math.max(1, Math.ceil(totalZ / zStep));
            var zPerRev3 = totalZ / numRevs3;
            var zCur3 = safeZ;
            for(var rev3=0; rev3<numRevs3; rev3++){
              var zEnd3 = (rev3===numRevs3-1) ? depthZ : (safeZ-(rev3+1)*zPerRev3);
              for(var k=1; k<=N_arc; k++){
                var a3 = dir*2*Math.PI*k/N_arc;
                var zAt3 = zCur3 + (zEnd3-zCur3)*k/N_arc;
                pushSeg({x:cx2+curR3*Math.cos(a3), y:cy2+curR3*Math.sin(a3), z:zAt3}, false, srcLine, rc);
              }
              zCur3 = zEnd3;
            }
            // Finishing circle at full depth
            for(var k=1; k<=N_arc; k++){
              var a3 = dir*2*Math.PI*k/N_arc;
              pushSeg({x:cx2+curR3*Math.cos(a3), y:cy2+curR3*Math.sin(a3), z:depthZ}, false, srcLine, rc);
            }
            pushSeg({x:cx2+curR3, y:cy2, z:safeZ}, true, srcLine, rc);
          }
        }

      } else {
        // ── Q342>0: Pre-drilled — helical descent at each radial ring ──
        // Tool moves to ring radius, then helically descends (no straight plunge)
        for(var ri=0; ri<radii.length; ri++){
          var curR = radii[ri];
          if(curR <= 0) continue; // skip center if accidentally added

          // Rapid to approach point on ring at safeZ
          pushSeg({x:cx2 + curR, y:cy2, z:safeZ}, true, srcLine, rc);

          // Helical descent: Q334 = Z drop per full revolution (360°)
          var numRevs = Math.max(1, Math.ceil(totalZ / zStep));
          var zPerRev = totalZ / numRevs;
          var zCur = safeZ;
          for(var rev=0; rev<numRevs; rev++){
            var zEnd = (rev === numRevs-1) ? depthZ : (safeZ - (rev+1)*zPerRev);
            for(var k=1; k<=N_arc; k++){
              var a = dir * 2*Math.PI * k/N_arc;
              var zAt = zCur + (zEnd - zCur) * k/N_arc;
              pushSeg({x:cx2+curR*Math.cos(a), y:cy2+curR*Math.sin(a), z:zAt}, false, srcLine, rc);
            }
            zCur = zEnd;
          }

          // Finishing circle at full depth
          for(var k=1; k<=N_arc; k++){
            var a = dir * 2*Math.PI * k/N_arc;
            pushSeg({x:cx2+curR*Math.cos(a), y:cy2+curR*Math.sin(a), z:depthZ}, false, srcLine, rc);
          }

          // Retract to safeZ before next ring
          pushSeg({x:cx2 + curR, y:cy2, z:safeZ}, true, srcLine, rc);
        }
      }

      // ── Final retract ───────────────────────────────────────────────
      feed = rFeed;
      pushSeg({x:cx2, y:cy2, z:safeZ}, true, srcLine, rc);
      pushSeg({x:cx2, y:cy2, z:surfZ + Math.abs(cy.Q204 || 50)}, true, srcLine, rc);

      feed = oldFeed;
    }
    else if(cy.type===201){
      /*
       * CYCL DEF 201 — Reaming
       * Q200 = safety clearance (incr above Q203)
       * Q201 = depth (neg, incr below Q203)
       * Q206 = feed rate for reaming (mm/min, FAUTO)
       * Q211 = dwell time at bottom (s)
       * Q208 = retraction feed rate (0 = use Q206)
       * Q203 = Z coordinate of workpiece surface (abs)
       * Q204 = 2nd safety clearance (incr above Q203)
       *
       * Cycle run:
       * 1. Rapid to safeZ above hole center
       * 2. Feed at Q206 down to full depth in one pass (no pecking — reaming is always single pass)
       * 3. Dwell Q211 at bottom
       * 4. Retract at Q208 (or Q206 if Q208=0) to safeZ
       * 5. Rapid to 2nd safety clearance
       *
       * Workpiece shape: clean cylindrical hole at tool radius, smooth walls
       */
      var surfZ  = cy.Q203 !== undefined ? cy.Q203 : 0;
      var safeZ  = surfZ + Math.abs(cy.Q200 || 2);
      var safe2Z = surfZ + Math.abs(cy.Q204 || 50);
      var depth  = cy.Q201 || -10;
      if(depth > 0) depth = -depth;
      var depthZ = surfZ + depth;
      var reamF  = (cy.Q206==='FAUTO') ? lastDefinedFeed : (cy.Q206 || 100);
      var retF   = cy.Q208 > 0 ? cy.Q208 : reamF;
      var cx2 = pos.x, cy2a = pos.y;
      var oldFeed = feed;

      // 1. Rapid to safeZ
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2a,z:safeZ}, rapid:true, feed:9999, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, toolNum:toolNum, len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2a-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', safeRetract:true});
      pos={x:cx2,y:cy2a,z:safeZ};

      // 2. Ream down in one pass
      feed = reamF;
      pushSeg({x:cx2, y:cy2a, z:depthZ}, false, srcLine, rc);

      // 3. Retract at Q208 — a synchronized FEED move (smooth reamer exit), never FMAX
      feed = retF;
      pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true);

      // 4. Rapid to 2nd safety clearance
      pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);

      feed = oldFeed;
    }
    else if(cy.type===209){
      /*
       * CYCL DEF 209 — Tapping with Chip Breaking
       * Q200 = safety clearance (incr above Q203)
       * Q201 = thread depth (neg, incr below Q203)
       * Q239 = thread pitch (+ right-hand, − left-hand)
       * Q203 = Z coordinate of workpiece surface (abs)
       * Q204 = 2nd safety clearance (incr above Q203)
       * Q257 = infeed depth per chip-break cycle (incr, 0 = single pass, no chip breaking)
       * Q256 = retract factor for chip breaking: TNC retracts by Q256 × Q239 (pitch).
       *        Q256 = 0 → full retract out of the hole to set-up clearance (Q200)
       * Q336 = spindle orientation angle (0 for simulation)
       *
       * Cycle run (per Heidenhain manual):
       * 1. Rapid to safeZ (set-up clearance)
       * 2. Tap down by Q257 at synchronized feed (pitch × RPM)
       * 3. Chip break: retract by Q256×pitch (stays in hole), or fully to safeZ if Q256=0.
       *    ALL motions inside the thread are at synchronized feed (spindle reverses) — never FMAX.
       * 4. Repeat until Q201 depth
       * 5. Retract out of hole to safeZ at synchronized feed
       * 6. FMAX to 2nd set-up clearance (Q204)
       *
       * Feed calculation: F = pitch × RPM — if spindleS=0 use lastDefinedFeed as fallback
       * Workpiece: cylindrical hole at tool radius (thread profile not modeled in voxel sim)
       */
      var surfZ  = cy.Q203 !== undefined ? cy.Q203 : 0;
      var safeZ  = surfZ + Math.abs(cy.Q200 || 2);
      var safe2Z = surfZ + Math.abs(cy.Q204 || 50);
      var depth  = cy.Q201 || -10;
      if(depth > 0) depth = -depth;
      var depthZ = surfZ + depth;
      var pitch  = Math.abs(cy.Q239 || 1.25);
      // Feed = pitch × RPM; fallback to lastDefinedFeed if RPM unknown
      var tapFeed = pitch > 0 && spindleS > 0 ? pitch * spindleS : lastDefinedFeed;
      var chipDepth = cy.Q257 > 0 ? cy.Q257 : Math.abs(depth); // depth per chip-break step
      // Q256=0: full retract to safeZ; Q256>0: retract by pitch*Q256
      var chipFullRetract = (cy.Q256 === 0);
      var chipRetract = chipFullRetract ? 0 : Math.abs(pitch * cy.Q256);
      if(!chipFullRetract && chipRetract < 0.001) chipRetract = 0.2; // fallback
      var cx2 = pos.x, cy2a = pos.y;
      var oldFeed = feed;

      // 1. Rapid to safeZ
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2a,z:safeZ}, rapid:true, feed:9999, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, toolNum:toolNum, len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2a-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', safeRetract:true});
      pos={x:cx2,y:cy2a,z:safeZ};

      // 2. Chip-break tapping loop
      feed = tapFeed;
      var tapped = 0;
      var totalDepth = Math.abs(depth);
      while(tapped < totalDepth - 1e-6){
        var nextTap = Math.min(totalDepth, tapped + chipDepth);
        var targetZ = surfZ - nextTap;

        // Tap down to next chip-break depth
        pushSeg({x:cx2, y:cy2a, z:targetZ}, false, srcLine, rc, false);
        tapped = nextTap;

        if(tapped < totalDepth - 1e-6){
          if(chipFullRetract){
            // Q256=0: full retract to safeZ (synchronized feed — spindle reverses, tool follows thread)
            pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true);
            // Re-tap down to just above last depth (synchronized feed — tool follows existing thread)
            pushSeg({x:cx2, y:cy2a, z:targetZ + 0.1}, false, srcLine, rc, true);
          } else {
            // Q256>0: retract by pitch*Q256, stays in hole (synchronized feed)
            var breakZ = targetZ + chipRetract;
            pushSeg({x:cx2, y:cy2a, z:breakZ}, false, srcLine, rc, true);
            pushSeg({x:cx2, y:cy2a, z:targetZ + 0.1}, false, srcLine, rc, true);
          }
        }
      }

      // 3. Full retract to safeZ — synchronized feed (spindle reverses, tool follows thread out)
      pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true);

      // 4. Rapid to 2nd safety clearance (tool is out of the hole — FMAX allowed)
      pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);

      feed = oldFeed;
    }
  }

  function flushPending(){
    for(var mi=0;mi<pendingMoves.length;mi++){
      var mv=pendingMoves[mi];
      feed=mv.feed; blockIndex=mv.blockIdx;
      if(typeof mv.spindleOn !== 'undefined') spindleOn=mv.spindleOn;
      if(mv.spindleS && mv.spindleS > 0) spindleS=mv.spindleS;
      if(typeof mv.coolantOn !== 'undefined') coolantOn=mv.coolantOn;
      var mod=mv.modifier;
      // set pos to stored from position
      pos={x:mv.from.x, y:mv.from.y, z:mv.from.z};
      if(!mod || mi+1>=pendingMoves.length){
        pushSeg(mv.target, mv.rapid, mv.srcLine, mv.rc);
        if(mv.m99 && activeCycle) executeCycle(activeCycle, mv.srcLine, mv.rc);
        continue;
      }
      var nextMv=pendingMoves[mi+1];
      var corner=mv.target;
      var in_dx=corner.x-pos.x, in_dy=corner.y-pos.y;
      var in_l=Math.sqrt(in_dx*in_dx+in_dy*in_dy);
      var out_dx=nextMv.target.x-corner.x, out_dy=nextMv.target.y-corner.y;
      var out_l=Math.sqrt(out_dx*out_dx+out_dy*out_dy);
      if(in_l<1e-6||out_l<1e-6){ pushSeg(corner, mv.rapid, mv.srcLine, mv.rc); continue; }
      var u_in={x:in_dx/in_l, y:in_dy/in_l};
      var u_out={x:out_dx/out_l, y:out_dy/out_l};
      var r=mod.r;
      var dot=Math.max(-1,Math.min(1,u_in.x*u_out.x+u_in.y*u_out.y));
      var halfAngle=Math.acos(dot)/2;
      if(halfAngle<1e-4){ pushSeg(corner, mv.rapid, mv.srcLine, mv.rc); continue; }
      var dist=Math.min(r/Math.tan(halfAngle), in_l*0.9, out_l*0.9);
      var p1={x:corner.x-u_in.x*dist, y:corner.y-u_in.y*dist, z:corner.z};
      var p2={x:corner.x+u_out.x*dist, y:corner.y+u_out.y*dist, z:corner.z};
      pushSeg(p1, mv.rapid, mv.srcLine, mv.rc);
      if(mod.type==='CHF'){ pushSeg(p2, mv.rapid, mv.srcLine, mv.rc); }
      else {
        var cross=u_in.x*u_out.y-u_in.y*u_out.x;
        var sign=cross>=0?1:-1;
        var perp={x:-u_in.y*sign, y:u_in.x*sign};
        var cx3=p1.x+perp.x*r, cy3=p1.y+perp.y*r;
        var a0=Math.atan2(p1.y-cy3,p1.x-cx3);
        var a1t=Math.atan2(p2.y-cy3,p2.x-cx3);
        var sw; if(sign>0){sw=a1t-a0;while(sw<=-1e-4)sw+=2*Math.PI;}else{sw=a1t-a0;while(sw>=1e-4)sw-=2*Math.PI;}
        var N=Math.max(8,Math.ceil(Math.abs(sw)/(Math.PI/36)));
        for(var ki=1;ki<=N;ki++){var a=a0+sw*(ki/N);pushSeg({x:cx3+r*Math.cos(a),y:cy3+r*Math.sin(a),z:corner.z},mv.rapid,mv.srcLine,mv.rc);}
      }
      // CRITICAL: the outgoing block must start at the fillet/chamfer END (p2),
      // not at the original corner — otherwise an extra spike gets cut through
      // the corner AND the polyline gets a gap that corrupts radius comp runs.
      nextMv.from = {x:p2.x, y:p2.y, z:p2.z};
    }
    pendingMoves=[];
  }

  for(var i=0;i<expandedProg.length;i++){
    var raw = expandedProg[i].text.trim();
    var srcLineI = expandedProg[i].srcLine;
    var line = raw.toUpperCase().replace(/;.*$/,'')
      .replace(/^[ \t]*\d+[ \t]+(?=[A-Z;*])/,'') // tolerate PASTED machine code with block numbers ("12 TOOL CALL 5") — file import strips them too
      .replace(/(\d),(?=\d)/g,'$1.') // Heidenhain decimal comma -> dot (Q1+0,5774, X+10,5); MUST happen before any regex/eval below
      .trim();
    if(!line || line.charAt(0)===';') continue;

    // Strip FN 0–4 prefix BEFORE Q resolution so the assignment LHS (Q1 = …) is protected.
    // FN 0: assign, FN 1: add, FN 2: subtract, FN 3: multiply, FN 4: divide —
    // Heidenhain writes the operator in the expression itself, so stripping the prefix suffices.
    if(/^FN\s*[0-4]\s*:/i.test(line)) line = line.replace(/^FN\s*[0-4]\s*:/i,'').trim();

    // Resolve Q parameters in line before parsing
    if(Object.keys(qVars).length > 0) line = resolveQLine(line, qVars);

    // Track whether THIS line is still part of the CURRENT CYCL DEF's own
    // Q-parameter continuation block (matches the same rule used by
    // computeBlockNumbers for the editor's gutter numbering): a Q-param
    // line counts as "in the block" only while it directly follows the
    // CYCL DEF line or another such Q-param line. _wasInCycleParamBlock is
    // the state BEFORE this line — that's what decides where THIS line's
    // own Q-assignment goes; inCycleParamBlock is then updated for the
    // NEXT line.
    var _wasInCycleParamBlock = inCycleParamBlock;
    var _isQParamLine = /^Q\d+\s*(?:=|\s+(?:FAUTO|FMAX))/i.test(line);
    if(/^CYCL\s+DEF\s+(200|201|208|209)\b/.test(line)) inCycleParamBlock = true;
    else if(!(inCycleParamBlock && _isQParamLine)) inCycleParamBlock = false;

    var fm = line.match(/\bF\+?(\d+\.?\d*)/);
    if(fm) feed = parseFloat(fm[1]);

    if(line.indexOf('BLK FORM')===0){ continue; }

    // Q parameter assignment: Q1 = +50 / Q2 = Q1 + 10 / Q3 = SIN(Q1) etc.
    // (undefined-Q and reserved-range warnings are emitted by the validator, not here)
    var _qAssign = line.match(/^\s*(Q\d+)\s*=\s*(.+)/);
    if(_qAssign){
      var _qNum = parseInt(_qAssign[1].slice(1));
      var _qExpr = _qAssign[2].trim().replace(/;.*$/,'').trim();
      if(activeCycle && _wasInCycleParamBlock){
        // Inside cycle def — update cycle parameter (evalQExpr supports expressions like Q10+5)
        var _qVal = /FAUTO/i.test(_qExpr)?'FAUTO':(/FMAX/i.test(_qExpr)?9999:evalQExpr(_qExpr, qVars));
        activeCycle['Q'+_qNum] = _qVal;
        // Basic sanity: Q200 must be >0, Q201 must be <=0
        if(_qNum===200 && typeof _qVal==='number' && _qVal<=0) console.warn('Q200 safety clearance should be positive, got '+_qVal);
        if(_qNum===201 && typeof _qVal==='number' && _qVal>0){ activeCycle['Q201']=-_qVal; } // auto-negate
      } else {
        qVars[_qNum] = evalQExpr(_qExpr, qVars);
      }
      continue;
    }
    else if(/^\s*Q\d+/.test(line)){
      if(activeCycle && _wasInCycleParamBlock){
        var qpm=line.match(/Q(\d+)\s*=?\s*([+-]?[\d.]+|FAUTO|FMAX)/i);
        if(qpm) activeCycle['Q'+qpm[1]]=(/FAUTO/i.test(qpm[2])?'FAUTO':(/FMAX/i.test(qpm[2])?9999:pFloat(qpm[2])));
      }
    }
    else if(line.indexOf('CYCL DEF 200')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      activeCycle={type:200, Q200:+(qm[200]!==undefined?qm[200]:2), Q201:+(qm[201]!==undefined?qm[201]:-20), Q206:+(qm[206]!==undefined?qm[206]:150), Q202:+(qm[202]!==undefined?qm[202]:0), Q210:+(qm[210]!==undefined?qm[210]:0), Q203:+(qm[203]!==undefined?qm[203]:0), Q204:+(qm[204]!==undefined?qm[204]:50), Q211:+(qm[211]!==undefined?qm[211]:0)};
    }
    else if(line.indexOf('CYCL DEF 201')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      activeCycle={type:201, Q200:+(qm[200]||2), Q201:+(qm[201]||-10), Q206:+(qm[206]||80), Q211:+(qm[211]||0), Q208:+(qm[208]||0), Q203:+(qm[203]||0), Q204:+(qm[204]||50)};
    }
    else if(line.indexOf('CYCL DEF 209')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      activeCycle={type:209, Q200:+(qm[200]||2), Q201:+(qm[201]||-10), Q239:+(qm[239]||1.25), Q203:+(qm[203]||0), Q204:+(qm[204]||50), Q257:+(qm[257]||5), Q256:+(qm[256]||0.2), Q336:+(qm[336]||0)};
    }
    else if(line.indexOf('CYCL DEF 208')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      // parse Q params
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      activeCycle={type:208, Q200:+(qm[200]||2), Q201:+(qm[201]||-10), Q206:+(qm[206]||150), Q203:+(qm[203]||0), Q204:+(qm[204]||50), Q334:+(qm[334]||0), Q335:+(qm[335]||10), Q342:+(qm[342]||0), Q351:+(qm[351]||1)};
    }
    else if(/^CYCL\s+DEF\s+\d+/.test(line)){
      // Unsupported cycle number (e.g. 7 datum shift, 203, 220 patterns...):
      // real behavior would differ — do NOT keep the previous cycle armed,
      // otherwise a later M99/CYCL CALL would silently run the WRONG cycle.
      flushPending();
      activeCycle = null;
      var _unsup = line.match(/^CYCL\s+DEF\s+(\d+)/);
      if(typeof probs !== 'undefined') probs.push({line:srcLineI, sev:'warn', msg:'CYCL DEF '+_unsup[1]+' is not supported by the simulator — cycle ignored (supported: 200, 201, 208, 209)'});
      console.warn('CYCL DEF '+_unsup[1]+' not supported — ignored');
    }
    else if(line.indexOf('CYCL CALL')===0){
      // standalone CYCL CALL — flush L moves first so pos is at correct XY
      flushPending();
      if(activeCycle) executeCycle(activeCycle, srcLineI, rcState);
    }
    // M99 on L line is handled inside flushPending after the move
    else if(line.indexOf('TOOL DEF')===0){
      // TOOL DEF — store tool number in ALL subsequent segments until next TOOL CALL
      var tdm=line.match(/TOOL DEF\s+(\d+)/);
      if(tdm) pendingDefTool = parseInt(tdm[1]);
    }
    else if(line.indexOf('TOOL CALL')===0){
      flushPending(); pendingDefTool=0;
      spindleOn=false; coolantOn=false;
      var tn=line.match(/TOOL CALL (\d+)/); if(tn) toolNum=parseInt(tn[1]);
      // Add to GOTO list with current sub[] index
      toolCallList.push({toolNum:toolNum, lineNum:srcLineI, subIdx:sub.length});
      var tf=line.match(/\bF(\d+)/); if(tf){ feed=parseFloat(tf[1]); lastDefinedFeed=feed; }
      var ts=line.match(/\bS(\d+)/); if(ts) spindleS=parseInt(ts[1]);
      // DL/DR overrides from TOOL CALL line (override tool table values)
      // Accept both '.' and ',' as decimal separator (e.g. DL0.2 or DL0,2)
      var tdl=line.match(/\bDL([+-]?\d+[.,]?\d*)/);
      var tdr=line.match(/\bDR([+-]?\d+[.,]?\d*)/);
      // Heidenhain: TOOL CALL deltas are ADDED to the tool-table deltas, they do
      // NOT replace them. Table deltas describe the real (physical) tool; TOOL
      // CALL deltas are programmed allowances — the control adjusts the PATH
      // (and length compensation), the physical tool stays the same.
      curDLpgm = tdl ? parseFloat(tdl[1].replace(',', '.')) : 0;
      curDRpgm = tdr ? parseFloat(tdr[1].replace(',', '.')) : 0;
      // TOOL CALL cancels an active radius compensation — the new contour must
      // re-arm RL/RR itself.
      rcState = '';
      var tObj=getToolByNum(toolNum);
      if(tObj){
        // kept only for UI/status display of the last programmed deltas —
        // the cutting/compensation logic reads per-segment dlPgm/drPgm instead
        if(tdl) tObj._dlOverride=curDLpgm; else delete tObj._dlOverride;
        if(tdr) tObj._drOverride=curDRpgm; else delete tObj._drOverride;
        var _tObjType = inferToolType(tObj);
        var _drTabR = (_tObjType==='MILL') ? (tObj.DR||0) : 0;
        // TOOL_R = effective compensation radius: R(table) + DR(table) + DR(TOOL CALL)
        TOOL_R = tObj.R + _drTabR + curDRpgm;
      }
    }
    else if(/^M13\b/.test(line)||/^M14\b/.test(line)){ flushPending(); spindleOn=true; coolantOn=true; sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,rc:'',spindleOn:true,coolantOn:true,toolNum:toolNum,isMseg:true}); blockIndex++; }
        else if(/^M3\b/.test(line)||/^M4\b/.test(line)){ flushPending(); spindleOn=true;  sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,rc:'',spindleOn:true,coolantOn:coolantOn,toolNum:toolNum,isMseg:true}); blockIndex++; }
    else if(/^M5\b/.test(line)){ flushPending(); spindleOn=false; sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,rc:'',spindleOn:false,coolantOn:coolantOn,toolNum:toolNum,isMseg:true}); blockIndex++; }
    else if(/^M7\b/.test(line)||/^M8\b/.test(line)||/^M13\b/.test(line)||/^M14\b/.test(line)){ flushPending(); coolantOn=true;  sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,rc:'',spindleOn:spindleOn,coolantOn:true,toolNum:toolNum,isMseg:true}); blockIndex++; }
    else if(/^M9\b/.test(line)){ flushPending(); coolantOn=false; sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,rc:'',spindleOn:spindleOn,coolantOn:false,toolNum:toolNum,isMseg:true}); blockIndex++; }
    else if(/^M0\b/.test(line)||/^M2\b/.test(line)||/^M30\b/.test(line)){
      flushPending();
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:pos.x,y:pos.y,z:pos.z}, rapid:true, feed:DEFAULT_FEED, len:0.001, blockIndex:blockIndex, srcLine:srcLineI, rc:'', stop:true});
      blockIndex++;
      if(/^M30\b/.test(line)) break; // end of program
    }
    else if(line.indexOf('CC')===0){
      var cx=line.match(/X([+-]?\d+\.?\d*)/), cy=line.match(/Y([+-]?\d+\.?\d*)/);
      if(cx) ccx=parseFloat(cx[1]); if(cy) ccy=parseFloat(cy[1]);
    }
    else if(/^C(\s|$)/.test(line)){
      flushPending();
      blockIndex++;
      var ex=line.match(/X([+-]?\d+\.?\d*)/), ey=line.match(/Y([+-]?\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      var dr = line.indexOf('DR-')>=0 ? -1 : 1;
      if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      if(ccx!==null && ccy!==null){
        var R = Math.sqrt((pos.x-ccx)*(pos.x-ccx)+(pos.y-ccy)*(pos.y-ccy));
        // NOTE: radius compensation applied later by applyRadiusComp (polyline offset)
        R = Math.max(R, 0.1);
        var a0 = Math.atan2(pos.y-ccy, pos.x-ccx);
        var a1 = Math.atan2(endY-ccy, endX-ccx);
        var sweep;
        if(dr>0){ sweep = a1-a0; while(sweep<=1e-4) sweep += 2*Math.PI; }
        else { sweep = a1-a0; while(sweep>=-1e-4) sweep -= 2*Math.PI; }
        var N = Math.max(8, Math.ceil(Math.abs(sweep)/(Math.PI/32)));
        for(var k=1;k<=N;k++){
          var a = a0 + sweep*(k/N);
          pushSeg({x:ccx+R*Math.cos(a), y:ccy+R*Math.sin(a), z:pos.z}, false, i, rcState);
        }
        // If the programmed end point does not lie exactly on the circle around
        // CC (radius taken from the START point), land on the programmed end
        // anyway — otherwise pos drifts and subsequent incremental moves shift.
        if(Math.abs(pos.x-endX)>1e-6||Math.abs(pos.y-endY)>1e-6) pushSeg({x:endX,y:endY,z:pos.z},false,i,rcState);
      }
    }
    else if(line.indexOf('LP')===0){
      // LP PR+30 PA+45 F500 — linear polar move
      blockIndex++;
      var pr=line.match(/PR([+-]?\d+\.?\d*)/), pa=line.match(/PA([+-]?\d+\.?\d*)/);
      var fm=line.match(/\bF\+?(\d+\.?\d*)/); if(fm) feed=parseFloat(fm[1]);
      if(pr && pa && ccx!==null && ccy!==null){
        var rad=parseFloat(pr[1]), ang=parseFloat(pa[1])*Math.PI/180;
        var tx=ccx+rad*Math.cos(ang), ty=ccy+rad*Math.sin(ang);
        if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
        var _m99LP=/\bM99\b/.test(line), _m89LP=/\bM89\b/.test(line);
        if(_m89LP) modalCycleCall=true;
        var hasM99lp=_m99LP||_m89LP||modalCycleCall;
        if(_m99LP) modalCycleCall=false;
        if(!isNaN(feed)&&feed<9000) lastDefinedFeed=feed;
        pendingMoves.push({from:{x:pos.x,y:pos.y,z:pos.z}, target:{x:tx,y:ty,z:pos.z}, rapid:line.indexOf('FMAX')>=0, srcLine:srcLineI, rc:rcState, feed:feed, spindleOn:spindleOn, spindleS:spindleS, coolantOn:coolantOn, blockIdx:blockIndex, modifier:null, m99:hasM99lp});
        pos={x:tx,y:ty,z:pos.z};
      }
    }
    else if(line.indexOf('CP')===0){
      // CP PA+180 DR+ F500 — circular polar arc
      flushPending();
      blockIndex++;
      var pa2=line.match(/PA([+-]?\d+\.?\d*)/);
      var fm2=line.match(/\bF\+?(\d+\.?\d*)/); if(fm2) feed=parseFloat(fm2[1]);
      var dr2=line.indexOf('DR-')>=0 ? -1 : 1;
      if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      if(pa2 && ccx!==null && ccy!==null){
        var a0cp=Math.atan2(pos.y-ccy, pos.x-ccx);
        var a1cp=parseFloat(pa2[1])*Math.PI/180;
        var Rcp=Math.sqrt((pos.x-ccx)*(pos.x-ccx)+(pos.y-ccy)*(pos.y-ccy));
        // apply RL/RR compensation to CP arc radius
        Rcp = Math.max(Rcp, 0.1); // RC applied later by applyRadiusComp
        var sw; if(dr2>0){sw=a1cp-a0cp;while(sw<=1e-4)sw+=2*Math.PI;}else{sw=a1cp-a0cp;while(sw>=-1e-4)sw-=2*Math.PI;}
        var N=Math.max(8,Math.ceil(Math.abs(sw)/(Math.PI/32)));
        for(var k=1;k<=N;k++){var a=a0cp+sw*(k/N);pushSeg({x:ccx+Rcp*Math.cos(a),y:ccy+Rcp*Math.sin(a),z:pos.z},false,i,rcState);}
      }
    }
    else if(/^CR(\s|$)/.test(line)){
      // CR — arc defined by radius and direction
      flushPending();
      blockIndex++;
      var ex=line.match(/X([+-]?\d+\.?\d*)/), ey=line.match(/Y([+-]?\d+\.?\d*)/);
      // Heidenhain CR: the SIGN of R selects the arc — R+ = arc <= 180deg,
      // R- = arc > 180deg; DR+/- selects the rotation direction.
      var rm=line.match(/(?:^|\s)R([+\-]?)(\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      var dr = line.indexOf('DR-')>=0 ? -1 : 1;
      if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      if(line.indexOf('FMAX')>=0){ feed=9999; } else { var fm=line.match(/\bF(\d+\.?\d*)/); if(fm) feed=parseFloat(fm[1]); }
      if(rm){
        var R = parseFloat(rm[2]);
        var signR = (rm[1]==='-') ? -1 : 1; // R- selects the major (>180deg) arc
        var dx = endX-pos.x, dy = endY-pos.y;
        var d2 = dx*dx+dy*dy;
        if(d2 > 0 && R*R >= d2/4){
          var d = Math.sqrt(d2);
          var h = Math.sqrt(R*R - d2/4);
          // Two circle centers exist (mid +- perpendicular*h). For the given
          // rotation DR, one yields the minor arc, the other the major arc:
          //   center = mid + perp*h*dr        -> arc <= 180deg  (R+)
          //   center = mid - perp*h*dr        -> arc  > 180deg  (R-)
          var px = -dy/d*h*dr*signR, py = dx/d*h*dr*signR;
          var cx2 = (pos.x+endX)/2 + px;
          var cy2 = (pos.y+endY)/2 + py;
          var a0 = Math.atan2(pos.y-cy2, pos.x-cx2);
          var a1 = Math.atan2(endY-cy2, endX-cx2);
          var sweep;
          if(dr>0){ sweep=a1-a0; while(sweep<=1e-4) sweep+=2*Math.PI; }
          else { sweep=a1-a0; while(sweep>=-1e-4) sweep-=2*Math.PI; }
          var N=Math.max(8,Math.ceil(Math.abs(sweep)/(Math.PI/32)));
          for(var k=1;k<=N;k++){
            var a=a0+sweep*(k/N);
            pushSeg({x:cx2+R*Math.cos(a),y:cy2+R*Math.sin(a),z:pos.z},false,i,rcState);
          }
          // guard against float drift: land exactly on the programmed end point
          if(Math.abs(pos.x-endX)>1e-9||Math.abs(pos.y-endY)>1e-9) pushSeg({x:endX,y:endY,z:pos.z},false,i,rcState);
        }
      }
    }
    else if(/^CT(\s|$)/.test(line)){
      // CT — tangential arc (tangent to previous move)
      flushPending();
      blockIndex++;
      var ex=line.match(/X([+-]?\d+\.?\d*)/), ey=line.match(/Y([+-]?\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      if(line.indexOf('FMAX')>=0){ feed=9999; } else { var fmct=line.match(/\bF(\d+\.?\d*)/); if(fmct) feed=parseFloat(fmct[1]); }
      if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      // compute tangent from the last segment that actually moved in XY —
      // a preceding Z-only plunge or retract must not reset the tangent
      var tanX=0, tanY=1;
      for(var lsi=sub.length-1; lsi>=0; lsi--){
        var ls=sub[lsi];
        var ldx=ls.to.x-ls.from.x, ldy=ls.to.y-ls.from.y;
        var ll=Math.sqrt(ldx*ldx+ldy*ldy);
        if(ll>1e-6){ tanX=ldx/ll; tanY=ldy/ll; break; }
      }
      var dx=endX-pos.x, dy=endY-pos.y;
      // center perpendicular to tangent, passing through pos
      // solve: center = pos + t*(-tanY, tanX), arc through endX,endY
      var denom = -tanY*dx + tanX*dy;
      if(Math.abs(denom)>1e-6){
        var t2=(dx*dx+dy*dy)/(2*denom);
        var cx2=pos.x-tanY*t2, cy2=pos.y+tanX*t2;
        var R=Math.sqrt((pos.x-cx2)*(pos.x-cx2)+(pos.y-cy2)*(pos.y-cy2));
        var a0=Math.atan2(pos.y-cy2,pos.x-cx2);
        var a1=Math.atan2(endY-cy2,endX-cx2);
        var dr2=denom>0?1:-1;
        var sweep;
        if(dr2>0){ sweep=a1-a0; while(sweep<=1e-4) sweep+=2*Math.PI; }
        else { sweep=a1-a0; while(sweep>=-1e-4) sweep-=2*Math.PI; }
        var N=Math.max(8,Math.ceil(Math.abs(sweep)/(Math.PI/32)));
        for(var k=1;k<=N;k++){
          var a=a0+sweep*(k/N);
          pushSeg({x:cx2+R*Math.cos(a),y:cy2+R*Math.sin(a),z:pos.z},false,i,rcState);
        }
      } else {
        pushSeg({x:endX,y:endY,z:pos.z},false,i,rcState);
      }
    }
    else if(line.indexOf('L ')===0 || line==='L'){
      blockIndex++;
      if(/\bRL\b/.test(line)) rcState='RL'; else if(/\bRR\b/.test(line)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(line)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      var lx=line.match(/IX([+-]?\d+\.?\d*)/), ly=line.match(/IY([+-]?\d+\.?\d*)/), lz=line.match(/IZ([+-]?\d+\.?\d*)/);
      // NOTE: no lookbehind here — (?<!...) is a SyntaxError on iOS Safari <16.4
      // and kills the WHOLE script at load. (?:^|[^I]) is equivalent for our lines.
      var lxa=line.match(/(?:^|[^I])X([+-]?\d+\.?\d*)/), lya=line.match(/(?:^|[^I])Y([+-]?\d+\.?\d*)/), lza=line.match(/(?:^|[^I])Z([+-]?\d+\.?\d*)/);
      var target = {
        x: lx ? pos.x+parseFloat(lx[1]) : (lxa ? parseFloat(lxa[1]) : pos.x),
        y: ly ? pos.y+parseFloat(ly[1]) : (lya ? parseFloat(lya[1]) : pos.y),
        z: lz ? pos.z+parseFloat(lz[1]) : (lza ? parseFloat(lza[1]) : pos.z)
      };
      var _m99L=/\bM99\b/.test(line), _m89L=/\bM89\b/.test(line);
      if(_m89L) modalCycleCall=true;                 // arm modal call (applies from this block on)
      var hasM99=_m99L||_m89L||modalCycleCall;       // call cycle after this positioning block?
      if(_m99L) modalCycleCall=false;                // M99 calls once more and cancels modality
      var isFmax = line.indexOf('FMAX')>=0;
      // FMAX is non-persistent: only applies to this block, feed reverts after
      if(isFmax){ var _prevFeed=feed; feed=9999; }
      if(!isNaN(feed) && feed<9000) lastDefinedFeed=feed;
      pendingMoves.push({from:{x:pos.x,y:pos.y,z:pos.z}, target:{x:target.x,y:target.y,z:target.z}, rapid:isFmax, srcLine:srcLineI, rc:rcState, feed:feed, spindleOn:spindleOn, spindleS:spindleS, coolantOn:coolantOn, blockIdx:blockIndex, modifier:null, m99:hasM99});
      if(isFmax) feed=_prevFeed; // restore feed after FMAX block
      pos = {x:target.x,y:target.y,z:target.z}; // track pos for incremental coords
    }
    else if(line.indexOf('RND')===0){
      var rm=line.match(/R(\d+\.?\d*)/);
      if(rm && pendingMoves.length>0) pendingMoves[pendingMoves.length-1].modifier={type:'RND',r:parseFloat(rm[1])};
    }
    else if(line.indexOf('CHF')===0){
      var cm=line.match(/(\d+\.?\d*)/);
      if(cm && pendingMoves.length>0) pendingMoves[pendingMoves.length-1].modifier={type:'CHF',r:parseFloat(cm[1])};
    }
  }

  // flush remaining pendingMoves
  flushPending();

  // ============================================================
  // Radius compensation: proper polyline offset (Heidenhain CRC)
  // ============================================================
  // Process each contiguous run of RC-active segments. Within a run,
  // offset the polyline perpendicular by TOOL_R (left=RL, right=RR),
  // mitre at corners, and insert rounding arcs at convex outer corners.
  applyRadiusComp(sub);

  return {blkMin:blkMin, blkMax:blkMax, blkCyl:blkCyl, sub:sub, totalBlocks:blockIndex, start:{x:blkMin.x,y:blkMax.y,z:blkMax.z+50}};
}

function applyRadiusComp(sub){
  offsetRun._gouged = {}; // reset gouge-warning dedupe for this parse
  var i=0;
  while(i<sub.length){
    // Skip non-RC segments
    if(!sub[i].rc || sub[i].rc==='' || sub[i].rc==='R0'){ i++; continue; }
    // Find the end of this RC run (same compensation side)
    var side = sub[i].rc; // 'RL' or 'RR'
    var j=i;
    while(j<sub.length && sub[j].rc===side) j++;
    // Run is sub[i..j-1]
    var prevSeg = (i>0) ? sub[i-1] : null;
    var nextSeg = (j<sub.length) ? sub[j] : null;
    var newLen = offsetRun(sub, i, j-1, side, prevSeg, nextSeg);
    // offsetRun returns the new number of segments in the run
    i = i + (newLen||0);
  }
}

function offsetRun(sub, a, b, side, prevSeg, nextSeg){
  // Build vertex list from the run: V0=seg[a].from, V1=seg[a].to=seg[a+1].from, ...
  // Offset = the tool's reference-point radius R + DR (per-run tool, not global).
  // This positions the tool CENTER; the physical tool shape (cone/ball/flat) in
  // vxCut then removes exactly what it intersects from THAT position — matching
  // real-world cutting. For DRILL/COUNTERSINK, vxCut's cone shape uses R alone
  // (never +DR) — DR's entire effect is this path offset, never double-applied
  // to the cone's own radius.
  // Cone/countersink tools are set up with R≈0.001 (tip reference) in the tool
  // table, so DR alone carries the compensation amount — same convention TOOL CALL
  // uses for CYCL DEF 200/208 (see _cycleR there). DL is then chosen by the
  // operator (DL = -DR/tan(T-ANGLE/2)) so the cone's own sharp edge lands exactly
  // on that offset path.
  var _runTool = getToolByNum(sub[a].toolNum);
  var TR;
  if(_runTool){
    // Effective compensation radius, exactly like the real control:
    //   R (table) + DR (table = physical oversize) + DR (TOOL CALL = programmed
    //   allowance, captured per-segment at parse time as drPgm).
    // Per-segment capture means rough/finish passes that re-call the SAME tool
    // with different DR each keep their own offset. The physical cut (vxCut)
    // uses R + table-DR only, so a positive programmed DR leaves real stock.
    var _drTab = (_runTool.DR||0);
    var _drPgm = (sub[a].drPgm||0);
    TR = Math.max(0.05, _runTool.R + _drTab + _drPgm);
  } else {
    TR = TOOL_R;
  }
  var sgn = (side==='RR') ? -1 : 1; // RL: left normal (+), RR: right normal (-)
  var verts=[]; 
  verts.push({x:sub[a].from.x, y:sub[a].from.y, z:sub[a].from.z});
  for(var k=a;k<=b;k++) verts.push({x:sub[k].to.x, y:sub[k].to.y, z:sub[k].to.z});
  var nv=verts.length;
  if(nv<2) return (b-a+1); // nothing to offset — skip the run unchanged, don't stall the caller

  // Compute unit direction & left-normal of each edge between verts
  var edges=[];
  for(var e=0;e<nv-1;e++){
    var dx=verts[e+1].x-verts[e].x, dy=verts[e+1].y-verts[e].y;
    var L=Math.sqrt(dx*dx+dy*dy);
    if(L<1e-9){ edges.push(null); continue; }
    var ux=dx/L, uy=dy/L;
    edges.push({ux:ux, uy:uy, nx:-uy*sgn, ny:ux*sgn, L:L});
  }

  // Offset each vertex; build new point list (may insert corner arcs)
  var out=[]; // {x,y,z}
  var outSeg=[]; // parallel array: which ORIGINAL sub[] index each out[] point's metadata (rapid/feed/...) should come from
  // find first/last valid edge
  var firstE=-1, lastE=-1;
  for(var e2=0;e2<edges.length;e2++){ if(edges[e2]){ if(firstE<0) firstE=e2; lastE=e2; } }
  if(firstE<0) return (b-a+1); // degenerate run (e.g. pure Z plunge under RL/RR, no XY motion) — skip, don't stall

  for(var v=0; v<nv; v++){
    // incoming edge = edges[v-1], outgoing edge = edges[v]
    var ein=null, eout=null;
    for(var pe=v-1; pe>=0; pe--){ if(edges[pe]){ ein=edges[pe]; break; } }
    for(var ne=v;   ne<edges.length; ne++){ if(edges[ne]){ eout=edges[ne]; break; } }
    // Which original sub[] segment "owns" this vertex's metadata (rapid, feed, ...):
    // prefer the outgoing edge (the move heading away from this point), else the
    // incoming edge (end vertex). This is what fixes material not being removed
    // when the move that *activates* RL/RR is a rapid (FMAX) plunge — only that
    // one segment should stay rapid; the cutting moves later in the same run must
    // keep their own feed/rapid metadata, not inherit the plunge's.
    var _segTag = eout ? (a+ne) : (ein ? (a+pe) : a);

    if(!ein && eout){
      // start vertex: offset by outgoing normal
      out.push({x:verts[v].x+eout.nx*TR, y:verts[v].y+eout.ny*TR, z:verts[v].z}); outSeg.push(_segTag);
    } else if(ein && !eout){
      // end vertex: offset by incoming normal
      out.push({x:verts[v].x+ein.nx*TR, y:verts[v].y+ein.ny*TR, z:verts[v].z}); outSeg.push(_segTag);
    } else if(ein && eout){
      // interior vertex: mitre between the two offset normals
      var bx=ein.nx+eout.nx, by=ein.ny+eout.ny;
      var bl=Math.sqrt(bx*bx+by*by);
      // cross product of incoming->outgoing to detect convex/concave
      var cross=ein.ux*eout.uy - ein.uy*eout.ux; // >0 left turn, <0 right turn
      var isConvex = (sgn>0) ? (cross < -1e-9) : (cross > 1e-9); // outer corner for this comp side
      if(bl<1e-6){
        // ~180° reversal: just offset by incoming normal
        out.push({x:verts[v].x+ein.nx*TR, y:verts[v].y+ein.ny*TR, z:verts[v].z}); outSeg.push(_segTag);
      } else {
        var mx=bx/bl, my=by/bl;
        var cosHalf = mx*ein.nx + my*ein.ny; // = cos(half turn angle)
        // ── Gouge detection (real TNC: "tool radius too large" error) ──────
        // At a concave corner the offset consumes TR*tan(turn/2) of path from
        // EACH adjacent edge. If that exceeds half of either edge, the tool
        // does not fit into the feature. The same per-vertex criterion also
        // catches tessellated inner ARCS / RND fillets with radius < TR
        // (each tessellation vertex consumes ~TR*dTheta/2 of a ~Rarc*dTheta
        // chord), so no separate arc check is needed.
        if(!isConvex){
          var _sinHalf = Math.sqrt(Math.max(0, 1 - cosHalf*cosHalf));
          var _consume = (cosHalf > 1e-6) ? TR * (_sinHalf/cosHalf) : TR*1e6;
          if(_consume > ein.L*0.5 + 1e-6 || _consume > eout.L*0.5 + 1e-6){
            var _gLine = sub[Math.min(a + Math.max(0, v-1), b)].srcLine;
            if(!offsetRun._gouged) offsetRun._gouged = {};
            if(!offsetRun._gouged[_gLine]){
              offsetRun._gouged[_gLine] = true;
              var _gMsg = 'Inner corner/radius is smaller than the compensation radius ('+TR.toFixed(3)+'mm) — a real TNC would abort with a "tool radius too large" error; the simulated path gouges the contour here.';
              if(typeof probs !== 'undefined') probs.push({line:_gLine, sev:'warn', msg:_gMsg});
              console.warn('Line '+(_gLine+1)+': '+_gMsg);
            }
          }
        }
        if(cosHalf > 0.9990){
          // Near-tangent junction (arc/straight tangency): use incoming normal exactly
          // Avoids bisector approximation error at RND arc entry/exit points
          out.push({x:verts[v].x+ein.nx*TR, y:verts[v].y+ein.ny*TR, z:verts[v].z}); outSeg.push(_segTag);
        } else if(isConvex && cosHalf < 0.9239){
          // Convex outer corner > 45°: insert rounding arc of radius TR centered at V
          var pA={x:verts[v].x+ein.nx*TR,  y:verts[v].y+ein.ny*TR};
          var pB={x:verts[v].x+eout.nx*TR, y:verts[v].y+eout.ny*TR};
          var aA=Math.atan2(pA.y-verts[v].y, pA.x-verts[v].x);
          var aB=Math.atan2(pB.y-verts[v].y, pB.x-verts[v].x);
          var sweep=aB-aA;
          if(sgn>0){ while(sweep>0) sweep-=2*Math.PI; while(sweep<=-2*Math.PI) sweep+=2*Math.PI; }
          else     { while(sweep<0) sweep+=2*Math.PI; while(sweep>=2*Math.PI) sweep-=2*Math.PI; }
          var steps=Math.max(4, Math.ceil(Math.abs(sweep)/(Math.PI/18)));
          for(var s=0;s<=steps;s++){
            var aa=aA+sweep*(s/steps);
            out.push({x:verts[v].x+TR*Math.cos(aa), y:verts[v].y+TR*Math.sin(aa), z:verts[v].z}); outSeg.push(_segTag);
          }
        } else {
          // Concave or shallow corner: mitre — cap at TR*3 to avoid huge spikes at tight angles
          var off=Math.min(TR/Math.max(0.25,cosHalf), TR*3);
          out.push({x:verts[v].x+mx*off, y:verts[v].y+my*off, z:verts[v].z}); outSeg.push(_segTag);
        }
      }
    } else {
      out.push({x:verts[v].x, y:verts[v].y, z:verts[v].z}); outSeg.push(_segTag);
    }
  }

  // Rewrite the run's segments to follow the offset point list.
  // We have (b-a+1) original segments and 'out' has >= nv points.
  // Rebuild: replace segment endpoints, distributing extra arc points.
  // Connect boundaries: prev segment's 'to' → first offset point; 
  // next segment's 'from' → last offset point (avoids jump/gouge at R0 transition)
  if(prevSeg && out.length>0){ prevSeg.to = {x:out[0].x, y:out[0].y, z:out[0].z}; var pdx=prevSeg.to.x-prevSeg.from.x,pdy=prevSeg.to.y-prevSeg.from.y,pdz=prevSeg.to.z-prevSeg.from.z; prevSeg.len=Math.sqrt(pdx*pdx+pdy*pdy+pdz*pdz); }
  if(nextSeg && out.length>0){ var lp=out[out.length-1]; nextSeg.from = {x:lp.x, y:lp.y, z:lp.z}; var ndx=nextSeg.to.x-nextSeg.from.x,ndy=nextSeg.to.y-nextSeg.from.y,ndz=nextSeg.to.z-nextSeg.from.z; nextSeg.len=Math.sqrt(ndx*ndx+ndy*ndy+ndz*ndz); }
  return rebuildRunSegments(sub, a, b, out, outSeg);
}

function rebuildRunSegments(sub, a, b, out, outSeg){
  // Replace sub[a..b] with new segments connecting consecutive 'out' points,
  // preserving per-segment metadata (feed, rapid, rc, toolNum...). Each new
  // segment pulls its metadata from the ORIGINAL sub[] segment it actually
  // came from (outSeg[p]), not blindly from sub[a] — otherwise a rapid
  // (FMAX) move that merely *activates* RL/RR would make every later
  // cutting move in the same run inherit rapid=true and silently stop
  // removing material.
  var newSegs=[];
  for(var p=0;p<out.length-1;p++){
    var f=out[p], t=out[p+1];
    var dx=t.x-f.x, dy=t.y-f.y, dz=t.z-f.z;
    var len=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(len<1e-9) continue;
    var meta = sub[outSeg[p]] || sub[a];
    newSegs.push({
      from:{x:f.x,y:f.y,z:f.z}, to:{x:t.x,y:t.y,z:t.z},
      rapid:meta.rapid, feed:meta.feed, spindleS:meta.spindleS, spindleOn:meta.spindleOn,
      coolantOn:meta.coolantOn, len:len, blockIndex:meta.blockIndex, srcLine:meta.srcLine,
      rc:meta.rc, toolNum:meta.toolNum, pendingDef:meta.pendingDef,
      dlPgm:meta.dlPgm||0, drPgm:meta.drPgm||0
    });
  }
  // Splice newSegs into sub in place of [a..b]
  var args=[a, (b-a+1)].concat(newSegs);
  Array.prototype.splice.apply(sub, args);
  return newSegs.length;
}

function triggerRefine(){
  if(!VX || !prog) return;
  var btn = document.getElementById('refineBtnCanvas');
  if(btn){ btn.disabled=true; btn.textContent='\u29d7 Refining\u2026'; }
  _showRefineIndicator('Refining mesh\u2026');
  updateStatus('\u2699\ufe0f Initialising refine\u2026', false);

  var HI_LEVELS = [300, 500];
  var HI = HI_LEVELS[VX_QUALITY];
  var min = prog.blkMin, max = prog.blkMax;
  var w = max.x-min.x, d = max.y-min.y, h = max.z-min.z;
  // Isotropic cells, capped so large blanks keep detail (same logic as vxInit).
  var hiCell = Math.max(w, d, h) / (HI - 1);
  var HI_CELL_CAP = [0.5, 0.3][VX_QUALITY!==undefined?VX_QUALITY:0] || 0.5; // finer than live sim
  if(hiCell > HI_CELL_CAP) hiCell = HI_CELL_CAP;
  var nx = Math.max(4, Math.round(w/hiCell)+1);
  var ny = Math.max(4, Math.round(d/hiCell)+1);
  var nz = Math.max(4, Math.round(h/hiCell)+1);
  // Memory guard — refine runs in a worker but still allocates two grids; cap total.
  var HI_VOXEL_BUDGET = 64000000; // worker thread, larger budget than live sim
  if(nx*ny*nz > HI_VOXEL_BUDGET){
    var hiScale = Math.cbrt((nx*ny*nz) / HI_VOXEL_BUDGET);
    hiCell = hiCell * hiScale;
    nx = Math.max(4, Math.round(w/hiCell)+1);
    ny = Math.max(4, Math.round(d/hiCell)+1);
    nz = Math.max(4, Math.round(h/hiCell)+1);
  }
  var dx = w/(nx-1), dy = d/(ny-1), dz = h/(nz-1);

  // Build tools map
  var toolsMap = {};
  // Table values only — physical tool. Programmed TOOL CALL deltas travel
  // per-segment (dlPgm) in subArr; DR(pgm) is already baked into the offset path.
  toolLibrary.forEach(function(t){ if(t&&t.T) toolsMap[t.T]={TYPE:(t.TYPE||inferToolType(t)),R:t.R||5,R2:t.R2||0,T_ANGLE:t.T_ANGLE||0,LCUTS:t.LCUTS||99999,DR:(t.DR||0),DR2:(t.DR2||0)}; });

  // Serialize sub[] — only what worker needs
  var executedCount = (mode==='idle'||mode==='done') ? (subIndex>0?subIndex:sub.length) : subIndex;
  if(mode==='done') executedCount=sub.length;
  var subArr = prog.sub.slice(0,executedCount).map(function(sm){
    return {from:{x:sm.from.x,y:sm.from.y,z:sm.from.z},to:{x:sm.to.x,y:sm.to.y,z:sm.to.z},rapid:!!sm.rapid,toolNum:sm.toolNum||1,len:sm.len||0,dlPgm:sm.dlPgm||0};
  });

  // Copy VX.cut — do NOT transfer (keep original intact for voxel mesh)
  var vxCutCopy = new Uint8Array(VX.cut.buffer.slice(0));

  // Try Worker first, fall back to main-thread chunked if blocked (e.g. sandboxed iframe)
  if(_refineWorker){ _refineWorker.terminate(); _refineWorker=null; }

  var _refineData = {
    type:'refine', min:min, max:max,
    nx:nx, ny:ny, nz:nz, dx:dx, dy:dy, dz:dz,
    subArr:subArr, vxCut:vxCutCopy.buffer,
    vxNx:VX.nx, vxNy:VX.ny, vxNz:VX.nz,
    vxOx:VX.ox, vxOy:VX.oy, vxOz:VX.oz,
    vxDx:VX.dx, vxDy:VX.dy, vxDz:VX.dz,
    blkCyl:prog.blkCyl||null, tools:toolsMap
  };

  var _workerOk = false;
  try {
    var _wb = new Blob([REFINE_WORKER_CODE], {type:'application/javascript'});
    var _wu = URL.createObjectURL(_wb);
    var _w = new Worker(_wu);
    URL.revokeObjectURL(_wu);
    _w.onmessage = function(e){
      var msg = e.data;
      if(msg.type==='progress'){
        updateStatus('\u2699\ufe0f Refining\u2026 '+msg.pct+'%', false);
        _showRefineIndicator('Refining mesh\u2026 '+msg.pct+'%');
      } else if(msg.type==='done'){
        _refineWorker=null;
        _applyRefinedMesh(Array.from(new Float32Array(msg.verts)), Array.from(new Float32Array(msg.norms)), Array.from(new Int32Array(msg.colors)));
        var btn2=document.getElementById('refineBtnCanvas');
        if(btn2){ btn2.disabled=false; btn2.textContent='\u2713 Refined'; }
        _hideRefineIndicator();
        updateStatus('Precise mesh ready \u2014 '+prog.totalBlocks+' blocks', false);
      }
    };
    _w.onerror = function(err){
      // Worker blocked (sandbox) — fall back to main thread
      _refineWorker=null;
      _runRefineMainThread(_refineData);
    };
    _refineWorker = _w;
    _w.postMessage(_refineData, []);
    _workerOk = true;
  } catch(e) {
    // Blob URL blocked — run on main thread
  }
  if(!_workerOk) _runRefineMainThread(_refineData);
}

function resetState(){
  window._collisionActive=false;
  var statusEl=document.getElementById('statusMsg');
  if(statusEl){ statusEl.style.color=''; statusEl.style.fontWeight=''; }
  subIndex = 0; subProgress = 0; mode='idle';
  if(sub.length){ toolPos = {x:sub[0].from.x, y:sub[0].from.y, z:sub[0].from.z}; }
  else if(prog){ toolPos = {x:prog.start.x, y:prog.start.y, z:prog.start.z}; }
  if(THREE_OK){ bufClear(feedBuf); bufClear(rapidBuf); placeTool(); }
  updateStatus('Ready — press Run', false);
  var rbb=document.getElementById('refineBtnCanvas'); if(rbb){ rbb.style.display='none'; }
  var _tb=document.getElementById('activeToolBadge'); if(_tb){ _tb.style.display='none'; }
  clearSimInfoPanel();
  activeSrcLine=-1; highlightActiveLine(-1);
  toolLibrary.forEach(function(t){ t.CUR_TIME=0; t.TL=false; });
  if(typeof curView!=='undefined' && curView==='tools') renderToolsTab();
  // sync currentToolNum and tool mesh with program's first TOOL CALL
  if(sub && sub.length){
    var firstTool = sub[0].toolNum||1;
    if(firstTool !== currentToolNum){ currentToolNum=firstTool; var _ft=getToolByNum(firstTool); TOOL_R=_ft ? Math.max(0.1,_ft.R+((inferToolType(_ft)==='MILL')?(_ft.DR||0):0)) : 5; if(toolGroup) buildToolMesh(); }
  }
  atcAnim = null;
  if(atcArm) atcArm.visible=false;
  if(pendingToolGroup) pendingToolGroup.visible=false;
  pendingToolNum = 0;
  updatePos();
}

function updateATC(dt){
  if(!atcAnim || !toolGroup) return;
  var spd = 0.65;
  atcAnim.t = Math.min(1, atcAnim.t + dt * spd);
  var t  = atcAnim.t;
  var ig = atcAnim.inGroup;
  var cx = atcAnim.cornerX, cy = atcAnim.cornerY, cz = atcAnim.cornerZ;

  if(t < 0.45){
    // outgoing moves from work pos to corner
    var p = easeInOut(t / 0.45);
    toolGroup.position.x = atcAnim.outX + (cx - atcAnim.outX) * p;
    toolGroup.position.y = atcAnim.outY + (cy - atcAnim.outY) * p;
    toolGroup.position.z = atcAnim.outZ + (cz - atcAnim.outZ) * p;
    // incoming waits at corner
    if(ig) ig.position.set(cx, cy, cz);

  } else if(t < 0.55){
    // both at corner — swap
    toolGroup.position.set(cx, cy, cz);
    if(!atcAnim.swapped){
      atcAnim.swapped = true;
      if(ig){ scene.remove(ig); atcAnim.inGroup = null; }
      currentToolNum = atcAnim.toT;
      var nt2 = getToolByNum(atcAnim.toT); if(nt2) TOOL_R = Math.max(0.1, nt2.R + ((inferToolType(nt2)==='MILL')?(nt2.DR||0):0));
      buildToolMesh();
      toolGroup.position.set(cx, cy, cz);
    }

  } else {
    // new tool moves from corner to work pos
    var p3 = easeInOut((t - 0.55) / 0.45);
    toolGroup.position.x = cx + (atcAnim.endX - cx) * p3;
    toolGroup.position.y = cy + (atcAnim.endY - cy) * p3;
    toolGroup.position.z = cz + (atcAnim.endZ - cz) * p3;
    if(t >= 1){
      atcAnim = null;
      placeTool();
    }
  }
}

function buildToolMesh(){
  // clear existing children
  while(toolGroup.children.length) toolGroup.remove(toolGroup.children[0]);


  // use currentToolNum (set by simulation) or TOOL_R
  var activeToolNum = currentToolNum || 1;
  var t = getToolByNum(activeToolNum) || null;

  var R       = t ? t.R      : TOOL_R;
  var R2      = t ? (t.R2||0): 0;
  var L       = t ? t.L      : 50;
  var TANGLE  = t ? (t.T_ANGLE||0) : 0;
  // Tool color from TOOL_CUT_COLORS based on tool number
  var shaftColor = getToolColor3(activeToolNum);

  // Update global TOOL_R
  // Physical tool only: table deltas describe the real tool (so they resize the
  // mesh); TOOL CALL deltas offset the PATH, not the tool, so they must not.
  // DR still doesn't reshape DRILL/COUNTERSINK (path/tip-reference convention).
  var _ttypeMesh = t ? inferToolType(t) : 'MILL';
  var DR = t ? (t.DR||0) : 0;
  if(_ttypeMesh!=='MILL') DR = 0;
  var DL = t ? (t.DL||0) : 0;
  TOOL_R = Math.max(0.1, R + DR);
  var Rcomp = TOOL_R;
  var Lcomp = Math.max(1,   (L + DL) / 2); // show half length in viewport

  var shaftMat  = new THREE.MeshPhongMaterial({color:0xcfd3da, shininess:80, specular:0x666666});
  var cuttingMat= new THREE.MeshPhongMaterial({color:shaftColor, shininess:90, specular:0x888888});
  var tipMat    = new THREE.MeshPhongMaterial({color:0x888888, shininess:60, specular:0x444444});
  var seg = 32;

  // ── Shank (upper, grey) ─────────────────────────────────────
  // shank = top portion above cutting length
  var LCUTS = t ? (t.LCUTS||Lcomp*0.4) : Lcomp*0.4;
  LCUTS = Math.min(LCUTS, Lcomp);
  var shankLen = Math.max(1, Lcomp - LCUTS);

  var shankGeo = new THREE.CylinderGeometry(Rcomp*0.85, Rcomp*0.85, shankLen, seg);
  shankGeo.rotateX(Math.PI/2);
  shankGeo.translate(0, 0, LCUTS + shankLen/2);
  toolGroup.add(new THREE.Mesh(shankGeo, shaftMat));

  // ── Cutting flute area ───────────────────────────────────────
  if(R2 > 0 && R2 <= R){
    // Ball nose / bull-nose: hemisphere at bottom + cylinder body above
    var sphereR = R2; // radius of the ball at tip
    // Hemisphere (bottom half of sphere)
    var sphereGeo = new THREE.SphereGeometry(sphereR, seg, Math.ceil(seg/2), 0, Math.PI*2, Math.PI/2, Math.PI/2);
    sphereGeo.rotateX(Math.PI/2);
    sphereGeo.translate(0, 0, sphereR);
    toolGroup.add(new THREE.Mesh(sphereGeo, cuttingMat));

    // If R2 < R (bull-nose), add a transition ring
    if(R2 < Rcomp){
      var ringGeo = new THREE.CylinderGeometry(Rcomp, Rcomp, R2*0.5, seg);
      ringGeo.rotateX(Math.PI/2);
      ringGeo.translate(0, 0, sphereR + R2*0.25);
      toolGroup.add(new THREE.Mesh(ringGeo, cuttingMat));
    }

    // Cylinder body above the sphere
    var bodyLen3 = Math.max(0.5, LCUTS - sphereR);
    if(bodyLen3 > 0){
      var bodyGeo3 = new THREE.CylinderGeometry(Rcomp, Rcomp, bodyLen3, seg);
      bodyGeo3.rotateX(Math.PI/2);
      bodyGeo3.translate(0, 0, sphereR + bodyLen3/2);
      toolGroup.add(new THREE.Mesh(bodyGeo3, cuttingMat));
    }

  } else if(TANGLE > 0 && TANGLE <= 180){
    var halfAngleRad = (TANGLE/2) * Math.PI/180;
    if(_ttypeMesh==='DRILL'){
      // Drill / reamer / center drill: point widens from the tip up to the tool's
      // REAL radius R (Rcomp, no DR), then a cylindrical body up to LCUTS (flute length).
      var pointDepth = Math.min(LCUTS, Math.max(0.05, Rcomp / Math.tan(halfAngleRad)));
      var coneGeoD = new THREE.CylinderGeometry(Rcomp, 0, pointDepth, seg);
      coneGeoD.rotateX(Math.PI/2);
      coneGeoD.translate(0, 0, pointDepth/2);
      toolGroup.add(new THREE.Mesh(coneGeoD, cuttingMat));

      var bodyLen4 = LCUTS - pointDepth;
      if(bodyLen4 > 0.05){
        var bodyGeo4 = new THREE.CylinderGeometry(Rcomp, Rcomp, bodyLen4, seg);
        bodyGeo4.rotateX(Math.PI/2);
        bodyGeo4.translate(0, 0, pointDepth + bodyLen4/2);
        toolGroup.add(new THREE.Mesh(bodyGeo4, cuttingMat));
      }
    } else {
      // Countersink / chamfer: Rcomp (R+DR) is the tool's OWN tip radius — ≈0 for
      // a sharp point, or a real value for a flat/truncated tip (frustum). The cone
      // surface starts at Rcomp and widens upward; PHYSICAL max diameter is defined
      // by angle + cutting-edge height (LCUTS), independent of Rcomp.
      var coneH = LCUTS;                                  // cutting cone height = cutting edge length
      var coneMaxR = coneH * Math.tan(halfAngleRad);      // physical max radius at top of cutting edge
      coneMaxR = Math.max(coneMaxR, 0.2, Rcomp + 0.05);

      // Physical (visible) height: the flat tip is already "buried" apexOffset
      // above the imaginary sharp apex, so less height remains to reach coneMaxR.
      var apexOffset = Rcomp / Math.tan(halfAngleRad);
      var frustumH = Math.max(0.15, coneH - apexOffset);

      // Frustum — flat tip (radius Rcomp) at Z=0, full width (coneMaxR) at Z=frustumH
      var coneGeo = new THREE.CylinderGeometry(coneMaxR, Rcomp, frustumH, seg);
      coneGeo.rotateX(Math.PI/2);
      coneGeo.translate(0, 0, frustumH/2);
      toolGroup.add(new THREE.Mesh(coneGeo, cuttingMat));
    }

  } else {
    // Flat end mill — closed cylinder (caps included)
    var fluteGeo = new THREE.CylinderGeometry(Rcomp, Rcomp, LCUTS, seg, 1, false);
    fluteGeo.rotateX(Math.PI/2);
    fluteGeo.translate(0, 0, LCUTS/2);
    toolGroup.add(new THREE.Mesh(fluteGeo, cuttingMat));
  }

  // ── Tool holder collar ───────────────────────────────────────
  var collarGeo = new THREE.CylinderGeometry(Rcomp*1.4, Rcomp*1.4, 4, seg);
  collarGeo.rotateX(Math.PI/2);
  collarGeo.translate(0, 0, Lcomp + 2);
  toolGroup.add(new THREE.Mesh(collarGeo, shaftMat));
}

function commitSeg(sm){
  if(THREE_OK){ bufAppend(sm.rapid?rapidBuf:feedBuf, sm.from, sm.to); }
  // Update M state only from dedicated M segments (len=0.001 and no movement)
  if(sm.isMseg){
    currentSpindleOn = !!sm.spindleOn;
    currentCoolantOn = !!sm.coolantOn;
    // currentSpindle keeps last S value — only display changes
  }
  // TOOL DEF — show pending tool from segment's pendingDef
  if(sm.pendingDef && sm.pendingDef !== pendingToolNum){
    pendingToolNum = sm.pendingDef;
    if(THREE_OK && prog) showPendingTool(sm.pendingDef);
  }
  if(sm.toolNum && sm.toolNum !== currentToolNum){
    currentSpindleOn = false;
    currentCoolantOn = false;
    startATC(currentToolNum, sm.toolNum);
    currentToolNum = sm.toolNum;
    pendingToolNum = 0;
  } else if(sm.toolNum){
    currentToolNum = sm.toolNum;
  }
  // collision check for rapid moves — skip if Z is moving upward (retract)
  if(sm.rapid && !sm.safeRetract && VX && sm.to.z < sm.from.z){
    var cellSize=Math.min(VX.dx,VX.dy,VX.dz);
    var steps=Math.max(2,Math.ceil(sm.len/cellSize));
    for(var si=0;si<=steps;si++){
      var t=si/steps;
      var cx=sm.from.x+(sm.to.x-sm.from.x)*t;
      var cy=sm.from.y+(sm.to.y-sm.from.y)*t;
      var cz=sm.from.z+(sm.to.z-sm.from.z)*t;
      if(vxCollides(cx,cy,cz,TOOL_R)){
        rapidCollision(sm, cx, cy, cz);
        break;
      }
    }
  }
  if(VX && !sm.rapid){
    var cellSize=Math.min(VX.dx,VX.dy);
    var steps=Math.max(2, Math.ceil(sm.len/cellSize*1.5));
    for(var si=0;si<=steps;si++){
      var t=si/steps;
      var cx=sm.from.x+(sm.to.x-sm.from.x)*t;
      var cy=sm.from.y+(sm.to.y-sm.from.y)*t;
      var cz=sm.from.z+(sm.to.z-sm.from.z)*t;
      var _ct = getToolByNum(currentToolNum);
      // Z shift of the cut: ONLY the TOOL CALL DL (programmed allowance), taken
      // per-segment (sm.dlPgm). Table DL is the MEASURED length delta — the
      // control fully compensates it (L+DL), so it never shows on the workpiece.
      var _dl = sm.dlPgm || 0;
      var _ttype = _ct ? inferToolType(_ct) : 'MILL';
      // Physical cutting shape = tool table only. Table DR describes the real
      // oversize of a MILL tool (so it DOES cut wider); TOOL CALL DR is a pure
      // PATH offset (applied in offsetRun / cycles) and must never reshape the
      // cut — that's exactly how the control behaves ("the simulated tool size
      // remains the same"). DR2 (table) is the physical corner-radius delta.
      var _drTab = (_ttype==='MILL' && _ct) ? (_ct.DR||0) : 0;
      var _dr2Tab = _ct ? (_ct.DR2||0) : 0;
      var _shape = null;
      var _lcuts = _ct ? (_ct.LCUTS||(_ct.R*999)) : TOOL_R*999;
      if(_ct && _ct.R2 > 0 && _ct.R2 < _ct.R){
        _shape = {type:'torus', r2:Math.max(0.01, _ct.R2 + _dr2Tab), lcuts:_lcuts};
      } else if(_ct && _ct.R2 > 0 && _ct.R2 >= _ct.R){
        var _r2p = Math.max(0.01, _ct.R2 + _dr2Tab); // physical ball radius
        _shape = {type:'ball', r2:_r2p, r2orig:_r2p, lcuts:_lcuts};
      } else if(_ct && _ct.T_ANGLE > 0){
        _shape = {type:'cone', angle:_ct.T_ANGLE, mode:(_ttype==='DRILL'?'drill':'countersink'), lcuts:_lcuts};
      } else {
        _shape = {type:'flat', lcuts:_lcuts};
      }
      var _toolR = (_ct ? _ct.R : TOOL_R) + _drTab;
      vxCut(cx, cy, cz + _dl, _toolR, _shape);
    }
  }
}

function getLblAtLine(srcLine){
  if(!codeEl) return null;
  var lines = codeEl.value.split('\n');
  var activeLbl = null;
  for(var i=0; i<=Math.min(srcLine, lines.length-1); i++){
    var u = lines[i].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(/^LBL\s+0/.test(u)){ activeLbl = null; }
    else if(/^LBL\s+(\d+)/.test(u)){ var m=u.match(/^LBL\s+(\d+)/); if(m) activeLbl=m[1]; }
  }
  return activeLbl;
}
