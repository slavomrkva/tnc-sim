// parser-engine -- web implementation; Android port intentionally deferred until acceptance.

function expandLblLines(lines, issues){
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
        var cm2=lu3.match(/^CALL LBL\s+(\d+)(?:\s+REP\s+(\d+))?\s*$/);
        if(cm2){
          var lnum=cm2[1], reps=cm2[2]?parseInt(cm2[2]):1;
          var lbody=lblDefs[lnum]||[];
          if(reps<1||reps>65534){
            if(issues) issues.push({line:li,sev:'err',msg:'REP must be within 1..65534 \u2014 label call ignored'});
            reps=0;
          }
          // A formally valid repeat can still exceed the simulator's practical
          // expansion budget when the label body is large. Refuse that call
          // instead of freezing the browser or silently executing a prefix.
          if(lbody.length*reps>200000-expandedLines.length){
            if(issues) issues.push({line:li,sev:'err',msg:'Expanded label calls exceed the simulator limit of 200000 blocks \u2014 label call ignored'});
            reps=0;
          }
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

// Validate the same deliberately small Q-expression language that evalQExpr
// executes.  evalQExpr keeps its historic numeric fallback for parser
// robustness, but the editor must never present a malformed/undefined
// expression as valid code and then silently simulate it as zero.
function inspectQExpr(expr, qVars){
  expr=String(expr||'').trim();
  if(!expr) return {ok:false,msg:'Q expression is empty'};
  var undefinedQs=[];
  expr.replace(/Q(\d+)/gi,function(m,n){
    if(qVars[parseInt(n)]===undefined && undefinedQs.indexOf('Q'+parseInt(n))<0)
      undefinedQs.push('Q'+parseInt(n));
    return m;
  });
  if(undefinedQs.length) return {ok:false,msg:undefinedQs.join(', ')+' has no value assigned'};
  // Reject names/tokens that the evaluator does not implement.  This also
  // prevents Function() from seeing arbitrary JavaScript identifiers.
  var identifiers=expr.match(/[A-Z_]+/gi)||[];
  var allowed={Q:true,SQRT:true,SIN:true,COS:true,TAN:true,ASIN:true,ACOS:true,ATAN:true,ABS:true,INT:true,FRAC:true};
  for(var ai=0;ai<identifiers.length;ai++){
    var id=identifiers[ai].toUpperCase();
    if(!allowed[id]) return {ok:false,msg:'Unsupported token "'+identifiers[ai]+'" in Q expression'};
  }
  if(/[^0-9Q+\-*/().\sA-Z_]/i.test(expr)) return {ok:false,msg:'Invalid character in Q expression'};
  var value=evalQExpr(expr,qVars);
  if(!isFinite(value)) return {ok:false,msg:'Q expression does not produce a finite number'};
  // evalQExpr returns 0 on a syntax exception, so independently compile the
  // resolved expression to distinguish a real zero from a swallowed failure.
  var probe=expr.replace(/Q(\d+)/gi,function(m,n){return '('+qVars[parseInt(n)]+')';})
    .replace(/SQRT\s*\(/gi,'Math.sqrt(').replace(/SIN\s*\(/gi,'Math.sin(')
    .replace(/COS\s*\(/gi,'Math.cos(').replace(/TAN\s*\(/gi,'Math.tan(')
    .replace(/ASIN\s*\(/gi,'Math.asin(').replace(/ACOS\s*\(/gi,'Math.acos(')
    .replace(/ATAN\s*\(/gi,'Math.atan(').replace(/ABS\s*\(/gi,'Math.abs(')
    .replace(/INT\s*\(/gi,'Math.trunc(')
    .replace(/FRAC\s*\(([^)]+)\)/gi,function(m,v){return '('+v+'-Math.trunc('+v+'))';});
  try {
    var compiled=Function('"use strict"; return ('+probe+');')();
    if(typeof compiled!=='number'||!isFinite(compiled)) return {ok:false,msg:'Q expression does not produce a finite number'};
  } catch(e){ return {ok:false,msg:'Malformed Q expression'}; }
  return {ok:true,value:value};
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

// Cycle Q-parameter access that respects an explicit zero (NOTES rule #2).
// `Q || default` silently drops a meaningful 0 (e.g. Q201=0 depth, Q204=0 2nd
// clearance); this helper only falls back when the parameter is genuinely
// absent. Kept tiny and side-effect free, and used only where the meaning of
// zero and of the default both match the Heidenhain documentation.
function cycleQ(cy, num, def){
  var v = cy ? cy['Q'+num] : undefined;
  return (v !== undefined && v !== null) ? v : def;
}

// One deterministic grid planner owns both live cutting and Refine. A fixed
// BLK FORM side limit is a poor memory guard: a long, thin blank can be cheap
// while a smaller cube can be expensive. Keep the requested isotropic detail
// whenever it fits, then binary-search the smallest coarser cell whose rounded
// dimensions stay inside the browser budget.
var LIVE_VOXEL_BUDGET = 24000000;
var REFINE_VOXEL_BUDGET = 64000000;

function planVoxelGrid(w,d,h,targetResolution,cellCap,budget){
  var vals=[w,d,h,targetResolution,cellCap,budget];
  for(var vi=0;vi<vals.length;vi++) if(!isFinite(vals[vi])) return null;
  if(w<=0||d<=0||h<=0||targetResolution<2||cellCap<=0||budget<64) return null;
  var maxDim=Math.max(w,d,h);
  var detailCell=Math.min(maxDim/(targetResolution-1),cellCap);
  if(!isFinite(detailCell)||detailCell<=0) return null;
  function atCell(cell){
    var nx=Math.max(4,Math.round(w/cell)+1);
    var ny=Math.max(4,Math.round(d/cell)+1);
    var nz=Math.max(4,Math.round(h/cell)+1);
    return {cell:cell,nx:nx,ny:ny,nz:nz,total:nx*ny*nz};
  }
  var plan=atCell(detailCell);
  var limited=plan.total>budget;
  if(limited){
    var low=detailCell, high=maxDim;
    // `high=maxDim` always produces the 4x4x4 minimum grid, so the upper
    // bound is known to fit. Fixed iterations make the result reproducible.
    for(var bi=0;bi<56;bi++){
      var mid=(low+high)/2;
      if(atCell(mid).total>budget) low=mid;
      else high=mid;
    }
    plan=atCell(high);
  }
  plan.detailCell=detailCell;
  plan.effectiveCell=Math.max(w/(plan.nx-1),d/(plan.ny-1),h/(plan.nz-1));
  plan.limited=limited;
  plan.budget=budget;
  return plan;
}

function planLiveVoxelGrid(w,d,h,quality){
  quality=Math.max(0,Math.min(2,quality===undefined?1:quality));
  return planVoxelGrid(w,d,h,[100,150,200][quality],[1.0,0.7,0.5][quality],LIVE_VOXEL_BUDGET);
}

function planRefineVoxelGrid(w,d,h,quality){
  quality=Math.max(0,Math.min(2,quality===undefined?1:quality));
  return planVoxelGrid(w,d,h,[300,400,500][quality],[0.5,0.4,0.3][quality],REFINE_VOXEL_BUDGET);
}

// Effective radius compensation, exactly like the real control:
//   R(table) + DR(table) + DR(TOOL CALL)
// This single value drives BOTH the final wall path and the radial stepover in
// cycles, so a programmed DR can never make the two disagree. The physical
// voxel tool shape (vxCut) still uses table geometry only — a programmed DR is
// a path allowance, it must not inflate the mesh.
function effectiveCompRadius(tool, drPgm){
  if(!tool) return TOOL_R;
  return (tool.R || 0) + (tool.DR || 0) + (drPgm || 0);
}

// Parser tests and lightweight embeds can load this module without the full
// Tool Table UI module, so keep a small compatibility resolver here.
function resolveParserToolCall(n){
  if(typeof resolveToolCall==='function') return resolveToolCall(n);
  var requested=typeof getToolByNum==='function' ? getToolByNum(n) : null;
  if(!requested) return {requested:n,tool:null,toolNum:n,replacement:false,locked:false};
  if(!requested.TL) return {requested:n,tool:requested,toolNum:n,replacement:false,locked:false};
  var replacement=requested.RT && typeof getToolByNum==='function' ? getToolByNum(requested.RT) : null;
  if(replacement && replacement.T===requested.RT && !replacement.TL) return {requested:n,tool:replacement,toolNum:replacement.T,replacement:true,locked:true};
  return {requested:n,tool:requested,toolNum:n,replacement:false,locked:true};
}

// TNC 640 M-function grammar shared by static validation and simulation.
// The control permits up to four M functions; TNC Sim deliberately exposes
// two. Parameters belong to the M function that precedes them and therefore
// stay after the first M token at the end of a positioning block.
var TNC640_STANDARD_M = {
  0:1,1:1,2:1,3:1,4:1,5:1,6:1,8:1,9:1,13:1,14:1,30:1,
  89:1,91:1,92:1,94:1,97:1,98:1,99:1,101:1,102:1,103:1,
  107:1,108:1,109:1,110:1,111:1,116:1,117:1,118:1,120:1,
  126:1,127:1,128:1,129:1,130:1,134:1,135:1,136:1,137:1,
  138:1,140:1,141:1,143:1,144:1,145:1,148:1,149:1,197:1
};
var TNC640_FULLY_SIMULATED_M = {
  0:1,2:1,3:1,4:1,5:1,7:1,8:1,9:1,13:1,14:1,30:1,89:1,99:1
};

function mFunctionParameterIssue(code, params){
  var ok=true, msg='';
  if(code===103){
    ok=params.length===0 || (params.length===1 && /^F\+?\d+(?:\.\d+)?$/.test(params[0]));
    msg='M103 accepts an optional F percentage, e.g. M103 F20';
  } else if(code===118){
    ok=params.every(function(t){ return /^[XYZABC][+-]?\d+(?:\.\d+)?$/.test(t); });
    msg='M118 accepts axis values, e.g. M118 X1 Y1 B5';
  } else if(code===120){
    ok=params.length===0 || (params.length===1 && /^LA(?:[0-9]|[1-9][0-9])$/.test(params[0]));
    msg='M120 accepts optional LA0 to LA99';
  } else if(code===128){
    ok=params.length===0 || (params.length===1 && /^F\+?\d+(?:\.\d+)?$/.test(params[0]));
    msg='M128 accepts an optional F value';
  } else if(code===138){
    ok=params.every(function(t){ return /^[ABC]$/.test(t); });
    msg='M138 accepts rotary-axis letters A, B and/or C';
  } else if(code===140){
    ok=params.length>=2 && params[0]==='MB' &&
      (/^(?:MAX|[+-]?\d+(?:\.\d+)?)$/.test(params[1])) &&
      (params.length===2 || (params.length===3 && /^F\+?\d+(?:\.\d+)?$/.test(params[2])));
    msg='M140 requires MB plus a distance or MAX, optionally followed by F';
  } else if(code===197){
    ok=params.length===1 && /^DL\+?\d+(?:\.\d+)?$/.test(params[0]);
    msg='M197 requires DL, e.g. M197 DL0.876';
  } else if(params.length){
    ok=false;
    msg='M'+code+' does not use parameters known to the TNC 640 validator';
  }
  return ok ? null : msg;
}

function analyzeMFunctionTail(tokens, firstToken){
  var result={motionTokens:tokens.slice(),groups:[],codes:[],issues:[],firstM:-1};
  for(var i=firstToken;i<tokens.length;i++){
    if(/^M\d+$/.test(tokens[i])){ result.firstM=i; break; }
  }
  if(result.firstM<0) return result;
  result.motionTokens=tokens.slice(0,result.firstM);
  var group=null;
  for(var ti=result.firstM;ti<tokens.length;ti++){
    var tok=tokens[ti];
    if(/^M\d+$/.test(tok)){
      group={code:parseInt(tok.slice(1),10),token:tok,params:[]};
      result.groups.push(group);
      result.codes.push(tok);
    } else if(group){
      group.params.push(tok);
    }
  }
  if(result.groups.length>2)
    result.issues.push({sev:'err',msg:'Simulator limit: at most two M functions are supported in one block (TNC 640 permits four)'});
  for(var gi=0;gi<result.groups.length;gi++){
    var g=result.groups[gi];
    var paramIssue=mFunctionParameterIssue(g.code,g.params);
    if(paramIssue){
      if(!TNC640_STANDARD_M[g.code] && g.params.length)
        result.issues.push({sev:'warn',msg:'Parameters of machine-specific M'+g.code+' are not validated or simulated'});
      else
        result.issues.push({sev:'err',msg:paramIssue});
    }
  }
  return result;
}

function positioningTextBeforeM(lineText){
  var tokens=String(lineText||'').trim().split(/\s+/);
  var analyzed=analyzeMFunctionTail(tokens,1);
  return analyzed.motionTokens.join(' ');
}

function validateProgram(code, liveEdit){
  // liveEdit=true suppresses radius-compensation completeness checks (a contour
  // that is still active because R0 has not been typed yet). While editing, an
  // in-progress RL/RR contour is normal and must not nag; those checks run at
  // simulation start instead (Run/Step pass liveEdit=false). Defaults to full
  // validation when called directly.
  // Real Heidenhain .H files (as exported by the control) prefix every block
  // with its block number, e.g. "12 TOOL CALL 5 Z S2000". Strip it so all the
  // startsWith-style keyword checks below (BEGIN PGM, LBL, CYCL DEF, ...) work
  // the same whether the program was typed fresh or imported from a machine.
  code = code.replace(/(\d),(\d)/g,'$1.$2');
  code = code.replace(/^[ \t]*\d+[ \t]+/gm, '');
  var lines = code.split('\n');
  var probs = [];
  function rejectUnknownTokens(tokens,start,allowed,line){
    for(var ti=start;ti<tokens.length;ti++){
      var accepted=false;
      for(var pi=0;pi<allowed.length;pi++) if(allowed[pi].test(tokens[ti])){accepted=true;break;}
      if(!accepted) probs.push({line:line,sev:'err',msg:'Unsupported token "'+tokens[ti]+'" in this block'});
    }
  }
  function rejectDuplicateFields(tokens,start,line){
    var seen={};
    for(var di=start;di<tokens.length;di++){
      var token=tokens[di], key='', label='';
      var axis=token.match(/^I?([XYZ])(?=[+-]?\d)/);
      if(axis){ key='axis-'+axis[1]; label='coordinate '+axis[1]; }
      else if(/^F(?:MAX|AUTO|\+?\d)/.test(token)){ key='feed'; label='feed'; }
      else if(/^(?:RL|RR|R0)$/.test(token)){ key='radius-comp'; label='radius compensation'; }
      else if(/^DR[+-]$/.test(token)){ key='direction'; label='rotation direction DR'; }
      else if(/^R[+-]?\d/.test(token)){ key='radius'; label='circle radius R'; }
      else if(/^PR[+-]?\d/.test(token)){ key='polar-radius'; label='polar radius PR'; }
      else if(/^(?:PA|IPA)[+-]?\d/.test(token)){ key='polar-angle'; label='polar angle PA/IPA'; }
      if(!key) continue;
      if(seen[key]) probs.push({line:line,sev:'err',msg:'Ambiguous block \u2014 '+label+' is programmed more than once'});
      else seen[key]=true;
    }
  }
  function validatePositioningFeed(tokens,line){
    for(var fi=1;fi<tokens.length;fi++){
      if(/^F/.test(tokens[fi])&&tokens[fi]!=='FMAX'&&tokens[fi]!=='FAUTO'){
        var strict=tokens[fi].match(/^F\+?(\d+(?:\.\d+)?)$/);
        if(!strict||parseFloat(strict[1])<=0)
          probs.push({line:line,sev:'err',msg:'Feed must be FMAX, FAUTO, or a number greater than 0'});
      }
    }
  }
  function validateMTail(mInfo,line,blockKind){
    for(var ii=0;ii<mInfo.issues.length;ii++)
      probs.push({line:line,sev:mInfo.issues[ii].sev,msg:mInfo.issues[ii].msg});
    for(var gi=0;gi<mInfo.groups.length;gi++){
      var g=mInfo.groups[gi], n=g.code;
      if((n===89||n===99)&&blockKind==='standalone')
        probs.push({line:line,sev:'err',msg:'M'+n+' must be programmed at the end of a positioning block'});
      if((n===89||n===99)&&blockKind!=='standalone'&&!hasCycleDef)
        probs.push({line:line,sev:'err',msg:'M'+n+' without a defined cycle \u2014 CYCL DEF missing'});
      if((n===91||n===92||n===130)&&blockKind==='standalone')
        probs.push({line:line,sev:'err',msg:'M'+n+' is effective only inside a positioning block'});
      if(n===1)
        probs.push({line:line,sev:'warn',msg:'M1 is valid, but optional-stop mode is not simulated'});
      else if(n===6)
        probs.push({line:line,sev:'warn',msg:'M6 is valid; TNC Sim stops the spindle/program but does not perform a machine-specific tool change'});
      else if(!TNC640_FULLY_SIMULATED_M[n]){
        if(TNC640_STANDARD_M[n])
          probs.push({line:line,sev:'warn',msg:'M'+n+' is valid TNC 640 syntax, but its machine effect is not simulated'});
        else
          probs.push({line:line,sev:'warn',msg:'Machine-specific M'+n+' is accepted, but its effect is not simulated'});
      }
    }
  }
  function validateFirstPositioningMove(line,hasMotion){
    if(!hasMotion) return;
    if(!valSpindleOn&&hasToolCall&&firstMoveLine<0)
      probs.push({line:line,sev:'warn',msg:'Spindle? \u2014 M3/M4 not programmed before first cutting move'});
    if(!hasToolCall)
      probs.push({line:line,sev:'warn',msg:'No tool active \u2014 TOOL CALL missing before this move'});
  }
  function applyValidatorMStart(codes){
    if(codes.some(function(m){ return /^(?:M3|M4|M13|M14)$/.test(m); }))
      valSpindleOn=true;
  }
  function applyValidatorMEnd(codes){
    if(codes.some(function(m){ return /^(?:M0|M2|M5|M6|M30)$/.test(m); }))
      valSpindleOn=false;
  }
  if(lines.length > 2000)
    probs.push({line:2000,sev:'err',msg:'Program exceeds 2000 lines ('+lines.length+' lines) \u2014 simulator limit'});

  var hasBegin=false, hasEnd=false, hasBlk1=false, hasBlk2=false;
  var beginCount=0, endCount=0, seenEnd=false;
  var beginName='', endName='';
  var blkMin1={x:null,y:null,z:null};
  var blkMax1={x:null,y:null,z:null};
  var _cylPending=false, _cylZ0_val=0; // cylinder blank size check state
  var lastCC=false, ccLine=-1, valCCX=null, valCCY=null;
  var valRcState='';
  var valRcLine=-1;
  var lastRcWasArc=false;
  var hasToolCall=false;
  var toolCallLine=-1;
  var firstMoveLine=-1;
  var valToolNum=0;
  var valZ=null;
  var valSurfZ=null;
  var valLastX=null, valLastY=null; // tracks XY position for geometry and compensation checks
  var valHasXYTangent=false;
  var valSpindleOn=false;
  var valSpindleS=0;
  var valToolCallPendingSpindle=false;
  var qVarsVal={};
  var valCycleQ={}, valCycleQSeen={};
  var valCycleLine=-1;
  var valCycleNum=0;
  var valInCycle=false;
  var blk1Line=-1;
  var activeCycleDef=false;
  var lastCycleLine=-1;
  var hasCycleDef=false;
  var pendingCC=true;
  var supportedCycleQ={
    200:{required:['Q200','Q201','Q206','Q202','Q210','Q203','Q204','Q211'],allowed:{Q200:1,Q201:1,Q206:1,Q202:1,Q210:1,Q203:1,Q204:1,Q211:1,Q395:1}},
    201:{required:['Q200','Q201','Q206','Q211','Q208','Q203','Q204'],allowed:{Q200:1,Q201:1,Q206:1,Q211:1,Q208:1,Q203:1,Q204:1}},
    208:{required:['Q200','Q201','Q206','Q334','Q203','Q204','Q335','Q342','Q351'],allowed:{Q200:1,Q201:1,Q206:1,Q334:1,Q203:1,Q204:1,Q335:1,Q342:1,Q351:1,Q370:1}},
    209:{required:['Q200','Q201','Q239','Q203','Q204','Q257','Q256','Q336'],allowed:{Q200:1,Q201:1,Q239:1,Q203:1,Q204:1,Q257:1,Q256:1,Q336:1,Q403:1}}
  };
  function recordCycleQ(name,value,line){
    if(valCycleQSeen[name])
      probs.push({line:line,sev:'err',msg:name+' is programmed more than once in CYCL DEF '+valCycleNum});
    else valCycleQSeen[name]=true;
    valCycleQ[name]=value;
  }

  function finishCycleValidation(){
    if(!valInCycle) return;
    valInCycle=false;
    var _cycleSpec=supportedCycleQ[valCycleNum];
    if(_cycleSpec){
      for(var _rq=0;_rq<_cycleSpec.required.length;_rq++){
        var _requiredQ=_cycleSpec.required[_rq];
        if(!valCycleQSeen[_requiredQ])
          probs.push({line:valCycleLine,sev:'err',msg:'CYCL '+valCycleNum+': missing required parameter '+_requiredQ});
      }
      for(var _seenQ in valCycleQSeen){
        if(!_cycleSpec.allowed[_seenQ])
          probs.push({line:valCycleLine,sev:'err',msg:'CYCL '+valCycleNum+': '+_seenQ+' is not supported by this simulated cycle'});
      }
    }
    var _cQ200=valCycleQ['Q200'],_cQ201=valCycleQ['Q201'],_cQ204=valCycleQ['Q204'];
    if(_cQ200!==undefined&&typeof _cQ200==='number'&&_cQ200<0) probs.push({line:valCycleLine,sev:'err',msg:'Q200 safety clearance must be >= 0 (got '+_cQ200+')'});
    if(_cQ204!==undefined&&typeof _cQ204==='number'&&_cQ204<0) probs.push({line:valCycleLine,sev:'err',msg:'Q204 safety clearance must be >= 0 (got '+_cQ204+')'});
    if(_cQ201!==undefined&&typeof _cQ201==='number'&&_cQ201===0) probs.push({line:valCycleLine,sev:'warn',msg:'Q201 = 0: cycle will not execute'});
    if(_cQ201!==undefined&&typeof _cQ201==='number'&&_cQ201>0) probs.push({line:valCycleLine,sev:'err',msg:'Q201 depth must be negative (below surface), got +'+_cQ201+' — the cycle will not cut'});
    var _qNumBad=function(q,pred){ return typeof valCycleQ[q]==='number'&&pred(valCycleQ[q]); };
    if(valCycleNum===200){
      if(_qNumBad('Q206',function(v){return v<=0;})||_qNumBad('Q202',function(v){return v<0;})||_qNumBad('Q210',function(v){return v<0;})||_qNumBad('Q211',function(v){return v<0;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 200: Q206 must be > 0 and Q202/Q210/Q211 must be >= 0'});
      if(_qNumBad('Q395',function(v){return v!==0&&v!==1;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 200: Q395 must be 0 or 1'});
    } else if(valCycleNum===201){
      if(_qNumBad('Q206',function(v){return v<=0;})||_qNumBad('Q208',function(v){return v<0;})||_qNumBad('Q211',function(v){return v<0;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 201: Q206 must be > 0 and Q208/Q211 must be >= 0'});
    } else if(valCycleNum===208){
      if(_qNumBad('Q206',function(v){return v<=0;})||_qNumBad('Q334',function(v){return v<0;})||_qNumBad('Q335',function(v){return v<=0;})||_qNumBad('Q342',function(v){return v<0;})||_qNumBad('Q351',function(v){return v!==-1&&v!==0&&v!==1;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 208: invalid feed, diameter, pre-drill, infeed, or Q351 sign'});
      if(typeof valCycleQ.Q342==='number'&&typeof valCycleQ.Q335==='number'&&valCycleQ.Q342>valCycleQ.Q335) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 208: Q342 pre-drilled diameter must not exceed Q335 nominal diameter'});
      if(_qNumBad('Q370',function(v){return v<0||(v>0&&v<0.1)||v>1999;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 208: Q370 path overlap must be 0 or within 0.1...1999'});
    } else if(valCycleNum===209){
      if(_qNumBad('Q239',function(v){return v===0||Math.abs(v)>99.9999;})||_qNumBad('Q257',function(v){return v<0;})||_qNumBad('Q256',function(v){return v<0;})||_qNumBad('Q403',function(v){return v<0.0001||v>10;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 209: invalid pitch, chip-break, or retraction factor'});
      if(_qNumBad('Q336',function(v){return v< -360||v>360;})) probs.push({line:valCycleLine,sev:'err',msg:'CYCL 209: Q336 spindle orientation must be within -360...360 degrees'});
    }
  }

  // Validate LBL structure on the original source. expandLblLines deliberately
  // removes LBL/CALL blocks, so doing this later made all label diagnostics
  // unreachable and missing labels were silently expanded to nothing.
  var definedLbls={}, duplicateLbls={};
  for(var _li2=0;_li2<lines.length;_li2++){
    var _lu=lines[_li2].trim().toUpperCase().replace(/;.*$/,'').trim();
    var _lm=_lu.match(/^LBL\s+(\d+)\s*$/);
    if(/^LBL\b/.test(_lu)&&!_lm)
      probs.push({line:_li2,sev:'err',msg:'Faulty block \u2014 expected: LBL <0..65535>'});
    if(_lm && _lm[1]!=='0'){
      if(parseInt(_lm[1])>65535){
        probs.push({line:_li2,sev:'err',msg:'Label number must be within 1..65535'});
        continue;
      }
      if(definedLbls[_lm[1]]){
        duplicateLbls[_lm[1]]=_li2;
        probs.push({line:_li2,sev:'err',msg:'Label number allocated twice \u2014 LBL '+_lm[1]});
      }
      definedLbls[_lm[1]]=_li2+1;
    }
  }
  for(var _li3=0;_li3<lines.length;_li3++){
    var _callU=lines[_li3].trim().toUpperCase().replace(/^[ \t]*\d+[ \t]+/,'').replace(/;.*$/,'').trim();
    var _callM=_callU.match(/^CALL\s+LBL\s+(\d+)(?:\s+REP\s+([+-]?\d+))?\s*$/);
    if(/^CALL\s+LBL\b/.test(_callU) && !_callM)
      probs.push({line:_li3,sev:'err',msg:'Faulty block \u2014 expected: CALL LBL <no.> [REP <count>]'});
    else if(_callM){
      if(parseInt(_callM[1])<1||parseInt(_callM[1])>65535)
        probs.push({line:_li3,sev:'err',msg:'Label number must be within 1..65535'});
      if(!definedLbls[_callM[1]]) probs.push({line:_li3,sev:'err',msg:'Label number not allocated \u2014 LBL '+_callM[1]+' missing'});
      if(_callM[2]!==undefined&&(parseInt(_callM[2])<1||parseInt(_callM[2])>65534)) probs.push({line:_li3,sev:'err',msg:'REP must be within 1..65534'});
    }
  }

  var expandedVal = expandLblLines(lines);

  // RND/CHF is a modifier between two contour moves in the implemented
  // parser.  Orphaned or trailing modifiers used to disappear without any
  // diagnostic, which is never an acceptable simulation result.
  var _meaningful=[];
  for(var _si=0;_si<expandedVal.length;_si++){
    var _su=expandedVal[_si].text.trim().toUpperCase().replace(/^[ \t]*\d+[ \t]+/,'').replace(/;.*$/,'').trim();
    if(_su) _meaningful.push({u:_su,line:expandedVal[_si].srcLine});
  }
  for(var _sj=0;_sj<_meaningful.length;_sj++){
    if(/^(RND|CHF)\b/.test(_meaningful[_sj].u)){
      var _prevU=_sj>0?_meaningful[_sj-1].u:'';
      var _nextU=_sj+1<_meaningful.length?_meaningful[_sj+1].u:'';
      if(!/^(L|LP)\b/.test(_prevU)||!/^(L|LP)\b/.test(_nextU))
        probs.push({line:_meaningful[_sj].line,sev:'err',msg:_meaningful[_sj].u.split(/\s+/)[0]+' must be programmed between two supported contour moves'});
    }
  }

  for(var i=0;i<expandedVal.length;i++){
    var raw=expandedVal[i].text.trim();
    var srcI=expandedVal[i].srcLine;
    var u = (!raw||raw.charAt(0)===';') ? '' :
      raw.toUpperCase().replace(/^[ \t]*\d+[ \t]+(?=[A-Z;*])/,'').split(';')[0].trim();
    if(valInCycle&&!/^Q\d+/.test(u)) finishCycleValidation();
    if(!u) continue;

    // Strip FN 0–4 prefix (FN 0 assign, FN 1 add, FN 2 sub, FN 3 mult, FN 4 div)
    if(/^FN\s*[0-4]\s*:/i.test(u)) u = u.replace(/^FN\s*[0-4]\s*:/i,'').trim();

    if(!hasBegin&&u.indexOf('BEGIN PGM')!==0)
      probs.push({line:srcI,sev:'err',msg:'Program block appears before BEGIN PGM'});
    if(seenEnd&&u.indexOf('END PGM')!==0)
      probs.push({line:srcI,sev:'err',msg:'Program block appears after END PGM'});

    // Q100-199 read-only check
    var _qValAssign = u.match(/^(Q\d+)\s*=\s*(.+)/);
    if(_qValAssign && !valInCycle){
      var _qNum2=parseInt(_qValAssign[1].slice(1));
      if(_qNum2>=100&&_qNum2<=199) probs.push({line:srcI,sev:'warn',msg:_qValAssign[1]+' is in the reserved range Q100\u2013Q199 (measurement results \u2014 read-only)'});
      var _qNum = parseInt(_qValAssign[1].slice(1));
      var _qInspection=inspectQExpr(_qValAssign[2],qVarsVal);
      if(!_qInspection.ok) probs.push({line:srcI,sev:'err',msg:_qValAssign[1]+': '+_qInspection.msg});
      else qVarsVal[_qNum] = _qInspection.value;
      continue;
    }
    if(Object.keys(qVarsVal).length > 0) u = resolveQLine(u, qVarsVal);

    // Undefined Q parameter in a movement line — coordinate would be silently ignored
    if(/^(L|C|CC|RND|CR|CT|LP|CP)\b/.test(u) && /[XYZIJKRP][+-]?Q\d+/.test(u)){
      var _undefQ = u.match(/[XYZIJKRP][+-]?(Q\d+)/);
      probs.push({line:srcI,sev:'err',msg:_undefQ[1]+' has no value assigned \u2014 coordinate will be ignored'});
    }

    var toks=u.split(/\s+/);
    if(/^(L|C|CR|CT|LP|CP)\b/.test(u)){
      for(var _mfi=1;_mfi<toks.length;_mfi++){
        var _mf=toks[_mfi].match(/^F\+?(\d+(?:\.\d+)?)$/);
        if(_mf&&parseFloat(_mf[1])<=0) probs.push({line:srcI,sev:'err',msg:'Feed must be greater than 0'});
      }
    }

    // ── BEGIN PGM ──
    if(u.indexOf('BEGIN PGM')===0){
      hasBegin=true; beginCount++;
      if(beginCount>1) probs.push({line:srcI,sev:'err',msg:'BEGIN PGM may only appear once'});
      if(seenEnd) probs.push({line:srcI,sev:'err',msg:'BEGIN PGM may not appear after END PGM'});
      if(!/^BEGIN PGM \S+ (MM|INCH)$/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: BEGIN PGM <name> MM'});
      else {
        beginName=toks[2];
        if(/\sINCH$/.test(u)) probs.push({line:srcI,sev:'err',msg:'INCH programs are not supported by the simulator \u2014 use MM'});
      }

    // ── END PGM ──
    } else if(u.indexOf('END PGM')===0){
      hasEnd=true; endCount++; seenEnd=true;
      if(!hasBegin) probs.push({line:srcI,sev:'err',msg:'END PGM appears before BEGIN PGM'});
      if(endCount>1) probs.push({line:srcI,sev:'err',msg:'END PGM may only appear once'});
      if(!/^END PGM \S+ (MM|INCH)$/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: END PGM <name> MM'});
      else {
        endName=toks[2];
        if(/\sINCH$/.test(u)) probs.push({line:srcI,sev:'err',msg:'INCH programs are not supported by the simulator \u2014 use MM'});
        if(beginName && endName && beginName!==endName)
          probs.push({line:srcI,sev:'err',msg:'PGM name mismatch: END PGM "'+endName+'" \u2260 BEGIN PGM "'+beginName+'"'});
      }
      if((valRcState==='RL'||valRcState==='RR') && !liveEdit)
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
        if(!_crl||!_cz1l) probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER 0.2 incomplete \u2014 define radius X and top Z'});
        var _crv=_crl?parseFloat(_crl[1]):NaN, _cz1v=_cz1l?parseFloat(_cz1l[1]):NaN;
        if((_crl&&!isFinite(_crv))||(_cz1l&&!isFinite(_cz1v))||!isFinite(_cylZ0_val))
          probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER dimensions must be finite numbers'});
        else {
          if(_crl&&_crv<=0) probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER radius X must be greater than 0'});
          if(_cz1l&&_cz1v<=_cylZ0_val) probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER top Z must be greater than bottom Z'});
          if(_crl&&_cz1l&&_crv>0&&_cz1v>_cylZ0_val){
            var _dia=Math.abs(_crv)*2, _ch=Math.abs(_cz1v-_cylZ0_val);
            var _cylPlan=planLiveVoxelGrid(_dia,_dia,_ch,1);
            if(_cylPlan&&_cylPlan.limited)
              probs.push({line:srcI,sev:'warn',msg:'BLK FORM: Default 3D detail will be reduced to about '+_cylPlan.effectiveCell.toFixed(2)+' mm/voxel to stay within browser memory limits'});
          }
        }
        _cylPending=false;
      }
      else if(!/X[+-]?\d/.test(u)||!/Y[+-]?\d/.test(u)||!/Z[+-]?\d/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'BLK FORM 0.2 incomplete \u2014 define X, Y and Z'});
      else {
        var _bx=u.match(/X([+-]?\d+\.?\d*)/),_by=u.match(/Y([+-]?\d+\.?\d*)/),_bz=u.match(/Z([+-]?\d+\.?\d*)/);
        if(_bx) blkMax1.x=parseFloat(_bx[1]); if(_by) blkMax1.y=parseFloat(_by[1]); if(_bz) blkMax1.z=parseFloat(_bz[1]);
        var _zeroBox = blkMin1.x===0&&blkMin1.y===0&&blkMin1.z===0&&blkMax1.x===0&&blkMax1.y===0&&blkMax1.z===0;
        var _boxComplete=blkMin1.x!==null&&blkMin1.y!==null&&blkMin1.z!==null&&
          blkMax1.x!==null&&blkMax1.y!==null&&blkMax1.z!==null;
        var _boxFinite=_boxComplete&&isFinite(blkMin1.x)&&isFinite(blkMin1.y)&&isFinite(blkMin1.z)&&
          isFinite(blkMax1.x)&&isFinite(blkMax1.y)&&isFinite(blkMax1.z);
        if(_boxComplete){
          if(!_boxFinite) probs.push({line:srcI,sev:'err',msg:'BLK FORM dimensions must be finite numbers'});
          else {
            var _sx=Math.abs(blkMax1.x-blkMin1.x), _sy=Math.abs(blkMax1.y-blkMin1.y), _sz=Math.abs(blkMax1.z-blkMin1.z);
            if(!_zeroBox&&blkMax1.x<=blkMin1.x) probs.push({line:srcI,sev:'err',msg:'BLK FORM: X max ('+_bx[1]+') must be > X min ('+blkMin1.x+')'});
            if(!_zeroBox&&blkMax1.y<=blkMin1.y) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Y max ('+_by[1]+') must be > Y min ('+blkMin1.y+')'});
            if(!_zeroBox&&blkMax1.z<=blkMin1.z) probs.push({line:srcI,sev:'err',msg:'BLK FORM: Z max ('+_bz[1]+') must be > Z min ('+blkMin1.z+')'});
            if(!_zeroBox&&blkMax1.x>blkMin1.x&&blkMax1.y>blkMin1.y&&blkMax1.z>blkMin1.z){
              var _boxPlan=planLiveVoxelGrid(_sx,_sy,_sz,1);
              if(_boxPlan&&_boxPlan.limited)
                probs.push({line:srcI,sev:'warn',msg:'BLK FORM: Default 3D detail will be reduced to about '+_boxPlan.effectiveCell.toFixed(2)+' mm/voxel to stay within browser memory limits'});
            }
          }
        }
      }

    } else if(u.indexOf('BLK FORM CYLINDER')===0){
      // Cylinder header: 0.1-style line holds center + Z0. Radius/height checked on the next 0.2 line.
      hasBlk1=true;
      var _cxl=u.match(/X([+-]?\d+\.?\d*)/), _cyl=u.match(/Y([+-]?\d+\.?\d*)/), _czl=u.match(/Z([+-]?\d+\.?\d*)/);
      if(!/X[+-]?\d/.test(u)||!/Y[+-]?\d/.test(u)||!_czl)
        probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER incomplete \u2014 define center X, Y and bottom Z'});
      if(_cxl&&_cyl&&_czl&&(!isFinite(parseFloat(_cxl[1]))||!isFinite(parseFloat(_cyl[1]))||!isFinite(parseFloat(_czl[1]))))
        probs.push({line:srcI,sev:'err',msg:'BLK FORM CYLINDER dimensions must be finite numbers'});
      _cylZ0_val = _czl?parseFloat(_czl[1]):0; _cylPending=true;

    } else if(u.indexOf('BLK FORM')===0){
      probs.push({line:srcI,sev:'err',msg:'This BLK FORM variant is not supported (supported: 0.1/0.2 box and CYLINDER)'});
      // other BLK FORM variants — no size check needed

    // ── TOOL CALL ──
    } else if(u.indexOf('TOOL CALL')===0){
      if(!/^TOOL CALL \d+/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: TOOL CALL <no.> Z S<rpm>'});
      if(valRcState==='RL'||valRcState==='RR')
        probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' active \u2014 program R0 before TOOL CALL'});
      if(!/\bS\d+/.test(u))
        probs.push({line:srcI,sev:'warn',msg:'Spindle speed S missing in TOOL CALL'});
      if(/\bS[+-]/.test(u)||/\bS0(?:\D|$)/.test(u))
        probs.push({line:srcI,sev:'err',msg:'TOOL CALL spindle speed S must be a positive number'});
      var _toolF=u.match(/\bF([+-]?\d+(?:\.\d+)?)/);
      if(_toolF&&parseFloat(_toolF[1])<=0) probs.push({line:srcI,sev:'err',msg:'TOOL CALL feed F must be greater than 0'});
      rejectUnknownTokens(toks,3,[/^Z$/, /^S[+-]?\d+(?:\.\d+)?$/, /^F[+-]?\d+(?:\.\d+)?$/, /^DL[+-]?\d+(?:\.\d+)?$/, /^DR[+-]?\d+(?:\.\d+)?$/],srcI);
      hasToolCall=true; toolCallLine=srcI;
      valSpindleS=0;
      var _valSm=u.match(/\bS(\d+)/); if(_valSm) valSpindleS=parseInt(_valSm[1]);
      valToolCallPendingSpindle=true;
      var _tm=u.match(/TOOL CALL (\d+)/);
      if(_tm){
        var _requestedTool=parseInt(_tm[1]);
        var _resolvedTool=resolveParserToolCall(_requestedTool);
        valToolNum=_resolvedTool.toolNum;
        if(!_resolvedTool.tool) probs.push({line:srcI,sev:'err',msg:'Tool T'+_requestedTool+' is missing from the Tool Table'});
        else if(_resolvedTool.locked&&!_resolvedTool.replacement) probs.push({line:srcI,sev:'err',msg:'Tool T'+_requestedTool+' is locked and has no available replacement tool'});
        else if(_resolvedTool.replacement) probs.push({line:srcI,sev:'warn',msg:'Tool T'+_requestedTool+' is locked — replacement T'+_resolvedTool.toolNum+' will be used'});
      }

    // ── TOOL DEF ──
    } else if(u.indexOf('TOOL DEF')===0){
      if(!/^TOOL DEF \d+$/.test(u))
        probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: TOOL DEF <no.>'});

    // ── CC ──
    } else if(toks[0]==='CC'){
      rejectUnknownTokens(toks,1,[/^I?[XY][+-]?\d+(?:\.\d+)?$/],srcI);
      rejectDuplicateFields(toks,1,srcI);
      var _ccixm=u.match(/(?:^|\s)IX([+-]?\d+\.?\d*)/), _cciym=u.match(/(?:^|\s)IY([+-]?\d+\.?\d*)/);
      var _ccxm=u.match(/(?:^|\s)X([+-]?\d+\.?\d*)/), _ccym=u.match(/(?:^|\s)Y([+-]?\d+\.?\d*)/);
      if(!_ccixm&&!_cciym&&!_ccxm&&!_ccym){
        if(valLastX===null||valLastY===null) probs.push({line:srcI,sev:'err',msg:'CC without coordinates requires a preceding tool position'});
        else { valCCX=valLastX; valCCY=valLastY; }
      } else {
        if((_ccixm&&valLastX===null)||(_cciym&&valLastY===null))
          probs.push({line:srcI,sev:'err',msg:'Incremental CC requires a preceding tool position'});
        if(_ccixm&&valLastX!==null) valCCX=valLastX+parseFloat(_ccixm[1]);
        else if(_ccxm) valCCX=parseFloat(_ccxm[1]);
        else if(valCCX===null&&valLastX!==null) valCCX=valLastX;
        if(_cciym&&valLastY!==null) valCCY=valLastY+parseFloat(_cciym[1]);
        else if(_ccym) valCCY=parseFloat(_ccym[1]);
        else if(valCCY===null&&valLastY!==null) valCCY=valLastY;
      }
      lastCC=true; ccLine=srcI; pendingCC=true;

    // ── C arc ──
    } else if(/^C(\s|$)/.test(u)){
      var _cMInfo=analyzeMFunctionTail(toks,1), _cMotionTokens=_cMInfo.motionTokens;
      var _cMotion=_cMotionTokens.join(' '), _cEmbeddedMs=_cMInfo.codes;
      validateMTail(_cMInfo,srcI,'positioning');
      rejectUnknownTokens(_cMotionTokens,1,[/^[XY][+-]?\d+(?:\.\d+)?$/, /^DR[+-]$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/],srcI);
      rejectDuplicateFields(_cMotionTokens,1,srcI);
      validatePositioningFeed(_cMotionTokens,srcI);
      applyValidatorMStart(_cEmbeddedMs);
      if(!lastCC) probs.push({line:srcI,sev:'err',msg:'Circle center undefined \u2014 program CC first'});
      if(_cMotion.indexOf('DR+')<0&&_cMotion.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(/\bRL\b/.test(_cMotion)||/\bRR\b/.test(_cMotion))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      pendingCC=false; lastRcWasArc=true;
      var _cex=_cMotion.match(/X([+-]?\d+\.?\d*)/), _cey=_cMotion.match(/Y([+-]?\d+\.?\d*)/);
      if(!_cex&&!_cey) probs.push({line:srcI,sev:'err',msg:'C block has no end point'});
      var _cEndX=_cex?parseFloat(_cex[1]):valLastX, _cEndY=_cey?parseFloat(_cey[1]):valLastY;
      if(valLastX!==null&&valLastY!==null&&valCCX!==null&&valCCY!==null&&_cEndX!==null&&_cEndY!==null){
        var _cStartR=Math.hypot(valLastX-valCCX,valLastY-valCCY);
        var _cEndR=Math.hypot(_cEndX-valCCX,_cEndY-valCCY);
        if(_cStartR<1e-9||Math.abs(_cStartR-_cEndR)>1e-4)
          probs.push({line:srcI,sev:'err',msg:'C end point is not on the circle defined by the start point and CC'});
      }
      if(_cEndX!==null) valLastX=_cEndX; if(_cEndY!==null) valLastY=_cEndY;
      validateFirstPositioningMove(srcI,!!(_cex||_cey));
      applyValidatorMEnd(_cEmbeddedMs);
      valHasXYTangent=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── CR ──
    } else if(toks[0]==='CR'){
      var _crMInfo=analyzeMFunctionTail(toks,1), _crMotionTokens=_crMInfo.motionTokens;
      var _crMotion=_crMotionTokens.join(' '), _crEmbeddedMs=_crMInfo.codes;
      validateMTail(_crMInfo,srcI,'positioning');
      rejectUnknownTokens(_crMotionTokens,1,[/^[XY][+-]?\d+(?:\.\d+)?$/, /^R[+-]?\d+(?:\.\d+)?$/, /^DR[+-]$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/],srcI);
      rejectDuplicateFields(_crMotionTokens,1,srcI);
      validatePositioningFeed(_crMotionTokens,srcI);
      applyValidatorMStart(_crEmbeddedMs);
      if(!/(?:^|\s)R[+-]?\d/.test(_crMotion)) probs.push({line:srcI,sev:'err',msg:'Circle radius R missing'});
      if(_crMotion.indexOf('DR+')<0&&_crMotion.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(/\bRL\b/.test(_crMotion)||/\bRR\b/.test(_crMotion))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      var _crRm=_crMotion.match(/(?:^|\s)R[+-]?(\d+\.?\d*)/);
      var _crex=_crMotion.match(/X([+-]?\d+\.?\d*)/), _crey=_crMotion.match(/Y([+-]?\d+\.?\d*)/);
      if(!_crex&&!_crey) probs.push({line:srcI,sev:'err',msg:'CR block has no end point'});
      var _crEndX=_crex?parseFloat(_crex[1]):valLastX, _crEndY=_crey?parseFloat(_crey[1]):valLastY;
      if(_crRm&&valLastX!==null&&valLastY!==null&&_crEndX!==null&&_crEndY!==null){
        var _crChord=Math.hypot(_crEndX-valLastX,_crEndY-valLastY), _crRadius=parseFloat(_crRm[1]);
        if(_crRadius<=0||_crChord<1e-9||_crChord>2*_crRadius+1e-6)
          probs.push({line:srcI,sev:'err',msg:'CR geometry is impossible \u2014 end-point chord must be greater than 0 and no longer than 2R'});
      }
      if(_crEndX!==null) valLastX=_crEndX; if(_crEndY!==null) valLastY=_crEndY;
      validateFirstPositioningMove(srcI,!!(_crex||_crey));
      applyValidatorMEnd(_crEmbeddedMs);
      valHasXYTangent=true;
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── CT ──
    } else if(toks[0]==='CT'){
      var _ctMInfo=analyzeMFunctionTail(toks,1), _ctMotionTokens=_ctMInfo.motionTokens;
      var _ctMotion=_ctMotionTokens.join(' '), _ctEmbeddedMs=_ctMInfo.codes;
      validateMTail(_ctMInfo,srcI,'positioning');
      rejectUnknownTokens(_ctMotionTokens,1,[/^[XY][+-]?\d+(?:\.\d+)?$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/],srcI);
      rejectDuplicateFields(_ctMotionTokens,1,srcI);
      validatePositioningFeed(_ctMotionTokens,srcI);
      applyValidatorMStart(_ctEmbeddedMs);
      if(!/X[+-]?\d/.test(_ctMotion)&&!/Y[+-]?\d/.test(_ctMotion))
        probs.push({line:srcI,sev:'warn',msg:'CT block without end point'});
      if(/\bRL\b/.test(_ctMotion)||/\bRR\b/.test(_ctMotion))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. may not begin on an arc \u2014 activate RL/RR on an L block'});
      if(!valHasXYTangent) probs.push({line:srcI,sev:'err',msg:'CT requires a preceding XY contour move to define the tangent'});
      var _ctex=_ctMotion.match(/X([+-]?\d+\.?\d*)/), _ctey=_ctMotion.match(/Y([+-]?\d+\.?\d*)/);
      if(_ctex) valLastX=parseFloat(_ctex[1]); if(_ctey) valLastY=parseFloat(_ctey[1]);
      validateFirstPositioningMove(srcI,!!(_ctex||_ctey));
      applyValidatorMEnd(_ctEmbeddedMs);
      valHasXYTangent=true;
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── LP / CP ──
    } else if(toks[0]==='LP'){
      var _lpMInfo=analyzeMFunctionTail(toks,1), _lpMotionTokens=_lpMInfo.motionTokens;
      var _lpMotion=_lpMotionTokens.join(' '), _lpEmbeddedMs=_lpMInfo.codes;
      validateMTail(_lpMInfo,srcI,'positioning');
      rejectUnknownTokens(_lpMotionTokens,1,[/^PR[+-]?\d+(?:\.\d+)?$/, /^(?:PA|IPA)[+-]?\d+(?:\.\d+)?$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/],srcI);
      rejectDuplicateFields(_lpMotionTokens,1,srcI);
      validatePositioningFeed(_lpMotionTokens,srcI);
      applyValidatorMStart(_lpEmbeddedMs);
      if(!lastCC) probs.push({line:srcI,sev:'err',msg:'Polar origin undefined \u2014 program CC before LP'});
      var _vpr=_lpMotion.match(/(?:^|\s)PR([+-]?\d+\.?\d*)/);
      var _vpa=_lpMotion.match(/(?:^|\s)PA([+-]?\d+\.?\d*)/);
      var _vipa=_lpMotion.match(/(?:^|\s)IPA([+-]?\d+\.?\d*)/);
      if(_vpa&&_vipa) probs.push({line:srcI,sev:'err',msg:'LP may contain PA or IPA, not both'});
      if(!_vpr&&!_vpa&&!_vipa) probs.push({line:srcI,sev:'err',msg:'LP block has no polar end point'});
      if(valCCX!==null&&valCCY!==null){
        var _vcurR=(valLastX!==null&&valLastY!==null)?Math.hypot(valLastX-valCCX,valLastY-valCCY):null;
        var _vcurA=(valLastX!==null&&valLastY!==null)?Math.atan2(valLastY-valCCY,valLastX-valCCX):null;
        var _vResolvedR=_vpr?parseFloat(_vpr[1]):_vcurR;
        var _vResolvedA=_vpa?parseFloat(_vpa[1])*Math.PI/180:(_vipa&&_vcurA!==null?_vcurA+parseFloat(_vipa[1])*Math.PI/180:_vcurA);
        if(_vResolvedR===null) probs.push({line:srcI,sev:'err',msg:'LP without PR requires a preceding polar position'});
        if(_vResolvedA===null) probs.push({line:srcI,sev:'err',msg:'LP without absolute PA requires a preceding polar position'});
        if(_vResolvedR!==null&&_vResolvedA!==null){
          var _voldPX=valLastX,_voldPY=valLastY;
          valLastX=valCCX+_vResolvedR*Math.cos(_vResolvedA);
          valLastY=valCCY+_vResolvedR*Math.sin(_vResolvedA);
          if(_voldPX===null||_voldPY===null||Math.hypot(valLastX-_voldPX,valLastY-_voldPY)>1e-9) valHasXYTangent=true;
        }
      }
      if(_vpr&&parseFloat(_vpr[1])<0) probs.push({line:srcI,sev:'err',msg:'Polar radius PR must not be negative'});
      validateFirstPositioningMove(srcI,!!(_vpr||_vpa||_vipa));
      applyValidatorMEnd(_lpEmbeddedMs);
      if(firstMoveLine<0) firstMoveLine=srcI;
    } else if(toks[0]==='CP'){
      var _cpMInfo=analyzeMFunctionTail(toks,1), _cpMotionTokens=_cpMInfo.motionTokens;
      var _cpMotion=_cpMotionTokens.join(' '), _cpEmbeddedMs=_cpMInfo.codes;
      validateMTail(_cpMInfo,srcI,'positioning');
      rejectUnknownTokens(_cpMotionTokens,1,[/^(?:PA|IPA)[+-]?\d+(?:\.\d+)?$/, /^I?Z[+-]?\d+(?:\.\d+)?$/, /^DR[+-]$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/],srcI);
      rejectDuplicateFields(_cpMotionTokens,1,srcI);
      validatePositioningFeed(_cpMotionTokens,srcI);
      applyValidatorMStart(_cpEmbeddedMs);
      if(!lastCC) probs.push({line:srcI,sev:'err',msg:'Polar origin undefined \u2014 program CC before CP'});
      var _vcpa=_cpMotion.match(/(?:^|\s)PA([+-]?\d+\.?\d*)/), _vcipa=_cpMotion.match(/(?:^|\s)IPA([+-]?\d+\.?\d*)/);
      if(!_vcpa&&!_vcipa) probs.push({line:srcI,sev:'err',msg:'Polar angle PA or IPA missing'});
      if(_vcpa&&_vcipa) probs.push({line:srcI,sev:'err',msg:'CP may contain PA or IPA, not both'});
      if(_cpMotion.indexOf('DR+')<0&&_cpMotion.indexOf('DR-')<0) probs.push({line:srcI,sev:'err',msg:'Rotation direction DR missing'});
      if(_vcipa){
        var _vcipaNum=parseFloat(_vcipa[1]);
        var _vcDr=_cpMotion.indexOf('DR-')>=0?-1:1;
        if(Math.abs(_vcipaNum)<1e-12) probs.push({line:srcI,sev:'err',msg:'Incremental polar angle IPA must be non-zero'});
        else if(_vcipaNum*_vcDr<0) probs.push({line:srcI,sev:'err',msg:'For incremental CP, IPA and DR must have the same sign'});
      }
      if(/\bRL\b/.test(_cpMotion)||/\bRR\b/.test(_cpMotion))
        probs.push({line:srcI,sev:'err',msg:'Radius comp. not permitted on a CP block'});
      if(valCCX!==null&&valCCY!==null&&valLastX!==null&&valLastY!==null&&(_vcpa||_vcipa)){
        var _vcR=Math.hypot(valLastX-valCCX,valLastY-valCCY);
        var _vcA0=Math.atan2(valLastY-valCCY,valLastX-valCCX);
        var _vcA1=_vcpa?parseFloat(_vcpa[1])*Math.PI/180:_vcA0+parseFloat(_vcipa[1])*Math.PI/180;
        valLastX=valCCX+_vcR*Math.cos(_vcA1);
        valLastY=valCCY+_vcR*Math.sin(_vcA1);
        valHasXYTangent=true;
      }
      var _vcpiz=_cpMotion.match(/(?:^|\s)IZ([+-]?\d+\.?\d*)/), _vcpz=_cpMotion.match(/(?:^|\s)Z([+-]?\d+\.?\d*)/);
      if(_vcpiz) valZ=(valZ===null?0:valZ)+parseFloat(_vcpiz[1]);
      else if(_vcpz) valZ=parseFloat(_vcpz[1]);
      validateFirstPositioningMove(srcI,!!(_vcpa||_vcipa||_vcpiz||_vcpz));
      applyValidatorMEnd(_cpEmbeddedMs);
      lastRcWasArc=true;
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── L ──
    } else if(toks[0]==='L'){
      var _li=srcI;
      var _lTokens=u.split(/\s+/);
      var _lMInfo=analyzeMFunctionTail(_lTokens,1), _lMotionTokens=_lMInfo.motionTokens;
      var _lMotion=_lMotionTokens.join(' '), _embeddedMs=_lMInfo.codes;
      validateMTail(_lMInfo,srcI,'positioning');
      var hasAxis=/I?[XYZ][+-]?\d/.test(_lMotion);
      var hasF=/\bF/.test(_lMotion);
      if(/(?:^|\s)I?[ABC](?=[+\-\d\s]|$)/.test(_lMotion))
        probs.push({line:srcI,sev:'err',msg:'Rotary axes A/B/C are not supported by the simulator'});
      rejectUnknownTokens(_lMotionTokens,1,[/^I?[XYZ][+-]?\d+(?:\.\d+)?$/, /^(?:FMAX|FAUTO|F\+?\d+(?:\.\d+)?)$/, /^(?:RL|RR|R0)$/, /^I?[ABC].*$/],srcI);
      rejectDuplicateFields(_lMotionTokens,1,srcI);
      validatePositioningFeed(_lMotionTokens,srcI);
      for(var _lti=1;_lti<_lMotionTokens.length;_lti++){
        var _lt=_lMotionTokens[_lti];
        if(/^I?[XYZABC]/.test(_lt)&&!/^I?[XYZ][+-]?\d+(?:\.\d+)?$/.test(_lt))
          probs.push({line:srcI,sev:'err',msg:'Malformed or unsupported coordinate token "'+_lt+'"'});
      }
      // Known start-of-block spindle functions affect this positioning move.
      // Other M numbers are intentionally accepted without inventing
      // machine-specific simulation semantics for them.
      applyValidatorMStart(_embeddedMs);
      // Z depth vs LCUTS check
      var _zm2=_lMotion.match(/\bZ([+-]?\d+\.?\d*)/);
      if(_zm2){ var _nz=parseFloat(_zm2[1]); if(valSurfZ!==null && _nz<valSurfZ) valZ=_nz; }
      if(!hasAxis&&!hasF)
        probs.push({line:srcI,sev:'warn',msg:'Empty L block \u2014 program X, Y, Z or F'});
      if(/\bFMAX\b/.test(_lMotion)&&(valRcState==='RL'||valRcState==='RR')&&!/\bR0\b/.test(_lMotion))
        probs.push({line:srcI,sev:'warn',msg:'FMAX with active radius comp. \u2014 program a feed rate for cutting'});
      // Evaluate each coordinate independently: a signed Y must not hide an
      // unsigned X in the same block.
      for(var _signI=1;_signI<_lMotionTokens.length;_signI++){
        if(/^I?[XYZ]\d/.test(_lMotionTokens[_signI])){
          probs.push({line:srcI,sev:'warn',msg:'Sign missing in '+_lMotionTokens[_signI]+' \u2014 TNC coordinates require + or -'});
          break;
        }
      }
      validateFirstPositioningMove(srcI,hasAxis);
      // M5 takes effect at the end of the block, after the move above.
      applyValidatorMEnd(_embeddedMs);
      // RL/RR tracking
      if(/\bRL\b/.test(_lMotion)){
        if(valRcState==='RR') probs.push({line:srcI,sev:'err',msg:'Change of radius comp. RR \u2192 RL \u2014 cancel with R0 first'});
        valRcState='RL'; valRcLine=srcI; lastRcWasArc=false;
      } else if(/\bRR\b/.test(_lMotion)){
        if(valRcState==='RL') probs.push({line:srcI,sev:'err',msg:'Change of radius comp. RL \u2192 RR \u2014 cancel with R0 first'});
        valRcState='RR'; valRcLine=srcI; lastRcWasArc=false;
      } else if(/\bR0\b/.test(_lMotion)){
        valRcState=''; valRcLine=-1;
      }
      // Zero-XY-displacement check while comp is active — a pure Z (plunge) move
      // under RL/RR has no lateral edge to offset against. This used to freeze
      // the simulator (infinite loop in applyRadiusComp/offsetRun); that's now
      // fixed defensively, but it's still not valid Heidenhain practice, so flag it.
      var _isIX4=/(?:^|\s)IX/.test(_lMotion), _isIY4=/(?:^|\s)IY/.test(_lMotion);
      var _xm4=_lMotion.match(/(?:^|\s)I?X([+-]?\d+\.?\d*)/), _ym4=_lMotion.match(/(?:^|\s)I?Y([+-]?\d+\.?\d*)/);
      var _oldVX4=valLastX, _oldVY4=valLastY;
      var _newVX4 = _xm4 ? (_isIX4 && valLastX!==null ? valLastX+parseFloat(_xm4[1]) : parseFloat(_xm4[1])) : valLastX;
      var _newVY4 = _ym4 ? (_isIY4 && valLastY!==null ? valLastY+parseFloat(_ym4[1]) : parseFloat(_ym4[1])) : valLastY;
      if(_oldVX4!==null&&_oldVY4!==null&&_newVX4!==null&&_newVY4!==null&&
         Math.hypot(_newVX4-_oldVX4,_newVY4-_oldVY4)>1e-9) valHasXYTangent=true;
      if((valRcState==='RL'||valRcState==='RR') && _oldVX4!==null && _oldVY4!==null && _newVX4!==null && _newVY4!==null){
        if(Math.abs(_newVX4-_oldVX4)<1e-6 && Math.abs(_newVY4-_oldVY4)<1e-6)
          probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' on a pure Z move \u2014 comp needs XY motion'});
      }
      valLastX=_newVX4; valLastY=_newVY4;
      if(!isNaN(parseFloat((_lMotion.match(/\bF\+?(\d+\.?\d*)/)||[])[1]))) {
        var _fv=parseFloat((_lMotion.match(/\bF\+?(\d+\.?\d*)/)||[0,0])[1]);
        if(_fv>100000) probs.push({line:srcI,sev:'warn',msg:'Feed rate F'+_fv+' exceeds 100000 mm/min'});
      }
      var _coords=(_lMotion.matchAll?Array.from(_lMotion.matchAll(/[XYZ]([+-]?\d+\.?\d*)/g)):(function(){var r=[],m,re=/[XYZ]([+-]?\d+\.?\d*)/g;while((m=re.exec(_lMotion)))r.push(m);return r;})());
      _coords.forEach(function(mc){var v=parseFloat(mc[1]);if(Math.abs(v)>10000) probs.push({line:srcI,sev:'warn',msg:'Coordinate '+mc[0]+' exceeds \xb110000 mm limit'});});
      if(firstMoveLine<0) firstMoveLine=srcI;

    // ── RND ──
    } else if(toks[0]==='RND'){
      if(!/^RND\s+R\+?\d+(?:\.\d+)?$/.test(u)) probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: RND R<positive radius>'});
      else{
        var _rndRm=u.match(/R[+-]?(\d+\.?\d*)/);
        if(_rndRm){
          if(parseFloat(_rndRm[1])<=0) probs.push({line:srcI,sev:'err',msg:'Rounding radius must be greater than 0'});
        }
      }

    // ── CHF ──
    } else if(toks[0]==='CHF'){
      var _chfm=u.match(/^CHF\s+\+?(\d+(?:\.\d+)?)$/);
      if(!_chfm||parseFloat(_chfm[1])<=0) probs.push({line:srcI,sev:'err',msg:'Chamfer length must be greater than 0'});

    // ── CYCL DEF ──
    } else if(u.indexOf('CYCL DEF')===0){
      var _cnum=u.match(/CYCL\s+DEF\s+(\d+)/);
      var _supportedCycle=_cnum&&['200','201','208','209'].indexOf(_cnum[1])>=0;
      if(!_cnum) probs.push({line:srcI,sev:'err',msg:'Faulty block \u2014 expected: CYCL DEF <number>'});
      else if(!_supportedCycle) probs.push({line:srcI,sev:'err',msg:'CYCL DEF '+_cnum[1]+' is not supported by the simulator (supported: 200, 201, 208, 209)'});
      var _qd=u.match(/Q200\s*=\s*([+-]?[\d.]+)/); if(_qd&&parseFloat(_qd[1])<0) probs.push({line:srcI,sev:'warn',msg:'Q200 (safety clearance) must be >= 0'});
      var _qd2=u.match(/Q201\s*=\s*([+-]?[\d.]+)/); if(_qd2&&parseFloat(_qd2[1])>0) probs.push({line:srcI,sev:'err',msg:'Q201 depth must be negative (below surface) — the cycle will not cut'});
      var _qd3=u.match(/Q335\s*=\s*([+-]?[\d.]+)/); if(_qd3&&parseFloat(_qd3[1])<=0) probs.push({line:srcI,sev:'err',msg:'Q335 bore diameter must be greater than 0'});
      var _qd4=u.match(/Q206\s*=\s*(\d+)/); if(_qd4&&parseFloat(_qd4[1])===0) probs.push({line:srcI,sev:'err',msg:'Q206 feed rate may not be 0'});
      hasCycleDef=!!_supportedCycle; lastCycleLine=srcI; activeCycleDef=!!_supportedCycle;
      valCycleQ={}; valCycleQSeen={}; valCycleLine=srcI; valCycleNum=_cnum?parseInt(_cnum[1]):0; valInCycle=true;
      var _inlineQRe=/Q(\d+)\s*=\s*(.*?)(?=\s+Q\d+\s*=|$)/ig, _inlineQm;
      while((_inlineQm=_inlineQRe.exec(u))){
        var _inlineExpr=_inlineQm[2].trim();
        if(/^FAUTO$/i.test(_inlineExpr)) recordCycleQ('Q'+_inlineQm[1],'FAUTO',srcI);
        else if(/^FMAX$/i.test(_inlineExpr)) probs.push({line:srcI,sev:'err',msg:'FMAX is not supported as a cycle Q value'});
        else {
          var _inlineInspection=inspectQExpr(_inlineExpr,qVarsVal);
          if(!_inlineInspection.ok) probs.push({line:srcI,sev:'err',msg:'Q'+_inlineQm[1]+': '+_inlineInspection.msg});
          else recordCycleQ('Q'+_inlineQm[1],_inlineInspection.value,srcI);
        }
      }

    // ── Q inside CYCL DEF ──
    } else if(/^\s*Q\d+/.test(u) && valInCycle){
      var qpm=u.match(/^Q(\d+)\s*(?:=\s*)?(.+)$/i);
      if(!qpm) probs.push({line:srcI,sev:'err',msg:'Faulty cycle parameter \u2014 expected: Q<number>=<value>'});
      else if(/^FAUTO$/i.test(qpm[2].trim())) recordCycleQ('Q'+qpm[1],'FAUTO',srcI);
      else if(/^FMAX$/i.test(qpm[2].trim())) probs.push({line:srcI,sev:'err',msg:'FMAX is not supported as a cycle Q value'});
      else {
        var _cycleInspection=inspectQExpr(qpm[2],qVarsVal);
        if(!_cycleInspection.ok) probs.push({line:srcI,sev:'err',msg:'Q'+qpm[1]+': '+_cycleInspection.msg});
        else recordCycleQ('Q'+qpm[1],_cycleInspection.value,srcI);
      }

    // ── CYCL CALL ──
    } else if(u.indexOf('CYCL CALL')===0){
      if(u!=='CYCL CALL') probs.push({line:srcI,sev:'err',msg:'Unsupported tokens after CYCL CALL'});
      if(!hasCycleDef) probs.push({line:srcI,sev:'err',msg:'No cycle defined \u2014 CYCL DEF missing before CYCL CALL'});
      if(valRcState==='RL'||valRcState==='RR')
        probs.push({line:srcI,sev:'err',msg:'Radius comp. '+valRcState+' active \u2014 program R0 before CYCL CALL'});
      if(valCycleNum===209 && !(valSpindleS>0))
        probs.push({line:srcI,sev:'err',msg:'CYCL 209 requires a positive S on the current TOOL CALL'});

    // ── M functions ──
    } else if(/^M\d+/.test(u)){
      var _standaloneMInfo=analyzeMFunctionTail(toks,0);
      validateMTail(_standaloneMInfo,srcI,'standalone');
      applyValidatorMStart(_standaloneMInfo.codes);
      applyValidatorMEnd(_standaloneMInfo.codes);

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
    } else {
      probs.push({line:srcI,sev:'err',msg:'Block is not supported by the simulator: '+u});
    }
  }

  // Final checks
  if(!hasBegin) probs.push({line:0,sev:'err',msg:'BEGIN PGM missing'});
  if(!hasEnd)   probs.push({line:lines.length-1,sev:'err',msg:'END PGM missing'});
  if(!hasToolCall&&hasBegin) probs.push({line:firstMoveLine>0?firstMoveLine:1,sev:'warn',msg:'No TOOL CALL programmed'});
  // No BLK FORM is a supported toolpath-only mode. Warn only when the box
  // definition is genuinely half-finished.
  if(hasBlk1!==hasBlk2) probs.push({line:0,sev:'warn',msg:'BLK FORM incomplete'});
  if(_cylPending) probs.push({line:lines.length-1,sev:'err',msg:'BLK FORM CYLINDER is missing its 0.2 radius/top block'});
  if((valRcState==='RL'||valRcState==='RR') && !liveEdit) probs.push({line:valRcLine,sev:'err',msg:'Radius comp. '+valRcState+' still active at END PGM \u2014 cancel with R0'});

  return probs;
}

// Keep diagnostics produced only while constructing the real toolpath (for
// example a geometrically unfit compensated corner) on the parse result.  The
// optional legacy global is mirrored for the existing VM regression harnesses;
// browser UI code reads result.problems and never depends on that global.
function pushParseProblem(list, problem){
  if(list) list.push(problem);
  if(typeof probs !== 'undefined' && probs !== list) probs.push(problem);
}

function parseProgram(code){
  // Normalize: replace commas with dots in decimal numbers (0,5 → 0.5)
  code = code.replace(/(\d),(\d)/g, '$1.$2');
  // Strip leading block numbers from real exported .H files (see validateProgram).
  code = code.replace(/^[ \t]*\d+[ \t]+/gm, '');
  
  var lines = code.split('\n');
  var parseProblems = [];
  var blkMin = {x:0,y:0,z:0};
  var blkMax = {x:100,y:80,z:40};
  var blkCyl = null; // {cx, cy, r, zMin, zMax} if cylindrical blank
  _WORKPIECE_TOP_Z = 0;
  var hasBlkDefinition = false;
  var boxMinComplete = false, boxMaxComplete = false;
  var ccx=null, ccy=null;
  var feed = DEFAULT_FEED;
  lastDefinedFeed = DEFAULT_FEED;
  // FAUTO in the supported fixed cycles follows the feed from the current
  // TOOL CALL. Keep it separate from the ordinary modal feed, which later L/C
  // blocks are allowed to change without redefining the tool's automatic feed.
  var toolCallFeed = DEFAULT_FEED;
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
  var spindleS = 0; // spindle speed from the CURRENT TOOL CALL S...
  var spindleOn = false;  // M3/M4 = true, M5 = false
  var spindleDir = 0;     // +1=M3/M13, -1=M4/M14, 0=stopped/not selected
  var activeThreadHand = 0; // +1 right-hand, -1 left-hand during CYCL 209
  var coolantOn = false;  // M7/M8 = true, M9 = false
  var qVars = {};         // Q parameter values {1:50, 2:30, ...}
  var pendingDefTool = 0; // tool number from TOOL DEF
  var activeCycle = null; // current radius compensation: '', 'RL', 'RR', 'R0'
  // TOOL CALL is illegal while RL/RR is active. Once encountered, suppress
  // subsequent compensated motion until an explicit R0 instead of silently
  // drawing a plausible nominal path with the new tool.
  var radiusCompBlocked = false;
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

  function embeddedMCodes(lineText){
    return (String(lineText||'').match(/\bM\d+\b/g)||[]).map(function(m){ return m.toUpperCase(); });
  }

  function beginPositioningFeed(blockText){
    var prior=feed;
    var rapid=/\bFMAX\b/.test(blockText);
    var automatic=/\bFAUTO\b/.test(blockText);
    var numeric=blockText.match(/\bF\+?(\d+(?:\.\d+)?)/);
    if(automatic) feed=toolCallFeed;
    else if(rapid) feed=9999;
    else if(numeric) feed=parseFloat(numeric[1]);
    if(!rapid&&!isNaN(feed)&&feed<9000) lastDefinedFeed=feed;
    return {prior:prior,rapid:rapid};
  }

  function endPositioningFeed(state){
    if(state&&state.rapid) feed=state.prior;
  }

  function applyKnownMStart(codes){
    for(var msi=0;msi<codes.length;msi++){
      if(codes[msi]==='M3'||codes[msi]==='M13'){ spindleOn=true; spindleDir=1; }
      else if(codes[msi]==='M4'||codes[msi]==='M14'){ spindleOn=true; spindleDir=-1; }
      if(codes[msi]==='M7'||codes[msi]==='M8'||codes[msi]==='M13'||codes[msi]==='M14')
        coolantOn=true;
    }
  }

  function applyKnownMEnd(codes){
    for(var mei=0;mei<codes.length;mei++){
      if(codes[mei]==='M0'||codes[mei]==='M2'||codes[mei]==='M30'){
        spindleOn=false; spindleDir=0; coolantOn=false;
      }
      else if(codes[mei]==='M5'||codes[mei]==='M6'){ spindleOn=false; spindleDir=0; }
      else if(codes[mei]==='M9') coolantOn=false;
    }
  }

  function cycleCallForMCodes(codes){
    var hasM89=codes.indexOf('M89')>=0, hasM99=codes.indexOf('M99')>=0;
    if(hasM89) modalCycleCall=true;
    var callCycle=hasM89||hasM99||modalCycleCall;
    if(hasM99) modalCycleCall=false;
    return callCycle;
  }

  function finishMControlBlock(codes,srcLine){
    var stop=codes.some(function(m){ return /^(?:M0|M2|M6|M30)$/.test(m); });
    if(stop){
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},
        rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLine,
        rc:'',spindleOn:spindleOn,spindleDir:spindleDir,coolantOn:coolantOn,
        toolNum:toolNum,isMseg:true,stop:true});
      blockIndex++;
    }
    return codes.indexOf('M2')>=0||codes.indexOf('M30')>=0;
  }

  // first pass for BLK FORM so start Z is correct
  for(var p=0;p<lines.length;p++){
    var lu = lines[p].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(lu.indexOf('BLK FORM CYLINDER')===0){
      hasBlkDefinition = true;
      // CYL: 0.1 has center X Y and Z min; 0.2 has radius (X=Y=R) and Z max
      var cx=lu.match(/X([+-]?\d+\.?\d*)/),cy=lu.match(/Y([+-]?\d+\.?\d*)/),cz=lu.match(/Z([+-]?\d+\.?\d*)/);
      if(cx&&cy&&cz){
        var r=0; // radius comes from 0.2 line, read below
        blkMin.x=parseFloat(cx[1]); blkMin.y=parseFloat(cy[1]); blkMin.z=parseFloat(cz[1]);
      }
    } else if(lu.indexOf('BLK FORM 0.1')===0){
      hasBlkDefinition = true;
      var x1=lu.match(/X([+-]?\d+\.?\d*)/),y1=lu.match(/Y([+-]?\d+\.?\d*)/),z1=lu.match(/Z([+-]?\d+\.?\d*)/);
      boxMinComplete = !!(x1&&y1&&z1);
      if(x1)blkMin.x=parseFloat(x1[1]); if(y1)blkMin.y=parseFloat(y1[1]); if(z1)blkMin.z=parseFloat(z1[1]);
    } else if(lu.indexOf('BLK FORM 0.2')===0){
      hasBlkDefinition = true;
      var x2=lu.match(/X([+-]?\d+\.?\d*)/),y2=lu.match(/Y([+-]?\d+\.?\d*)/),z2=lu.match(/Z([+-]?\d+\.?\d*)/);
      boxMaxComplete = !!(x2&&y2&&z2);
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
  var zeroBox = boxMinComplete&&boxMaxComplete&&blkMin.x===0&&blkMin.y===0&&blkMin.z===0&&blkMax.x===0&&blkMax.y===0&&blkMax.z===0;
  var hasStock = hasBlkDefinition&&!zeroBox&&(blkMax.x>blkMin.x)&&(blkMax.y>blkMin.y)&&(blkMax.z>blkMin.z);
  pos = {x:blkMin.x, y:blkMax.y, z:blkMax.z + 50}; // home: back-left corner, above block
  // push initial home position as virtual start
  sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:pos.x,y:pos.y,z:pos.z}, rapid:true, feed:DEFAULT_FEED, len:0.001, blockIndex:0, srcLine:0, rc:''});

  var contourGeomSeq=0;

  function pointCopy(p){ return {x:p.x,y:p.y,z:p.z}; }

  function lineGeom(from,to,srcLine,kind){
    return {id:++contourGeomSeq,type:'line',kind:kind||'L',srcLine:srcLine,
      from:pointCopy(from),to:pointCopy(to)};
  }

  function arcGeom(from,to,cx,cy,r,a0,sweep,srcLine,kind){
    return {id:++contourGeomSeq,type:'arc',kind:kind||'C',srcLine:srcLine,
      from:pointCopy(from),to:pointCopy(to),cx:cx,cy:cy,r:r,a0:a0,sweep:sweep};
  }

  function pushSeg(to, rapid, srcLine, rc, safeRetract, ensureVisible, rcActivation, rcGeom){
    var from = {x:pos.x,y:pos.y,z:pos.z};
    if((rc||'') === 'R0') radiusCompBlocked = false;
    if(radiusCompBlocked){
      pos = {x:to.x,y:to.y,z:to.z};
      return;
    }
    var dx=to.x-from.x, dy=to.y-from.y, dz=to.z-from.z;
    var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(len > 1e-6){
      sub.push({from:from, to:{x:to.x,y:to.y,z:to.z}, rapid:rapid, feed:feed, spindleS:spindleS, spindleOn:spindleOn, spindleDir:spindleDir, threadHand:activeThreadHand, coolantOn:coolantOn, len:len, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', toolNum:toolNum, pendingDef:pendingDefTool, safeRetract:!!safeRetract, ensureVisible:!!ensureVisible, rcActivation:!!rcActivation, rcGeom:rcGeom||null, dlPgm:curDLpgm, drPgm:curDRpgm});
    }
    pos = {x:to.x,y:to.y,z:to.z};
  }

  function pushContourLine(to,rapid,srcLine,rc,rcActivation,kind){
    var geom=lineGeom(pos,to,srcLine,kind||'L');
    pushSeg(to,rapid,srcLine,rc,false,false,rcActivation,geom);
    return geom;
  }

  function pushContourArc(geom,rapid,srcLine,rc,maxStep){
    var steps=Math.max(8,Math.ceil(Math.abs(geom.sweep)/(maxStep||Math.PI/32)));
    for(var ai=1;ai<=steps;ai++){
      var t=ai/steps, ang=geom.a0+geom.sweep*t;
      var target={x:geom.cx+geom.r*Math.cos(ang),y:geom.cy+geom.r*Math.sin(ang),z:geom.from.z+(geom.to.z-geom.from.z)*t};
      if(ai===steps) target=pointCopy(geom.to);
      pushSeg(target,rapid,srcLine,rc,false,false,false,geom);
    }
  }

  function pushCycleEvent(kind, value, srcLine, rc, phase){
    sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:pos.x,y:pos.y,z:pos.z},
      rapid:true, feed:feed, spindleS:spindleS, spindleOn:spindleOn,
      spindleDir:spindleDir, coolantOn:coolantOn, len:0.001,
      blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', toolNum:toolNum,
      dlPgm:curDLpgm, drPgm:curDRpgm, cycleEvent:kind,
      cyclePhase:phase||'',
      dwellSeconds:kind==='dwell'?Math.max(0, Number(value)||0):0,
      eventValue:value});
  }

  // --- expand LBL/CALL LBL (shared helper) ---
  var expandedProg = expandLblLines(lines, parseProblems);
  // --- end LBL expansion ---

  var pendingMoves=[];

  function executeCycle(cy, srcLine, rc){
    if(radiusCompBlocked) return;
    // ── Shared numeric & safety extraction for all four supported cycles ──
    // Zero is a valid Q value (NOTES rule #2): read Q200/Q203/Q204 clearances
    // and Q201 depth uniformly, never folding an explicit 0 into a default.
    var surfZ  = cycleQ(cy, 203, 0);
    var q200   = cycleQ(cy, 200, 2);
    var q204   = cycleQ(cy, 204, 50);
    var q201   = cycleQ(cy, 201, cy.type===200 ? -20 : -10);
    var safeZ  = surfZ + q200;
    var safe2Z = surfZ + q204;
    if(q200 < 0 || q204 < 0){
      pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL '+cy.type+': Q200 and Q204 safety clearances must be >= 0 — no cycle path generated'});
      return;
    }
    // A2: a positive programmed depth drives the tool the wrong way on a real
    // control (actual behavior depends on machine parameter displayDepthErr).
    // The safe simulator baseline is a validation error and NO cutting path —
    // never a silent sign flip (no Math.abs, no depth = -depth).
    if(typeof q201 === 'number' && q201 > 0){
      pushParseProblem(parseProblems, {line:srcLine, sev:'err',
        msg:'CYCL '+cy.type+': Q201 depth must be negative (below surface); got +'+q201+' — no cutting path generated'});
      return;
    }
    // HEIDENHAIN: Q201=0 means the cycle is not executed. Do not even emit
    // approach/retract feed segments that could be mistaken for a cycle run.
    if(q201 === 0) return;
    var depth  = q201;            // <= 0  (A1: exactly 0 => no sub-surface motion)
    var depthZ = surfZ + depth;
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
      var pFeed  = (cy.Q206==='FAUTO') ? toolCallFeed : cycleQ(cy, 206, 150);
      if(!(pFeed > 0) || cycleQ(cy, 202, 0) < 0 || cycleQ(cy, 210, 0) < 0 || cycleQ(cy, 211, 0) < 0){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 200: Q206 must be > 0 and Q202/Q210/Q211 must be >= 0 — no cutting path generated'});
        return;
      }
      var dwellTop = Math.max(0, cycleQ(cy, 210, 0));
      var dwellDepth = Math.max(0, cycleQ(cy, 211, 0));
      // Q395=1 defines Q201 at the cylindrical part of a pointed drill. The
      // tool tip therefore travels deeper by the drill-point length.
      var depthRef = cycleQ(cy, 395, 0);
      if(depthRef !== 0 && depthRef !== 1){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 200: Q395 depth reference must be 0 or 1 — no cutting path generated'});
        return;
      }
      if(depthRef === 1){
        var _drillTool = getToolByNum(toolNum);
        var _tipAngle = _drillTool ? Number(_drillTool.T_ANGLE) : 0;
        if(_tipAngle > 0 && _tipAngle < 180){
          var _physicalR = Math.max(0, Number(_drillTool.R)||0);
          depth -= _physicalR / Math.tan(_tipAngle*Math.PI/360);
          depthZ = surfZ + depth;
        } else {
          pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 200: Q395=1 requires a valid tool-table T-ANGLE (0...180 deg) — no cutting path generated'});
          return;
        }
      }
      var peck = (cy.Q202 !== undefined && cy.Q202 > 0) ? cy.Q202 : Math.abs(depth);
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
        if(dwellDepth > 0) pushCycleEvent('dwell', dwellDepth, srcLine, rc, 'depth');
        pecked = nextPeck;

        if(pecked < Math.abs(depth) - 1e-6){
          // Not final depth — retract to safeZ for chip removal
          feed = 9999;
          pushSeg({x:cx2, y:cy2a, z:safeZ}, true, srcLine, rc, true, true);
          if(dwellTop > 0) pushCycleEvent('dwell', dwellTop, srcLine, rc, 'top');
          // Rapid back into the pre-drilled hole to Q200 above the previous
          // infeed depth (advanced stop distance), capped at the safe plane.
          pushSeg({x:cx2, y:cy2a, z:Math.min(safeZ, surfZ - pecked + q200)}, true, srcLine, rc, true, true);
          feed = pFeed;
        }
      }

      // 3. Retract to safeZ (rapid)
      feed = 9999;
      pushSeg({x:cx2, y:cy2a, z:safeZ}, true, srcLine, rc, true, true);

      // 4. Retract to 2nd safety clearance (rapid) — only when it is actually
      //    HIGHER than the first clearance. A3: an explicit Q204=0 (or any value
      //    that lands at/below safeZ) must never trigger a default nor a final
      //    rapid back DOWN toward the part.
      if(safe2Z > safeZ + 1e-6) pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);

      feed = oldFeed;
    }
    else if(cy.type===208){
      /*
       * CYCL DEF 208 — Bore Milling (Heidenhain)
       *
       * Path model (matches the real control):
       *  - The whole cycle path is driven by ONE effective compensation radius
       *    effR = R(table) + DR(table) + DR(TOOL CALL). It drives BOTH the final
       *    wall path AND the radial stepover, so a programmed DR can never make
       *    the two disagree (A4). The physical voxel shape in vxCut stays
       *    table-only, so DR never inflates the mesh.
       *  - Each radial ring is entered from the bore centre on a semicircle at
       *    safeZ, descends as a constant-radius helix (<= Q334 per turn),
       *    finishes with a full circle at depth, then returns to the centre at
       *    working depth and only THEN retracts vertically at the centre (A5).
       */
      var pFeed  = (cy.Q206==='FAUTO') ? toolCallFeed : cycleQ(cy, 206, 150);
      if(!(pFeed > 0) || cycleQ(cy, 334, 0) < 0){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: Q206 must be > 0 and Q334 must be >= 0 — no cutting path generated'});
        return;
      }
      var rFeed  = 9999;
      // Q334 = max Z descent per full 360° helix (0 → whole depth in one turn).
      var zStep  = (cy.Q334 !== undefined && cy.Q334 > 0) ? cy.Q334 : Number.POSITIVE_INFINITY;
      // TNC 640 Cycle 208: Q370=0 lets the control distribute the paths
      // automatically; a positive Q370 multiplied by the active tool radius is
      // the radial stepover factor k. Values between 0 and 0.1 are not valid.
      var q370 = cycleQ(cy, 370, 0);
      if(!isFinite(q370) || q370 < 0 || (q370 > 0 && q370 < 0.1) || q370 > 1999){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: Q370 path overlap must be 0 or within 0.1...1999 — no cutting path generated'});
        return;
      }
      var q351 = cycleQ(cy, 351, 1);
      if(q351 !== -1 && q351 !== 0 && q351 !== 1){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: Q351 must be -1, 0, or +1 — no cutting path generated'});
        return;
      }
      // Q351 selects climb/conventional milling. M4 reverses the physical
      // spindle direction, so the XY helix direction must reverse as well.
      var dir = (q351 === -1 ? -1 : 1) * (spindleDir === -1 ? -1 : 1);
      var cx2 = pos.x, cy2 = pos.y;
      var N_arc = 32;               // segments per revolution
      var oldFeed = feed;

      // Effective compensation radius (path only — see effectiveCompRadius).
      var _ct208 = getToolByNum(toolNum);
      var effR = effectiveCompRadius(_ct208, curDRpgm);
      var maxPlungeAngle = _ct208 ? Number(_ct208.ANGLE)||0 : 0;
      var cornerR208 = _ct208 ? Math.max(0, (Number(_ct208.R2)||0) + (Number(_ct208.DR2)||0)) : 0;
      // A non-positive effective radius is an invalid tool/allowance combination
      // — validate explicitly instead of clamping it up to some minimum.
      if(!(effR > 0)){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err',
          msg:'CYCL 208: effective tool radius (R+DR) is '+effR.toFixed(3)+'mm — must be > 0'});
        feed = oldFeed;
      } else {
        var boreDia = cycleQ(cy, 335, 0);
        var preDia  = cycleQ(cy, 342, 0);
        var boreR   = boreDia / 2;
        var mR      = boreR - effR;            // outermost wall-path radius
        var _tol    = Math.max(1e-4, effR * 1e-3);
        var _geomEps = 1e-6;
        var totalZ  = Math.abs(depthZ - safeZ);

        if(!(boreDia > 0)){
          pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: Q335 nominal diameter must be > 0 — no cutting path generated'});
          feed = oldFeed;
          return;
        }
        if(preDia < 0 || preDia > boreDia + _geomEps){
          pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: Q342 pre-drilled diameter must be between 0 and Q335 — no cutting path generated'});
          feed = oldFeed;
          return;
        }
        if(mR < -_geomEps){
          pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: effective tool diameter exceeds Q335 nominal diameter — no cutting path generated'});
          feed = oldFeed;
          return;
        }
        // Older TNC 640 documentation limits solid machining without Q342 when
        // the nominal diameter exceeds twice the tool diameter. The 2021
        // baseline documents repeated radial paths, so simulate them but expose
        // the version-dependent restriction instead of silently claiming it is
        // accepted by every control generation.
        if(preDia === 0 && boreDia > 4*effR + _tol){
          pushParseProblem(parseProblems, {line:srcLine, sev:'warn', msg:'CYCL 208: Q342=0 with Q335 greater than twice the effective tool diameter is control-version dependent (older TNC 640 manuals reject it)'});
        }

        // One constant-radius helix ring: semicircle entry from the centre →
        // helix to depth → finishing circle → return to centre at depth →
        // vertical retract at the centre (A5). Leaves pos centred at safeZ.
        var boreRing = function(curR){
          feed = pFeed;
          // Tool-table ANGLE limits Q334. DR2 reduces the usable radial cutting
          // width and therefore tightens the permissible plunge without using
          // an arbitrary minimum radius.
          var ringStep = zStep;
          var radialWidthForAngle = effR-cornerR208;
          if(maxPlungeAngle > 0 && maxPlungeAngle < 90){
            var plungeRadius = curR * radialWidthForAngle / effR;
            var angleStep = 2*Math.PI*plungeRadius*Math.tan(maxPlungeAngle*Math.PI/180);
            if(angleStep > 0) ringStep = Math.min(ringStep, angleStep);
          }
          var numRevs = Math.max(1, Math.ceil(totalZ / ringStep));
          if(numRevs > 2000){
            pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: '+numRevs+' helix revolutions exceed the supported safety limit — check ANGLE/DR2/Q334'});
            return false;
          }
          // semicircle entry from centre to (cx2+curR, cy2) at safeZ
          for(var ap=1; ap<=N_arc/2; ap++){
            var aa = Math.PI + dir*Math.PI*ap/(N_arc/2);
            pushSeg({x:cx2 + curR/2 + (curR/2)*Math.cos(aa), y:cy2 + (curR/2)*Math.sin(aa), z:safeZ}, false, srcLine, rc);
          }
          // constant-radius helical descent (<= Q334 per revolution)
          var zPerRev = totalZ / numRevs;
          var zCur = safeZ;
          for(var rev=0; rev<numRevs; rev++){
            var zEnd = (rev === numRevs-1) ? depthZ : (safeZ - (rev+1)*zPerRev);
            for(var k=1; k<=N_arc; k++){
              var a = dir * 2*Math.PI * k/N_arc;
              var zAt = zCur + (zEnd - zCur) * k/N_arc;
              pushSeg({x:cx2 + curR*Math.cos(a), y:cy2 + curR*Math.sin(a), z:zAt}, false, srcLine, rc);
            }
            zCur = zEnd;
          }
          // finishing circle at full depth
          for(var k=1; k<=N_arc; k++){
            var a = dir * 2*Math.PI * k/N_arc;
            pushSeg({x:cx2 + curR*Math.cos(a), y:cy2 + curR*Math.sin(a), z:depthZ}, false, srcLine, rc);
          }
          // A5: return XY to the centre at working depth, THEN a vertical
          // retract at the centre (rapid, held for a visible frame).
          pushSeg({x:cx2, y:cy2, z:depthZ}, false, srcLine, rc);
          pushSeg({x:cx2, y:cy2, z:safeZ}, true, srcLine, rc, true, true);
          return true;
        };

        // ── 1. Rapid to safeZ above centre ─────────────────────────────
        feed = rFeed;
        sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2,z:safeZ},
          rapid:true, feed:rFeed, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn,
          len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001,
          blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', toolNum:toolNum, safeRetract:true});
        pos={x:cx2, y:cy2, z:safeZ};

        if(Math.abs(mR) <= _geomEps){
          // Direct plunge is valid only when Q335 matches the effective tool
          // diameter and the Tool Table marks center-cutting teeth (RCUTS).
          if(!(_ct208 && Number(_ct208.RCUTS)>0)){
            pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: direct boring requires RCUTS > 0 (center-cutting tool) — no cutting path generated'});
            feed = oldFeed;
            return;
          }
          feed = pFeed;
          pushSeg({x:cx2, y:cy2, z:depthZ}, false, srcLine, rc);
          pushSeg({x:cx2, y:cy2, z:safeZ}, true, srcLine, rc, true, true);
        } else {
          // Build evenly spaced rings from the innermost workable radius out to
          // the wall. For Q370>0 the documented stepover is Q370 times the
          // active radius. Q370=0 keeps the automatic distribution, where DR2
          // reduces the usable radial cutting width. The range is divided into
          // equal steps so there is never a near-zero final pass.
          var radialStep = q370 > 0 ? q370*effR : effR-cornerR208;
          if(!(radialStep > _tol)){
            pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 208: effective corner radius DR2 leaves no supported radial cutting width — full-radius overlap is not modeled; no cutting path generated'});
            feed = oldFeed;
            return;
          }
          var innerStart = (preDia > 0) ? Math.max(0, Math.min(mR, preDia/2 - effR)) : 0;
          var range = mR - innerStart;
          var nSteps = range <= _tol ? 1 : Math.max(1, Math.ceil(range / radialStep));
          // Hard guard against an unbounded pass count. With a correct effR this
          // never triggers; it is a safety net, not a substitute for geometry.
          if(nSteps > 2000){
            pushParseProblem(parseProblems, {line:srcLine, sev:'err',
              msg:'CYCL 208: '+nSteps+' radial passes for Ø'+boreDia+' with effective radius '+effR.toFixed(3)+'mm — aborted (check R/DR/Q335)'});
            nSteps = 0;
          }
          var step = range / Math.max(1, nSteps);
          for(var i=1; i<=nSteps; i++){
            if(!boreRing(range <= _tol ? mR : innerStart + i*step)) break; // innermost first
          }
        }

        // ── Final 2nd clearance ─────────────────────────────────────────
        // pos is already centred at safeZ. A3/A5: only rise to the 2nd
        // clearance when it is actually higher, never a rapid back down.
        if(safe2Z > safeZ + 1e-6){ feed = rFeed; pushSeg({x:cx2, y:cy2, z:safe2Z}, true, srcLine, rc); }

        feed = oldFeed;
      }
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
      var reamF  = (cy.Q206==='FAUTO') ? toolCallFeed : cycleQ(cy, 206, 100);
      var retF   = (cy.Q208 !== undefined && cy.Q208 > 0) ? cy.Q208 : reamF;
      if(!(reamF > 0) || cycleQ(cy, 208, 0) < 0 || cycleQ(cy, 211, 0) < 0){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 201: Q206 must be > 0 and Q208/Q211 must be >= 0 — no cutting path generated'});
        return;
      }
      var cx2 = pos.x, cy2a = pos.y;
      var oldFeed = feed;

      // 1. Rapid to safeZ
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2a,z:safeZ}, rapid:true, feed:9999, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, toolNum:toolNum, len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2a-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', safeRetract:true});
      pos={x:cx2,y:cy2a,z:safeZ};

      // 2. Ream down in one pass
      feed = reamF;
      pushSeg({x:cx2, y:cy2a, z:depthZ}, false, srcLine, rc);

      var reamDwell = Math.max(0, cycleQ(cy, 211, 0));
      if(reamDwell > 0) pushCycleEvent('dwell', reamDwell, srcLine, rc, 'depth');

      // 3. Retract at Q208 — a synchronized FEED move (smooth reamer exit), never FMAX
      feed = retF;
      pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true, true);

      // 4. Rapid to 2nd safety clearance — only when higher than safeZ (A3).
      if(safe2Z > safeZ + 1e-6) pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);

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
       * Q336 = spindle orientation angle (represented as an explicit cycle event)
       * Q403 = synchronized retract speed/feed factor
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
       * Feed calculation: F = |pitch| × RPM; missing current S rejects the cycle
       * Workpiece: cylindrical hole at tool radius (thread profile not modeled in voxel sim)
       */
      // Q239 sign encodes thread hand (+ right / − left). Feed uses the pitch
      // magnitude; synchronized infeed/retract segments retain thread hand and
      // the corresponding forward/reverse spindle direction explicitly.
      var pitchSigned = cycleQ(cy, 239, 1.25);
      var pitch  = Math.abs(pitchSigned);
      if(!(pitch > 0) || pitch > 99.9999){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: Q239 thread pitch must be non-zero — no tapping path generated'});
        return;
      }
      // S belongs to the current TOOL CALL. A stale speed from a previous tool
      // must never make an otherwise invalid tapping cycle look synchronized.
      if(!(spindleS > 0)){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: current TOOL CALL has no positive spindle speed S — no tapping path generated'});
        return;
      }
      var tapFeed = pitch * spindleS;
      var retractFactor = cycleQ(cy, 403, 1);
      if(retractFactor < 0.0001 || retractFactor > 10){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: Q403 retraction factor must be within 0.0001...10 — no tapping path generated'});
        return;
      }
      var retractFeed = tapFeed * retractFactor;
      var orientation = cycleQ(cy, 336, 0);
      if(!isFinite(orientation) || orientation < -360 || orientation > 360){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: Q336 spindle orientation must be within -360...360 degrees — no tapping path generated'});
        return;
      }
      var tapTool = getToolByNum(toolNum);
      var tablePitch = tapTool ? Math.abs(Number(tapTool.PITCH)||0) : 0;
      if(tablePitch > 0 && Math.abs(tablePitch-pitch) > Math.max(1e-4, pitch*1e-3)){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: |Q239| ('+pitch+'mm) does not match tool-table PITCH ('+tablePitch+'mm) — no tapping path generated'});
        return;
      }
      var q257 = cycleQ(cy, 257, 0);
      if(q257 < 0){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: Q257 chip-break depth must be >= 0 — no tapping path generated'});
        return;
      }
      var chipDepth = q257 > 0 ? q257 : Math.abs(depth); // depth per chip-break step
      // Q256 is a MULTIPLE of the pitch (Q256 × Q239), NOT a distance in mm.
      // Q256=0 → full retract out of the hole to Q200; Q256>0 → stay in the hole.
      var q256 = cycleQ(cy, 256, 0.2);
      if(q256 < 0){
        pushParseProblem(parseProblems, {line:srcLine, sev:'err', msg:'CYCL 209: Q256 retract factor must be >= 0 — no tapping path generated'});
        return;
      }
      var chipFullRetract = (q256 === 0);
      var chipRetract = chipFullRetract ? 0 : Math.abs(pitch * q256);
      if(!chipFullRetract && chipRetract < 0.001) chipRetract = pitch; // guard: at least one pitch
      var cx2 = pos.x, cy2a = pos.y;
      var oldFeed = feed;
      var oldSpindleOn = spindleOn;
      var oldSpindleDir = spindleDir;
      var oldSpindleS = spindleS;
      var threadDir = pitchSigned > 0 ? 1 : -1;
      activeThreadHand = threadDir;

      // 1. Rapid to safeZ
      sub.push({from:{x:pos.x,y:pos.y,z:pos.z}, to:{x:cx2,y:cy2a,z:safeZ}, rapid:true, feed:9999, spindleS:spindleS, spindleOn:spindleOn, coolantOn:coolantOn, toolNum:toolNum, len:Math.sqrt(Math.pow(cx2-pos.x,2)+Math.pow(cy2a-pos.y,2)+Math.pow(safeZ-pos.z,2))||0.001, blockIndex:blockIndex, srcLine:srcLine, rc:rc||'', safeRetract:true});
      pos={x:cx2,y:cy2a,z:safeZ};
      if(orientation !== 0) pushCycleEvent('spindle-orientation', orientation, srcLine, rc, 'positioning');

      // 2. Chip-break tapping loop
      feed = tapFeed;
      spindleOn = true;
      spindleDir = threadDir;
      spindleS = oldSpindleS;
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
            feed = retractFeed;
            spindleDir = -threadDir;
            spindleS = oldSpindleS*retractFactor;
            pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true, true);
            // Re-tap down to just above last depth (synchronized feed — tool follows existing thread)
            feed = tapFeed;
            spindleDir = threadDir;
            spindleS = oldSpindleS;
            pushSeg({x:cx2, y:cy2a, z:targetZ + 0.1}, false, srcLine, rc, true, true);
          } else {
            // Q256>0: retract by pitch*Q256, stays in hole (synchronized feed)
            var breakZ = targetZ + chipRetract;
            feed = retractFeed;
            spindleDir = -threadDir;
            spindleS = oldSpindleS*retractFactor;
            pushSeg({x:cx2, y:cy2a, z:breakZ}, false, srcLine, rc, true, true);
            feed = tapFeed;
            spindleDir = threadDir;
            spindleS = oldSpindleS;
            pushSeg({x:cx2, y:cy2a, z:targetZ + 0.1}, false, srcLine, rc, true, true);
          }
        }
      }

      // 3. Full retract to safeZ — synchronized feed (spindle reverses, tool follows thread out)
      feed = retractFeed;
      spindleDir = -threadDir;
      spindleS = oldSpindleS*retractFactor;
      pushSeg({x:cx2, y:cy2a, z:safeZ}, false, srcLine, rc, true, true);

      // 4. Rapid to 2nd safety clearance (tool is out of the hole — FMAX allowed),
      //    only when it is actually higher than safeZ (A3).
      spindleOn = oldSpindleOn;
      spindleDir = oldSpindleDir;
      spindleS = oldSpindleS;
      activeThreadHand = 0;
      if(safe2Z > safeZ + 1e-6){
        feed = 9999;
        pushSeg({x:cx2, y:cy2a, z:safe2Z}, true, srcLine, rc, true);
      }

      feed = oldFeed;
    }
  }

  function flushPending(){
    // Iterating the batch below reassigns the shared modal `feed` per move —
    // including 9999 for FMAX rapids and any per-move feed set inside a fixed
    // cycle. That is bookkeeping local to rendering; it must NOT leak back as
    // the main-loop modal feed. Otherwise a contour that ends in an FMAX
    // retract (or a fixed cycle) corrupts the modal feed to 9999, and the next
    // contour's first cutting move that omits F would run at rapid instead of
    // the last programmed / FAUTO feed. Preserve and restore it around the loop.
    var _modalFeed=feed;
    var _lastPendingMove=pendingMoves.length ? pendingMoves[pendingMoves.length-1] : null;
    for(var mi=0;mi<pendingMoves.length;mi++){
      var mv=pendingMoves[mi];
      feed=mv.feed; blockIndex=mv.blockIdx;
      if(typeof mv.spindleOn !== 'undefined') spindleOn=mv.spindleOn;
      if(typeof mv.spindleDir !== 'undefined') spindleDir=mv.spindleDir;
      if(mv.spindleS && mv.spindleS > 0) spindleS=mv.spindleS;
      if(typeof mv.coolantOn !== 'undefined') coolantOn=mv.coolantOn;
      var mod=mv.modifier;
      // set pos to stored from position
      pos={x:mv.from.x, y:mv.from.y, z:mv.from.z};
      if(mod && mi+1>=pendingMoves.length){
        pushParseProblem(parseProblems,{line:mod.line!=null?mod.line:mv.srcLine,sev:'err',msg:mod.type+' has no following contour move \u2014 modifier ignored'});
        pushContourLine(mv.target, mv.rapid, mv.srcLine, mv.rc, mv.rcActivation, 'L');
        if(mv.m99 && activeCycle) executeCycle(activeCycle, mv.srcLine, mv.rc);
        continue;
      }
      if(!mod){
        var plainGeom=pushContourLine(mv.target, mv.rapid, mv.srcLine, mv.rc, mv.rcActivation, 'L');
        if(mv.afterDegenerateChf) plainGeom.afterDegenerateChf=true;
        if(mv.m99 && activeCycle) executeCycle(activeCycle, mv.srcLine, mv.rc);
        continue;
      }
      var nextMv=pendingMoves[mi+1];
      var corner=mv.target;
      var in_dx=corner.x-pos.x, in_dy=corner.y-pos.y;
      var in_l=Math.sqrt(in_dx*in_dx+in_dy*in_dy);
      var out_dx=nextMv.target.x-corner.x, out_dy=nextMv.target.y-corner.y;
      var out_l=Math.sqrt(out_dx*out_dx+out_dy*out_dy);
      if(in_l<1e-6||out_l<1e-6){ pushContourLine(corner, mv.rapid, mv.srcLine, mv.rc, mv.rcActivation, 'L'); continue; }
      var u_in={x:in_dx/in_l, y:in_dy/in_l};
      var u_out={x:out_dx/out_l, y:out_dy/out_l};
      var r=mod.r;
      var dot=Math.max(-1,Math.min(1,u_in.x*u_out.x+u_in.y*u_out.y));
      var halfAngle=Math.acos(dot)/2;
      if(halfAngle<1e-4){ pushContourLine(corner, mv.rapid, mv.srcLine, mv.rc, mv.rcActivation, 'L'); continue; }
      // A tangential RND consumes r*tan(turn/2) along each adjacent contour
      // element. Using r/tan(turn/2) is only correct for a 90-degree corner and
      // distorts every shallow/obtuse HEIDENHAIN rounding arc.
      var requestedDist=mod.type==='CHF'?r:r*Math.tan(halfAngle);
      if(!(requestedDist>0)||requestedDist>=in_l-1e-6||requestedDist>=out_l-1e-6){
        pushParseProblem(parseProblems,{line:mod.line!=null?mod.line:mv.srcLine,sev:'err',msg:mod.type+' does not fit between the adjacent contour moves \u2014 modifier ignored'});
        pushContourLine(corner,mv.rapid,mv.srcLine,mv.rc,mv.rcActivation,'L');
        continue;
      }
      var dist=requestedDist;
      var p1={x:corner.x-u_in.x*dist, y:corner.y-u_in.y*dist, z:corner.z};
      var p2={x:corner.x+u_out.x*dist, y:corner.y+u_out.y*dist, z:corner.z};
      var incomingGeom=pushContourLine(p1, mv.rapid, mv.srcLine, mv.rc, mv.rcActivation, 'L');
      if(mv.afterDegenerateChf) incomingGeom.afterDegenerateChf=true;
      if(mod.type==='CHF'){
        pushContourLine(p2, mv.rapid, mod.line!=null?mod.line:mv.srcLine, mv.rc, false, 'CHF');
        if(Math.hypot(p2.x-p1.x,p2.y-p1.y)<1e-10) nextMv.afterDegenerateChf=true;
      }
      else {
        var cross=u_in.x*u_out.y-u_in.y*u_out.x;
        var sign=cross>=0?1:-1;
        var perp={x:-u_in.y*sign, y:u_in.x*sign};
        var cx3=p1.x+perp.x*r, cy3=p1.y+perp.y*r;
        var a0=Math.atan2(p1.y-cy3,p1.x-cx3);
        var a1t=Math.atan2(p2.y-cy3,p2.x-cx3);
        var sw; if(sign>0){sw=a1t-a0;while(sw<=-1e-4)sw+=2*Math.PI;}else{sw=a1t-a0;while(sw>=1e-4)sw-=2*Math.PI;}
        var rndGeom=arcGeom(p1,p2,cx3,cy3,r,a0,sw,mod.line!=null?mod.line:mv.srcLine,'RND');
        pushContourArc(rndGeom,mv.rapid,mod.line!=null?mod.line:mv.srcLine,mv.rc,Math.PI/36);
      }
      // CRITICAL: the outgoing block must start at the fillet/chamfer END (p2),
      // not at the original corner — otherwise an extra spike gets cut through
      // the corner AND the polyline gets a gap that corrupts radius comp runs.
      nextMv.from = {x:p2.x, y:p2.y, z:p2.z};
    }
    pendingMoves=[];
    // Pending contour rendering temporarily restores each block's start state.
    // Continue parsing with the state after the final block's end-effective M.
    if(_lastPendingMove){
      if(typeof _lastPendingMove.spindleAfter!=='undefined') spindleOn=_lastPendingMove.spindleAfter;
      if(typeof _lastPendingMove.spindleDirAfter!=='undefined') spindleDir=_lastPendingMove.spindleDirAfter;
      if(typeof _lastPendingMove.coolantAfter!=='undefined') coolantOn=_lastPendingMove.coolantAfter;
    }
    feed=_modalFeed; // restore modal feed (see note at top of flushPending)
  }

  for(var i=0;i<expandedProg.length;i++){
    var raw = expandedProg[i].text.trim();
    var srcLineI = expandedProg[i].srcLine;
    var line = raw.toUpperCase().replace(/;.*$/,'')
      .replace(/^[ \t]*\d+[ \t]+(?=[A-Z;*])/,'') // tolerate PASTED machine code with block numbers ("12 TOOL CALL 5") — file import strips them too
      .replace(/(\d),(?=\d)/g,'$1.') // Heidenhain decimal comma -> dot (Q1+0,5774, X+10,5); MUST happen before any regex/eval below
      .trim();
    if(!line || line.charAt(0)===';'){
      inCycleParamBlock = false;
      continue;
    }

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
        // A2: never silently negate a positive Q201. A positive depth is a
        // programming error; executeCycle validates it and refuses to cut.
        if(_qNum===201 && typeof _qVal==='number' && _qVal>0) console.warn('Q201 depth should be negative (below surface), got +'+_qVal);
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
      modalCycleCall=false; // a new CYCL DEF cancels modal M89
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      activeCycle={type:200, Q200:+(qm[200]!==undefined?qm[200]:2), Q201:+(qm[201]!==undefined?qm[201]:-20), Q206:+(qm[206]!==undefined?qm[206]:150), Q202:+(qm[202]!==undefined?qm[202]:0), Q210:+(qm[210]!==undefined?qm[210]:0), Q203:+(qm[203]!==undefined?qm[203]:0), Q204:+(qm[204]!==undefined?qm[204]:50), Q211:+(qm[211]!==undefined?qm[211]:0), Q395:+(qm[395]!==undefined?qm[395]:0)};
    }
    else if(line.indexOf('CYCL DEF 201')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      modalCycleCall=false;
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      // Zero is a valid Q value (NOTES rule #2): keep an explicit 0 for depth,
      // clearances and feeds instead of folding it into a default.
      activeCycle={type:201, Q200:+(qm[200]!==undefined?qm[200]:2), Q201:+(qm[201]!==undefined?qm[201]:-10), Q206:+(qm[206]!==undefined?qm[206]:80), Q211:+(qm[211]!==undefined?qm[211]:0), Q208:+(qm[208]!==undefined?qm[208]:0), Q203:+(qm[203]!==undefined?qm[203]:0), Q204:+(qm[204]!==undefined?qm[204]:50)};
    }
    else if(line.indexOf('CYCL DEF 209')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      modalCycleCall=false;
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      // Q256/Q257 defaults MUST use !==undefined (not ||): an explicit 0 is
      // meaningful and falsy — Q256=0 means full retract out of the hole, and
      // Q257=0 means a single pass (no chip breaking). `qm||default` would drop
      // both back to their defaults. See NOTES rule #2. (Cycle 200 already does this.)
      activeCycle={type:209, Q200:+(qm[200]!==undefined?qm[200]:2), Q201:+(qm[201]!==undefined?qm[201]:-10), Q239:+(qm[239]!==undefined?qm[239]:1.25), Q203:+(qm[203]!==undefined?qm[203]:0), Q204:+(qm[204]!==undefined?qm[204]:50), Q257:+(qm[257]!==undefined?qm[257]:5), Q256:+(qm[256]!==undefined?qm[256]:0.2), Q336:+(qm[336]!==undefined?qm[336]:0), Q403:+(qm[403]!==undefined?qm[403]:1)};
    }
    else if(line.indexOf('CYCL DEF 208')===0){
      flushPending(); // execute any pending M99 with the CURRENT cycle before replacing it
      modalCycleCall=false;
      // parse Q params
      var qm={}; var qr=line.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/g);
      if(qr) qr.forEach(function(q){ var m=q.match(/Q(\d+)\s*=?\s*([+-]?\d+\.?\d*)/); if(m) qm[m[1]]=pFloat(m[2]); });
      // Zero is a valid Q value (NOTES rule #2): an explicit Q201=0 must stay 0
      // (no cut), and Q334=0 keeps its documented single-revolution meaning.
      activeCycle={type:208, Q200:+(qm[200]!==undefined?qm[200]:2), Q201:+(qm[201]!==undefined?qm[201]:-10), Q206:+(qm[206]!==undefined?qm[206]:150), Q203:+(qm[203]!==undefined?qm[203]:0), Q204:+(qm[204]!==undefined?qm[204]:50), Q334:+(qm[334]!==undefined?qm[334]:0), Q335:+(qm[335]!==undefined?qm[335]:10), Q342:+(qm[342]!==undefined?qm[342]:0), Q351:+(qm[351]!==undefined?qm[351]:1), Q370:+(qm[370]!==undefined?qm[370]:0)};
    }
    else if(/^CYCL\s+DEF\s+\d+/.test(line)){
      // Unsupported cycle number (e.g. 7 datum shift, 203, 220 patterns...):
      // real behavior would differ — do NOT keep the previous cycle armed,
      // otherwise a later M99/CYCL CALL would silently run the WRONG cycle.
      flushPending();
      modalCycleCall=false;
      activeCycle = null;
      var _unsup = line.match(/^CYCL\s+DEF\s+(\d+)/);
      pushParseProblem(parseProblems, {line:srcLineI, sev:'warn', msg:'CYCL DEF '+_unsup[1]+' is not supported by the simulator — cycle ignored (supported: 200, 201, 208, 209)'});
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
      var _toolCallUnderComp = (rcState==='RL' || rcState==='RR');
      spindleOn=false; spindleDir=0; spindleS=0; coolantOn=false;
      var tn=line.match(/TOOL CALL (\d+)/);
      var requestedToolNum=tn ? parseInt(tn[1]) : toolNum;
      var resolvedTool=resolveParserToolCall(requestedToolNum);
      toolNum=resolvedTool.toolNum;
      var tf=line.match(/\bF\+?(\d+(?:\.\d+)?)/); if(tf){ feed=parseFloat(tf[1]); lastDefinedFeed=feed; toolCallFeed=feed; }
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
      if(_toolCallUnderComp){
        radiusCompBlocked = true;
        pushParseProblem(parseProblems, {line:srcLineI, sev:'err', msg:'TOOL CALL is not permitted while '+rcState+' is active — compensated motion suppressed until R0'});
      } else {
        rcState = '';
      }
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
    else if(/^M\d+\b/.test(line)){
      flushPending();
      var _standaloneInfo=analyzeMFunctionTail(line.split(/\s+/),0);
      var _standaloneCodes=_standaloneInfo.codes;
      applyKnownMStart(_standaloneCodes);
      applyKnownMEnd(_standaloneCodes);
      var _standaloneStops=_standaloneCodes.some(function(m){ return /^(?:M0|M2|M6|M30)$/.test(m); });
      if(!_standaloneStops && _standaloneCodes.some(function(m){ return /^(?:M3|M4|M5|M7|M8|M9|M13|M14)$/.test(m); })){
        sub.push({from:{x:pos.x,y:pos.y,z:pos.z},to:{x:pos.x,y:pos.y,z:pos.z},
          rapid:true,feed:DEFAULT_FEED,len:0.001,blockIndex:blockIndex,srcLine:srcLineI,
          rc:'',spindleOn:spindleOn,spindleDir:spindleDir,coolantOn:coolantOn,
          toolNum:toolNum,isMseg:true});
        blockIndex++;
      }
      if(finishMControlBlock(_standaloneCodes,srcLineI)) break;
    }
    else if(line.indexOf('CC')===0){
      var cix=line.match(/(?:^|\s)IX([+-]?\d+\.?\d*)/), ciy=line.match(/(?:^|\s)IY([+-]?\d+\.?\d*)/);
      var cx=line.match(/(?:^|\s)X([+-]?\d+\.?\d*)/), cy=line.match(/(?:^|\s)Y([+-]?\d+\.?\d*)/);
      if(!cix&&!ciy&&!cx&&!cy){ ccx=pos.x; ccy=pos.y; }
      else {
        if(cix) ccx=pos.x+parseFloat(cix[1]); else if(cx) ccx=parseFloat(cx[1]); else if(ccx===null) ccx=pos.x;
        if(ciy) ccy=pos.y+parseFloat(ciy[1]); else if(cy) ccy=parseFloat(cy[1]); else if(ccy===null) ccy=pos.y;
      }
    }
    else if(/^C(\s|$)/.test(line)){
      flushPending();
      blockIndex++;
      var _mCodesC=embeddedMCodes(line);
      applyKnownMStart(_mCodesC);
      var _callCycleC=cycleCallForMCodes(_mCodesC);
      var _cCore=positioningTextBeforeM(line);
      var _cFeedState=beginPositioningFeed(_cCore);
      var ex=_cCore.match(/X([+-]?\d+\.?\d*)/), ey=_cCore.match(/Y([+-]?\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      var dr = _cCore.indexOf('DR-')>=0 ? -1 : 1;
      if(/\bRL\b/.test(_cCore)) rcState='RL'; else if(/\bRR\b/.test(_cCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_cCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      var _cArcMade=false;
      if(ccx!==null && ccy!==null){
        var R = Math.sqrt((pos.x-ccx)*(pos.x-ccx)+(pos.y-ccy)*(pos.y-ccy));
        var _cEndRadius=Math.sqrt((endX-ccx)*(endX-ccx)+(endY-ccy)*(endY-ccy));
        if(R<1e-9||Math.abs(R-_cEndRadius)>1e-4){
          pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'C end point is not on the circle defined by the start point and CC \u2014 arc rejected'});
          applyKnownMEnd(_mCodesC);
          endPositioningFeed(_cFeedState);
          continue;
        }
        var cFrom=pointCopy(pos);
        var a0 = Math.atan2(pos.y-ccy, pos.x-ccx);
        var a1 = Math.atan2(endY-ccy, endX-ccx);
        var sweep;
        if(dr>0){ sweep = a1-a0; while(sweep<=1e-4) sweep += 2*Math.PI; }
        else { sweep = a1-a0; while(sweep>=-1e-4) sweep -= 2*Math.PI; }
        var cTo={x:endX,y:endY,z:cFrom.z};
        pushContourArc(arcGeom(cFrom,cTo,ccx,ccy,R,a0,sweep,srcLineI,'C'),_cFeedState.rapid,srcLineI,rcState,Math.PI/32);
        _cArcMade=true;
      } else pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'Circle center undefined \u2014 C block rejected'});
      if(_cArcMade&&_callCycleC&&activeCycle) executeCycle(activeCycle,srcLineI,rcState);
      applyKnownMEnd(_mCodesC);
      endPositioningFeed(_cFeedState);
      if(finishMControlBlock(_mCodesC,srcLineI)) break;
    }
    else if(line.indexOf('LP')===0){
      // LP PR+30 PA+45 / LP IPA+60 — linear polar move. Omitted
      // coordinates retain the current polar radius/angle, as on TNC 640.
      blockIndex++;
      var _lpCore=positioningTextBeforeM(line), _mCodesLP=embeddedMCodes(line);
      applyKnownMStart(_mCodesLP);
      var _callCycleLP=cycleCallForMCodes(_mCodesLP);
      var _lpFeedState=beginPositioningFeed(_lpCore);
      var pr=_lpCore.match(/(?:^|\s)PR([+-]?\d+\.?\d*)/);
      var pa=_lpCore.match(/(?:^|\s)PA([+-]?\d+\.?\d*)/);
      var ipa=_lpCore.match(/(?:^|\s)IPA([+-]?\d+\.?\d*)/);
      var fm=_lpCore.match(/\bF\+?(\d+\.?\d*)/); if(fm) feed=parseFloat(fm[1]);
      if(ccx===null||ccy===null) pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'Polar origin undefined \u2014 LP block rejected'});
      if((pr||pa||ipa) && ccx!==null && ccy!==null){
        var curRad=Math.hypot(pos.x-ccx,pos.y-ccy);
        var curAng=Math.atan2(pos.y-ccy,pos.x-ccx);
        var rad=pr?parseFloat(pr[1]):curRad;
        var ang=pa?parseFloat(pa[1])*Math.PI/180:(ipa?curAng+parseFloat(ipa[1])*Math.PI/180:curAng);
        if(rad<0){
          pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'Polar radius PR must not be negative \u2014 LP block rejected'});
          endPositioningFeed(_lpFeedState);
          continue;
        }
        var tx=ccx+rad*Math.cos(ang), ty=ccy+rad*Math.sin(ang);
        if(/\bRL\b/.test(_lpCore)) rcState='RL'; else if(/\bRR\b/.test(_lpCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_lpCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
        if(!isNaN(feed)&&feed<9000) lastDefinedFeed=feed;
        var _pendingLP={from:{x:pos.x,y:pos.y,z:pos.z}, target:{x:tx,y:ty,z:pos.z}, rapid:_lpFeedState.rapid, srcLine:srcLineI, rc:rcState, feed:feed, spindleOn:spindleOn,spindleDir:spindleDir, spindleS:spindleS, coolantOn:coolantOn, blockIdx:blockIndex, modifier:null, m99:_callCycleLP,mCodes:_mCodesLP.slice()};
        pendingMoves.push(_pendingLP);
        pos={x:tx,y:ty,z:pos.z};
        applyKnownMEnd(_mCodesLP);
        _pendingLP.spindleAfter=spindleOn;
        _pendingLP.spindleDirAfter=spindleDir;
        _pendingLP.coolantAfter=coolantOn;
        if(_mCodesLP.some(function(m){ return /^(?:M0|M2|M6|M30)$/.test(m); })){
          flushPending();
          if(finishMControlBlock(_mCodesLP,srcLineI)) break;
        }
      }
      endPositioningFeed(_lpFeedState);
    }
    else if(line.indexOf('CP')===0){
      // CP PA+180 or CP IPA+360 IZ+5 — polar arc / helix
      flushPending();
      blockIndex++;
      var _cpCore=positioningTextBeforeM(line), _mCodesCP=embeddedMCodes(line);
      applyKnownMStart(_mCodesCP);
      var _callCycleCP=cycleCallForMCodes(_mCodesCP), _cpArcMade=false;
      var _cpFeedState=beginPositioningFeed(_cpCore);
      var pa2=_cpCore.match(/(?:^|\s)PA([+-]?\d+\.?\d*)/);
      var ipa2=_cpCore.match(/(?:^|\s)IPA([+-]?\d+\.?\d*)/);
      var cpiz=_cpCore.match(/(?:^|\s)IZ([+-]?\d+\.?\d*)/);
      var cpz=_cpCore.match(/(?:^|\s)Z([+-]?\d+\.?\d*)/);
      var fm2=_cpCore.match(/\bF\+?(\d+\.?\d*)/); if(fm2) feed=parseFloat(fm2[1]);
      var dr2=_cpCore.indexOf('DR-')>=0 ? -1 : 1;
      if(ccx===null||ccy===null) pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'Polar origin undefined \u2014 CP block rejected'});
      if(/\bRL\b/.test(_cpCore)) rcState='RL'; else if(/\bRR\b/.test(_cpCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_cpCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      if((pa2||ipa2) && ccx!==null && ccy!==null){
        var a0cp=Math.atan2(pos.y-ccy, pos.x-ccx);
        var Rcp=Math.sqrt((pos.x-ccx)*(pos.x-ccx)+(pos.y-ccy)*(pos.y-ccy));
        var cpFrom=pointCopy(pos);
        var sw,a1cp;
        if(ipa2){
          sw=parseFloat(ipa2[1])*Math.PI/180;
          if(Math.abs(sw)<1e-12||sw*dr2<0){
            pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'For incremental CP, IPA must be non-zero and have the same sign as DR \u2014 CP block rejected'});
            endPositioningFeed(_cpFeedState);
            continue;
          }
          a1cp=a0cp+sw;
        } else {
          a1cp=parseFloat(pa2[1])*Math.PI/180;
          if(dr2>0){sw=a1cp-a0cp;while(sw<=1e-4)sw+=2*Math.PI;}else{sw=a1cp-a0cp;while(sw>=-1e-4)sw-=2*Math.PI;}
        }
        var cpEndZ=cpiz?cpFrom.z+parseFloat(cpiz[1]):(cpz?parseFloat(cpz[1]):cpFrom.z);
        var cpTo={x:ccx+Rcp*Math.cos(a1cp),y:ccy+Rcp*Math.sin(a1cp),z:cpEndZ};
        pushContourArc(arcGeom(cpFrom,cpTo,ccx,ccy,Rcp,a0cp,sw,srcLineI,'CP'),_cpFeedState.rapid,srcLineI,rcState,Math.PI/32);
        _cpArcMade=true;
      }
      if(_cpArcMade&&_callCycleCP&&activeCycle) executeCycle(activeCycle,srcLineI,rcState);
      applyKnownMEnd(_mCodesCP);
      endPositioningFeed(_cpFeedState);
      if(finishMControlBlock(_mCodesCP,srcLineI)) break;
    }
    else if(/^CR(\s|$)/.test(line)){
      // CR — arc defined by radius and direction
      flushPending();
      blockIndex++;
      var _crCore=positioningTextBeforeM(line), _mCodesCR=embeddedMCodes(line);
      applyKnownMStart(_mCodesCR);
      var _callCycleCR=cycleCallForMCodes(_mCodesCR), _crArcMade=false;
      var _crFeedState=beginPositioningFeed(_crCore);
      var ex=_crCore.match(/X([+-]?\d+\.?\d*)/), ey=_crCore.match(/Y([+-]?\d+\.?\d*)/);
      // Heidenhain CR: the SIGN of R selects the arc — R+ = arc <= 180deg,
      // R- = arc > 180deg; DR+/- selects the rotation direction.
      var rm=_crCore.match(/(?:^|\s)R([+\-]?)(\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      var dr = _crCore.indexOf('DR-')>=0 ? -1 : 1;
      if(/\bRL\b/.test(_crCore)) rcState='RL'; else if(/\bRR\b/.test(_crCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_crCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      if(rm){
        var R = parseFloat(rm[2]);
        var signR = (rm[1]==='-') ? -1 : 1; // R- selects the major (>180deg) arc
        var dx = endX-pos.x, dy = endY-pos.y;
        var d2 = dx*dx+dy*dy;
        if(d2 > 0 && R*R >= d2/4){
          var crFrom=pointCopy(pos);
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
          var crTo={x:endX,y:endY,z:crFrom.z};
          pushContourArc(arcGeom(crFrom,crTo,cx2,cy2,R,a0,sweep,srcLineI,'CR'),_crFeedState.rapid,srcLineI,rcState,Math.PI/32);
          _crArcMade=true;
        } else pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'CR geometry is impossible \u2014 arc rejected'});
      } else pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'CR radius R is missing \u2014 arc rejected'});
      if(_crArcMade&&_callCycleCR&&activeCycle) executeCycle(activeCycle,srcLineI,rcState);
      applyKnownMEnd(_mCodesCR);
      endPositioningFeed(_crFeedState);
      if(finishMControlBlock(_mCodesCR,srcLineI)) break;
    }
    else if(/^CT(\s|$)/.test(line)){
      // CT — tangential arc (tangent to previous move)
      flushPending();
      blockIndex++;
      var _ctCore=positioningTextBeforeM(line), _mCodesCT=embeddedMCodes(line);
      applyKnownMStart(_mCodesCT);
      var _callCycleCT=cycleCallForMCodes(_mCodesCT), _ctArcMade=false;
      var _ctFeedState=beginPositioningFeed(_ctCore);
      var ex=_ctCore.match(/X([+-]?\d+\.?\d*)/), ey=_ctCore.match(/Y([+-]?\d+\.?\d*)/);
      var endX = ex ? parseFloat(ex[1]) : pos.x;
      var endY = ey ? parseFloat(ey[1]) : pos.y;
      if(/\bRL\b/.test(_ctCore)) rcState='RL'; else if(/\bRR\b/.test(_ctCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_ctCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      // compute tangent from the last segment that actually moved in XY —
      // a preceding Z-only plunge or retract must not reset the tangent
      var tanX=0, tanY=1, _hasTangent=false;
      for(var lsi=sub.length-1; lsi>=0; lsi--){
        var ls=sub[lsi];
        var ldx=ls.to.x-ls.from.x, ldy=ls.to.y-ls.from.y;
        var ll=Math.sqrt(ldx*ldx+ldy*ldy);
        if(ll>1e-6){ tanX=ldx/ll; tanY=ldy/ll; _hasTangent=true; break; }
      }
      if(!_hasTangent){
        pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'CT requires a preceding XY contour move to define the tangent \u2014 arc rejected'});
        endPositioningFeed(_ctFeedState);
        continue;
      }
      var dx=endX-pos.x, dy=endY-pos.y;
      // center perpendicular to tangent, passing through pos
      // solve: center = pos + t*(-tanY, tanX), arc through endX,endY
      var denom = -tanY*dx + tanX*dy;
      if(Math.abs(denom)>1e-6){
        var ctFrom=pointCopy(pos);
        var t2=(dx*dx+dy*dy)/(2*denom);
        var cx2=pos.x-tanY*t2, cy2=pos.y+tanX*t2;
        var R=Math.sqrt((pos.x-cx2)*(pos.x-cx2)+(pos.y-cy2)*(pos.y-cy2));
        var a0=Math.atan2(pos.y-cy2,pos.x-cx2);
        var a1=Math.atan2(endY-cy2,endX-cx2);
        var dr2=denom>0?1:-1;
        var sweep;
        if(dr2>0){ sweep=a1-a0; while(sweep<=1e-4) sweep+=2*Math.PI; }
        else { sweep=a1-a0; while(sweep>=-1e-4) sweep-=2*Math.PI; }
        var ctTo={x:endX,y:endY,z:ctFrom.z};
        pushContourArc(arcGeom(ctFrom,ctTo,cx2,cy2,R,a0,sweep,srcLineI,'CT'),_ctFeedState.rapid,srcLineI,rcState,Math.PI/32);
        _ctArcMade=true;
      } else {
        pushContourLine({x:endX,y:endY,z:pos.z},_ctFeedState.rapid,srcLineI,rcState,false,'CT-L');
        _ctArcMade=true;
      }
      if(_ctArcMade&&_callCycleCT&&activeCycle) executeCycle(activeCycle,srcLineI,rcState);
      applyKnownMEnd(_mCodesCT);
      endPositioningFeed(_ctFeedState);
      if(finishMControlBlock(_mCodesCT,srcLineI)) break;
    }
    else if(line.indexOf('L ')===0 || line==='L'){
      blockIndex++;
      var _mCodesL=embeddedMCodes(line);
      applyKnownMStart(_mCodesL);
      var _lCore=positioningTextBeforeM(line);
      var _lFeedState=beginPositioningFeed(_lCore);
      var _priorRcL=rcState;
      if(/\bRL\b/.test(_lCore)) rcState='RL'; else if(/\bRR\b/.test(_lCore)) rcState='RR'; else if(/(?:^|\s)R0(?=\s|$)/.test(_lCore)) rcState='R0'; // token match — 'R0.5' (CR radius) must NOT cancel compensation
      var lx=_lCore.match(/IX([+-]?\d+\.?\d*)/), ly=_lCore.match(/IY([+-]?\d+\.?\d*)/), lz=_lCore.match(/IZ([+-]?\d+\.?\d*)/);
      // NOTE: no lookbehind here — (?<!...) is a SyntaxError on iOS Safari <16.4
      // and kills the WHOLE script at load. (?:^|[^I]) is equivalent for our lines.
      var lxa=_lCore.match(/(?:^|[^I])X([+-]?\d+\.?\d*)/), lya=_lCore.match(/(?:^|[^I])Y([+-]?\d+\.?\d*)/), lza=_lCore.match(/(?:^|[^I])Z([+-]?\d+\.?\d*)/);
      var target = {
        x: lx ? pos.x+parseFloat(lx[1]) : (lxa ? parseFloat(lxa[1]) : pos.x),
        y: ly ? pos.y+parseFloat(ly[1]) : (lya ? parseFloat(lya[1]) : pos.y),
        z: lz ? pos.z+parseFloat(lz[1]) : (lza ? parseFloat(lza[1]) : pos.z)
      };
      var hasM99=cycleCallForMCodes(_mCodesL);
      var isFmax = _lFeedState.rapid;
      var _pendingL={from:{x:pos.x,y:pos.y,z:pos.z}, target:{x:target.x,y:target.y,z:target.z}, rapid:isFmax, srcLine:srcLineI, rc:rcState, feed:feed, spindleOn:spindleOn, spindleDir:spindleDir, spindleS:spindleS, coolantOn:coolantOn, blockIdx:blockIndex, modifier:null, rcActivation:(rcState==='RL'||rcState==='RR')&&rcState!==_priorRcL, m99:hasM99, mCodes:_mCodesL.slice()};
      pendingMoves.push(_pendingL);
      applyKnownMEnd(_mCodesL);
      _pendingL.spindleAfter=spindleOn;
      _pendingL.spindleDirAfter=spindleDir;
      _pendingL.coolantAfter=coolantOn;
      endPositioningFeed(_lFeedState);
      pos = {x:target.x,y:target.y,z:target.z}; // track pos for incremental coords
      if(_mCodesL.some(function(m){ return /^(?:M0|M2|M6|M30)$/.test(m); })){
        flushPending();
        if(finishMControlBlock(_mCodesL,srcLineI)) break;
      }
    }
    else if(line.indexOf('RND')===0){
      var rm=line.match(/R(\d+\.?\d*)/);
      if(rm && pendingMoves.length>0) pendingMoves[pendingMoves.length-1].modifier={type:'RND',r:parseFloat(rm[1]),line:srcLineI};
      else pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'RND has no preceding supported contour move \u2014 modifier ignored'});
    }
    else if(line.indexOf('CHF')===0){
      var cm=line.match(/(\d+\.?\d*)/);
      if(cm && pendingMoves.length>0) pendingMoves[pendingMoves.length-1].modifier={type:'CHF',r:parseFloat(cm[1]),line:srcLineI};
      else pushParseProblem(parseProblems,{line:srcLineI,sev:'err',msg:'CHF has no preceding supported contour move \u2014 modifier ignored'});
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
  applyRadiusComp(sub, parseProblems);

  // In toolpath-only mode, frame the viewers around the actual motion instead
  // of the unused default workpiece dimensions.
  var viewMin=blkMin, viewMax=blkMax;
  if(!hasStock&&sub.length){
    var mn={x:Infinity,y:Infinity,z:Infinity}, mx={x:-Infinity,y:-Infinity,z:-Infinity};
    sub.forEach(function(sm){
      [sm.from,sm.to].forEach(function(pt){
        mn.x=Math.min(mn.x,pt.x); mn.y=Math.min(mn.y,pt.y); mn.z=Math.min(mn.z,pt.z);
        mx.x=Math.max(mx.x,pt.x); mx.y=Math.max(mx.y,pt.y); mx.z=Math.max(mx.z,pt.z);
      });
    });
    var span=Math.max(mx.x-mn.x,mx.y-mn.y,mx.z-mn.z,20), pad=Math.max(10,span*0.1);
    viewMin={x:mn.x-pad,y:mn.y-pad,z:mn.z-pad};
    viewMax={x:mx.x+pad,y:mx.y+pad,z:mx.z+pad};
  }

  return {blkMin:blkMin, blkMax:blkMax, blkCyl:blkCyl, hasStock:hasStock, viewMin:viewMin, viewMax:viewMax, sub:sub, problems:parseProblems, totalBlocks:blockIndex, start:{x:blkMin.x,y:blkMax.y,z:blkMax.z+50}};
}

function _rcPoint(p){ return {x:p.x,y:p.y,z:p.z}; }
function _rcDist2(a,b){ var dx=a.x-b.x,dy=a.y-b.y; return dx*dx+dy*dy; }
function _rcCross(a,b){ return a.x*b.y-a.y*b.x; }
function _rcDot(a,b){ return a.x*b.x+a.y*b.y; }
function _rcDirectedAngle(a0,a1,dir){
  var d=a1-a0;
  if(dir>0){ while(d<0)d+=2*Math.PI; while(d>=2*Math.PI)d-=2*Math.PI; }
  else { while(d>0)d-=2*Math.PI; while(d<=-2*Math.PI)d+=2*Math.PI; }
  return d;
}
function _rcPrimitiveStart(p){
  if(p.type==='line') return _rcPoint(p.start);
  if(p.type==='point') return _rcPoint(p.point);
  return {x:p.cx+p.r*Math.cos(p.a0),y:p.cy+p.r*Math.sin(p.a0),z:p.z0};
}
function _rcPrimitiveEnd(p){
  if(p.type==='line') return _rcPoint(p.end);
  if(p.type==='point') return _rcPoint(p.point);
  var a=p.a0+p.sweep;
  return {x:p.cx+p.r*Math.cos(a),y:p.cy+p.r*Math.sin(a),z:p.z1};
}
function _rcTangent(p,atEnd){
  if(p.type==='line'){
    var dx=p.end.x-p.start.x,dy=p.end.y-p.start.y,l=Math.hypot(dx,dy);
    return l>1e-12?{x:dx/l,y:dy/l}:{x:0,y:0};
  }
  if(p.type==='point') return atEnd?p.endTangent:p.startTangent;
  var a=p.a0+(atEnd?p.sweep:0),dir=p.sweep>=0?1:-1;
  return {x:-Math.sin(a)*dir,y:Math.cos(a)*dir};
}
function _rcPointOnPrimitive(pt,p,tol){
  tol=tol||1e-6;
  if(p.type==='point') return _rcDist2(pt,p.point)<=tol*tol;
  if(p.type==='line'){
    var dx=p.end.x-p.start.x,dy=p.end.y-p.start.y,l2=dx*dx+dy*dy;
    if(l2<1e-16) return _rcDist2(pt,p.start)<=tol*tol;
    var t=((pt.x-p.start.x)*dx+(pt.y-p.start.y)*dy)/l2;
    var q={x:p.start.x+dx*t,y:p.start.y+dy*t};
    return t>=-tol&&t<=1+tol&&_rcDist2(pt,q)<=tol*tol;
  }
  var rr=Math.hypot(pt.x-p.cx,pt.y-p.cy);
  if(Math.abs(rr-p.r)>tol) return false;
  var dir=p.sweep>=0?1:-1;
  var rel=_rcDirectedAngle(p.a0,Math.atan2(pt.y-p.cy,pt.x-p.cx),dir);
  return Math.abs(rel)<=Math.abs(p.sweep)+tol/Math.max(p.r,1e-9);
}
function _rcSupportIntersections(a,b){
  var out=[];
  if(a.type==='point'){
    if(_rcPointOnPrimitive(a.point,b,1e-6)) out.push(_rcPoint(a.point));
    return out;
  }
  if(b.type==='point') return _rcSupportIntersections(b,a);
  if(a.type==='line'&&b.type==='line'){
    var r={x:a.end.x-a.start.x,y:a.end.y-a.start.y};
    var s={x:b.end.x-b.start.x,y:b.end.y-b.start.y};
    var den=_rcCross(r,s);
    if(Math.abs(den)<1e-12) return out;
    var qmp={x:b.start.x-a.start.x,y:b.start.y-a.start.y};
    var t=_rcCross(qmp,s)/den;
    out.push({x:a.start.x+r.x*t,y:a.start.y+r.y*t,z:a.end.z});
    return out;
  }
  if(a.type==='arc'&&b.type==='line') return _rcSupportIntersections(b,a);
  if(a.type==='line'&&b.type==='arc'){
    var dx=a.end.x-a.start.x,dy=a.end.y-a.start.y;
    var fx=a.start.x-b.cx,fy=a.start.y-b.cy;
    var qa=dx*dx+dy*dy,qb=2*(fx*dx+fy*dy),qc=fx*fx+fy*fy-b.r*b.r;
    var disc=qb*qb-4*qa*qc;
    if(qa<1e-16||disc<-1e-9) return out;
    disc=Math.sqrt(Math.max(0,disc));
    var t1=(-qb-disc)/(2*qa),t2=(-qb+disc)/(2*qa);
    out.push({x:a.start.x+dx*t1,y:a.start.y+dy*t1,z:a.end.z});
    if(Math.abs(t2-t1)>1e-10) out.push({x:a.start.x+dx*t2,y:a.start.y+dy*t2,z:a.end.z});
    return out;
  }
  var dx=b.cx-a.cx,dy=b.cy-a.cy,d=Math.hypot(dx,dy);
  if(d<1e-10&&Math.abs(a.r-b.r)<1e-8) return out;
  if(d>a.r+b.r+1e-8||d<Math.abs(a.r-b.r)-1e-8||d<1e-12) return out;
  var x=(a.r*a.r-b.r*b.r+d*d)/(2*d);
  var h=Math.sqrt(Math.max(0,a.r*a.r-x*x));
  var ux=dx/d,uy=dy/d,px=a.cx+ux*x,py=a.cy+uy*x;
  out.push({x:px-uy*h,y:py+ux*h,z:a.z1});
  if(h>1e-10) out.push({x:px+uy*h,y:py-ux*h,z:a.z1});
  return out;
}
function _rcFiniteIntersections(a,b){
  var c=_rcSupportIntersections(a,b),out=[];
  for(var i=0;i<c.length;i++) if(_rcPointOnPrimitive(c[i],a,1e-5)&&_rcPointOnPrimitive(c[i],b,1e-5)) out.push(c[i]);
  return out;
}
function _rcSetEnd(p,pt){
  if(p.type==='line'){ p.end=_rcPoint(pt); return; }
  if(p.type==='point'){ p.point=_rcPoint(pt); return; }
  var dir=p.sweep>=0?1:-1;
  p.sweep=_rcDirectedAngle(p.a0,Math.atan2(pt.y-p.cy,pt.x-p.cx),dir);
  p.z1=pt.z;
}
function _rcSetStart(p,pt){
  if(p.type==='line'){ p.start=_rcPoint(pt); return; }
  if(p.type==='point'){ p.point=_rcPoint(pt); return; }
  var endAngle=p.a0+p.sweep,dir=p.sweep>=0?1:-1;
  p.a0=Math.atan2(pt.y-p.cy,pt.x-p.cx);
  p.sweep=_rcDirectedAngle(p.a0,endAngle,dir);
  p.z0=pt.z;
}
function _rcOffsetGeom(g,sideSign,radius){
  if(!g) return null;
  if(g.type==='line'){
    var dx=g.to.x-g.from.x,dy=g.to.y-g.from.y,l=Math.hypot(dx,dy);
    if(l<1e-10) return {type:'vertical',geom:g};
    var nx=-dy/l*sideSign,ny=dx/l*sideSign;
    return {type:'line',kind:g.kind,srcLine:g.srcLine,geom:g,
      start:{x:g.from.x+nx*radius,y:g.from.y+ny*radius,z:g.from.z},
      end:{x:g.to.x+nx*radius,y:g.to.y+ny*radius,z:g.to.z}};
  }
  var dir=g.sweep>=0?1:-1;
  var corrected=g.r-sideSign*dir*radius;
  if(corrected < -1e-8) return {type:'invalid',geom:g,srcLine:g.srcLine};
  if(Math.abs(corrected)<=1e-8){
    var endAngle=g.a0+g.sweep;
    return {type:'point',kind:g.kind,srcLine:g.srcLine,geom:g,
      point:{x:g.cx,y:g.cy,z:g.to.z},
      startTangent:{x:-Math.sin(g.a0)*dir,y:Math.cos(g.a0)*dir},
      endTangent:{x:-Math.sin(endAngle)*dir,y:Math.cos(endAngle)*dir}};
  }
  return {type:'arc',kind:g.kind,srcLine:g.srcLine,geom:g,cx:g.cx,cy:g.cy,r:corrected,a0:g.a0,sweep:g.sweep,z0:g.from.z,z1:g.to.z};
}
function _rcCloneSegment(template,from,to,side,extra){
  var s={},k;
  for(k in template) if(Object.prototype.hasOwnProperty.call(template,k)) s[k]=template[k];
  s.from=_rcPoint(from); s.to=_rcPoint(to); s.rc=side; s.rcActivation=false;
  var dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
  s.len=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(extra) for(k in extra) if(Object.prototype.hasOwnProperty.call(extra,k)) s[k]=extra[k];
  return s;
}
function _rcEmitPrimitive(out,p,template,side){
  var start=_rcPrimitiveStart(p),end=_rcPrimitiveEnd(p);
  if(p.type==='point') return;
  if(p.type==='line'){
    if(_rcDist2(start,end)>1e-16||Math.abs(start.z-end.z)>1e-9) out.push(_rcCloneSegment(template,start,end,side,{rcGeom:p}));
    return;
  }
  var steps=Math.max(8,Math.ceil(Math.abs(p.sweep)/(Math.PI/64))),prev=start;
  for(var i=1;i<=steps;i++){
    var t=i/steps,a=p.a0+p.sweep*t;
    var q={x:p.cx+p.r*Math.cos(a),y:p.cy+p.r*Math.sin(a),z:p.z0+(p.z1-p.z0)*t};
    if(i===steps) q=end;
    out.push(_rcCloneSegment(template,prev,q,side,{rcGeom:p,srcLine:p.srcLine}));
    prev=q;
  }
}
function _rcEffectiveRadius(seg){
  var tool=getToolByNum(seg.toolNum);
  return tool ? tool.R+(tool.DR||0)+(seg.drPgm||0) : TOOL_R;
}
function _rcNominalPrimitive(g){
  if(!g) return null;
  if(g.type==='line') return {type:'line',start:_rcPoint(g.from),end:_rcPoint(g.to),geom:g};
  return {type:'arc',cx:g.cx,cy:g.cy,r:g.r,a0:g.a0,sweep:g.sweep,z0:g.from.z,z1:g.to.z,geom:g};
}
function _rcNominalPairIntersects(a,b){
  if(!a.geom||!b.geom) return false;
  var na=_rcNominalPrimitive(a.geom),nb=_rcNominalPrimitive(b.geom);
  if(na.type==='arc'&&nb.type==='arc'&&Math.hypot(na.cx-nb.cx,na.cy-nb.cy)<1e-8&&Math.abs(na.r-nb.r)<1e-8) return true;
  return _rcFiniteIntersections(na,nb).length>0;
}
function _rcReport(parseProblems,line,msg,incomplete){
  // incomplete=true marks a diagnostic that only means "the RL/RR contour is
  // not finished yet" (no following contour element). The editor defers those
  // to simulation start so a contour that is still being typed does not nag
  // (see runValidation). Genuine geometry errors (tool radius too large, etc.)
  // leave incomplete falsy and keep showing live.
  pushParseProblem(parseProblems,{line:line!=null?line:0,sev:'err',msg:msg,rcDefer:!!incomplete});
  console.warn('Line '+((line||0)+1)+': '+msg);
}
function _rcHasLoop(pieces){
  for(var i=0;i<pieces.length;i++) for(var j=i+1;j<pieces.length;j++){
    if(j===i+1) continue;
    // The first and last elements are the approach/departure boundary of the
    // compensated contour. HEIDENHAIN permits these paths to meet or overlap;
    // they are not a compensation-created interior loop.
    if(i===0&&j>=pieces.length-2) continue;
    if(pieces[i].type==='arc'&&pieces[j].type==='arc'&&Math.hypot(pieces[i].cx-pieces[j].cx,pieces[i].cy-pieces[j].cy)<1e-8&&Math.abs(pieces[i].r-pieces[j].r)<1e-8){
      if(!_rcNominalPairIntersects(pieces[i],pieces[j])) return true;
      continue;
    }
    var hits=_rcFiniteIntersections(pieces[i],pieces[j]);
    if(hits.length&&!_rcNominalPairIntersects(pieces[i],pieces[j])) return true;
  }
  return false;
}

function applyRadiusComp(sub,parseProblems){
  var hasAnalytic=false;
  for(var ai=0;ai<sub.length;ai++) if((sub[ai].rc==='RL'||sub[ai].rc==='RR')&&sub[ai].rcGeom){ hasAnalytic=true; break; }
  if(hasAnalytic) applyRadiusCompAnalytic(sub,parseProblems);
  else _applyRadiusCompPolylineFallback(sub,parseProblems);
}

function applyRadiusCompAnalytic(sub,parseProblems){
  var i=0;
  while(i<sub.length){
    if(sub[i].rc!=='RL'&&sub[i].rc!=='RR'){ i++; continue; }
    var side=sub[i].rc,j=i;
    while(j<sub.length&&sub[j].rc===side) j++;
    var prev=i>0?sub[i-1]:null,next=j<sub.length?sub[j]:null;
    var newLen=_offsetRunAnalytic(sub,i,j-1,side,prev,next,parseProblems);
    i+=newLen||0;
  }
}

function _offsetRunAnalytic(sub,a,b,side,prevSeg,nextSeg,parseProblems){
  var activation=sub[a]&&sub[a].rcActivation?sub[a]:null;
  if(!activation){
    var unsupported=false;
    for(var ui=a;ui<=b;ui++) if(!sub[ui].rcGeom){ unsupported=true; break; }
    if(unsupported) return _offsetRunPolylineFallback(sub,a,b,side,prevSeg,nextSeg,parseProblems);
    _rcReport(parseProblems,sub[a]?sub[a].srcLine:0,'Radius compensation must be activated in an L block — compensated cutting run rejected.');
    sub.splice(a,b-a+1); return 0;
  }
  var radius=_rcEffectiveRadius(activation);
  if(!(radius>0)){
    _rcReport(parseProblems,activation.srcLine,'Radius compensation active with a non-positive effective tool radius (R+DR = '+radius.toFixed(3)+'mm) — compensated cutting run rejected.');
    sub.splice(a,b-a+1); return 0;
  }
  var groups=[],lastId=null;
  for(var si=a;si<=b;si++){
    var sg=sub[si],id=sg.rcGeom?sg.rcGeom.id:'seg-'+si;
    if(!groups.length||id!==lastId) groups.push({geom:sg.rcGeom,segments:[sg],template:sg,index:groups.length});
    else groups[groups.length-1].segments.push(sg);
    lastId=id;
  }
  var firstGroup=groups[0];
  if(!firstGroup.geom||!firstGroup.template.rcActivation){
    _rcReport(parseProblems,activation.srcLine,'Cannot calculate tool radius compensation at the programmed contour start.',true);
    sub.splice(a,b-a+1); return 0;
  }
  groups.shift();
  if(!groups.length){
    _rcReport(parseProblems,activation.srcLine,'Radius compensation has no following contour element — compensated cutting run rejected.',true);
    sub.splice(a,b-a+1); return 0;
  }
  var sideSign=side==='RL'?1:-1,items=[],xy=[];
  for(var gi=0;gi<groups.length;gi++){
    if(!groups[gi].geom) return _offsetRunPolylineFallback(sub,a,b,side,prevSeg,nextSeg,parseProblems);
    var prim=_rcOffsetGeom(groups[gi].geom,sideSign,radius);
    if(prim&&prim.type==='invalid'){
      _rcReport(parseProblems,prim.srcLine,'tool radius too large: inside contour radius is smaller than the effective tool radius ('+radius.toFixed(3)+'mm).');
      sub.splice(a,b-a+1); return 0;
    }
    var item={group:groups[gi],prim:prim,itemIndex:items.length};
    items.push(item); if(prim&&prim.type!=='vertical'){ xy.push(item); }
  }
  if(!xy.length){
    _rcReport(parseProblems,activation.srcLine,'Cannot calculate tool radius compensation without a following XY contour element.',true);
    sub.splice(a,b-a+1); return 0;
  }
  var transitionAfter={},pieces=[];
  for(var ji=0;ji<xy.length-1;ji++){
    var left=xy[ji],right=xy[ji+1],p=left.prim,q=right.prim;
    var nominalEnd=left.group.geom.to,nominalStart=right.group.geom.from;
    if(_rcDist2(nominalEnd,nominalStart)>1e-8){
      _rcReport(parseProblems,right.group.geom.srcLine,'Cannot calculate tool radius compensation: gap between contour elements.');
      sub.splice(a,b-a+1); return 0;
    }
    var t1=_rcTangent(p,true),t2=_rcTangent(q,false),cross=_rcCross(t1,t2),dot=_rcDot(t1,t2);
    var terminalChfDeparture=Math.abs(cross)<1e-9&&dot<0&&
      ji===xy.length-2&&right.itemIndex===items.length-1&&
      nextSeg&&nextSeg.rc==='R0'&&p.type==='line'&&q.type==='line'&&
      right.group.geom.afterDegenerateChf;
    if(Math.abs(cross)<1e-9&&dot>0){
      var pe=_rcPrimitiveEnd(p),qs=_rcPrimitiveStart(q);
      var snap={x:(pe.x+qs.x)/2,y:(pe.y+qs.y)/2,z:(pe.z+qs.z)/2};
      _rcSetEnd(p,snap); _rcSetStart(q,snap);
    } else if(terminalChfDeparture){
      // A 180-degree CHF immediately before the final compensated line
      // collapses to one nominal point. The last line is then the programmed
      // departure toward R0, not another inside contour corner. Preserve the
      // established legacy-simulator behaviour for this reported compatibility
      // case by leading from the current offset endpoint to that line's offset
      // endpoint. The TNC 640 manual does not explicitly define a 180-degree
      // degenerate CHF departure.
      _rcSetStart(q,_rcPrimitiveEnd(p));
    } else if(sideSign*cross<0){
      var from=_rcPrimitiveEnd(p),to=_rcPrimitiveStart(q);
      var aa0=Math.atan2(from.y-nominalEnd.y,from.x-nominalEnd.x);
      var aa1=Math.atan2(to.y-nominalEnd.y,to.x-nominalEnd.x);
      var tsweep=_rcDirectedAngle(aa0,aa1,cross>0?1:-1);
      var trans={type:'arc',kind:'RC-TRANSITION',srcLine:right.group.geom.srcLine,cx:nominalEnd.x,cy:nominalEnd.y,r:radius,a0:aa0,sweep:tsweep,z0:from.z,z1:to.z};
      transitionAfter[left.itemIndex]=trans;
    } else {
      var candidates=_rcSupportIntersections(p,q),best=null,bestScore=Infinity;
      var rawEnd=_rcPrimitiveEnd(p),rawStart=_rcPrimitiveStart(q);
      for(var ci=0;ci<candidates.length;ci++){
        if(!_rcPointOnPrimitive(candidates[ci],p,1e-5)||!_rcPointOnPrimitive(candidates[ci],q,1e-5)) continue;
        var score=_rcDist2(candidates[ci],rawEnd)+_rcDist2(candidates[ci],rawStart);
        if(score<bestScore){ best=candidates[ci]; bestScore=score; }
      }
      if(!best){
        _rcReport(parseProblems,right.group.geom.srcLine,'tool radius too large: the compensated inside contour elements have no valid intersection.');
        sub.splice(a,b-a+1); return 0;
      }
      best.z=nominalEnd.z;
      _rcSetEnd(p,best); _rcSetStart(q,best);
    }
  }
  for(var pi=0;pi<items.length;pi++) if(items[pi].prim.type!=='vertical'){
    pieces.push(items[pi].prim);
    if(transitionAfter[pi]) pieces.push(transitionAfter[pi]);
  }
  if(_rcHasLoop(pieces)){
    _rcReport(parseProblems,activation.srcLine,'tool radius too large: compensation creates a loop in the path of the tool center.');
    sub.splice(a,b-a+1); return 0;
  }
  var out=[],firstStart=_rcPrimitiveStart(xy[0].prim);
  var approach=_rcCloneSegment(activation,activation.from,firstStart,side,{rcActivation:true,programmedTo:_rcPoint(activation.to),rcGeom:firstGroup.geom});
  if(approach.len>1e-9) out.push(approach);
  var current=firstStart;
  for(var ii=0;ii<items.length;ii++){
    var it=items[ii];
    if(it.prim.type==='vertical'){
      var vg=it.group.geom;
      var vz={x:current.x,y:current.y,z:vg.to.z};
      if(Math.abs(vz.z-current.z)>1e-9) out.push(_rcCloneSegment(it.group.template,current,vz,side,{rcGeom:vg}));
      current=vz;
    } else {
      _rcEmitPrimitive(out,it.prim,it.group.template,side);
      current=_rcPrimitiveEnd(it.prim);
      if(transitionAfter[ii]){
        _rcEmitPrimitive(out,transitionAfter[ii],it.group.template,side);
        current=_rcPrimitiveEnd(transitionAfter[ii]);
      }
    }
  }
  sub.splice.apply(sub,[a,b-a+1].concat(out));
  if(nextSeg&&out.length){
    var last=out[out.length-1].to;
    var ndx=nextSeg.to.x-nextSeg.from.x,ndy=nextSeg.to.y-nextSeg.from.y;
    var pureZ=nextSeg.rc==='R0'&&Math.abs(ndx)<1e-9&&Math.abs(ndy)<1e-9;
    nextSeg.from=_rcPoint(last);
    if(pureZ){
      nextSeg.to.x=last.x; nextSeg.to.y=last.y; _recalcSegmentLen(nextSeg);
      _carryPhysicalXY(sub,a+out.length+1,last.x,last.y);
    } else _recalcSegmentLen(nextSeg);
  }
  return out.length;
}

function _applyRadiusCompPolylineFallback(sub, parseProblems){
  _offsetRunPolylineFallback._gouged = {}; // reset fallback diagnostics for this parse
  _offsetRunPolylineFallback._badRadius = {};
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
    var newLen = _offsetRunPolylineFallback(sub, i, j-1, side, prevSeg, nextSeg, parseProblems);
    // offsetRun returns the new number of segments in the run
    i = i + (newLen||0);
  }
}

function _offsetRunPolylineFallback(sub, a, b, side, prevSeg, nextSeg, parseProblems){
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
    // R1: the offset is the ACTUAL effective radius R+DR — no hidden 0.05 mm
    // floor. A 0.001 mm effective tool offsets the path by 0.001 mm.
    TR = _runTool.R + _drTab + _drPgm;
  } else {
    TR = TOOL_R;
  }
  // A non-positive effective radius cannot offset a contour. Report it and
  // remove the invalid compensated run rather than cutting the nominal path.
  if(!(TR > 0)){
    var _erLine = (sub[a] && sub[a].srcLine!=null) ? sub[a].srcLine : 0;
    if(!_offsetRunPolylineFallback._badRadius) _offsetRunPolylineFallback._badRadius = {};
    if(!_offsetRunPolylineFallback._badRadius[_erLine]){
      _offsetRunPolylineFallback._badRadius[_erLine] = true;
      var _erMsg = 'Radius compensation active with a non-positive effective tool radius (R+DR = '+TR.toFixed(3)+'mm) — compensated cutting run rejected.';
      pushParseProblem(parseProblems, {line:_erLine, sev:'err', msg:_erMsg});
      console.warn('Line '+(_erLine+1)+': '+_erMsg);
    }
    sub.splice(a, b-a+1);
    return 0;
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

  // The parser tessellates every C/RND/CR/CT primitive into many short line
  // segments, all carrying the source line of the original primitive.  Gouge
  // checks must therefore reason about that whole primitive, not treat the
  // first 2 mm chord of a large arc as an independent short contour edge.
  // Otherwise a perfectly valid L -> large C transition is rejected solely
  // because the display tessellation is fine-grained (Complete Part exposed
  // this with its 25 mm entry arc).
  var edgeGroup=[], primitiveGroups=[];
  var _lastGroup=-1, _lastGroupSrc=null, _lastGroupEdge=-2;
  for(var eg=0;eg<edges.length;eg++){
    if(!edges[eg]){ edgeGroup[eg]=-1; continue; }
    var _egSrc=sub[a+eg].srcLine;
    if(_lastGroup<0 || _egSrc!==_lastGroupSrc || eg!==_lastGroupEdge+1){
      _lastGroup=primitiveGroups.length;
      primitiveGroups.push({srcLine:_egSrc, len:0, startConsume:0, endConsume:0, cornerLine:_egSrc});
    }
    edgeGroup[eg]=_lastGroup;
    primitiveGroups[_lastGroup].len+=edges[eg].L;
    _lastGroupSrc=_egSrc;
    _lastGroupEdge=eg;
  }

  // Offset each vertex; build new point list (may insert corner arcs)
  var out=[]; // {x,y,z}
  var outSeg=[]; // parallel array: which ORIGINAL sub[] index each out[] point's metadata (rapid/feed/...) should come from
  var invalidRun=false;
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
        // At a concave corner the offset consumes TR*tan(turn/2) from each
        // adjacent programmed primitive.  Accumulate that consumption at the
        // primitive boundaries; the tool does not fit when the two ends use
        // all of the available primitive length.  Vertices inside one
        // tessellated arc are handled separately by a curvature-radius check.
        if(!isConvex){
          var _sinHalf = Math.sqrt(Math.max(0, 1 - cosHalf*cosHalf));
          var _consume = (cosHalf > 1e-6) ? TR * (_sinHalf/cosHalf) : TR*1e6;
          var _inGroup=edgeGroup[pe], _outGroup=edgeGroup[ne];
          if(_inGroup>=0 && _outGroup>=0 && _inGroup!==_outGroup){
            primitiveGroups[_inGroup].endConsume=Math.max(primitiveGroups[_inGroup].endConsume,_consume);
            primitiveGroups[_outGroup].startConsume=Math.max(primitiveGroups[_outGroup].startConsume,_consume);
            primitiveGroups[_inGroup].cornerLine=sub[a+pe].srcLine;
            primitiveGroups[_outGroup].cornerLine=sub[a+ne].srcLine;
          } else if(_inGroup>=0 && _inGroup===_outGroup && ne===pe+1){
            // Three consecutive points belonging to the same source primitive
            // describe its local curvature.  This reliably rejects a genuine
            // inner arc/fillet whose radius is smaller than the effective tool
            // radius without confusing chord length with feature size.
            var _pa=verts[pe], _pb=verts[pe+1], _pc=verts[ne+1];
            var _ab=Math.hypot(_pb.x-_pa.x,_pb.y-_pa.y);
            var _bc=Math.hypot(_pc.x-_pb.x,_pc.y-_pb.y);
            var _ca=Math.hypot(_pa.x-_pc.x,_pa.y-_pc.y);
            var _twiceArea=Math.abs((_pb.x-_pa.x)*(_pc.y-_pa.y)-(_pb.y-_pa.y)*(_pc.x-_pa.x));
            if(_twiceArea>1e-9){
              var _curveR=(_ab*_bc*_ca)/(2*_twiceArea);
              if(_curveR + 1e-6 < TR){ invalidRun=true; }
            }
          }
        }
        if(cosHalf > 0.9990){
          // Near-tangent junction (arc/straight tangency): use incoming normal exactly
          // Avoids bisector approximation error at RND arc entry/exit points
          out.push({x:verts[v].x+ein.nx*TR, y:verts[v].y+ein.ny*TR, z:verts[v].z}); outSeg.push(_segTag);
        } else if(isConvex){
          // Every non-tangent convex outer corner gets the control-style
          // transitional arc; shallow corners must not silently become mitres.
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

  // A straight/arc primitive may be bounded by inner corners at both ends.
  // Reject only when their required tangential distances overlap (or leave no
  // usable length). Equality is deliberately treated as non-fitting: there is
  // no finite contour interval left between the two compensated transitions.
  for(var pg=0;pg<primitiveGroups.length;pg++){
    var _prim=primitiveGroups[pg];
    if(_prim.startConsume+_prim.endConsume >= _prim.len-1e-6 &&
       _prim.startConsume+_prim.endConsume>1e-9){
      invalidRun=true;
    }
  }

  if(invalidRun){
    var _gLine=(sub[a]&&sub[a].srcLine!=null)?sub[a].srcLine:0;
    if(!_offsetRunPolylineFallback._gouged) _offsetRunPolylineFallback._gouged = {};
    if(!_offsetRunPolylineFallback._gouged[_gLine]){
      _offsetRunPolylineFallback._gouged[_gLine]=true;
      var _gMsg='Inner corner/radius is smaller than the compensation radius ('+TR.toFixed(3)+'mm) — compensated cutting run rejected (tool radius too large).';
      pushParseProblem(parseProblems, {line:_gLine,sev:'err',msg:_gMsg});
      console.warn('Line '+(_gLine+1)+': '+_gMsg);
    }
    sub.splice(a, b-a+1);
    return 0;
  }

  // Rewrite the run's segments to follow the offset point list.
  // We have (b-a+1) original segments and 'out' has >= nv points.
  // Rebuild: replace segment endpoints, distributing extra arc points.
  // Connect boundaries: prev segment's 'to' → first offset point;
  // next segment's 'from' → last offset point (avoids jump/gouge at R0 transition).
  if(prevSeg && out.length>0){ prevSeg.to = {x:out[0].x, y:out[0].y, z:out[0].z}; var pdx=prevSeg.to.x-prevSeg.from.x,pdy=prevSeg.to.y-prevSeg.from.y,pdz=prevSeg.to.z-prevSeg.from.z; prevSeg.len=Math.sqrt(pdx*pdx+pdy*pdy+pdz*pdz); }
  if(nextSeg && out.length>0){
    var lp=out[out.length-1];
    var _nextDx=nextSeg.to.x-nextSeg.from.x, _nextDy=nextSeg.to.y-nextSeg.from.y;
    var _pureZCancel=nextSeg.rc==='R0' && Math.abs(_nextDx)<1e-9 && Math.abs(_nextDy)<1e-9;
    nextSeg.from = {x:lp.x, y:lp.y, z:lp.z};
    if(_pureZCancel){
      // R0 changes compensation state but a Z-only block has no lateral motion
      // with which to return the physical tool centre to the nominal contour.
      // Keep the retract vertical at the last compensated XY and carry that
      // real position through later Z/state-only segments. The first later XY
      // move can then perform the normal lead-out to its programmed target.
      nextSeg.to.x=lp.x; nextSeg.to.y=lp.y;
      _recalcSegmentLen(nextSeg);
      _carryPhysicalXY(sub, b+2, lp.x, lp.y);
    } else {
      _recalcSegmentLen(nextSeg);
    }
  }
  return rebuildRunSegments(sub, a, b, out, outSeg);
}

function _recalcSegmentLen(seg){
  var dx=seg.to.x-seg.from.x, dy=seg.to.y-seg.from.y, dz=seg.to.z-seg.from.z;
  seg.len=Math.sqrt(dx*dx+dy*dy+dz*dz);
}

function _carryPhysicalXY(sub, start, x, y){
  for(var i=start;i<sub.length;i++){
    var seg=sub[i];
    var dx=seg.to.x-seg.from.x, dy=seg.to.y-seg.from.y;
    seg.from={x:x,y:y,z:seg.from.z};
    if(Math.abs(dx)<1e-9 && Math.abs(dy)<1e-9){
      seg.to.x=x; seg.to.y=y;
      _recalcSegmentLen(seg);
      continue;
    }
    // First programmed XY move after the Z-only cancellation: start from the
    // actual carried position and lead out to the nominal programmed target.
    _recalcSegmentLen(seg);
    break;
  }
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
      spindleDir:meta.spindleDir, threadHand:meta.threadHand||0,
      coolantOn:meta.coolantOn, len:len, blockIndex:meta.blockIndex, srcLine:meta.srcLine,
      rc:meta.rc, toolNum:meta.toolNum, pendingDef:meta.pendingDef,
      safeRetract:!!meta.safeRetract, ensureVisible:!!meta.ensureVisible,
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

  var min = prog.blkMin, max = prog.blkMax;
  var w = max.x-min.x, d = max.y-min.y, h = max.z-min.z;
  var hiPlan=planRefineVoxelGrid(w,d,h,VX_QUALITY);
  if(!hiPlan){
    if(btn){ btn.disabled=false; btn.textContent='◆ Refine'; }
    _hideRefineIndicator();
    updateStatus('Refine could not plan a valid voxel grid', false);
    return;
  }
  var nx=hiPlan.nx, ny=hiPlan.ny, nz=hiPlan.nz;
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
        updateStatus('Precise mesh ready \u2014 '+prog.totalBlocks+' simulation steps', false);
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
  if(sm.cycleEvent) return;
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
  // Expanded CALL LBL body blocks deliberately point at the CALL line so the
  // editor highlights the instruction that started the subprogram. That line
  // is outside the LBL body, therefore recover its explicit target first.
  var source=(lines[srcLine]||'').trim().replace(/;.*$/,'').trim().toUpperCase();
  var call=source.match(/^CALL\s+LBL\s+(\d+)/);
  if(call) return call[1];
  var activeLbl = null;
  for(var i=0; i<=Math.min(srcLine, lines.length-1); i++){
    var u = lines[i].trim().replace(/;.*$/,'').trim().toUpperCase();
    if(/^LBL\s+0/.test(u)){ activeLbl = null; }
    else if(/^LBL\s+(\d+)/.test(u)){ var m=u.match(/^LBL\s+(\d+)/); if(m) activeLbl=m[1]; }
  }
  return activeLbl;
}
