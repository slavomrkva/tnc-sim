// help-popups -- verified byte-for-byte identical between web and android repos.

function toggleKpHelp(){
  // Mobile: open full reference modal directly
  if(window.matchMedia('(pointer:coarse)').matches){
    openHelp();
    return;
  }
  // Desktop: toggle hover popup mode
  kpHelpMode = !kpHelpMode;
  var btn = document.getElementById('kpHelpBtn');
  if(btn){
    btn.style.background = kpHelpMode ? 'var(--accent)' : 'rgba(var(--accent-rgb),.14)';
    btn.style.color = kpHelpMode ? '#fff' : 'var(--accent)';
    btn.style.borderColor = kpHelpMode ? 'var(--accent)' : 'rgba(var(--accent-rgb),.4)';
    btn.textContent = kpHelpMode ? '✕ Help' : '? Help';
  }
  document.body.style.cursor = kpHelpMode ? 'help' : '';
  if(!kpHelpMode) hideHelpPopup();
}

function hideHelpPopup(){
  if(_helpPopup){ _helpPopup.remove(); _helpPopup = null; }
}

function openHelp(){
  exitFieldMode();
  closeCtxPanel();
  var b=document.getElementById('helpBody');
  var h='<p style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.6">Quick reference for TNC Sim. On desktop activate <b style="color:var(--text2);">? Help</b> and hover over any button.</p>';
  var groups=[
    {label:'Simulation controls',keys:['run','step','stop','reset','speed','path','measure']},
    {label:'Views',keys:['view-3d','view-2d','view-tools']},
    {label:'Quality',keys:['q-low','q-med']},
    {label:'Editor',keys:['editor','line-nums','export','bug-report']},
    {label:'Motion commands',keys:['L','C','CC','CR','RND','CHF','LP','CP','P','I']},
    {label:'Program structure',keys:['BLK FORM','TOOL CALL','TOOL DEF','CYCL DEF','CYCL CALL','LBL','CALL LBL','M','M0','M3','M4','M5','M7','M8','M9','M30']},
    {label:'Q parameters',keys:['Q','Q200','Q201','Q202','Q203','Q204','Q206','Q208','Q239','Q256','Q257']},
  ];
  groups.forEach(function(g){
    h+='<div style="margin:0 0 4px;padding:8px 0 4px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;">'+g.label+'</div>';
    g.keys.forEach(function(k){
      var e=HELP_MAP[k]; if(!e) return;
      h+='<div class="help-cmd"><code>'+e.title+'</code><p>'+e.desc+'</p>'+(e.ex?'<div class="ex">e.g. <code>'+e.ex.replace(/\n/g,'<br>')+'</code></div>':'')+'</div>';
    });
  });
  b.innerHTML=h;
  document.getElementById('helpOverlay').classList.add('open');
}

function closeHelp(){ document.getElementById('helpOverlay').classList.remove('open'); }
