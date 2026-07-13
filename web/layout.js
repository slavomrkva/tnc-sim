// layout -- web-specific (diverged from or absent in the other repo).

function showKpHelp(key, anchorEl){
  if(!kpHelpMode) return false;
  var entry = HELP_MAP[key] || HELP_MAP[key.split(' ')[0]] || null;
  if(!entry) return false;

  // Remove existing popup
  if(_helpPopup){ _helpPopup.remove(); _helpPopup = null; }

  var pop = document.createElement('div');
  pop.className = 'help-popup';
  pop.innerHTML =
    '<div class="help-popup-title">'+entry.title+'</div>'
    +'<div class="help-popup-desc">'+entry.desc+'</div>'
    +(entry.ex ? '<div class="help-popup-ex">e.g. <code>'+entry.ex.replace(/\n/g,'<br>')+'</code></div>' : '');
  document.body.appendChild(pop);
  _helpPopup = pop;

  // Position near anchor or center — on mobile CSS handles it via fixed bottom.
  // Use !_isMTab() (not a raw width check) so the short-viewport single-column
  // layout also gets the mobile bottom-fixed popup, matching rule #4.
  if(anchorEl && !_isMTab()){
    var r = anchorEl.getBoundingClientRect();
    var top = r.bottom + 8;
    var left = r.left;
    // keep within viewport
    if(left + 300 > window.innerWidth) left = window.innerWidth - 308;
    if(top + 150 > window.innerHeight) top = r.top - 158;
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  } else if(!_isMTab()){
    pop.style.top = '50%';
    pop.style.left = '50%';
    pop.style.transform = 'translate(-50%,-50%)';
  }
  return true;
}

function _isMTab(){ return window.matchMedia && matchMedia('(max-width:1024px), (max-height:600px)').matches; }

/* Mobile uses a bounded editor viewport: controls stay in normal flex flow and
   only the textarea scrolls. Shared render paths still call the legacy
   _growCode hook, so keep it as a stale inline-size cleanup. */
(function(){
  function fit(){
    var ta = document.getElementById('code');
    if(!ta) return;
    ta.style.height = '';
    var ln = document.getElementById('lineNums');
    if(ln) ln.style.minHeight = '';
  }
  window._growCode = fit;
  window.addEventListener('resize', fit);
  setTimeout(fit, 60);
})();
