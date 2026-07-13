// keyboard -- web-specific (diverged from or absent in the other repo).

/* Keep the mobile bottom tab bar pinned to the true visible viewport.
   position:fixed tracks the *layout* viewport, but mobile browsers resize it
   only after the address-bar show/hide animation finishes — that lag is the
   visible "jump". We follow visualViewport continuously with a rAF loop that
   runs while scrolling/resizing, so the bar stays glued the whole time. */
(function(){
  if(!window.visualViewport) return;
  var bar = null, raf = 0, idleTicks = 0, last = -1, focusHold = false;
  // The shrink-based detection below only fires once the visual viewport has
  // already lost >140px to the keyboard — i.e. partway through the open
  // animation. Until then the fixed bottom bar is still visible and, on
  // browsers that lift fixed elements above the keyboard, it visibly rides up
  // with it. Focusing a text field is the *real* trigger for the OS keyboard
  // and fires before any viewport change, so we hide the bar on that event and
  // keep it hidden (focusHold) until focus leaves. Gated to the mobile layout
  // (where the bar exists) and to touch input (a narrow desktop window focusing
  // the editor raises no on-screen keyboard, so the bar must stay put there).
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
    var kbdOpen = offset > 140 || focusHold;
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
  window.addEventListener('orientationchange', function(){ setTimeout(kick, 50); });
  document.addEventListener('focusin', function(e){
    if(kbTriggers(e.target)){ focusHold = true; kick(); }
  });
  document.addEventListener('focusout', function(){
    // Don't restore the bar the instant focus is lost — a field-to-field hop
    // would flash it. Just drop the hold and let the viewport check re-show it
    // once the keyboard has actually finished sliding away (offset ≤ 140).
    focusHold = false; kick();
  });
  kick();
})();
