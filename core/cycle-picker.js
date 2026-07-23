// cycle-picker -- verified byte-for-byte identical between web and android repos.

function openCyclePicker(){
  var panel = document.getElementById('ctxPanel');
  var opts = CYCLES.map(function(cyc){
    return '<option value="'+cyc.num+'">'+cyc.num+' — '+cyc.name+'</option>';
  }).join('');
  panel.style.height='';
  panel.innerHTML = '<div class="ctx-row1"><span style="font-family:var(--mono);font-size:11px;color:var(--text2);">Select cycle:</span></div>'
    + '<div class="ctx-row2">'
    + '<select id="cyclePicker" style="flex:1;font-family:var(--mono);font-size:12px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:4px 8px;cursor:pointer;">'
    + opts + '</select>'
    + '<button class="fbar-done" onclick="var v=document.getElementById(&quot;cyclePicker&quot;).value; closeCtxPanel(); selectCycle(parseInt(v));">Insert</button>'
    + '<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:4px 6px;" onclick="closeCtxPanel()">&#10005;</button>'
    + '</div>';
}

function closeCtxPanel(){
  if(typeof _cancelMobileFocus==='function') _cancelMobileFocus(true);
  var panel = document.getElementById('ctxPanel');
  if(panel){ panel.innerHTML=''; panel.style.height=''; }
  BLK.active = false; BLK.step = 0;
  renderIdlePanel();
}

function closeCyclePicker(){ closeCtxPanel(); }

function showCycleList(){ openCyclePicker(); }

function showCycleParams(num){ selectCycle(num); }

function selectCycle(num){
  closeCyclePicker();
  var cyc=CYCLES.find(function(c){return c.num===num;});
  if(!cyc) return;
  // build multiline CYCL DEF with comments
  var lines=['CYCL DEF '+num+' ;'+cyc.name];
  cyc.params.forEach(function(p){
    lines.push('  '+p.q+'='+p.def+' ;'+p.name+(p.unit?' ['+p.unit+']':''));
  });
  var pos=lastSel&&lastSel.start!=null?lastSel.start:codeEl.selectionStart;
  var en=lastSel&&lastSel.end!=null?lastSel.end:pos;
  insertProgramBlock(lines.join('\n'),pos,en,{mode:'command'});
}
