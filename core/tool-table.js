// tool-table -- verified byte-for-byte identical between web and android repos.

function inferToolType(t){
  if(t && TOOL_TYPES.indexOf(t.TYPE)>=0) return t.TYPE;
  var r = (t&&t.R)||0, ta = (t&&t.T_ANGLE)||0;
  if(ta>0 && r<0.01) return 'COUNTERSINK';
  if(ta>0) return 'DRILL';
  return 'MILL';
}

function getToolByNum(n){ return toolLibrary.find(function(t){ return t.T===n; })||null; }

function nextFreeToolNumber(){
  for(var n=1;n<=999;n++) if(!getToolByNum(n)) return n;
  return 1000;
}

function toolEsc(value){
  return String(value===undefined||value===null?'':value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function effectiveToolRadius(t){
  if(!t) return 5;
  return Math.max(0.001, t.R + (inferToolType(t)==='MILL'?(t.DR||0):0));
}

function resolveToolCall(n){
  var requested=getToolByNum(n);
  if(!requested) return {requested:n,tool:null,toolNum:n,replacement:false,locked:false};
  if(!requested.TL) return {requested:n,tool:requested,toolNum:n,replacement:false,locked:false};
  var replacement=requested.RT ? getToolByNum(requested.RT) : null;
  if(replacement && !replacement.TL) return {requested:n,tool:replacement,toolNum:replacement.T,replacement:true,locked:true};
  return {requested:n,tool:requested,toolNum:n,replacement:false,locked:true};
}

function toolEntryErrors(t, allTools){
  var errs=[];
  function finite(v){ return typeof v==='number' && isFinite(v); }
  if(!finite(t.T)||Math.floor(t.T)!==t.T||t.T<1||t.T>999) errs.push('T must be a whole number from 1 to 999');
  if(TOOL_TYPES.indexOf(t.TYPE)<0) errs.push('TYPE is invalid');
  if(!t.NAME||t.NAME.length>16) errs.push('NAME must contain 1–16 characters');
  if(!finite(t.L)||t.L<=0||t.L>300) errs.push('L must be 0.001–300 mm');
  if(!finite(t.R)||t.R<=0||t.R>100) errs.push('R must be 0.001–100 mm');
  if(!finite(t.R2)||t.R2<0||t.R2>t.R) errs.push('R2 must be 0–R ('+t.R+' mm)');
  if(!finite(t.DL)||t.DL<-300||t.DL>300||t.L+t.DL<=0) errs.push('DL must keep effective length L+DL above 0 mm');
  if(!finite(t.DR)||t.DR<-100||t.DR>100) errs.push('DR must be -100–100 mm');
  if(!finite(t.DR2)||t.DR2<-100||t.DR2>100) errs.push('DR2 must be -100–100 mm');
  if(t.TYPE==='MILL' && t.R+t.DR<=0) errs.push('DR must keep effective radius R+DR above 0 mm');
  if(t.R2>0 && (t.R2+t.DR2<=0 || t.R2+t.DR2>t.R+(t.TYPE==='MILL'?t.DR:0))) errs.push('DR2 must keep effective R2 above 0 and not larger than the effective tool radius');
  if(!finite(t.CUT)||Math.floor(t.CUT)!==t.CUT||t.CUT<1||t.CUT>20) errs.push('CUT must be a whole number from 1 to 20');
  if(!finite(t.LCUTS)||t.LCUTS<=0||t.LCUTS>t.L+t.DL) errs.push('LCUTS must be above 0 and no larger than effective length L+DL');
  if(!finite(t.ANGLE)||t.ANGLE<0||t.ANGLE>90) errs.push('ANGLE must be 0–90°');
  if(!finite(t.T_ANGLE)||(t.T_ANGLE!==0&&(t.T_ANGLE<10||t.T_ANGLE>170))) errs.push('T-ANGLE must be 0 (flat) or 10–170°');
  if(t.TYPE==='COUNTERSINK' && !(t.T_ANGLE>0)) errs.push('COUNTERSINK requires T-ANGLE > 0');
  if(!finite(t.RT)||Math.floor(t.RT)!==t.RT||t.RT<0||t.RT>999) errs.push('RT must be 0 or a whole tool number from 1 to 999');
  if(t.RT===t.T) errs.push('RT cannot reference the same tool');
  if(t.RT && allTools && !allTools.some(function(x){return x.T===t.RT;})) errs.push('RT references missing tool T'+t.RT);
  if(!finite(t.TIME2)||t.TIME2<0) errs.push('TIME2 must be 0 or more');
  if(!finite(t.CUR_TIME)||t.CUR_TIME<0) errs.push('CUR.TIME must be 0 or more');
  if(t.DOC.length>120) errs.push('DOC must contain at most 120 characters');
  return errs;
}

function normalizeImportedTool(raw){
  var type=(raw && TOOL_TYPES.indexOf(raw.TYPE)>=0) ? raw.TYPE : inferToolType(raw||{});
  var tNum=Number(raw.T), radius=Number(raw.R);
  var r2=raw.R2===undefined?0:Number(raw.R2);
  var length=raw.L===undefined?75:Number(raw.L);
  var dl=raw.DL===undefined?0:Number(raw.DL);
  return {
    T:tNum, TYPE:type,
    NAME:String(raw.NAME===undefined?('TOOL_'+tNum):raw.NAME).trim().replace(/\s+/g,'_').toUpperCase(),
    L:length, R:radius, R2:r2,
    DL:dl, DR:raw.DR===undefined?0:Number(raw.DR), DR2:raw.DR2===undefined?0:Number(raw.DR2),
    CUT:raw.CUT===undefined?2:Number(raw.CUT),
    LCUTS:raw.LCUTS===undefined?(r2>0&&r2>=radius?r2:Math.min(25,length+dl)):Number(raw.LCUTS),
    ANGLE:raw.ANGLE===undefined?0:Number(raw.ANGLE), T_ANGLE:raw.T_ANGLE===undefined?0:Number(raw.T_ANGLE),
    TL:raw.TL===true, RT:raw.RT===undefined?0:Number(raw.RT),
    TIME2:raw.TIME2===undefined?0:Number(raw.TIME2), CUR_TIME:raw.CUR_TIME===undefined?0:Number(raw.CUR_TIME),
    DOC:String(raw.DOC===undefined?'':raw.DOC).trim()
  };
}

function invalidateToolTableState(){
  var activeNum=(typeof currentToolNum!=='undefined'&&currentToolNum)?currentToolNum:TOOL_NUM;
  TOOL_R=effectiveToolRadius(getToolByNum(activeNum));
  if(typeof buildToolMesh==='function' && typeof toolGroup!=='undefined' && toolGroup) buildToolMesh();
  if(typeof onReset==='function') onReset();
  if(typeof runValidation==='function') runValidation();
  var stale=document.getElementById('staleSimWarning');
  if(stale) stale.style.display='';
}

function field(id, label, val, type, title, min2, minV, maxV){
  var step = type==='number' ? (id==='T'?1:0.001) : undefined;
  var attrs = 'id="tf_'+id+'" style="font-family:var(--mono);font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px 7px;width:80px;outline:none;" title="'+(title||label)+'"';
  // type="text" + inputmode="decimal" instead of type="number": iOS numeric
  // keyboards often lack the minus sign (DL/DR/DR2 need negatives) and EU
  // locales type a comma, which makes a type=number value invalid/empty.
  // pFloat() on save already accepts both comma and dot.
  if(type==='number') attrs += ' type="text" inputmode="decimal" autocomplete="off" autocorrect="off" autocapitalize="off"'+(minV!==undefined?' data-min="'+minV+'"':'')+(maxV!==undefined?' data-max="'+maxV+'"':'');
  else attrs += ' type="text"';
  return '<label style="font-family:var(--mono);font-size:11px;color:var(--text3);display:flex;flex-direction:column;gap:2px;">'+label
    +'<input '+attrs+' value="'+(val!==undefined&&val!==null?val:'')+'">'
    +'</label>';
}

function renderToolForm(num, overrides){
  var t = (num !== null) ? getToolByNum(num) : null;
  var isNew = !t || !t.T;
  var nextT = isNew ? nextFreeToolNumber() : t.T;
  var ov = overrides || {};
  var curType = ov.hasOwnProperty('TYPE') ? ov.TYPE : (isNew ? 'MILL' : inferToolType(t));

  // fv: override value (from a just-changed dropdown re-render) wins, else existing tool value, else default-for-new
  function fv(id, def){ return ov.hasOwnProperty(id) ? ov[id] : (isNew ? def : t[id]); }

  function field(id, label, val, type, desc, step, min, max){
    var attrs = '';
    if(min!==undefined) attrs += ' data-min="'+min+'"';
    if(max!==undefined) attrs += ' data-max="'+max+'"';
    var _ftype = (type||'number');
    if(_ftype==='number'){ _ftype='text'; attrs += ' inputmode="decimal" autocomplete="off" autocorrect="off" autocapitalize="off"'; }
    return '<div class="tool-field">'
      +'<label>'+label+'</label>'
      +'<input id="tf_'+id+'" type="'+_ftype+'"'+attrs+' value="'+toolEsc(val)+'">'
      +'<span class="field-desc">'+desc+'</span>'
      +'</div>';
  }

  var typeField = '<div class="tool-field">'
    +'<label>TYPE — Tool type</label>'
    +'<select id="tf_TYPE" onchange="toolTypeChanged()" style="font-family:var(--mono);font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px 7px;">'
    + TOOL_TYPES.map(function(ty){ return '<option value="'+ty+'"'+(ty===curType?' selected':'')+'>'+TOOL_TYPE_LABEL[ty]+'</option>'; }).join('')
    +'</select>'
    +'</div>';

  var rDesc = {
    MILL:        'Cutting radius = diameter / 2. Used for RL/RR compensation',
    DRILL:       'Real, fixed cutting radius (diameter / 2) — the largest radius outside the tip. Does not change with DR.',
    COUNTERSINK: 'Usually \u22480.001 (sharp tip). A real value (e.g. 2 mm) gives a flat/truncated tip of that radius — the cone still widens above it to the LCUTS/T-ANGLE diameter. Does not change with DR.'
  }[curType];
  var drDesc = {
    MILL:        'Delta value added to R. Positive = oversize, negative = undersize',
    DRILL:       'Not applied for a drill/reamer — has no meaning on a real machine, ignored by the simulator.',
    COUNTERSINK: 'Does NOT change the cone\u2019s physical shape — it only offsets the path (RL/RR, CYCL DEF 208), exactly like a real control. Pair with DL = -DR/tan(T-ANGLE/2) so the cone\u2019s own edge meets that offset path.'
  }[curType];

  return '<div class="tool-form">'
    +'<h3>'+(isNew?'New Tool':'T'+t.T+' — '+toolEsc(t.NAME))+'</h3>'
    +field('T',     'T — Tool number',       isNew?nextT:t.T,    'number', 'Tool number used in TOOL CALL', '1', 1, 999)
    +typeField
    +field('NAME',  'NAME — Tool name',      fv('NAME',''),    'text',   'Max 16 chars, no spaces. E.g. END_MILL_D10')
    +field('L',     'L — Tool length (mm)',  fv('L',75),       'number', 'Distance from spindle gauge to tool tip', '0.001', 0.001, 300)
    +field('R',     'R — Tool radius (mm)',  fv('R',5),        'number', rDesc, '0.001', 0.001, 100)
    +field('R2',    'R2 — Corner radius (mm)',fv('R2',0),      'number', 'Radius of rounded cutting corner (toroidal cutter). 0 = flat end mill, R2=R = ball nose', '0.001')
    +field('DL',    'DL — Length oversize',  fv('DL',0),       'number', 'Delta value added to L. Used for wear compensation', '0.001')
    +field('DR',    'DR — Radius oversize',  fv('DR',0),       'number', drDesc, '0.001')
    +field('DR2',   'DR2 — R2 oversize',     fv('DR2',0),      'number', 'Delta value added to R2', '0.001')
    +field('CUT',   'CUT — Number of teeth', fv('CUT',4),      'number', 'Reference number of cutting edges; stored and exported but not used to change geometry', '1', 1, 20)
    +(function(){
      var _ta = pFloat(fv('T_ANGLE', curType==='DRILL'?118:0))||0;
      var _r  = pFloat(fv('R',5))||5;
      var _r2 = pFloat(fv('R2',0))||0;
      var _lcDef = fv('LCUTS', isNew?(curType==='DRILL'?(_r*2*6):25):undefined);
      if(curType==='COUNTERSINK' && _ta > 0){
        // Chamfer/countersink: LCUTS + T-ANGLE are MANDATORY — together they set the
        // tool's physical max diameter for simulation: Ø = 2·LCUTS·tan(angle/2),
        // independent of R. R itself is usually ≈0 (sharp tip); a real R gives a
        // flat/truncated tip of diameter 2·R, and the cone still widens above it
        // to reach the same max Ø.
        var _h2 = (_ta/2)*Math.PI/180;
        var _lcVal = (_lcDef!==undefined && _lcDef!==null && _lcDef!=='') ? pFloat(_lcDef) : (isNew?5:(t.LCUTS||5));
        var _dia = (2*_lcVal*Math.tan(_h2));
        var _rNow = pFloat(fv('R',0.001))||0.001;
        var _tipNote = (_rNow>0.01) ? (' Tip is flat/truncated, \u2300'+(2*_rNow).toFixed(2)+' mm, then widens to the max \u2300 above.') : '';
        return field('LCUTS', 'LCUTS — Tooth length (cone height) — required', _lcVal, 'number',
          'Required. Cutting-edge height of the cone, measured from the imaginary sharp apex. Max diameter = 2\u00d7LCUTS\u00d7tan(T-ANGLE/2). For this tool: \u2300'+(_dia.toFixed(2))+' mm at full depth.'+_tipNote, '0.1');
      } else if(curType==='DRILL'){
        // Drill/reamer: R is authoritative (real radius) — LCUTS is just the real
        // cutting/flute height (e.g. ~6× diameter for a standard jobber drill).
        // No formula link to R/T-ANGLE, no validation needed.
        var _lcVal3 = (_lcDef!==undefined && _lcDef!==null && _lcDef!=='') ? _lcDef : (isNew?(_r*2*6):t.LCUTS);
        return field('LCUTS', 'LCUTS — Cutting/flute height (mm)', _lcVal3, 'number',
          'Real cutting-edge (flute) length along the tool axis — how deep this drill/reamer can cut. Typical rule of thumb: ~6\u00d7 diameter for a standard drill (e.g. \u00d88 mm \u2192 ~48 mm). Purely informational — no link to R or T-ANGLE.', '0.1');
      } else if(_r2>0 && _r2>=_r){
        // ball nose: show R2, read-only
        return '<div class="tool-field"><label>LCUTS — Tooth length</label><span style="font-family:var(--mono);font-size:12px;color:var(--text2);">'+_r2+' mm <span style="color:var(--text3);font-size:10px;">(auto: ball radius)</span></span></div>';
      } else {
        var _lcVal2 = (_lcDef!==undefined && _lcDef!==null && _lcDef!=='') ? _lcDef : (isNew?25:t.LCUTS);
        return field('LCUTS', 'LCUTS — Tooth length', _lcVal2, 'number', 'Cutting edge length along tool axis. Used in Cycle 22 (pocket roughing)', '0.1');
      }
    })()
    +field('ANGLE',   'ANGLE — Max ramp angle (°)',    fv('ANGLE',3),        'number', 'Reference value for the tool. The simulator displays and exports it but does not alter a programmed path from it.', '0.1', 0, 90)
    +field('T_ANGLE', 'T-ANGLE — Tool point angle (°)', fv('T_ANGLE', curType==='DRILL'?118:0), 'number', 'Full included angle of tool tip. Drill = 118°, center drill = 142°, countersink — any angle. 0 disables the conical tip (flat end mill / ball nose).', '0.1', 0, 170)
    +'<div class="tool-field"><label>TL — Tool locked</label>'
      +'<input id="tf_TL" type="checkbox" '+((ov.hasOwnProperty('TL')?ov.TL:(!isNew&&t.TL))?'checked':'')+' style="width:auto;margin-top:4px;">'
      +'<span class="field-desc">Lock tool to prevent use (e.g. after breakage)</span>'
    +'</div>'
    +field('RT',    'RT — Replacement tool', fv('RT',0),       'number', 'Unlocked replacement tool used automatically when this tool is locked. 0 = none')
    +field('TIME2',    'TIME2 — Max tool life (min)', fv('TIME2',100), 'number', 'When the completed simulation reaches this cutting-time limit, the tool is locked for the next run. 0 = no limit')
    +field('CUR_TIME', 'CUR.TIME — Current run cutting time (min)', fv('CUR_TIME',0), 'number', 'Cutting time calculated for the most recently completed simulation.', '0.1')
    +field('DOC',   'DOC — Comment',         fv('DOC',''),     'text',   'Free text comment, shown in table')
    +'<div class="tool-form-btns">'
      +'<button class="tool-btn-save" onclick="toolSave('+(isNew?'null':num)+')">'+(isNew?'Add Tool':'Save Changes')+'</button>'
      +'<button class="tool-btn-cancel" onclick="toolCancelEdit()">Cancel</button>'
    +'</div>'
    +'</div>';
}

function toolTypeChanged(){
  var wrap = document.getElementById('toolFormWrap');
  if(!wrap) return;
  var ids = ['NAME','L','R','R2','DL','DR','DR2','CUT','LCUTS','ANGLE','T_ANGLE','RT','TIME2','CUR_TIME','DOC'];
  var ov = {};
  ids.forEach(function(id){
    var elx = document.getElementById('tf_'+id);
    if(elx) ov[id] = elx.value;
  });
  var tlEl = document.getElementById('tf_TL');
  if(tlEl) ov.TL = tlEl.checked;
  var tyEl = document.getElementById('tf_TYPE');
  if(tyEl) ov.TYPE = tyEl.value;
  // Friendly default: switching to DRILL with no point angle set yet -> suggest 118°
  if(ov.TYPE==='DRILL' && (!ov.T_ANGLE || pFloat(ov.T_ANGLE)===0)) ov.T_ANGLE = '118';
  wrap.innerHTML = renderToolForm(editingTool, ov);
}

function toolSave(oldNum){
  function formNum(id, blankValue){
    var raw=document.getElementById('tf_'+id).value.trim();
    return raw==='' ? blankValue : pFloat(raw);
  }
  var T      = formNum('T',NaN);
  var _tyEl  = document.getElementById('tf_TYPE');
  var TYPE   = (_tyEl && TOOL_TYPES.indexOf(_tyEl.value)>=0) ? _tyEl.value : 'MILL';
  var NAME   = document.getElementById('tf_NAME').value.trim().replace(/\s+/g,'_').toUpperCase()||'TOOL_'+T;
  var L      = formNum('L',NaN);
  var R      = formNum('R',NaN);
  var R2     = formNum('R2',0);
  var DL     = formNum('DL',0);
  var DR     = formNum('DR',0);
  var DR2    = formNum('DR2',0);
  var CUT    = formNum('CUT',NaN);
  var ANGLE   = formNum('ANGLE',NaN);
  var T_ANGLE = formNum('T_ANGLE',0);
  // LCUTS: editable <input> for flat AND cone tools (renderToolForm renders a
  // real input for both). For cone tools LCUTS = cone cutting-edge height and
  // defines the cone's widest diameter (2·LCUTS·tan(angle/2)) — same as a real
  // control — so we keep the user's value. Only a full ball nose auto-derives
  // it (= R2), where the form shows a read-only span (no tf_LCUTS element).
  var _lcutsEl = document.getElementById('tf_LCUTS');
  var LCUTS  = _lcutsEl ? formNum('LCUTS',NaN) : 0;
  if(!_lcutsEl && R2 > 0 && R2 >= R){
    // Full ball nose: LCUTS = R2 (form had no editable field for it)
    LCUTS = R2;
  }
  var TL     = document.getElementById('tf_TL').checked;
  var RT     = formNum('RT',0);
  var TIME2    = formNum('TIME2',0);
  var CUR_TIME = formNum('CUR_TIME',0);
  var DOC    = document.getElementById('tf_DOC').value.trim();

  var entry = {T:T,TYPE:TYPE,NAME:NAME,L:L,R:R,R2:R2,DL:DL,DR:DR,DR2:DR2,CUT:CUT,LCUTS:LCUTS,ANGLE:ANGLE,T_ANGLE:T_ANGLE,TL:TL,RT:RT,TIME2:TIME2,CUR_TIME:CUR_TIME,DOC:DOC};
  var prospective=toolLibrary.filter(function(t){return oldNum===null||t.T!==oldNum;}).concat([entry]);
  var toolErrs=toolEntryErrors(entry,prospective);
  if(oldNum!==null && T!==oldNum && toolLibrary.some(function(t){return t.T===T;})) toolErrs.push('T'+T+' already exists');
  if(toolErrs.length){ _toast('Cannot save:\n'+toolErrs.join('\n'), true); return; }

  if(oldNum !== null){
    var idx = toolLibrary.findIndex(function(t){ return t.T===oldNum; });
    if(idx>=0) toolLibrary[idx] = entry;
    if(T!==oldNum) toolLibrary.forEach(function(t){ if(t.RT===oldNum) t.RT=T; });
  } else {
    if(toolLibrary.find(function(t){ return t.T===T; })){ _toast('T'+T+' already exists.', true); return; }
    if(toolLibrary.length>=30){ _toast('Tool Table is full (max 30 tools).', true); return; }
    toolLibrary.push(entry);
  }
  toolLibrary.sort(function(a,b){ return a.T-b.T; });
  invalidateToolTableState();

  editingTool = null;
  renderToolsTab();
}

function toolEdit(num){
  editingTool = num;
  var wrap = document.getElementById('toolFormWrap');
  if(wrap) wrap.innerHTML = renderToolForm(num);
  else renderToolsTab();
}

function toolDeleteConfirm(num, btn){
  _editorConfirm('Delete T'+num+'?', function(){
    toolLibrary = toolLibrary.filter(function(t){ return t.T!==num; });
    toolLibrary.forEach(function(t){ if(t.RT===num) t.RT=0; });
    invalidateToolTableState();
    renderToolsTab();
  });
}

function toolCancelEdit(){
  editingTool = null;
  renderToolsTab();
}

function toolDelete(num){
  toolLibrary = toolLibrary.filter(function(t){ return t.T!==num; });
  toolLibrary.forEach(function(t){ if(t.RT===num) t.RT=0; });
  invalidateToolTableState();
  renderToolsTab();
}

function toolTableExport(){
  var data = JSON.stringify(toolLibrary, null, 2);
  _downloadTextFile(data, 'tools.tnt');
}

function toolTableImport(){
  var inp=document.getElementById('toolImportInput');
  if(inp){ inp.value=''; inp.click(); }
}

function onToolImportFile(e){
  var file=e.target.files&&e.target.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var arr=JSON.parse(ev.target.result);
      if(!Array.isArray(arr)) throw new Error('Expected a tool array');
      if(arr.length>30) throw new Error('Tool Table is full (max 30 tools)');
      var imported=arr.map(function(t,idx){
        if(!t||typeof t!=='object'||Array.isArray(t)) throw new Error('Tool '+(idx+1)+' is not an object');
        return normalizeImportedTool(t);
      });
      var seen={};
      imported.forEach(function(t,idx){
        if(seen[t.T]) throw new Error('Duplicate tool number T'+t.T);
        seen[t.T]=true;
        var errs=toolEntryErrors(t,imported);
        if(errs.length) throw new Error('Tool '+(idx+1)+': '+errs.join('; '));
      });
      toolLibrary=imported.sort(function(a,b){return a.T-b.T;});
      invalidateToolTableState();
      renderToolsTab();
    }catch(err){ _toast('Import failed: '+err.message, true); }
    e.target.value='';
  };
  reader.onerror=function(){ _toast('Could not read file: '+(reader.error&&reader.error.message||'unknown error'), true); e.target.value=''; };
  reader.readAsText(file);
}

function toolAddNew(){
  toolEdit(null);
  setTimeout(function(){
    var el=document.getElementById('tf_T');
    if(el){el.value=nextFreeToolNumber(); el.select();}
  },30);
}

function renderToolsTab(){
  var el = document.getElementById('viewTools');
  if(!el) return;
  editingTool = null;
  var m = document.getElementById('code').value.match(/TOOL CALL\s+(\d+)/i);
  var activeNum = m ? parseInt(m[1]) : 0;

  var html = '';
  html += '<div style="font-family:var(--mono);font-size:11px;color:var(--text3);margin-bottom:12px;">Select a tool to edit, or click <b style=\"color:var(--text2);\">+ Add tool</b> to create a new one. <span class="tt-help-hint">Click <b style=\"color:var(--text2);\">? Help</b> above, then any column header, for an explanation.</span></div>';
  html += '<div>';

  // Left: table
  html += '<div style="overflow-x:auto;width:100%;">';
  html += '<table class="tools-table"><thead><tr>'
    +'<th data-help="tt-T">T</th><th data-help="tt-TYPE">TYPE</th><th data-help="tt-NAME">NAME</th><th data-help="tt-L">L</th><th data-help="tt-R">R</th><th data-help="tt-R2">R2</th>'
    +'<th data-help="tt-DL">DL</th><th data-help="tt-DR">DR</th><th data-help="tt-DR2">DR2</th><th data-help="tt-CUT">CUT</th><th data-help="tt-LCUTS">LCUTS</th><th data-help="tt-ANGLE">ANGLE</th><th data-help="tt-TANGLE">T-ANGLE</th>'
    +'<th data-help="tt-TL">TL</th><th data-help="tt-RT">RT</th><th data-help="tt-TIME2">TIME2</th><th data-help="tt-CURTIME">CUR.TIME</th><th data-help="tt-DOC">DOC</th><th></th>'
    +'</tr></thead><tbody>';

  var TOOLS_COLSPAN = 19;
  var groupDesc = {
    MILL:        'MILL — end mills & ball nose (R/R2 define the cutting shape)',
    DRILL:       'DRILL — twist drills & reamers (R is the real, fixed cutting radius)',
    COUNTERSINK: 'COUNTERSINK — chamfer / deburring tools (T-ANGLE + LCUTS required \u2192 max \u00d8; R\u22480.001 unless a flat tip is needed)'
  };
  TOOL_TYPES.forEach(function(grp){
    var rows = toolLibrary.filter(function(t){ return t && t.T && inferToolType(t)===grp; });
    if(!rows.length) return;
    html += '<tr class="tool-group-row"><td colspan="'+TOOLS_COLSPAN+'" style="font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.3px;color:'+TOOL_TYPE_COLOR[grp]+';background:var(--bg2,rgba(128,128,128,.08));padding:5px 8px;border-top:1px solid var(--border);">'+groupDesc[grp]+'</td></tr>';
    rows.forEach(function(t){
    var active = t.T === activeNum;
    html += '<tr class="'+(active?'active-tool':'')+'">';
    var _tc2 = TOOL_CUT_COLORS[(t.T-1)%TOOL_CUT_COLORS.length];
    var _hex2 = '#'+[_tc2[0],_tc2[1],_tc2[2]].map(function(v){ return ('0'+Math.round(v*255).toString(16)).slice(-2); }).join('');
    html += '<td class="tool-num"><span class="tool-swatch" style="background:'+_hex2+'"></span>'+(active?'▶ ':'')+t.T+'</td>';
    html += '<td><span style="display:inline-block;font-size:9px;font-weight:600;padding:1px 6px;border-radius:9px;color:#fff;background:'+TOOL_TYPE_COLOR[grp]+';">'+TOOL_TYPE_LABEL[grp]+'</span></td>';
    html += '<td>'+toolEsc(t.NAME)+'</td>';
    html += '<td>'+t.L+'</td>';
    html += '<td>'+t.R+'</td>';
    html += '<td>'+t.R2+'</td>';
    html += '<td>'+(t.DL||0)+'</td>';
    html += '<td>'+(t.DR||0)+'</td>';
    html += '<td>'+(t.DR2||0)+'</td>';
    html += '<td>'+t.CUT+'</td>';
    html += '<td>'+t.LCUTS+'</td>';
    html += '<td>'+(t.ANGLE||0)+'</td>';
    html += '<td>'+(t.T_ANGLE||0)+'</td>';
    html += '<td>'+(t.TL?'L':'-')+'</td>';
    html += '<td>'+(t.RT||'-')+'</td>';
    var _ct=t.CUR_TIME||0, _t2=t.TIME2||0;
    var _pct=_t2>0?Math.min(100,Math.round(_ct/_t2*100)):0;
    var _barCol=_pct>=90?'#ff5d5d':_pct>=70?'#e8a23a':'#5dcaa5';
    html += '<td>'+(_t2||0)+'</td>';
    html += '<td><div style="display:flex;align-items:center;gap:4px;">'
      +'<div style="width:36px;height:5px;background:var(--border);border-radius:3px;overflow:hidden;">'
      +'<div style="width:'+_pct+'%;height:100%;background:'+_barCol+';border-radius:3px;"></div></div>'
      +_ct.toFixed(1)+'</div></td>';
    html += '<td style="color:var(--text3)">'+toolEsc(t.DOC)+'</td>';
    html += '<td class="tool-actions">'
      +'<button class="tool-act-btn" onclick="toolEdit('+t.T+')">Edit</button>'
      +'<button class="tool-act-btn del" onclick="toolDeleteConfirm('+t.T+', this)">Del</button>'
      +'</td>';
    html += '</tr>';
    });
  });
  html += '</tbody></table>';
  html += '<br><div style="display:flex;gap:8px;margin-top:4px;align-items:center;flex-wrap:wrap;">'
    +'<button class="tool-act-btn" style="font-size:10px;padding:4px 12px;" onclick="toolAddNew()">+ Add tool</button>'
    +'<button class="tool-act-btn" style="font-size:10px;padding:4px 10px;" onclick="toolTableExport()" title="Export as .tnt JSON">&#8595; Export</button>'
    +'<button class="tool-act-btn" style="font-size:10px;padding:4px 10px;" onclick="toolTableImport()" title="Import .tnt JSON">&#8593; Import</button>'
    +'<input type="file" id="toolImportInput" accept="application/json,text/plain,.json,.tnt,.txt" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;left:-9999px;" onchange="onToolImportFile(event)">'
    +'<span style="font-family:var(--mono);font-size:10px;color:var(--text3);">Export / Import is for this simulator only — it saves the table as a .tnt JSON file, not a real control tool table.</span>'
    +'</div>';
  html += '</div>';

  // Right: form
  html += '<div id="toolFormWrap">'+(editingTool !== null ? renderToolForm(editingTool) : '')+'</div>';
  html += '</div>';
  el.innerHTML = html;
}

function insertToolDef(){
  var code = codeEl.value;
  var pos = codeEl.selectionStart;
  var before = code.slice(0, pos);
  var m = before.match(/TOOL CALL\s+(\d+)/gi);
  var currentT = m ? parseInt(m[m.length-1].match(/\d+/)[0]) : 1;
  var sorted = toolLibrary.filter(function(t){ return t && t.T; }).sort(function(a,b){ return a.T-b.T; });
  var nextTool = null;
  for(var i=0;i<sorted.length;i++){ if(sorted[i].T > currentT){ nextTool = sorted[i]; break; } }
  if(!nextTool && sorted.length) nextTool = sorted[0];
  var defaultT = nextTool ? nextTool.T : null;

  var panel = document.getElementById('ctxPanel');
  var opts = sorted.map(function(t){
    return '<option value="'+t.T+'"'+(t.T===defaultT?' selected':'')+'>T'+t.T+(t.NAME?' — '+toolEsc(t.NAME):'')+'</option>';
  }).join('');

  panel.style.height='';
  panel.innerHTML =
    '<div class="ctx-row1">'
    +'<span style="font-family:var(--mono);font-size:11px;color:var(--text2);">TOOL DEF</span>'
    +'<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;margin-left:auto;" onclick="closeCtxPanel()">\u2715</button>'
    +'</div>'
    +'<div class="ctx-row2">'
    +'<span class="fbar-label" style="color:var(--text3);font-size:11px;">Pre-load tool:</span>'
    +(sorted.length
        ? '<select id="toolDefPicker" style="flex:1;font-family:var(--mono);font-size:12px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:4px 8px;cursor:pointer;">'+opts+'</select>'
        : '<span style="font-family:var(--mono);font-size:11px;color:var(--text3);flex:1;">No tools in Tool Table yet</span>')
    +'<button class="fbar-done" onclick="confirmToolDef()"'+(sorted.length?'':' disabled')+'>Insert</button>'
    +'</div>';
}

function confirmToolDef(){
  var picker = document.getElementById('toolDefPicker');
  var t = picker ? picker.value : '';
  closeCtxPanel();
  if(!t) return;
  insertKey('TOOL DEF '+t+' ; '+TOOL_DEF_DESC);
}

function openToolDefEdit(lineIdx){
  _toolDefEditLine = lineIdx;
  var lines = codeEl.value.split('\n');
  var cur = (lines[lineIdx]||'').match(/TOOL DEF\s+(\d+)/i);
  var curT = cur ? parseInt(cur[1]) : null;
  var sorted = toolLibrary.filter(function(t){ return t && t.T; }).sort(function(a,b){ return a.T-b.T; });
  var opts = sorted.map(function(t){
    return '<option value="'+t.T+'"'+(t.T===curT?' selected':'')+'>T'+t.T+(t.NAME?' \u2014 '+toolEsc(t.NAME):'')+'</option>';
  }).join('');
  var panel = document.getElementById('ctxPanel');
  panel.style.height='';
  panel.innerHTML =
    '<div class="ctx-row1">'
    +'<span style="font-family:var(--mono);font-size:11px;color:var(--text2);">TOOL DEF</span>'
    +'<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;margin-left:auto;" onclick="closeCtxPanel()">\u2715</button>'
    +'</div>'
    +'<div class="ctx-row2">'
    +'<span class="fbar-label" style="color:var(--text3);font-size:11px;">Pre-load tool:</span>'
    +(sorted.length
        ? '<select id="toolDefPicker" style="flex:1;font-family:var(--mono);font-size:12px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:4px 8px;cursor:pointer;">'+opts+'</select>'
        : '<span style="font-family:var(--mono);font-size:11px;color:var(--text3);flex:1;">No tools in Tool Table yet</span>')
    +'<button class="fbar-done" onclick="confirmToolDefEdit()"'+(sorted.length?'':' disabled')+'>Done</button>'
    +'</div>';
}

function confirmToolDefEdit(){
  if(_toolDefEditLine < 0){ closeCtxPanel(); return; }
  var picker = document.getElementById('toolDefPicker');
  var t = picker ? picker.value : '';
  if(!t){ closeCtxPanel(); return; }
  _undoPush();
  var lines = codeEl.value.split('\n');
  lines[_toolDefEditLine] = 'TOOL DEF '+t+' ; '+TOOL_DEF_DESC;
  codeEl.value = lines.join('\n');
  _toolDefEditLine = -1;
  closeCtxPanel();
  dirty=true; updateLineNums(); runValidation();
}

function openToolPicker(){
  // Remove existing overlay
  var old = document.getElementById('_toolPickerOverlay');
  if(old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = '_toolPickerOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99998;display:flex;align-items:center;justify-content:center;';

  var tools = toolLibrary.filter(function(t){ return t && t.T; }).sort(function(a,b){return a.T-b.T;});
  var curVal = FM.active ? String(FM.fields[FM.idx].val||1) : '1';

  var rows = tools.map(function(t){
    var sel = String(t.T)===curVal;
    var color = TOOL_CUT_COLORS ? TOOL_CUT_COLORS[(t.T-1)%TOOL_CUT_COLORS.length] : null;
    var hex = color ? '#'+[color[0],color[1],color[2]].map(function(v){return ('0'+Math.round(v*255).toString(16)).slice(-2);}).join('') : '#888';
    return '<div onclick="pickTool('+t.T+')" style="display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.06);'+(sel?'background:rgba(20,184,166,.12);':'')+'">'
      +'<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+hex+';flex-shrink:0;"></span>'
      +'<span style="font-family:var(--mono);font-size:14px;color:var(--text);flex:1;">T'+t.T+' — '+toolEsc(t.NAME)+'</span>'
      +(sel?'<span style="color:var(--accent3);font-size:18px;">●</span>':'<span style="color:var(--text3);font-size:18px;">○</span>')
      +'</div>';
  }).join('');

  overlay.innerHTML = '<div style="background:var(--surface2);border-radius:14px;width:90%;max-width:380px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.5);">'
    +'<div style="padding:14px 20px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:12px;color:var(--text3);display:flex;justify-content:space-between;align-items:center;">'
    +'<span>Select tool</span>'
    +'<button onclick="document.getElementById(\'_toolPickerOverlay\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;padding:0 4px;">✕</button>'
    +'</div>'
    +rows
    +'</div>';

  // Close on backdrop click
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function pickTool(tNum){
  var overlay = document.getElementById('_toolPickerOverlay');
  if(overlay) overlay.remove();
  if(FM.active && FM.fields[FM.idx] && FM.fields[FM.idx].type==='tool'){
    setFieldVal(String(tNum));
  }
}

function num(m){ return m ? parseFloat(m[1]) : null; }

function getToolColor3(toolNum){
  if(!toolNum || toolNum < 1) return 0xe8530a;
  var idx = (toolNum - 1) % TOOL_CUT_COLORS.length;
  if(idx < 0) idx = 0;
  var c = TOOL_CUT_COLORS[idx];
  return (Math.round(c[0]*255) << 16) | (Math.round(c[1]*255) << 8) | Math.round(c[2]*255);
}

function calcToolTimes(subArr){
  // Reset CUR_TIME for all tools
  toolLibrary.forEach(function(t){ t.CUR_TIME=0; });
  var RAPID_FEED=20000; // mm/min for rapid (FMAX)
  for(var i=0;i<subArr.length;i++){
    var s=subArr[i];
    if(!s.len||s.len<1e-6) continue;
    var feedMmMin=s.rapid?RAPID_FEED:Math.max(s.feed||1,1);
    var timeMins=s.len/feedMmMin;
    if(!s.rapid){
      // only count cutting time (non-rapid moves)
      var t=getToolByNum(s.toolNum||1);
      if(t) t.CUR_TIME=Math.round((t.CUR_TIME+timeMins)*100)/100;
    }
  }
  // Check TIME2 limit and warn
  toolLibrary.forEach(function(t){
    if(t.TIME2>0 && t.CUR_TIME>=t.TIME2){
      t.TL=true; // auto-lock
    }
  });
  // Refresh tools tab if open
  if(typeof curView!=='undefined' && curView==='tools') renderToolsTab();
}

function calcEstTime(subArr){
  // RAPID_MMS is visual speed — use a realistic rapid of 10000 mm/min for time estimate
  var RAPID_FEED = 20000; // mm/min
  var totalSec = 0;
  for(var i=0;i<subArr.length;i++){
    var s=subArr[i];
    if(!s.len || s.len<1e-6) continue;
    var feedMmMin = s.rapid ? RAPID_FEED : Math.max(s.feed||1, 1);
    totalSec += (s.len / feedMmMin) * 60;
  }
  var el=document.getElementById('estTime');
  if(!el) return;
  if(totalSec<1){ el.textContent=''; return; }
  var h=Math.floor(totalSec/3600);
  var m=Math.floor((totalSec%3600)/60);
  var s2=Math.round(totalSec%60);
  var parts=[];
  if(h>0) parts.push(h+'h');
  if(m>0||h>0) parts.push(m+'m');
  parts.push(s2+'s');
  el.textContent='\u23F1 est. '+parts.join(' ');
}

function buildToolIntoGroup(group, toolNum){
  if(!group) return;
  var t = getToolByNum(toolNum) || null;
  var R      = t ? t.R : 5;
  var L      = t ? (t.L + (t.DL||0)) / 2 : 25;
  var LCUTS2 = t ? Math.min(t.LCUTS||L*0.4, L) : L*0.4;
  var TANGLE2= t ? (t.T_ANGLE||0) : 0;
  var R2     = t ? (t.R2||0) : 0;
  var seg = 24;
  var toolColor  = getToolColor3(toolNum);
  var shaftMat   = new THREE.MeshPhongMaterial({color:0xcfd3da, shininess:80, specular:0x666666});
  var cuttingMat = new THREE.MeshPhongMaterial({color:toolColor, shininess:90, specular:0x888888});
  var tipMat     = new THREE.MeshPhongMaterial({color:0x888888, shininess:60, specular:0x444444});
  var shankLen = Math.max(1, L - LCUTS2);
  // Shank — same radius as flute to avoid visible ring at junction
  var sg = new THREE.CylinderGeometry(R*0.9, R*0.9, shankLen, seg);
  sg.rotateX(Math.PI/2); sg.translate(0,0,LCUTS2+shankLen/2);
  group.add(new THREE.Mesh(sg, shaftMat));
  // Small transition taper between flute and shank
  var taper = new THREE.CylinderGeometry(R*0.9, R, 2, seg);
  taper.rotateX(Math.PI/2); taper.translate(0,0,LCUTS2+1);
  group.add(new THREE.Mesh(taper, shaftMat));
  // Tip / flutes
  if(R2 > 0 && R2 <= R){
    // Ball nose / bull-nose
    var sGeo = new THREE.SphereGeometry(R2, seg, Math.ceil(seg/2), 0, Math.PI*2, Math.PI/2, Math.PI/2);
    sGeo.rotateX(Math.PI/2); sGeo.translate(0,0,R2);
    group.add(new THREE.Mesh(sGeo, cuttingMat));
    var bL3 = Math.max(0, LCUTS2-R2);
    if(bL3>0){ var bg3=new THREE.CylinderGeometry(R,R,bL3,seg); bg3.rotateX(Math.PI/2); bg3.translate(0,0,R2+bL3/2); group.add(new THREE.Mesh(bg3,cuttingMat)); }
  } else if(TANGLE2 > 0){
    var hRad = (TANGLE2/2)*Math.PI/180;
    var cH = Math.min(R/Math.tan(hRad), LCUTS2);
    var cg = new THREE.CylinderGeometry(R, 0, cH, seg);
    cg.rotateX(Math.PI/2); cg.translate(0,0,cH/2);
    group.add(new THREE.Mesh(cg, cuttingMat));
    var bL = Math.max(0, LCUTS2-cH);
    if(bL>0){ var bg2=new THREE.CylinderGeometry(R,R,bL,seg); bg2.rotateX(Math.PI/2); bg2.translate(0,0,cH+bL/2); group.add(new THREE.Mesh(bg2,cuttingMat)); }
  } else {
    // Flat end mill / reamer — closed cylinder (no separate disc needed)
    var fg = new THREE.CylinderGeometry(R, R, LCUTS2, seg, 1, false);
    fg.rotateX(Math.PI/2); fg.translate(0,0,LCUTS2/2);
    group.add(new THREE.Mesh(fg, cuttingMat));
  }
  // Collar
  var colG = new THREE.CylinderGeometry(R*1.4, R*1.4, 4, seg);
  colG.rotateX(Math.PI/2); colG.translate(0,0,L+2);
  group.add(new THREE.Mesh(colG, shaftMat));
}

function showPendingTool(toolNum){
  if(!THREE_OK || !prog) return;
  if(pendingToolGroup && pendingToolGroup._toolNum === toolNum){
    // just make visible again
    pendingToolGroup.visible = true;
    return;
  }
  // Remove old if different tool
  if(pendingToolGroup){ scene.remove(pendingToolGroup); pendingToolGroup=null; }
  pendingToolGroup = new THREE.Group();
  pendingToolGroup._toolNum = toolNum;
  buildToolIntoGroup(pendingToolGroup, toolNum);
  pendingToolGroup.position.set(prog.blkMax.x+60, prog.blkMax.y+60, prog.blkMax.z+120);
  pendingToolGroup.rotation.set(0.15, 0.15, 0);
  scene.add(pendingToolGroup);
}

function hidePendingTool(){
  if(pendingToolGroup){ pendingToolGroup.visible=false; }
}

function startATC(fromT, toT){
  if(!THREE_OK || !toolGroup || !prog) return;

  // Top-right corner of workpiece + offset
  var corner = {
    x: prog.blkMax.x + 60,
    y: prog.blkMax.y + 60,
    z: prog.blkMax.z + 120
  };

  // Use pendingToolGroup if already shown (from TOOL DEF), otherwise build it
  var inGroup;
  if(pendingToolGroup){
    inGroup = pendingToolGroup;
    pendingToolGroup = null;
    pendingToolNum = 0;
    inGroup.visible = true;
    inGroup.rotation.set(0,0,0); // reset tilt for animation
  } else {
    inGroup = new THREE.Group();
    buildToolIntoGroup(inGroup, toT);
    inGroup.position.set(corner.x, corner.y, corner.z);
    scene.add(inGroup);
  }

  atcAnim = {
    t: 0, toT: toT,
    inGroup: inGroup,
    outX: toolGroup.position.x,
    outY: toolGroup.position.y,
    outZ: toolGroup.position.z,
    cornerX: corner.x,
    cornerY: corner.y,
    cornerZ: corner.z,
    endX: toolPos.x,
    endY: toolPos.y,
    endZ: toolPos.z
  };
}
