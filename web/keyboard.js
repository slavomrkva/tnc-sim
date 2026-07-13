// keyboard -- web-specific (diverged from or absent in the other repo).

/* Keep the mobile bottom tab bar pinned to the true visible viewport.
   position:fixed tracks the *layout* viewport, but mobile browsers resize it
   only after the address-bar show/hide animation finishes — that lag is the
   visible "jump". We follow visualViewport continuously with a rAF loop that
   runs while scrolling/resizing, so the bar stays glued the whole time. */
(function(){
  if(!window.visualViewport) return;
  var bar = null, raf = 0, idleTicks = 0, last = -1;
  var baseline = window.visualViewport.height;
  var keyboardOpen = false;
  function apply(){
    if(!bar) bar = document.querySelector('.mtab-bar');
    var vv = window.visualViewport;
    var offset = window.innerHeight - (vv.height + vv.offsetTop);
    if(offset < 0.5) offset = 0;
    offset = Math.round(offset);
    if(!keyboardOpen && vv.height >= baseline - 2) baseline = vv.height;
    var drop = Math.max(offset, baseline - vv.height);
    // Hysteresis prevents the Learn practice strip and bottom bar from
    // repeatedly toggling during the keyboard/address-bar animation. The
    // baseline fallback also covers browsers where innerHeight shrinks with
    // visualViewport and the old offset therefore stayed near zero.
    if(!keyboardOpen && drop > 140) keyboardOpen = true;
    else if(keyboardOpen && drop < 80) keyboardOpen = false;
    var kbdOpen = keyboardOpen;
    // expose the true visible height + keyboard state to CSS so the editor
    // layout can shrink to fit the space actually left above the keyboard
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    document.documentElement.classList.toggle('kbd-open', kbdOpen);
    if(!bar) return;
    if(kbdOpen !== bar._kbdHidden){
      bar._kbdHidden = kbdOpen;
      bar.style.visibility = kbdOpen ? 'hidden' : '';
      idleTicks = 0;
    }
    if(kbdOpen){ return; }
    // Do NOT transform the bar during scrolling. Plain position:fixed tracks
    // the layout viewport smoothly on its own (the Learn tab proves this) —
    // chasing visualViewport with transforms is what caused the jitter. The
    // only thing we handle is hiding the bar while the keyboard is open.
    if(last !== 0){ last = 0; bar.style.transform = ''; }
  }
  function loop(){
    apply();
    // keep looping briefly after the last change so we ride out the
    // browser's URL-bar animation, then stop to save battery
    if(++idleTicks < 30){ raf = requestAnimationFrame(loop); }
    else { raf = 0; }
  }
  function kick(){ idleTicks = 0; if(!raf) raf = requestAnimationFrame(loop); }
  window.visualViewport.addEventListener('resize', kick);
  window.visualViewport.addEventListener('scroll', kick);
  window.addEventListener('scroll', kick, {passive:true});
  window.addEventListener('touchmove', kick, {passive:true});
  window.addEventListener('orientationchange', function(){
    keyboardOpen = false;
    setTimeout(function(){ baseline = window.visualViewport.height; kick(); }, 300);
  });
  kick();
})();
