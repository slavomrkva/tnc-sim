// bug-report -- WEB ONLY. The Android app keeps its own simpler flow; this
// file diverges from the Android copy on purpose (it talks to the tncsim.org
// /api/report Cloudflare Worker). Do not port it wholesale to Android.
//
// One-click flow: the user picks "Report a problem" or "Suggest improvement",
// optionally edits one textarea, and hits Send. The current NC program (bug
// only), version, device/browser, validator messages, app area and recent JS
// errors are attached automatically and a public GitHub issue is opened server
// side — no GitHub account required from the visitor.

var _bugKind = 'bug';   // 'bug' | 'suggest'

function _bugT(key, en){ return (typeof t === 'function') ? t(key, en) : en; }

// Which part of the app the user is looking at, for the report context.
function _bugArea(){
  if(typeof LEARN !== 'undefined' && LEARN && LEARN.open) return 'Learn';
  var mt = document.body.getAttribute('data-mtab');
  if(mt === 'view') return '3D';
  if(mt === 'learn') return 'Learn';
  return 'Editor';
}

// The first validator problem of error severity (if any).
function _bugValidatorError(){
  if(!(typeof problemsData !== 'undefined' && problemsData && problemsData.length)) return null;
  for(var i=0;i<problemsData.length;i++){ if(problemsData[i].sev === 'err') return problemsData[i]; }
  return null;
}

// Automatic, state-based description that pre-fills the textarea for a bug.
function _bugPrefill(){
  if(typeof _bugErrors !== 'undefined' && _bugErrors.length){
    return _bugT('bug.pf.js', 'The simulator encountered an internal error while processing this program.');
  }
  if(typeof LEARN !== 'undefined' && LEARN && LEARN.open){
    return _bugT('bug.pf.lesson', 'The lesson validation may not accept a correct solution.');
  }
  var ve = _bugValidatorError();
  if(ve){
    return _bugT('bug.pf.validator', 'The validator may be evaluating this program incorrectly.')
      + '\n\n' + ('L' + (ve.line+1) + ': ' + ve.msg);
  }
  return _bugT('bug.pf.default', 'The simulated result or toolpath may be incorrect for this program.');
}

// Reflect the active kind (bug/suggest) into the dialog.
function bugSetKind(kind){
  _bugKind = (kind === 'suggest') ? 'suggest' : 'bug';
  var pB = document.getElementById('bugChoiceProblem');
  var pS = document.getElementById('bugChoiceSuggest');
  if(pB) pB.classList.toggle('on', _bugKind === 'bug');
  if(pS) pS.classList.toggle('on', _bugKind === 'suggest');

  var ta = document.getElementById('bugDesc');
  var send = document.getElementById('bugSendBtn');
  var warn = document.getElementById('bugWarn');
  if(_bugKind === 'suggest'){
    ta.value = '';
    ta.placeholder = _bugT('bug.suggestPh', 'What would you like to add or improve?');
    if(send) send.textContent = _bugT('bug.sendSuggest', 'Send suggestion');
    if(warn) warn.textContent = _bugT('bug.warnSuggest',
      'The suggestion is anonymous. TNC Sim does not collect personal data. Your text and basic technical diagnostics are sent to our public GitHub tracker. Please don\'t include any confidential information.');
  } else {
    ta.value = _bugPrefill();
    ta.placeholder = _bugT('bug.bugPh', 'Optionally add more detail…');
    if(send) send.textContent = _bugT('bug.sendBug', 'Send report');
    if(warn) warn.textContent = _bugT('bug.warnBug',
      'This report is anonymous. TNC Sim does not collect personal data. Your description, current NC program, and basic technical diagnostics are sent to our public GitHub tracker. Please don\'t include any confidential information.');
  }
  _bugUpdateSendState();
}

// Suggestions require text; bug reports are always sendable.
function _bugUpdateSendState(){
  var send = document.getElementById('bugSendBtn');
  if(!send) return;
  var has = (document.getElementById('bugDesc').value.trim().length > 0);
  var disabled = (_bugKind === 'suggest' && !has) || send.dataset.sending === '1';
  send.disabled = disabled;
  send.style.opacity = disabled ? '0.5' : '1';
  send.style.cursor = disabled ? 'default' : 'pointer';
}

function openBugReport(kind){
  var overlay = document.getElementById('bugOverlay');
  var status = document.getElementById('bugStatus');
  if(status){ status.textContent = ''; status.style.display = 'none'; }
  var send = document.getElementById('bugSendBtn');
  if(send){ send.dataset.sending = '0'; }
  bugSetKind(kind === 'suggest' ? 'suggest' : 'bug');
  _bugRenderTurnstile();
  overlay.classList.add('open');
  setTimeout(function(){ document.getElementById('bugDesc').focus(); }, 100);
}

function closeBugReport(){
  document.getElementById('bugOverlay').classList.remove('open');
}

// Collect the automatic context lines for the report body.
function _bugContext(){
  var info = [];
  info.push('TNC Sim v' + APP_VERSION);
  info.push('Area: ' + _bugArea());
  info.push('UA: ' + navigator.userAgent.slice(0,180));
  info.push('Platform: ' + navigator.platform);
  info.push('Screen: ' + window.screen.width + '×' + window.screen.height + ' @ ' + window.devicePixelRatio + 'x');
  info.push('Touch: ' + (navigator.maxTouchPoints > 0 ? 'yes (' + navigator.maxTouchPoints + ' points)' : 'no'));
  info.push('Lang: ' + navigator.language);
  return info;
}

// Full markdown body sent to the server for the GitHub issue.
function _bugBuildBody(){
  var desc = document.getElementById('bugDesc').value.trim();
  var out = '## Description\n' + (desc || '(no description)') + '\n';

  out += '\n## Context\n```\n' + _bugContext().join('\n') + '\n```\n';

  if(_bugKind === 'bug'){
    // validator messages
    if(typeof problemsData !== 'undefined' && problemsData && problemsData.length){
      var v = ['Validator: ' + problemsData.length + ' issue(s)'];
      problemsData.slice(0,10).forEach(function(p){
        v.push('  ' + p.sev.toUpperCase() + ' L' + (p.line+1) + ': ' + p.msg);
      });
      out += '\n## Validator\n```\n' + v.join('\n') + '\n```\n';
    }
    // recent JS errors
    if(typeof _bugErrors !== 'undefined' && _bugErrors.length){
      out += '\n## JS errors\n```\n' + _bugErrors.join('\n') + '\n```\n';
    }
    // the NC program (bug reports only)
    var codeEl2 = document.getElementById('code');
    var prog = codeEl2 ? codeEl2.value : (typeof codeEl !== 'undefined' && codeEl ? codeEl.value : '');
    out += '\n## Program\n```\n' + prog + '\n```\n';
  }
  return out;
}

function _bugTitle(){
  var desc = document.getElementById('bugDesc').value.trim().replace(/\s+/g,' ');
  var prefix = (_bugKind === 'suggest') ? 'Suggestion: ' : 'Bug: ';
  var body = desc.slice(0,80) || (_bugKind === 'suggest' ? 'improvement' : 'issue');
  return prefix + body;
}

function _bugSetStatus(msg, isError){
  var status = document.getElementById('bugStatus');
  if(!status) return;
  status.style.display = 'block';
  status.style.color = isError ? 'var(--err, #e5484d)' : 'var(--text2)';
  status.innerHTML = msg;
}

// ── Cloudflare Turnstile (invisible) ──────────────────────────────────────
// The public site key lives in web/turnstile-config.js (window.TURNSTILE_SITE_KEY).
// The matching secret is a Cloudflare Worker secret, never in the repo.
var _tsWidgetId = null;
var _tsResolve = null;

function _bugRenderTurnstile(){
  if(_tsWidgetId !== null) return;
  if(!window.turnstile || !window.TURNSTILE_SITE_KEY) return;
  try{
    _tsWidgetId = window.turnstile.render('#bugTurnstile', {
      sitekey: window.TURNSTILE_SITE_KEY,
      size: 'invisible',
      callback: function(tok){ if(_tsResolve){ _tsResolve(tok); _tsResolve = null; } },
      'error-callback': function(){ if(_tsResolve){ _tsResolve(null); _tsResolve = null; } },
      'expired-callback': function(){ if(_tsResolve){ _tsResolve(null); _tsResolve = null; } }
    });
  }catch(e){ _tsWidgetId = null; }
}

// Resolves with a Turnstile token, or null if verification is unavailable.
function _bugGetToken(){
  return new Promise(function(resolve){
    if(!window.turnstile || !window.TURNSTILE_SITE_KEY){ resolve(null); return; }
    _bugRenderTurnstile();
    if(_tsWidgetId === null){ resolve(null); return; }
    _tsResolve = resolve;
    try{ window.turnstile.reset(_tsWidgetId); }catch(e){}
    try{ window.turnstile.execute(_tsWidgetId); }
    catch(e){ if(_tsResolve){ _tsResolve(null); _tsResolve = null; } }
    // Safety net if no callback fires (e.g. network stalls).
    setTimeout(function(){ if(_tsResolve){ _tsResolve(null); _tsResolve = null; } }, 20000);
  });
}

function sendReport(){
  var send = document.getElementById('bugSendBtn');
  if(!send || send.disabled) return;
  var kind = _bugKind;

  if(kind === 'suggest' && !document.getElementById('bugDesc').value.trim()){
    _bugSetStatus(_bugT('bug.needText', 'Please describe your suggestion first.'), true);
    return;
  }

  var payload = {
    kind: kind,
    title: _bugTitle(),
    body: _bugBuildBody()
  };

  send.dataset.sending = '1';
  _bugUpdateSendState();
  _bugSetStatus(_bugT('bug.sending', 'Sending…'), false);

  _bugGetToken().then(function(token){
    if(!token){
      send.dataset.sending = '0';
      _bugUpdateSendState();
      _bugSetStatus(window.turnstile
        ? _bugT('bug.verifyFailed', 'Verification failed. Please try again.')
        : _bugT('bug.offline', 'Could not reach the verification service. Check your connection and try again.'), true);
      return;
    }
    payload.token = token;
    return fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(data){
        return { ok: res.ok, data: data };
      });
    }).then(function(r){
      send.dataset.sending = '0';
      _bugUpdateSendState();
      if(r.ok && r.data && r.data.url){
        _bugSetStatus(_bugT('bug.sent', 'Thanks! Your report was posted: ')
          + '<a href="' + r.data.url + '" target="_blank" rel="noopener" style="color:var(--accent);">' + r.data.url + '</a>', false);
      } else {
        var msg = (r.data && r.data.error) ? r.data.error : _bugT('bug.failed', 'Sorry, sending failed. Please try again later.');
        _bugSetStatus(msg, true);
      }
    });
  }).catch(function(){
    send.dataset.sending = '0';
    _bugUpdateSendState();
    _bugSetStatus(_bugT('bug.failed', 'Sorry, sending failed. Please try again later.'), true);
  });
}
