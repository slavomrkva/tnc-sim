// Prepare a GitHub issue or email locally; no reporting tokens required.
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
    if(send) send.textContent = _bugT('bug.openGithub', 'Open GitHub issue');
  } else {
    ta.value = '';
    ta.placeholder = _bugT('bug.bugPh', 'Describe what went wrong…');
    if(send) send.textContent = _bugT('bug.openGithub', 'Open GitHub issue');
  }
  if(warn) warn.textContent = _bugT('bug.deliveryNotice', 'GitHub requires an account and publishes your report. Email needs no GitHub account and uses your email address. Bug reports include your current NC program and diagnostics. Review before sending; do not include confidential data.');
  _bugUpdateSendState();
}

// Both report types require a description written by the user.
function _bugUpdateSendState(){
  var send = document.getElementById('bugSendBtn');
  if(!send) return;
  var has = (document.getElementById('bugDesc').value.trim().length > 0);
  var disabled = !has;
  ['bugEmailBtn', 'bugDownloadBtn'].forEach(function(id){ var button = document.getElementById(id); if(button) button.disabled = disabled; });
  send.disabled = disabled;
  send.style.opacity = disabled ? '0.5' : '1';
  send.style.cursor = disabled ? 'default' : 'pointer';
}

function openBugReport(kind){
  var overlay = document.getElementById('bugOverlay');
  var status = document.getElementById('bugStatus');
  if(status){ status.textContent = ''; status.style.display = 'none'; }
  bugSetKind(kind === 'suggest' ? 'suggest' : 'bug');
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

// Full markdown report prepared locally for the selected destination.
function _bugBuildBody(){
  var desc = document.getElementById('bugDesc').value.trim();
  var out = '## Description\n' + desc + '\n';

  out += '\n## Context\n```\n' + _bugContext().join('\n') + '\n```\n';

  if(_bugKind === 'bug'){
    // validator messages
    if(typeof problemsData !== 'undefined' && problemsData && problemsData.length){
      var v = ['Validator: ' + problemsData.length + ' issue(s)'];
      problemsData.slice(0,10).forEach(function(p){
        v.push('  ' + p.sev.toUpperCase() + ' B'
          + (typeof problemBlockNumber==='function' ? problemBlockNumber(p.line) : (p.line+1))
          + ': ' + p.msg);
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
  var body = desc.slice(0,80).replace(/[\uD800-\uDBFF]$/, '') || (_bugKind === 'suggest' ? 'improvement' : 'issue');
  return prefix + body;
}

function _bugSetStatus(msg, isError){
  var status = document.getElementById('bugStatus');
  if(!status) return;
  status.style.display = 'block';
  status.style.color = isError ? 'var(--err, #e5484d)' : 'var(--text2)';
  status.innerHTML = msg;
}


function _bugDeliveryUrl(channel){
  var title = _bugTitle();
  var fullBody = _bugBuildBody();
  var body = fullBody;
  var truncated = false;
  var prefix = channel === 'email'
    ? 'mailto:info@tncsim.org?subject=' + encodeURIComponent(title) + '&body='
    : 'https://github.com/slavomrkva/tnc-sim/issues/new?labels=' + (_bugKind === 'suggest' ? 'enhancement' : 'bug') + '&title=' + encodeURIComponent(title) + '&body=';
  var limit = channel === 'email' ? 1800 : 7000;
  while((prefix + encodeURIComponent(body)).length > limit){
    truncated = true;
    fullBody = fullBody.slice(0, Math.floor(fullBody.length * 0.75));
    // Avoid cutting a Unicode surrogate pair in half.
    fullBody = fullBody.replace(/[\uD800-\uDBFF]$/, '');
    body = fullBody + '\n\n[Report shortened for the link. Use Download report and attach the full file before sending.]';
  }
  return {url: prefix + encodeURIComponent(body), truncated: truncated};
}

function sendReport(channel){
  channel = channel === 'email' ? 'email' : 'github';
  if(!document.getElementById('bugDesc').value.trim()){
    _bugSetStatus(_bugT('bug.needText', 'Please describe the problem or suggestion first.'), true);
    return;
  }
  var report = _bugDeliveryUrl(channel);
  window.open(report.url, '_blank', 'noopener,noreferrer');
  // Keep a normal link available even when a browser blocks popups.
  var status = document.getElementById('bugStatus');
  status.style.display = 'block';
  status.style.color = 'var(--text2)';
  status.textContent = _bugT('bug.reviewDraft', 'Review and send the draft in GitHub or your email app. If it did not open, use this link: ');
  var link = document.createElement('a');
  link.href = report.url;
  link.textContent = channel === 'email' ? _bugT('bug.openEmail', 'Open email') : _bugT('bug.openGithub', 'Open GitHub issue');
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  status.appendChild(link);
  if(report.truncated){
    status.appendChild(document.createTextNode(_bugT('bug.shortened', ' The draft was shortened. Download the full report and attach it before sending.')));
  }
}

function downloadBugReport(){
  if(!document.getElementById('bugDesc').value.trim()) return;
  _downloadTextFile(_bugBuildBody(), 'tnc-sim-report.txt');
}
