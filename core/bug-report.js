// bug-report -- verified byte-for-byte identical between web and android repos.

function openBugReport(){
  var overlay = document.getElementById('bugOverlay');
  // Collect debug info
  var info = [];
  info.push('TNC Sim v' + APP_VERSION);
  info.push('UA: '+navigator.userAgent.slice(0,120));
  info.push('Platform: '+navigator.platform);
  info.push('Screen: '+window.screen.width+'×'+window.screen.height+' @ '+window.devicePixelRatio+'x');
  info.push('Touch: '+(navigator.maxTouchPoints > 0 ? 'yes ('+navigator.maxTouchPoints+' points)' : 'no'));
  info.push('Lang: '+navigator.language);
  info.push('Program: '+(codeEl?codeEl.value.split('\n').length+' lines':'n/a'));
  if(prog){
    info.push('Blocks: '+prog.totalBlocks);
    info.push('Segments: '+(sub?sub.length:'0'));
    info.push('Mode: '+mode);
  }
  if(problemsData && problemsData.length){
    info.push('Validator: '+problemsData.length+' issue(s)');
    problemsData.slice(0,5).forEach(function(p){ info.push('  '+p.sev.toUpperCase()+' L'+(p.line+1)+': '+p.msg); });
  }
  if(_bugErrors.length){
    info.push('JS errors:');
    _bugErrors.forEach(function(e){ info.push('  '+e); });
  } else {
    info.push('JS errors: none');
  }
  var codeEl2 = document.getElementById('code');
  var progLines = codeEl2 ? codeEl2.value.split('\n').length : 0;
  info.push('--- Program ('+progLines+' lines included in report) ---');
  document.getElementById('bugDebug').textContent = info.join('\n');
  var codeEl2 = document.getElementById('code');
  var progTxt = codeEl2 ? codeEl2.value : '';
  document.getElementById('bugProgPreview').textContent = progTxt;
  document.getElementById('bugProgLines').textContent = '('+progTxt.split('\n').length+' lines — included in report)';
  document.getElementById('bugDesc').value = '';
  overlay.classList.add('open');
  setTimeout(function(){ document.getElementById('bugDesc').focus(); }, 100);
}

function closeBugReport(){
  document.getElementById('bugOverlay').classList.remove('open');
}

function bugCopyScreenshot(){
  if(!renderer) return;
  var btn = event.target;
  var orig = btn.textContent;
  renderer.render(scene, camera); // make sure the canvas reflects the current view
  renderer.domElement.toBlob(function(blob){
    if(!blob || !navigator.clipboard || !window.ClipboardItem) return;
    navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function(){
      btn.textContent = '✓ Copied';
      setTimeout(function(){ btn.textContent = orig; }, 1500);
    }).catch(function(){});
  }, 'image/png');
}

function _bugBuildText(){
  var desc = document.getElementById('bugDesc').value.trim();
  var debug = document.getElementById('bugDebug').textContent;
  var codeEl2 = document.getElementById('code');
  var prog_txt = codeEl2 ? codeEl2.value : (codeEl ? codeEl.value : '(unavailable)');
  return '## Description\n'+(desc||'(no description)')+'\n\n## Debug info\n```\n'+debug+'\n```\n\n## Program\n```\n'+prog_txt+'\n```'
    +'\n\n## Screenshot\n(paste here, if you have one)';
}

function bugSubmit(){
  var desc = document.getElementById('bugDesc').value.trim();
  var debug = document.getElementById('bugDebug').textContent;
  var codeEl2 = document.getElementById('code');
  var prog_txt = codeEl2 ? codeEl2.value : '';
  var title = encodeURIComponent('Bug: '+(desc.slice(0,60)||'issue'));

  // GitHub's actual URL length limit is ~8192 chars for the WHOLE url
  // ("Your request URL is too long" otherwise). Leave headroom for the
  // base path + title + "&body=".
  var URL_BUDGET = 7000;

  function buildBody(progPart, debugPart){
    return '## Description\n'+(desc||'(no description)')
      +'\n\n## Program\n```\n'+progPart+'\n```'
      +'\n\n## Debug info\n```\n'+debugPart+'\n```'
      +'\n\n## Screenshot\n(paste here, if you have one)';
  }

  var encoded = encodeURIComponent(buildBody(prog_txt, debug));

  if(encoded.length > URL_BUDGET){
    // Binary-search the longest program slice whose ENCODED length still
    // fits — encodeURIComponent expansion (newlines -> %0A etc.) isn't a
    // fixed ratio, so test the real encoded length rather than guessing.
    var lo=0, hi=prog_txt.length, fit=0;
    while(lo<=hi){
      var mid=(lo+hi)>>1;
      var candidate = prog_txt.slice(0,mid)+(mid<prog_txt.length?'\n...(trimmed)':'');
      if(encodeURIComponent(buildBody(candidate, debug)).length <= URL_BUDGET){ fit=mid; lo=mid+1; }
      else hi=mid-1;
    }
    var trimmedProg = prog_txt.slice(0,fit)+(fit<prog_txt.length?'\n...(trimmed)':'');
    encoded = encodeURIComponent(buildBody(trimmedProg, debug));

    // Still too long (huge debug info or description) — shrink debug info too.
    if(encoded.length > URL_BUDGET){
      encoded = encodeURIComponent(buildBody(trimmedProg, debug.slice(0,500)+'...(trimmed)'));
    }
  }
  window.open('https://github.com/slavomrkva/tnc-sim/issues/new?title='+title+'&body='+encoded, '_blank');
}

function bugEmailReport(){
  // No GitHub account needed — opens the user's own mail app (works on
  // mobile too, via the OS-level mailto: handler).
  var desc = document.getElementById('bugDesc').value.trim();
  var debug = document.getElementById('bugDebug').textContent;
  var codeEl2 = document.getElementById('code');
  var prog_txt = codeEl2 ? codeEl2.value : '';
  var subject = encodeURIComponent('TNC Sim bug report'+(desc?': '+desc.slice(0,50):''));

  // mailto: links have a much smaller practical limit than web URLs —
  // older Outlook/Windows mail handlers cap total length around ~2000
  // chars, so stay conservative across clients.
  var MAIL_BUDGET = 1500;

  function buildBody(progPart, debugPart){
    return 'Description:\n'+(desc||'(no description)')
      +'\n\nProgram:\n'+progPart
      +'\n\nDebug info:\n'+debugPart;
  }

  var encoded = encodeURIComponent(buildBody(prog_txt, debug));
  if(encoded.length > MAIL_BUDGET){
    var lo=0, hi=prog_txt.length, fit=0;
    while(lo<=hi){
      var mid=(lo+hi)>>1;
      var candidate = prog_txt.slice(0,mid)+(mid<prog_txt.length?'\n...(trimmed \u2014 full program copied to clipboard)':'');
      if(encodeURIComponent(buildBody(candidate, debug)).length <= MAIL_BUDGET){ fit=mid; lo=mid+1; }
      else hi=mid-1;
    }
    var trimmedProg = prog_txt.slice(0,fit)+(fit<prog_txt.length?'\n...(trimmed \u2014 full program copied to clipboard)':'');
    encoded = encodeURIComponent(buildBody(trimmedProg, debug));
    if(encoded.length > MAIL_BUDGET){
      encoded = encodeURIComponent(buildBody(trimmedProg, debug.slice(0,300)+'...(trimmed)'));
    }
  }

  window.location.href = 'mailto:info@tncsim.org?subject='+subject+'&body='+encoded;
}

function bugCopyReport(){
  var text = _bugBuildText();
  var btn = event.target;
  var orig = btn.textContent;
  function flashCopied(){
    btn.textContent = '✓ Copied';
    setTimeout(function(){ btn.textContent = orig; }, 1500);
  }
  navigator.clipboard.writeText(text).then(flashCopied).catch(function(){
    // fallback
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}
