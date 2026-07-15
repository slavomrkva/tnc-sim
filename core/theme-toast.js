// theme-toast -- verified byte-for-byte identical between web and android repos.

function _applyThemeUI(theme){
  var icon = document.getElementById('themeIcon');
  var label = document.getElementById('themeLabel');
  // Show the mode you'll SWITCH TO when clicked, not the current one —
  // showing "Dark" while already in dark mode reads as "click to go dark"
  // when it actually does the opposite.
  if(icon) icon.innerHTML = theme==='light' ? '&#9789;' : '&#9728;';
  if(label) label.textContent = theme==='light' ? 'Dark' : 'Light';
}

function toggleTheme(){
  var isLight = document.documentElement.getAttribute('data-theme')==='light';
  var next = isLight ? 'dark' : 'light';
  if(next==='light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  try{ localStorage.setItem('tncSimTheme', next); }catch(e){}
  _applyThemeUI(next);
  if(typeof scene!=='undefined' && scene) scene.background = new THREE.Color(_scene3dBgColor());
  if(typeof scene!=='undefined' && scene && scene.userData.grid && typeof _applyGridTheme==='function'){
    _applyGridTheme(scene.userData.grid);
  }
}

function openAboutPopup(){
  var old = document.getElementById('_aboutOverlay');
  if(old){ old.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = '_aboutOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;';

  overlay.innerHTML = '<div style="background:var(--surface2);border-radius:14px;width:100%;max-width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.5);">'
    +'<div style="padding:14px 20px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:12px;color:var(--text2);display:flex;justify-content:space-between;align-items:center;">'
    +'<span>About TNC Sim</span>'
    +'<button onclick="document.getElementById(\'_aboutOverlay\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;padding:0 4px;">\u2715</button>'
    +'</div>'
    +'<div style="padding:16px 20px;font-family:var(--mono);font-size:11px;color:var(--text3);line-height:1.7;">'
    +'TNC Sim is an open-source independent Heidenhain TNC simulator \u2014 early release, bugs are expected. Results may differ from a real TNC control \u2014 never use for actual machining without verification. The 3D cut is a voxel grid \u2014 details smaller than the active cell size won\u2019t appear, even at High quality or after Refine (cells are up to ~0.7mm on Default). Desktop first, mobile friendly. \u00b7 Not affiliated with HEIDENHAIN GmbH.'
    +'</div>'
    +'<div style="padding:12px 20px 16px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:8px;font-family:var(--mono);">'
    +'<a href="https://github.com/slavomrkva/tnc-sim" target="_blank" style="flex:1;min-width:110px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 10px;font-size:11px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text2);text-decoration:none;"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a>'
    +'<button onclick="document.getElementById(\'_aboutOverlay\').remove();openBugReport();" style="flex:1;min-width:110px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 10px;font-size:11px;border:1px solid rgba(245,137,58,.4);border-radius:6px;background:rgba(245,137,58,.14);color:var(--accent-warm);cursor:pointer;font-family:var(--mono);">\ud83d\udc1b Report a Bug</button>'
    +'<a href="https://buymeacoffee.com/slavozett" target="_blank" style="flex:1;min-width:110px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 10px;font-size:11px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text2);text-decoration:none;">\u2615 Buy me a coffee</a>'
    +'<a href="mailto:info@tncsim.org" style="flex:1 1 100%;text-align:center;padding:4px;font-size:10px;color:var(--text3);text-decoration:none;">info@tncsim.org</a>'
    +'<div style="flex:1 1 100%;text-align:center;font-family:var(--mono);font-size:10px;color:var(--text3);">Version '+APP_VERSION+'</div>'
    +'</div>'
    +'</div>';

  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
