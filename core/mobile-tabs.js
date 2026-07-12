// mobile-tabs -- verified byte-for-byte identical between web and android repos.

function mtabSwitch(name){
  // Switching straight to Editor with NO active practice task would show a
  // blank editor (openLearn stashes the program) — close Learn & restore it.
  // With an active task, or when just peeking at the 3D view mid-lesson,
  // Learn state stays untouched so you continue exactly where you left off.
  if(name==='editor' && typeof LEARN!=='undefined' && LEARN.open && LEARN.task < 0){
    LEARN.open = false;
    learnExit();
    var _lp = _lpEl(); if(_lp) _lp.style.display='none';
    var _mb2 = document.getElementById('learnMobileBar');
    if(_mb2){ _mb2.classList.remove('on'); _mb2.innerHTML=''; document.body.classList.remove('practice-on'); }
  }
  document.body.setAttribute('data-mtab', name);
  ['Editor','View','Learn'].forEach(function(n){
    var b = document.getElementById('mtab'+n);
    if(b) b.classList.toggle('on', n.toLowerCase()===name || (name==='view' && n==='View'));
  });
  if(name==='view'){
    // the 3D canvas had zero size while hidden — resize once visible
    requestAnimationFrame(function(){ if(typeof onResize==='function') onResize(); });
  }
  if(name==='editor' && typeof window._growCode==='function'){
    requestAnimationFrame(window._growCode);
  }
}

function mtabTapLearn(){
  mtabSwitch('learn');
  if(typeof LEARN!=='undefined' && !LEARN.open) openLearn();
}
