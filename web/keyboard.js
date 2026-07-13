// keyboard -- web-specific (diverged from or absent in the other repo).

/* Keep the mobile bottom tab bar pinned to the true visible viewport.
   position:fixed tracks the *layout* viewport, but mobile browsers resize it
   only after the address-bar show/hide animation finishes — that lag is the
   visible "jump". We follow visualViewport continuously with a rAF loop that
   runs while scrolling/resizing, so the bar stays glued the whole time. */
(function(){
  if(!window.visualViewport) return;
  var bar = null, raf = 0, idleTicks = 0, last = -1, focusHold = false, holdTimer = 0;
  // Two signals decide whether the bar is hidden, with distinct jobs:
  //   • FOCUS = "hide NOW". Focusing a text field is the real trigger for the
  //     OS keyboard and fires *before* the visual viewport starts shrinking, so
  //     the shrink check alone (offset>140) only trips partway through the open
  //     animation — long enough for the fixed bottom bar to be seen riding up
  //     with the rising keyboard. focusHold hides it the instant focus lands.
  //   • VIEWPORT = "when to show again". The shrink measurement is the only
  //     reliable signal for whether the keyboard is *actually* still up. So the
  //     moment it confirms the keyboard (offset>140) we DROP focusHold and hand
  //     authority back to the viewport. This is critical: dismissing the
  //     keyboard often keeps the field focused (Android's back button doesn't
  //     blur), so no focusout fires — if visibility stayed tied to focus the
  //     bar would never come back. focusHold is only ever a short bridge across
  //     the open animation, never the thing that keeps the bar hidden.
  // holdTimer is the safety net for a focus that raises no keyboard at all
  // (e.g. a hardware keyboard on a touch device): drop the hold after a beat so
  // the bar can't get stuck hidden. Gated to the mobile layout (bar exists) and
  // touch input (a narrow desktop window focusing the editor raises no keyboard).
  function clearHold(){ if(focusHold){ focusHold = false; kick(); } }
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
    var kbdOpen = offset > 140;
    if(kbdOpen){ focusHold = false; }      // viewport confirms — viewport now owns re-show
    else if(focusHold){ kbdOpen = true; }  // bridge the open animation only
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
    if(kbTriggers(e.target)){
      focusHold = true;
      if(holdTimer) clearTimeout(holdTimer);
      holdTimer = setTimeout(clearHold, 1500);
      kick();
    }
  });
  document.addEventListener('focusout', function(){
    // Drop the hold when focus leaves. The viewport check still decides when to
    // actually re-show the bar (once the keyboard has finished sliding away, or
    // immediately if it was already down), so a field-to-field hop — focus
    // bounces constantly during field editing — never flashes it while the
    // keyboard stays up (offset>140 keeps kbdOpen regardless of focusHold).
    if(holdTimer){ clearTimeout(holdTimer); holdTimer = 0; }
    focusHold = false; kick();
  });
  kick();
})();
