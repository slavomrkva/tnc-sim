// learn-coach -- first-run guided tour for PRACTICE. Shared core: keep this file
// byte-for-byte identical between the web and android repos.
//
// A practice task shows an assignment, a goal checklist, a Hint button and a
// Check button spread over two panels (and, on mobile, over two tabs). A first
// time user has no idea which of those is "the thing you do next", so the very
// first time practice is opened we walk them through it with a spotlight.
//
// No dependency: the spotlight hole is a plain div with a huge box-shadow, and
// it is re-measured on every step / resize / scroll.

var COACH = { on:false, step:0, steps:[] };

function _coachSeen(){ try { return localStorage.getItem('tnc_learn_coach') === '1'; } catch(e){ return true; } }
function _coachMarkSeen(){ try { localStorage.setItem('tnc_learn_coach', '1'); } catch(e){} }

/* The same logical target lives in a different element on mobile (the pinned
   practice strip above the editor) than on desktop (the Learn panel). Resolve
   late — after learnRender() has rebuilt both. */
function _coachTarget(key){
  var mob = _isMTab && _isMTab();
  var root = mob ? document.getElementById('learnMobileBar') : document.getElementById('learnPanel');
  if(!root) return null;
  if(key === 'editor') return document.getElementById('code');
  if(key === 'prompt') return root.querySelector('.lp-prompt');
  if(key === 'goals')  return root.querySelector('.lp-goals');
  if(key === 'hint')   return root.querySelector('.lp-btn.hint');
  if(key === 'check')  return root.querySelector('.lp-btn.chk');
  return null;
}

function learnCoachMaybeStart(force){
  // force=true replays the tour every time (used by the intro lesson, which is
  // itself the tour); otherwise it runs only once, the first time practice opens.
  if((!force && _coachSeen()) || COACH.on) return;
  // let learnRender() finish painting the practice UI before we measure it
  requestAnimationFrame(function(){ requestAnimationFrame(learnCoachStart); });
}

function learnCoachStart(){
  COACH.steps = [
    { k:'prompt', t:'The assignment',
      d:'What to achieve \u2014 one line. The theory above stays open; scroll back any time.' },
    { k:'editor', t:'You write here',
      d:'The real editor, with the starter program loaded. Add your lines; the blank appears in 3D as you type.' },
    { k:'goals',  t:'What is graded',
      d:'Each goal must go green. Grey until you press Check \u2014 nothing is hidden.' },
    { k:'hint',   t:'Stuck? Take a hint',
      d:'Three steps: a nudge, the structure, then the answer. Free to use.' },
    { k:'check',  t:'Check your work',
      d:'Press it any time. The simulator says which goal failed and why.' }
  ].filter(function(s){ return !!_coachTarget(s.k); });
  if(!COACH.steps.length) return;
  COACH.on = true; COACH.step = 0;

  var ov = document.createElement('div');
  ov.id = 'learnCoach';
  ov.innerHTML = '<div class="coach-hole"></div>'
    + '<div class="coach-tip">'
    +   '<div class="coach-n"></div>'
    +   '<div class="coach-t"></div>'
    +   '<div class="coach-d"></div>'
    +   '<div class="coach-btns">'
    +     '<button class="lp-btn" onclick="learnCoachEnd()">Skip</button>'
    +     '<button class="lp-btn coach-back" onclick="learnCoachPrev()">&#8249; Back</button>'
    +     '<button class="lp-btn pri grow" onclick="learnCoachNext()"></button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(ov);
  window.addEventListener('resize', _coachPaint);
  window.addEventListener('scroll', _coachPaint, true);
  _coachPaint();
}

function _coachPaint(){
  if(!COACH.on) return;
  var ov = document.getElementById('learnCoach');
  if(!ov) return;
  var s = COACH.steps[COACH.step];
  var el = _coachTarget(s.k);
  if(!el){ learnCoachNext(); return; }

  // keep the target on screen before measuring it
  try { el.scrollIntoView({block:'nearest', behavior:'instant'}); } catch(e){}

  var r = el.getBoundingClientRect();
  var pad = 6;
  var hole = ov.querySelector('.coach-hole');
  hole.style.left   = (r.left - pad) + 'px';
  hole.style.top    = (r.top  - pad) + 'px';
  hole.style.width  = (r.width  + 2*pad) + 'px';
  hole.style.height = (r.height + 2*pad) + 'px';

  var tip = ov.querySelector('.coach-tip');
  ov.querySelector('.coach-n').textContent = (COACH.step + 1) + ' / ' + COACH.steps.length;
  ov.querySelector('.coach-t').textContent = s.t;
  ov.querySelector('.coach-d').textContent = s.d;
  ov.querySelector('.coach-btns .pri').textContent =
    (COACH.step === COACH.steps.length - 1) ? 'Got it \u2713' : 'Next \u2192';
  // Back is present from step 2 on; hidden (not just disabled) on the first step
  var back = ov.querySelector('.coach-back');
  if(back) back.style.display = (COACH.step === 0) ? 'none' : '';

  // place the tip below the hole, or above it when there is no room
  var tw = Math.min(320, window.innerWidth - 24);
  tip.style.width = tw + 'px';
  var th = tip.offsetHeight || 150;
  var below = r.bottom + 12;
  var top = (below + th < window.innerHeight - 8) ? below : Math.max(8, r.top - th - 12);
  var left = Math.max(12, Math.min(window.innerWidth - tw - 12, r.left + r.width/2 - tw/2));
  tip.style.top = top + 'px';
  tip.style.left = left + 'px';
  tip.classList.toggle('flip', top < r.top);
}

function learnCoachNext(){
  if(!COACH.on) return;
  COACH.step++;
  if(COACH.step >= COACH.steps.length){ learnCoachEnd(); return; }
  _coachPaint();
}

function learnCoachPrev(){
  if(!COACH.on || COACH.step === 0) return;
  COACH.step--;
  _coachPaint();
}

function learnCoachEnd(){
  COACH.on = false;
  _coachMarkSeen();
  var ov = document.getElementById('learnCoach');
  if(ov) ov.remove();
  window.removeEventListener('resize', _coachPaint);
  window.removeEventListener('scroll', _coachPaint, true);
}

/* Replayable from the practice footer (and after a progress reset). */
function learnCoachReplay(){
  try { localStorage.removeItem('tnc_learn_coach'); } catch(e){}
  if(COACH.on) learnCoachEnd();
  learnCoachStart();
}
