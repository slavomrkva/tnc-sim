// keyboard -- web-specific (diverged from or absent in the other repo).

/* Keep the mobile bottom tab bar STATIC at the physical bottom of the screen
   while the OS keyboard is open — the keyboard simply draws over it, the bar
   never rides up and never hides/flashes.

   Why a transform: this bar is `position:fixed; bottom:0`, but the mobile
   browser raises fixed elements to the bottom of the *visual* viewport when the
   keyboard opens — i.e. up by exactly the keyboard height (`offset`). That
   upward lift is the "the bottom panel moves up with the keyboard" bug. We
   cancel it by translating the bar back DOWN by the same `offset`, so it stays
   pinned to the physical bottom and the keyboard covers it. Tracked every frame
   via a rAF loop so it moves in lock-step with the keyboard (no jump).

   Why gate on focus: the counter-translate is only wanted in a keyboard
   context. Focusing a text field is the real keyboard trigger and fires before
   the viewport changes, so pinning from that moment means zero upward drift
   even at the very start of the open animation. Outside a keyboard context the
   transform is 0, so ordinary URL-bar scrolling never gets counter-moved (which
   is what caused jitter in an earlier transform attempt). `offset` itself is 0
   whenever the keyboard is down, so even if focus lingers after a back-button
   dismiss the bar just sits at the bottom — nothing gets stuck. */
(function(){
  if(!window.visualViewport) return;
  var bar = null, raf = 0, idleTicks = 0, last = null, focusHold = false;
  function kbTriggers(el){
    if(!el) return false;
    var t = el.tagName;
    if(t !== 'INPUT' && t !== 'TEXTAREA' && !el.isContentEditable) return false;
    if(!window.matchMedia('(max-width:1024px), (max-height:600px)').matches) return false;
    return window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
  }
  function apply(){
    if(!bar) bar = document.querySelector('.mtab-bar');
    var vv = window.visualViewport;
    var offset = window.innerHeight - (vv.height + vv.offsetTop);
    if(offset < 0.5) offset = 0;
    offset = Math.round(offset);
    // expose the true visible height + keyboard state to CSS so the editor
    // layout can shrink to fit the space actually left above the keyboard
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    document.documentElement.classList.toggle('kbd-open', offset > 140);
    if(!bar) return;
    // Pin the bar to the physical bottom: cancel the browser's keyboard lift.
    var ty = focusHold ? offset : 0;
    if(ty !== last){
      last = ty;
      bar.style.transform = ty ? 'translateY(' + ty + 'px)' : '';
    }
  }
  function loop(){
    apply();
    // keep looping briefly after the last change so we ride out the
    // browser's keyboard / URL-bar animation, then stop to save battery
    if(++idleTicks < 30){ raf = requestAnimationFrame(loop); }
    else { raf = 0; }
  }
  function kick(){ idleTicks = 0; if(!raf) raf = requestAnimationFrame(loop); }
  window.visualViewport.addEventListener('resize', kick);
  window.visualViewport.addEventListener('scroll', kick);
  window.addEventListener('scroll', kick, {passive:true});
  window.addEventListener('touchmove', kick, {passive:true});
  window.addEventListener('orientationchange', function(){ setTimeout(kick, 50); });
  document.addEventListener('focusin', function(e){
    if(kbTriggers(e.target)){ focusHold = true; kick(); }
  });
  document.addEventListener('focusout', function(){ focusHold = false; kick(); });
  kick();
})();
